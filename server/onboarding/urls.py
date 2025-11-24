from django.urls import path
from .views import (
    OnboardingCandidateViewSet,
    OnboardingDocumentViewSet,
)

urlpatterns = [
    # Onboarding Candidate endpoints
    path('candidates/', OnboardingCandidateViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='onboarding-candidate-list'),

    path('candidates/<uuid:pk>/', OnboardingCandidateViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='onboarding-candidate-detail'),

    path('candidates/<uuid:pk>/update_section/', OnboardingCandidateViewSet.as_view({
        'post': 'update_section'
    }), name='onboarding-candidate-update-section'),

    path('candidates/<uuid:pk>/submit/', OnboardingCandidateViewSet.as_view({
        'post': 'submit'
    }), name='onboarding-candidate-submit'),

    path('candidates/<uuid:pk>/review/', OnboardingCandidateViewSet.as_view({
        'post': 'review'
    }), name='onboarding-candidate-review'),

    path('candidates/<uuid:pk>/progress/', OnboardingCandidateViewSet.as_view({
        'get': 'progress'
    }), name='onboarding-candidate-progress'),

    path('candidates/<uuid:pk>/audit-log/', OnboardingCandidateViewSet.as_view({
        'get': 'audit_log'
    }), name='onboarding-candidate-audit-log'),

    path('candidates/stats/', OnboardingCandidateViewSet.as_view({
        'get': 'stats'
    }), name='onboarding-candidate-stats'),

    path('candidates/applicants-awaiting-onboarding/', OnboardingCandidateViewSet.as_view({
        'get': 'applicants_awaiting_onboarding'
    }), name='onboarding-candidate-applicants-awaiting'),

    path('candidates/validate-token/', OnboardingCandidateViewSet.as_view({
        'get': 'validate_token'
    }), name='onboarding-candidate-validate-token'),

    # Onboarding Document endpoints
    path('documents/', OnboardingDocumentViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='onboarding-document-list'),

    path('documents/<uuid:pk>/', OnboardingDocumentViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='onboarding-document-detail'),

    path('documents/<uuid:pk>/verify/', OnboardingDocumentViewSet.as_view({
        'post': 'verify'
    }), name='onboarding-document-verify'),
]
