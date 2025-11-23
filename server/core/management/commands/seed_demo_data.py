"""
Django management command to seed demo data.
Usage: python manage.py seed_demo_data [--clear]
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import random
from datetime import datetime, date, timedelta, time
from decimal import Decimal

from core.models import SchoolDistrict
from authentication.models import UserEmail
from authentication.groups.models import ADGroupMapping
from hiring.models import (
    ScreeningQuestion, JobTemplate, Position, InterviewStage,
    Interviewer, JobApplication, Reference, Interview, Offer, HiredEmployee
)
from onboarding.models import OnboardingCandidate, OnboardingSectionData
from time_attendance.models import CalendarEvent, Timecard, TimeEntry, WorkLocation

User = get_user_model()

# Import all the configuration and seeding functions from the standalone script
# (We'll paste the config and functions here)
