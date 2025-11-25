from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
import uuid

from ..models import HiredEmployee
from ..serializers import HiredEmployeeSerializer


class HiredEmployeeViewSet(viewsets.ModelViewSet):
    """ViewSet for hired employees"""
    queryset = HiredEmployee.objects.all()
    serializer_class = HiredEmployeeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter,
                       DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['application__applicant_name',
                     'application__position__title']
    filterset_fields = ['exported_to_erp']
    ordering_fields = ['hire_date', 'export_date']
    ordering = ['-hire_date']

    @action(detail=True, methods=['post'])
    def export_to_erp(self, request, pk=None):
        """Export employee data to ERP system"""
        hired_employee = self.get_object()

        if hired_employee.exported_to_erp:
            return Response(
                {'error': 'Employee already exported to ERP system'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # TODO: Implement actual ERP API integration
        # For now, just mark as exported with mock employee ID
        hired_employee.exported_to_erp = True
        hired_employee.export_date = timezone.now()
        hired_employee.erp_employee_id = f"EMP-{uuid.uuid4().hex[:8].upper()}"
        hired_employee.save()

        serializer = self.get_serializer(hired_employee)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending_export(self, request):
        """Get employees pending export to ERP system"""
        pending = self.queryset.filter(exported_to_erp=False)
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_export(self, request):
        """Bulk export employees to ERP system"""
        employee_ids = request.data.get('employee_ids', [])

        if not employee_ids:
            return Response(
                {'error': 'employee_ids list is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        employees = self.queryset.filter(
            id__in=employee_ids,
            exported_to_erp=False
        )

        exported_count = 0
        for employee in employees:
            # TODO: Implement actual ERP API integration
            employee.exported_to_erp = True
            employee.export_date = timezone.now()
            employee.erp_employee_id = f"EMP-{uuid.uuid4().hex[:8].upper()}"
            employee.save()
            exported_count += 1

        return Response({
            'exported_count': exported_count,
            'message': f'Successfully exported {exported_count} employees to ERP system'
        })
