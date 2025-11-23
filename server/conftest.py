"""
Pytest configuration and shared fixtures for the K12 ERP project.

This file provides reusable test fixtures and utilities that can be used
across all test modules in the backend.
"""

import pytest
from datetime import date, timedelta


# Django fixtures should be imported in the fixture functions themselves
# to avoid importing before pytest-django sets up Django


@pytest.fixture
def User(db):
    """Import User model after Django is configured"""
    from authentication.models import User
    return User


@pytest.fixture
def SchoolDistrict(db):
    """Import SchoolDistrict model after Django is configured"""
    from core.models import SchoolDistrict
    return SchoolDistrict


@pytest.fixture
def district1(db):
    """Create a test school district"""
    from core.models import SchoolDistrict
    return SchoolDistrict.objects.create(
        name="Test District 1",
        code="test-district-1",
        is_active=True
    )


@pytest.fixture
def district2(db):
    """Create a second test school district for multi-tenancy tests"""
    from core.models import SchoolDistrict
    return SchoolDistrict.objects.create(
        name="Test District 2",
        code="test-district-2",
        is_active=True
    )


@pytest.fixture
def test_user(db, district1):
    """Create a standard test user"""
    from authentication.models import User
    return User.objects.create_user(
        username="testuser@test.com",
        email="testuser@test.com",
        district=district1,
        first_name="Test",
        last_name="User"
    )


@pytest.fixture
def test_user2(db, district2):
    """Create a second test user in a different district"""
    from authentication.models import User
    return User.objects.create_user(
        username="testuser2@test.com",
        email="testuser2@test.com",
        district=district2,
        first_name="Test",
        last_name="User 2"
    )


@pytest.fixture
def superintendent_user(db, district1):
    """Create a superintendent user with elevated permissions"""
    from authentication.models import User
    user = User.objects.create_user(
        username="superintendent@test.com",
        email="superintendent@test.com",
        district=district1,
        first_name="Super",
        last_name="Intendent"
    )
    user.is_superintendent = True
    user.save()
    return user


@pytest.fixture
def api_client():
    """Create an API client for testing"""
    from rest_framework.test import APIClient
    return APIClient()


@pytest.fixture
def authenticated_client(api_client, test_user):
    """Create an authenticated API client"""
    api_client.force_authenticate(user=test_user)
    return api_client


@pytest.fixture
def today():
    """Return today's date"""
    return date.today()


@pytest.fixture
def tomorrow(today):
    """Return tomorrow's date"""
    return today + timedelta(days=1)


@pytest.fixture
def next_week(today):
    """Return a date one week from today"""
    return today + timedelta(days=7)
