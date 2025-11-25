from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
import json

from ..models import (
    Position,
    JobApplication,
    Reference,
    InterviewAvailability
)
from ..serializers import (
    JobApplicationListSerializer,
    JobApplicationDetailSerializer
)


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
