from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import timedelta
import uuid

from ..models import Interview, Interviewer
from ..serializers import InterviewSerializer


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
