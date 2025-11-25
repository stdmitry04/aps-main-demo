"""
Hiring module views
Organized by functional area for better maintainability
"""

from .templates import (
    ScreeningQuestionViewSet,
    JobTemplateViewSet,
    OfferTemplateViewSet
)
from .positions import PositionViewSet
from .applications import JobApplicationViewSet
from .interviews import InterviewViewSet
from .offers import OfferViewSet
from .employees import HiredEmployeeViewSet

__all__ = [
    'ScreeningQuestionViewSet',
    'JobTemplateViewSet',
    'OfferTemplateViewSet',
    'PositionViewSet',
    'JobApplicationViewSet',
    'InterviewViewSet',
    'OfferViewSet',
    'HiredEmployeeViewSet',
]
