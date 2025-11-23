from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ScreeningQuestionViewSet,
    JobTemplateViewSet,
    PositionViewSet,
    JobApplicationViewSet,
    InterviewViewSet,
    OfferTemplateViewSet,
    OfferViewSet,
    HiredEmployeeViewSet
)

router = DefaultRouter()
router.register(r'screening-questions', ScreeningQuestionViewSet, basename='screening-question')
router.register(r'templates', JobTemplateViewSet, basename='job-template')
router.register(r'positions', PositionViewSet, basename='position')
router.register(r'applications', JobApplicationViewSet, basename='job-application')
router.register(r'interviews', InterviewViewSet, basename='interview')
router.register(r'offer-templates', OfferTemplateViewSet, basename='offer-template')
router.register(r'offers', OfferViewSet, basename='offer')
router.register(r'hired-employees', HiredEmployeeViewSet, basename='hired-employee')

urlpatterns = [
    path('', include(router.urls)),
]