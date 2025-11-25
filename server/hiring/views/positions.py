from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q

from ..models import Position, JobApplication, Offer
from ..serializers import (
    PositionListSerializer,
    PositionDetailSerializer,
    PublicPositionSerializer,
    JobApplicationListSerializer
)


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
