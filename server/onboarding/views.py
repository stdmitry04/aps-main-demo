from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Avg, Count, Q
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta

from .models import (
    OnboardingCandidate,
    OnboardingSectionData,
    OnboardingDocument,
    OnboardingAuditLog,
    OnboardingEmailLog
)
from .serializers import (
    OnboardingCandidateListSerializer,
    OnboardingCandidateDetailSerializer,
    OnboardingCandidateCreateSerializer,
    OnboardingSectionDataSerializer,
    OnboardingDocumentSerializer,
    SectionUpdateSerializer,
    ProgressUpdateSerializer,
    SubmitOnboardingSerializer,
    OnboardingAuditLogSerializer,
    AdminReviewSerializer,
    OnboardingStatsSerializer,
)
from .permissions import (
    IsHRStaff,
    IsCandidateOrHRStaff,
    CanSubmitOnboarding,
    CanReviewOnboarding,
    CanUploadDocuments,
)


class OnboardingCandidateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for onboarding candidates.
    Supports both HR staff and token-based candidate access.
    """
    queryset = OnboardingCandidate.objects.all()
    filter_backends = [filters.SearchFilter,
                       DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['name', 'email', 'position']
    filterset_fields = ['status', 'position']
    ordering_fields = ['created_at', 'last_updated', 'offer_date']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['create', 'list']:
            return [IsHRStaff()]
        elif self.action in ['retrieve', 'update', 'partial_update']:
            return [IsCandidateOrHRStaff()]
        elif self.action == 'destroy':
            return [IsHRStaff()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == 'create':
            return OnboardingCandidateCreateSerializer
        elif self.action == 'list':
            return OnboardingCandidateListSerializer
        return OnboardingCandidateDetailSerializer

    def get_object(self):
        """
        Override to support token-based access
        """
        access_token = self.request.query_params.get(
            'token') or self.request.headers.get('X-Onboarding-Token')

        if access_token:
            # Token-based access
            obj = get_object_or_404(
                OnboardingCandidate, access_token=access_token)
            self.check_object_permissions(self.request, obj)
            return obj

        # Standard primary key access
        return super().get_object()

    def create(self, request, *args, **kwargs):
        """Create a new onboarding candidate"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        candidate = serializer.save()

        # Log the creation
        self._create_audit_log(
            candidate,
            'created',
            'Onboarding candidate created',
            performed_by=request.user
        )

        # TODO: Send invitation email
        self._send_invitation_email(candidate)

        return Response(
            OnboardingCandidateDetailSerializer(candidate).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], permission_classes=[IsCandidateOrHRStaff])
    def update_section(self, request, pk=None):
        """
        Update a specific section's data.
        Can be called by candidate or HR staff.
        """
        candidate = self.get_object()
        serializer = SectionUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        section_index = serializer.validated_data['section_index']
        form_data = serializer.validated_data['form_data']
        is_completed = serializer.validated_data.get('is_completed', False)

        # Get or create the section
        section_name_map = [
            'personal_info',
            'employment_details',
            'i9_form',
            'tax_withholdings',
            'payment_method',
            'time_off',
            'deductions',
            'emergency_contact',
        ]
        section_name = section_name_map[section_index]

        section, created = OnboardingSectionData.objects.get_or_create(
            candidate=candidate,
            section_name=section_name,
            defaults={'section_index': section_index}
        )

        # Update the section
        section.form_data = form_data
        section.is_completed = is_completed
        if is_completed and not section.completed_at:
            section.completed_at = timezone.now()
        section.save()

        # Update candidate's completed sections count
        completed_count = candidate.section_data.filter(
            is_completed=True).count()
        candidate.completed_sections = completed_count
        candidate.last_updated = timezone.now()
        candidate.save()

        # Create audit log
        self._create_audit_log(
            candidate,
            'section_completed' if is_completed else 'updated',
            f"Section {section_index}: {section.get_section_name_display()}",
            section_name=section_name,
            performed_by=request.user if request.user.is_authenticated else None,
            performed_by_candidate=not request.user.is_authenticated
        )

        return Response({
            'section': OnboardingSectionDataSerializer(section).data,
            'candidate': OnboardingCandidateDetailSerializer(candidate).data
        })

    @action(detail=True, methods=['post'], permission_classes=[CanSubmitOnboarding])
    def submit(self, request, pk=None):
        """
        Submit the completed onboarding form.
        """
        candidate = self.get_object()
        serializer = SubmitOnboardingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Verify all sections are completed
        if candidate.completed_sections < 8:
            return Response(
                {'error': 'All sections must be completed before submission.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mark as submitted
        candidate.status = 'submitted'
        candidate.submitted_at = timezone.now()
        candidate.save()

        # Create audit log
        self._create_audit_log(
            candidate,
            'submitted',
            'Onboarding form submitted',
            performed_by=request.user if request.user.is_authenticated else None,
            performed_by_candidate=not request.user.is_authenticated
        )

        # TODO: Send confirmation email to candidate
        # TODO: Send notification email to HR

        return Response({
            'message': 'Onboarding form submitted successfully',
            'candidate': OnboardingCandidateDetailSerializer(candidate).data
        })

    @action(detail=True, methods=['post'], permission_classes=[CanReviewOnboarding])
    def review(self, request, pk=None):
        """
        HR staff review of onboarding submission.
        """
        candidate = self.get_object()
        serializer = AdminReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        section_index = serializer.validated_data.get('section_index')
        admin_comments = serializer.validated_data.get('admin_comments', '')
        mark_as_reviewed = serializer.validated_data.get(
            'mark_as_reviewed', True)

        if section_index is not None:
            # Review specific section
            section_name_map = [
                'personal_info', 'employment_details', 'i9_form', 'tax_withholdings',
                'payment_method', 'time_off', 'deductions', 'emergency_contact',
            ]
            section_name = section_name_map[section_index]

            try:
                section = candidate.section_data.get(section_name=section_name)
                section.reviewed_by_admin = mark_as_reviewed
                section.admin_reviewed_at = timezone.now() if mark_as_reviewed else None
                section.admin_comments = admin_comments
                section.save()
            except OnboardingSectionData.DoesNotExist:
                return Response(
                    {'error': f'Section {section_index} not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Review entire onboarding
            candidate.reviewed_by = request.user
            candidate.reviewed_at = timezone.now()
            candidate.admin_notes = admin_comments
            candidate.save()

        # Create audit log
        self._create_audit_log(
            candidate,
            'reviewed',
            'Onboarding reviewed by admin',
            performed_by=request.user,
            details={'section_index': section_index,
                     'comments': admin_comments}
        )

        return Response({
            'message': 'Review saved successfully',
            'candidate': OnboardingCandidateDetailSerializer(candidate).data
        })

    @action(detail=True, methods=['get'], permission_classes=[IsCandidateOrHRStaff])
    def progress(self, request, pk=None):
        """
        Get progress details for a candidate.
        """
        candidate = self.get_object()

        sections = candidate.section_data.all().order_by('section_index')
        section_progress = []

        for section in sections:
            section_progress.append({
                'index': section.section_index,
                'name': section.get_section_name_display(),
                'is_completed': section.is_completed,
                'completed_at': section.completed_at,
                'reviewed_by_admin': section.reviewed_by_admin,
            })

        return Response({
            'candidate_id': candidate.id,
            'name': candidate.name,
            'status': candidate.status,
            'completed_sections': candidate.completed_sections,
            'progress_percentage': candidate.progress_percentage,
            'sections': section_progress,
            'last_updated': candidate.last_updated,
            'submitted_at': candidate.submitted_at,
        })

    @action(detail=False, methods=['get'], permission_classes=[IsHRStaff])
    def stats(self, request):
        """
        Get onboarding statistics for HR dashboard.
        """
        total = OnboardingCandidate.objects.count()

        stats = {
            'total_candidates': total,
            'not_started': OnboardingCandidate.objects.filter(status='not_started').count(),
            'in_progress': OnboardingCandidate.objects.filter(status='in_progress').count(),
            'completed': OnboardingCandidate.objects.filter(status='completed').count(),
            'submitted': OnboardingCandidate.objects.filter(status='submitted').count(),
        }

        # Calculate average completion time (from creation to submission)
        submitted = OnboardingCandidate.objects.filter(
            status='submitted',
            submitted_at__isnull=False
        )

        if submitted.exists():
            completion_times = []
            for candidate in submitted:
                delta = candidate.submitted_at - candidate.created_at
                completion_times.append(
                    delta.total_seconds() / 86400)  # Convert to days

            stats['average_completion_time'] = sum(
                completion_times) / len(completion_times)
        else:
            stats['average_completion_time'] = 0.0

        # Completion rate
        stats['completion_rate'] = (
            stats['submitted'] / total * 100) if total > 0 else 0.0

        serializer = OnboardingStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsHRStaff])
    def applicants_awaiting_onboarding(self, request):
        """
        Get all applicants with offers who are awaiting onboarding.
        Returns combined data from applications, offers, and onboarding candidates.
        Filters for applications at 'Offer Accepted' stage.
        """
        from hiring.models import JobApplication, Offer

        # Get all applications at the Offer Accepted stage
        applications = JobApplication.objects.filter(
            stage='Offer Accepted'
        ).select_related('position', 'offer').prefetch_related('onboarding')

        result = []

        for application in applications:
            # Get the offer for this application (OneToOne relationship)
            try:
                offer = application.offer
            except Offer.DoesNotExist:
                offer = None

            # Get the onboarding candidate if exists
            onboarding = application.onboarding.first()

            # Build the response object
            applicant_data = {
                'id': str(application.id),
                'applicant_name': application.applicant_name,
                'applicant_email': application.applicant_email,
                'applicant_phone': application.applicant_phone,
                'position_title': application.position.title if application.position else 'N/A',
                'position_req_id': application.position.req_id if application.position else 'N/A',
                'stage': application.stage,
                'submitted_at': application.submitted_at.isoformat() if application.submitted_at else None,
                'job_application_id': str(application.id),
            }

            # Add offer data if exists
            if offer:
                applicant_data.update({
                    'offer_date': offer.offer_date.isoformat() if offer.offer_date else None,
                    'offer_status': offer.status,
                    'start_date': offer.start_date.isoformat() if offer.start_date else None,
                })
            else:
                applicant_data.update({
                    'offer_date': None,
                    'offer_status': None,
                    'start_date': None,
                })

            # Add onboarding data if exists
            if onboarding:
                applicant_data.update({
                    'has_onboarding': True,
                    'onboarding_id': str(onboarding.id),
                    'onboarding_status': onboarding.status,
                    'onboarding_progress': onboarding.completed_sections,
                })
            else:
                applicant_data.update({
                    'has_onboarding': False,
                    'onboarding_id': None,
                    'onboarding_status': None,
                    'onboarding_progress': 0,
                })

            result.append(applicant_data)

        # Calculate statistics
        stats = {
            'total': len(result),
            'with_accepted_offer': sum(1 for a in result if a['offer_status'] == 'Accepted'),
            'pending_offer': sum(1 for a in result if a['offer_status'] == 'Pending'),
            'without_onboarding': sum(1 for a in result if not a['has_onboarding']),
        }

        return Response({
            'applicants': result,
            'stats': stats
        })

    @action(detail=True, methods=['get'], permission_classes=[CanReviewOnboarding])
    def audit_log(self, request, pk=None):
        """
        Get audit log for a candidate.
        """
        candidate = self.get_object()
        logs = candidate.audit_logs.all()
        serializer = OnboardingAuditLogSerializer(logs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def validate_token(self, request):
        """
        Validate an onboarding access token.
        Returns candidate data if valid, error if invalid/expired.
        """
        access_token = request.query_params.get('token')
        if not access_token:
            return Response(
                {'error': 'Token parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            candidate = OnboardingCandidate.objects.get(
                access_token=access_token)

            if candidate.is_expired:
                return Response(
                    {'error': 'Token has expired', 'expired': True},
                    status=status.HTTP_403_FORBIDDEN
                )

            if candidate.status == 'submitted':
                return Response(
                    {'error': 'Onboarding already submitted',
                        'already_submitted': True},
                    status=status.HTTP_403_FORBIDDEN
                )

            return Response({
                'valid': True,
                'candidate': OnboardingCandidateDetailSerializer(candidate).data
            })

        except OnboardingCandidate.DoesNotExist:
            return Response(
                {'error': 'Invalid token'},
                status=status.HTTP_404_NOT_FOUND
            )

    def _create_audit_log(self, candidate, action, details_text, section_name='', performed_by=None, performed_by_candidate=False):
        """Helper to create audit log entries"""
        OnboardingAuditLog.objects.create(
            candidate=candidate,
            action=action,
            section_name=section_name,
            performed_by=performed_by,
            performed_by_candidate=performed_by_candidate,
            details={'description': details_text},
            ip_address=self._get_client_ip(),
            user_agent=self._get_user_agent()
        )

    def _get_client_ip(self):
        """Get client IP address from request"""
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip

    def _get_user_agent(self):
        """Get user agent from request"""
        return self.request.META.get('HTTP_USER_AGENT', '')

    def _send_invitation_email(self, candidate):
        """Send onboarding invitation email"""
        # TODO: Implement email sending
        OnboardingEmailLog.objects.create(
            candidate=candidate,
            email_type='invitation',
            recipient_email=candidate.email,
            subject=f'Welcome to School Demo District - Complete Your Onboarding',
            sent=True,
            sent_at=timezone.now()
        )


class OnboardingDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for uploading and managing onboarding documents.
    """
    queryset = OnboardingDocument.objects.all()
    serializer_class = OnboardingDocumentSerializer
    permission_classes = [CanUploadDocuments]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['candidate', 'document_type', 'verified']

    def create(self, request, *args, **kwargs):
        """Upload a document"""
        candidate_id = request.data.get('candidate_id')
        access_token = request.query_params.get(
            'token') or request.headers.get('X-Onboarding-Token')

        # Get candidate
        if access_token:
            candidate = get_object_or_404(
                OnboardingCandidate, access_token=access_token)
        else:
            candidate = get_object_or_404(OnboardingCandidate, id=candidate_id)

        # Create document
        document = OnboardingDocument.objects.create(
            candidate=candidate,
            document_type=request.data.get('document_type'),
            file=request.FILES.get('file'),
            file_name=request.FILES.get('file').name,
            file_size=request.FILES.get('file').size,
        )

        # Create audit log
        OnboardingAuditLog.objects.create(
            candidate=candidate,
            action='document_uploaded',
            details={'document_type': document.get_document_type_display()},
            performed_by=request.user if request.user.is_authenticated else None,
            performed_by_candidate=not request.user.is_authenticated
        )

        serializer = self.get_serializer(document)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[CanReviewOnboarding])
    def verify(self, request, pk=None):
        """Verify a document"""
        document = self.get_object()

        document.verified = True
        document.verified_by = request.user
        document.verified_at = timezone.now()
        document.verification_notes = request.data.get('notes', '')
        document.save()

        return Response({
            'message': 'Document verified successfully',
            'document': self.get_serializer(document).data
        })
