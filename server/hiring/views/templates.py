from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status

from ..models import ScreeningQuestion, JobTemplate, OfferTemplate
from ..serializers import (
    ScreeningQuestionSerializer,
    JobTemplateSerializer,
    OfferTemplateSerializer
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
