from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import timedelta

from ..models import Offer, HiredEmployee
from ..serializers import OfferSerializer


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
