from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q, Count
from datetime import datetime, timedelta
import uuid
import json

from .models import (
    ScreeningQuestion,
    JobTemplate,
    Position,
    InterviewStage,
    Interviewer,
    JobApplication,
    Reference,
    InterviewAvailability,
    Interview,
    OfferTemplate,
    Offer,
    HiredEmployee
)
from .serializers import (
    ScreeningQuestionSerializer,
    JobTemplateSerializer,
    PositionListSerializer,
    PositionDetailSerializer,
    PublicPositionSerializer,
    JobApplicationListSerializer,
    JobApplicationDetailSerializer,
    InterviewSerializer,
    OfferTemplateSerializer,
    OfferSerializer,
    HiredEmployeeSerializer
)


class ScreeningQuestionViewSet(viewsets.ModelViewSet):
    """ViewSet for screening questions"""
    queryset = ScreeningQuestion.objects.all()
    serializer_class = ScreeningQuestionSerializer
    # permission_classes = [IsAuthenticated]  # Commented out for demo purposes
    permission_classes = [AllowAny]  # Allow unauthenticated access for demo
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['question', 'category']
    filterset_fields = ['category', 'required']

    def perform_create(self, serializer):
        """Add district from request when creating screening question"""
        district_id = self.request.META.get('HTTP_X_DISTRICT_ID')
        if not district_id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'district': 'District ID is required'})

        from core.models import SchoolDistrict
        try:
            district = SchoolDistrict.objects.get(id=district_id)
        except SchoolDistrict.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'district': 'Invalid district ID'})

        serializer.save(district=district)


class JobTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for job templates"""
    queryset = JobTemplate.objects.all()
    serializer_class = JobTemplateSerializer
    # permission_classes = [IsAuthenticated]  # Commented out for demo purposes
    permission_classes = [AllowAny]  # Allow unauthenticated access for demo
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['template_name', 'primary_job_title']
    filterset_fields = ['primary_job_title', 'employee_category']

    def perform_create(self, serializer):
        """Add district from request when creating job template"""
        district_id = self.request.META.get('HTTP_X_DISTRICT_ID')
        if not district_id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'district': 'District ID is required'})

        from core.models import SchoolDistrict
        try:
            district = SchoolDistrict.objects.get(id=district_id)
        except SchoolDistrict.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'district': 'Invalid district ID'})

        serializer.save(district=district)


class PositionViewSet(viewsets.ModelViewSet):
    """ViewSet for positions"""
    queryset = Position.objects.all()
    filter_backends = [filters.SearchFilter,
                       DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['req_id', 'title', 'department', 'worksite']
    filterset_fields = ['status', 'department',
                        'worksite', 'employee_category']
    ordering_fields = ['created_at', 'start_date', 'posting_end_date']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return PositionListSerializer
        return PositionDetailSerializer

    def perform_create(self, serializer):
        """Add district from request when creating position"""
        district_id = self.request.META.get('HTTP_X_DISTRICT_ID')
        if not district_id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'district': 'District ID is required'})

        from core.models import SchoolDistrict
        try:
            district = SchoolDistrict.objects.get(id=district_id)
        except SchoolDistrict.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'district': 'Invalid district ID'})

        serializer.save(district=district)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def public(self, request):
        """Public endpoint for job board - returns only open positions"""
        today = timezone.now().date()
        positions = Position.objects.filter(
            status='Open',
            posting_start_date__lte=today,
            posting_end_date__gte=today
        )

        # Apply search filter
        search = request.query_params.get('search', None)
        if search:
            positions = positions.filter(
                Q(title__icontains=search) |
                Q(department__icontains=search) |
                Q(worksite__icontains=search)
            )

        # Apply department filter
        department = request.query_params.get('department', None)
        if department and department != 'all':
            positions = positions.filter(department=department)

        # Apply worksite filter
        worksite = request.query_params.get('worksite', None)
        if worksite and worksite != 'all':
            positions = positions.filter(worksite=worksite)

        serializer = PublicPositionSerializer(positions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def applicants(self, request, pk=None):
        """Get all applicants for a position"""
        position = self.get_object()
        applications = position.applications.all()

        # Apply filters
        stage = request.query_params.get('stage', None)
        if stage and stage != 'all':
            applications = applications.filter(stage=stage)

        certified = request.query_params.get('certified', None)
        if certified == 'true':
            applications = applications.filter(certified=True)
        elif certified == 'false':
            applications = applications.filter(certified=False)

        serializer = JobApplicationListSerializer(applications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get hiring statistics"""
        today = timezone.now().date()

        stats = {
            'total_positions': Position.objects.count(),
            'open_positions': Position.objects.filter(
                status='Open',
                posting_start_date__lte=today,
                posting_end_date__gte=today
            ).count(),
            'draft_positions': Position.objects.filter(status='Draft').count(),
            'closed_positions': Position.objects.filter(status='Closed').count(),
            'total_applications': JobApplication.objects.count(),
            'applications_this_month': JobApplication.objects.filter(
                submitted_at__gte=timezone.now().replace(day=1)
            ).count(),
            'pending_offers': Offer.objects.filter(status='Pending').count(),
            'accepted_offers': Offer.objects.filter(status='Accepted').count(),
        }

        return Response(stats)


class JobApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet for job applications"""
    queryset = JobApplication.objects.all()
    permission_classes = [IsAuthenticated]
    # Add parsers to handle file uploads
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    filter_backends = [filters.SearchFilter,
                       DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['applicant_name', 'applicant_email', 'current_role']
    filterset_fields = ['stage', 'certified', 'internal', 'position']
    ordering_fields = ['submitted_at', 'applicant_name']
    ordering = ['-submitted_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return JobApplicationListSerializer
        return JobApplicationDetailSerializer

    def get_permissions(self):
        # Allow public submission of applications
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_district_from_position(self, position_id):
        """Get district from the position being applied to"""
        try:
            position = Position.objects.get(id=position_id)
            return position.district
        except Position.DoesNotExist:
            return None

    def create(self, request, *args, **kwargs):
        """Handle application creation with file upload and nested data"""
        try:
            # Get position and its district
            position_id = request.data.get('position')
            if not position_id:
                return Response(
                    {'error': 'Position is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            district = self.get_district_from_position(position_id)
            if not district:
                return Response(
                    {'error': 'Invalid position or position not found'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get the basic fields
            data = {
                'position': position_id,
                'district': district.id,  # Add district from position
                'applicant_name': request.data.get('applicant_name'),
                'applicant_email': request.data.get('applicant_email'),
                'applicant_phone': request.data.get('applicant_phone', ''),
                'start_date_availability': request.data.get('start_date_availability'),
                'cover_letter': request.data.get('cover_letter', ''),
            }

            # Parse JSON fields
            screening_answers_str = request.data.get('screening_answers', '{}')
            references_str = request.data.get('references', '[]')
            availability_str = request.data.get('interview_availability', '[]')

            try:
                data['screening_answers'] = json.loads(screening_answers_str) if isinstance(
                    screening_answers_str, str) else screening_answers_str
                references_data = json.loads(references_str) if isinstance(
                    references_str, str) else references_str
                availability_data = json.loads(availability_str) if isinstance(
                    availability_str, str) else availability_str
            except json.JSONDecodeError as e:
                return Response(
                    {'error': f'Invalid JSON format: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Handle file upload
            resume_file = request.FILES.get('resume')
            if resume_file:
                data['resume'] = resume_file
            else:
                return Response(
                    {'error': 'Resume is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            print('Creating application with data:', {
                  k: v for k, v in data.items() if k != 'resume'})
            print('Screening answers:', data['screening_answers'])
            print('References:', references_data)
            print('Interview availability:', availability_data)

            # Create the application first
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            application = serializer.save()

            # Create references
            for reference_data in references_data:
                Reference.objects.create(
                    application=application,
                    district=application.district,  # Set district from application
                    name=reference_data.get('name', ''),
                    email=reference_data.get('email', ''),
                    phone=reference_data.get('phone', ''),
                    relationship=reference_data.get('relationship', '')
                )

            # Create interview availability
            for availability in availability_data:
                InterviewAvailability.objects.create(
                    application=application,
                    district=application.district,  # Set district from application
                    date=availability.get('date'),
                    time_slots=availability.get('timeSlots', [])
                )

            # Return the created application with all related data
            response_serializer = JobApplicationDetailSerializer(application)
            headers = self.get_success_headers(response_serializer.data)

            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )

        except Exception as e:
            print(f'Error creating application: {str(e)}')
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def advance_stage(self, request, pk=None):
        """Advance application to next stage"""
        application = self.get_object()

        stage_order = [
            'Application Review',
            'Screening',
            'Interview',
            'Interviews Completed',
            'Reference Check',
            'Offer',
            'Onboarding'
        ]

        current_index = stage_order.index(application.stage)
        if current_index < len(stage_order) - 1:
            application.stage = stage_order[current_index + 1]
            application.save()

            serializer = self.get_serializer(application)
            return Response(serializer.data)
        else:
            return Response(
                {'error': 'Application is already at final stage'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject an application"""
        application = self.get_object()
        application.stage = 'Rejected'
        application.is_active = False
        application.save()

        serializer = self.get_serializer(application)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def demo_set_stage(self, request, pk=None):
        """
        DEMO ONLY: Force set application to any stage.
        This endpoint bypasses normal workflow validation.
        """
        application = self.get_object()
        new_stage = request.data.get('stage')

        valid_stages = [choice[0] for choice in application.STAGE_CHOICES]

        if not new_stage:
            return Response(
                {'error': 'stage parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_stage not in valid_stages:
            return Response(
                {'error': f'Invalid stage. Must be one of: {", ".join(valid_stages)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        application.stage = new_stage
        application.save()

        serializer = self.get_serializer(application)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_position(self, request):
        """Get applications grouped by position"""
        position_id = request.query_params.get('position_id')
        if not position_id:
            return Response(
                {'error': 'position_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        applications = self.queryset.filter(position_id=position_id)
        serializer = JobApplicationListSerializer(applications, many=True)
        return Response(serializer.data)


class InterviewViewSet(viewsets.ModelViewSet):
    """ViewSet for interviews"""
    queryset = Interview.objects.all()
    serializer_class = InterviewSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter,
                       DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['application__applicant_name',
                     'application__position__title']
    filterset_fields = ['status', 'stage', 'scheduled_date']
    ordering_fields = ['scheduled_date', 'scheduled_time']
    ordering = ['scheduled_date', 'scheduled_time']

    @action(detail=False, methods=['get'])
    def interviewers(self, request):
        """Get available interviewers for a specific stage"""
        from .models import Interviewer, Interview

        stage_id = request.query_params.get('stage_id')

        if not stage_id:
            return Response(
                {'error': 'stage_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get all interviewers for the specified stage
        interviewers = Interviewer.objects.filter(
            stage_id=stage_id
        ).values('id', 'name', 'email', 'role', 'stage__stage_name')

        # Optional: Filter by availability if date/time provided
        scheduled_date = request.query_params.get('scheduled_date')
        scheduled_time = request.query_params.get('scheduled_time')

        if scheduled_date and scheduled_time:
            # Exclude interviewers already scheduled at that time
            # Adjust this based on your Interview model structure
            booked_emails = Interview.objects.filter(
                scheduled_date=scheduled_date,
                scheduled_time=scheduled_time,
                status__in=['Scheduled', 'Completed']
            ).values_list('interviewers__email', flat=True)

            interviewers = interviewers.exclude(email__in=booked_emails)

        return Response(list(interviewers))

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming interviews"""
        today = timezone.now().date()
        days = int(request.query_params.get('days', 30))
        end_date = today + timedelta(days=days)

        interviews = self.queryset.filter(
            scheduled_date__gte=today,
            scheduled_date__lte=end_date,
            status='Scheduled'
        )

        serializer = self.get_serializer(interviews, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_date_range(self, request):
        """Get interviews within a date range"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date or not end_date:
            return Response(
                {'error': 'start_date and end_date parameters are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        interviews = self.queryset.filter(
            scheduled_date__gte=start_date,
            scheduled_date__lte=end_date
        )

        serializer = self.get_serializer(interviews, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Mark interview as completed"""
        interview = self.get_object()
        interview.status = 'Completed'

        # Optional: Add feedback and rating
        feedback = request.data.get('feedback')
        rating = request.data.get('rating')

        if feedback:
            interview.feedback = feedback
        if rating:
            interview.rating = rating

        interview.save()

        # Increment completed interview stages for the application
        application = interview.application
        application.completed_interview_stages = max(
            application.completed_interview_stages,
            interview.stage.stage_number
        )
        application.save()

        serializer = self.get_serializer(interview)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def schedule(self, request):
        """Schedule a new interview"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Generate Zoom link (mock implementation)
        zoom_link = f"https://zoom.us/j/{uuid.uuid4().hex[:10]}"

        interview = serializer.save(zoom_link=zoom_link)

        # TODO: Send email notifications to candidate and interviewers

        return Response(
            self.get_serializer(interview).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get interview statistics"""
        today = timezone.now().date()

        stats = {
            'total_interviews': Interview.objects.count(),
            'scheduled': Interview.objects.filter(status='Scheduled').count(),
            'completed': Interview.objects.filter(status='Completed').count(),
            'upcoming_this_week': Interview.objects.filter(
                scheduled_date__gte=today,
                scheduled_date__lte=today + timedelta(days=7),
                status='Scheduled'
            ).count(),
            'today': Interview.objects.filter(
                scheduled_date=today,
                status='Scheduled'
            ).count(),
        }

        return Response(stats)


class OfferTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for offer templates"""
    queryset = OfferTemplate.objects.all()
    serializer_class = OfferTemplateSerializer
    # permission_classes = [IsAuthenticated]  # Commented out for demo purposes
    permission_classes = [AllowAny]  # Allow unauthenticated access for demo
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get the active offer template"""
        template = OfferTemplate.objects.filter(is_active=True).first()
        if not template:
            return Response(
                {'error': 'No active template found'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.get_serializer(template)
        return Response(serializer.data)


class OfferViewSet(viewsets.ModelViewSet):
    """ViewSet for offers"""
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer
    # Temporarily allow unauthenticated for testing
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter,
                       DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['application__applicant_name',
                     'application__position__title']
    filterset_fields = ['status', 'application__position__worksite']
    ordering_fields = ['offer_date', 'expiration_date']
    ordering = ['-offer_date']

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def accept(self, request, pk=None):
        """Accept an offer - public endpoint (UUID acts as secure token)"""
        offer = self.get_object()

        if offer.status != 'Pending':
            return Response(
                {'error': 'Only pending offers can be accepted'},
                status=status.HTTP_400_BAD_REQUEST
            )

        offer.status = 'Accepted'
        offer.accepted_date = timezone.now().date()
        offer.save()

        # Update application stage to Offer Accepted
        offer.application.stage = 'Offer Accepted'
        offer.application.save()

        # Create hired employee record
        HiredEmployee.objects.create(
            district=offer.district,
            application=offer.application,
            offer=offer,
            hire_date=offer.start_date
        )

        serializer = self.get_serializer(offer)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def decline(self, request, pk=None):
        """Decline an offer - public endpoint (UUID acts as secure token)"""
        offer = self.get_object()

        if offer.status != 'Pending':
            return Response(
                {'error': 'Only pending offers can be declined'},
                status=status.HTTP_400_BAD_REQUEST
            )

        offer.status = 'Declined'
        offer.declined_reason = request.data.get('reason', '')
        offer.save()

        serializer = self.get_serializer(offer)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny], url_path='public-accept')
    def public_accept(self, request, pk=None):
        """Public endpoint for accepting an offer - redirects to frontend"""
        from django.shortcuts import redirect
        from django.conf import settings

        # Redirect to frontend accept page with offer ID
        frontend_url = getattr(settings, 'FRONTEND_URL',
                               'http://localhost:3000')
        return redirect(f'{frontend_url}/hiring/offers/accept/{pk}')

    @action(detail=True, methods=['get'], permission_classes=[AllowAny], url_path='public-reject')
    def public_reject(self, request, pk=None):
        """Public endpoint for rejecting an offer - redirects to frontend"""
        from django.shortcuts import redirect
        from django.conf import settings

        # Redirect to frontend reject page with offer ID
        frontend_url = getattr(settings, 'FRONTEND_URL',
                               'http://localhost:3000')
        return redirect(f'{frontend_url}/hiring/offers/reject/{pk}')

    @action(detail=True, methods=['get'], permission_classes=[AllowAny], url_path='public-detail')
    def public_detail(self, request, pk=None):
        """Public endpoint for viewing offer details - UUID acts as secure token"""
        offer = self.get_object()
        serializer = self.get_serializer(offer)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """Get offers expiring within specified days"""
        today = timezone.now().date()
        days = int(request.query_params.get('days', 7))
        end_date = today + timedelta(days=days)

        offers = self.queryset.filter(
            status='Pending',
            expiration_date__gte=today,
            expiration_date__lte=end_date
        )

        serializer = self.get_serializer(offers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get offer statistics"""
        stats = {
            'total_offers': Offer.objects.count(),
            'pending': Offer.objects.filter(status='Pending').count(),
            'accepted': Offer.objects.filter(status='Accepted').count(),
            'declined': Offer.objects.filter(status='Declined').count(),
            'expired': Offer.objects.filter(status='Expired').count(),
        }

        return Response(stats)


class HiredEmployeeViewSet(viewsets.ModelViewSet):
    """ViewSet for hired employees"""
    queryset = HiredEmployee.objects.all()
    serializer_class = HiredEmployeeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter,
                       DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['application__applicant_name',
                     'application__position__title']
    filterset_fields = ['exported_to_infinite_vision']
    ordering_fields = ['hire_date', 'export_date']
    ordering = ['-hire_date']

    @action(detail=True, methods=['post'])
    def export_to_infinite_vision(self, request, pk=None):
        """Export employee data to Infinite Vision"""
        hired_employee = self.get_object()

        if hired_employee.exported_to_infinite_vision:
            return Response(
                {'error': 'Employee already exported to Infinite Vision'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # TODO: Implement actual Infinite Vision API integration
        # For now, just mark as exported with mock employee ID
        hired_employee.exported_to_infinite_vision = True
        hired_employee.export_date = timezone.now()
        hired_employee.infinite_vision_employee_id = f"EMP-{uuid.uuid4().hex[:8].upper()}"
        hired_employee.save()

        serializer = self.get_serializer(hired_employee)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending_export(self, request):
        """Get employees pending export to Infinite Vision"""
        pending = self.queryset.filter(exported_to_infinite_vision=False)
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_export(self, request):
        """Bulk export employees to Infinite Vision"""
        employee_ids = request.data.get('employee_ids', [])

        if not employee_ids:
            return Response(
                {'error': 'employee_ids list is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        employees = self.queryset.filter(
            id__in=employee_ids,
            exported_to_infinite_vision=False
        )

        exported_count = 0
        for employee in employees:
            # TODO: Implement actual Infinite Vision API integration
            employee.exported_to_infinite_vision = True
            employee.export_date = timezone.now()
            employee.infinite_vision_employee_id = f"EMP-{uuid.uuid4().hex[:8].upper()}"
            employee.save()
            exported_count += 1

        return Response({
            'exported_count': exported_count,
            'message': f'Successfully exported {exported_count} employees to Infinite Vision'
        })
