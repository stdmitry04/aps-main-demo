#!/usr/bin/env python
"""
Comprehensive demo data seeding script for K12 ERP system.
Seeds all major entities with realistic demo data.

Usage:
    python seed_demo_data.py                    # Seed all data
    python seed_demo_data.py --clear            # Clear all data first
    python seed_demo_data.py --docker           # Run in Docker container
"""
from django.contrib.auth import get_user_model
from core.models import SchoolDistrict
from authentication.models import UserEmail
from authentication.groups.models import ADGroupMapping
from hiring.models import (
    ScreeningQuestion, JobTemplate, Position, InterviewStage,
    Interviewer, JobApplication, Reference, Interview, Offer, HiredEmployee,
    OfferTemplate
)
from onboarding.models import OnboardingCandidate, OnboardingSectionData
from time_attendance.models import CalendarEvent, Timecard, TimeEntry, WorkLocation
import os
import sys
import django
import random
from datetime import datetime, date, timedelta, time
from decimal import Decimal
from uuid import UUID

# Setup Django FIRST before importing models
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'server'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

# Now import Django models after setup


User = get_user_model()


# ============================================================
# DEMO DATA CONFIGURATION
# ============================================================

DISTRICTS = [
    {
        'id': '2a73cea8-ddf9-4656-9c32-bf2c36320aa3',  # Fixed UUID for District 308
        'name': 'District 308',
        'code': 'district308',
        'contact_email': 'superintendent@vadimapsdatatechnologies.onmicrosoft.com',
        'contact_phone': '555-0308',
        'address': '856 West Dundee Avenue, Oswego, IL 60543',
    },
    {
        'id': 'b1e4d9f2-3c5a-4b7e-8d9f-1a2b3c4d5e6f',  # Fixed UUID for Riverside
        'name': 'Riverside Unified School District',
        'code': 'riverside',
        'contact_email': 'hr@riverside.k12.ca.us',
        'contact_phone': '555-0200',
        'address': '456 Learning Blvd, Riverside, CA 92501',
    },
]

AD_GROUPS = [
    # Real Entra ID groups for District 308
    {'name': 'School-Leadership', 'internal_group': 'admin',
        'ad_group_id': 'cafcb44c-5ac2-4910-a1bb-8998a74e8f4b'},
    {'name': 'HR-Staff', 'internal_group': 'hr',
        'ad_group_id': '54646a18-31e4-4016-956e-f7cf83bd9ebc'},
    {'name': 'Math-Teachers', 'internal_group': 'general_staff',
        'ad_group_id': 'b7895f9e-fd60-4c3b-a105-de05dd854929'},
    {'name': 'All-Teachers', 'internal_group': 'general_staff',
        'ad_group_id': '5f2ae509-6d04-4894-aaa9-cac7502aec99'},

    # Generic groups for other districts
    {'name': 'HR Department', 'internal_group': 'hr', 'ad_group_id': None},
    {'name': 'IT Administrators', 'internal_group': 'admin', 'ad_group_id': None},
    {'name': 'Teaching Staff', 'internal_group': 'general_staff', 'ad_group_id': None},
    {'name': 'Administrative Staff',
        'internal_group': 'general_staff', 'ad_group_id': None},
    {'name': 'Job Applicants', 'internal_group': 'candidate', 'ad_group_id': None},
]

USERS_PER_DISTRICT = [
    # Real Entra ID users (only for District 308)
    {
        'email': 'superintendent@vadimapsdatatechnologies.onmicrosoft.com',
        'first_name': 'Phillip',
        'last_name': 'Price',
        'job_title': 'Superintendent',
        'department': 'Administration',
        'ad_group': 'School-Leadership',
        'ad_group_ids': ['cafcb44c-5ac2-4910-a1bb-8998a74e8f4b'],
        'entra_id': '2e53a6f5-e5e4-484c-a1b6-74f3e7a097a7',
        'district_code': 'district308'
    },
    {
        'email': 'hr@vadimapsdatatechnologies.onmicrosoft.com',
        'first_name': 'Gideon',
        'last_name': 'Goddard',
        'job_title': 'HR Director',
        'department': 'Human Resources',
        'ad_group': 'HR-Staff',
        'ad_group_ids': ['54646a18-31e4-4016-956e-f7cf83bd9ebc'],
        'entra_id': '7929279d-a51b-408c-b567-1f4f42b8d8c0',
        'district_code': 'district308'
    },
    {
        'email': 'math.teacher3@vadimapsdatatechnologies.onmicrosoft.com',
        'first_name': 'Tyrell',
        'last_name': 'Wellick',
        'job_title': 'Math Teacher',
        'department': 'Mathematics',
        'ad_group': 'Math-Teachers',
        'ad_group_ids': ['b7895f9e-fd60-4c3b-a105-de05dd854929', '5f2ae509-6d04-4894-aaa9-cac7502aec99'],
        'entra_id': 'f1ae683c-bbc7-4c58-b175-c46e8f143561',
        'district_code': 'district308'
    },

    # Generic demo users (for all other districts)
    {'email': 'admin@{code}.edu', 'first_name': 'Admin', 'last_name': 'User', 'job_title': 'System Administrator',
        'department': 'IT', 'ad_group': 'IT Administrators', 'ad_group_ids': None, 'entra_id': None, 'district_code': None},
    {'email': 'hr.director@{code}.edu', 'first_name': 'Sarah', 'last_name': 'Johnson', 'job_title': 'HR Director',
        'department': 'Human Resources', 'ad_group': 'HR Department', 'ad_group_ids': None, 'entra_id': None, 'district_code': None},
    {'email': 'hr.manager@{code}.edu', 'first_name': 'Michael', 'last_name': 'Chen', 'job_title': 'HR Manager',
        'department': 'Human Resources', 'ad_group': 'HR Department', 'ad_group_ids': None, 'entra_id': None, 'district_code': None},
    {'email': 'principal@{code}.edu', 'first_name': 'Robert', 'last_name': 'Williams', 'job_title': 'Principal',
        'department': 'Administration', 'ad_group': 'Administrative Staff', 'ad_group_ids': None, 'entra_id': None, 'district_code': None},
    {'email': 'teacher1@{code}.edu', 'first_name': 'Emily', 'last_name': 'Davis', 'job_title': 'Math Teacher',
        'department': 'Mathematics', 'ad_group': 'Teaching Staff', 'ad_group_ids': None, 'entra_id': None, 'district_code': None},
    {'email': 'teacher2@{code}.edu', 'first_name': 'James', 'last_name': 'Martinez', 'job_title': 'Science Teacher',
        'department': 'Science', 'ad_group': 'Teaching Staff', 'ad_group_ids': None, 'entra_id': None, 'district_code': None},
]

JOB_TEMPLATES = [
    {
        'template_name': 'Elementary Teacher',
        'primary_job_title': 'Elementary School Teacher',
        'department': 'Elementary Education',
        'fte': Decimal('1.0'),
        'salary_range': '$45,000 - $65,000',
        'employee_category': 'Certificated',
        'interview_stages': 2,
    },
    {
        'template_name': 'High School Teacher',
        'primary_job_title': 'High School Teacher',
        'department': 'Secondary Education',
        'fte': Decimal('1.0'),
        'salary_range': '$50,000 - $75,000',
        'employee_category': 'Certificated',
        'interview_stages': 3,
    },
    {
        'template_name': 'Special Education Teacher',
        'primary_job_title': 'Special Education Teacher',
        'department': 'Special Education',
        'fte': Decimal('1.0'),
        'salary_range': '$52,000 - $78,000',
        'employee_category': 'Certificated',
        'interview_stages': 2,
    },
    {
        'template_name': 'Administrative Assistant',
        'primary_job_title': 'Administrative Assistant',
        'department': 'Administration',
        'fte': Decimal('1.0'),
        'salary_range': '$35,000 - $48,000',
        'employee_category': 'Classified',
        'interview_stages': 1,
    },
    {
        'template_name': 'Substitute Teacher',
        'primary_job_title': 'Substitute Teacher',
        'department': 'Various',
        'fte': Decimal('0.5'),
        'salary_range': '$150/day',
        'employee_category': 'Certificated',
        'interview_stages': 1,
    },
]

POSITIONS = [
    {
        'title': 'Riverside 5th Grade Teacher',
        'department': 'Elementary Education',
        'primary_job_title': 'Elementary School Teacher',
        'status': 'Open',
        'description': 'Seeking an enthusiastic and dedicated elementary school teacher...',
        'posting_days_ago': 14,
        'posting_duration_days': 30,
        'district_code': 'riverside',
        'req_id': 'REQ-RIVERSIDE-20240006',
    },
    {
        'title': 'Riverside High School Math Teacher',
        'department': 'Mathematics',
        'primary_job_title': 'High School Teacher',
        'status': 'Open',
        'description': 'Looking for a passionate math teacher to inspire students...',
        'posting_days_ago': 7,
        'posting_duration_days': 45,
        'district_code': 'riverside',
        'req_id': 'REQ-district308-20240007',
    },
    {
        'title': 'Riverside Special Education Coordinator',
        'department': 'Special Education',
        'primary_job_title': 'Special Education Teacher',
        'status': 'Open',
        'description': 'Lead our special education program and support diverse learners...',
        'posting_days_ago': 21,
        'posting_duration_days': 60,
        'district_code': 'riverside',
        'req_id': 'REQ-RIVERSIDE-20240008',
    },
    {
        'title': 'Riverside Front Office Administrator',
        'department': 'Administration',
        'primary_job_title': 'Administrative Assistant',
        'status': 'Open',
        'description': 'Organized and friendly administrative professional needed...',
        'posting_days_ago': 5,
        'posting_duration_days': 30,
        'district_code': 'riverside',
        'req_id': 'REQ-RIVERSIDE-20240009',
    },
    {
        'title': 'Riverside Substitute Teacher Pool',
        'department': 'Various',
        'primary_job_title': 'Substitute Teacher',
        'status': 'Open',
        'description': 'Join our substitute teacher pool for flexible opportunities...',
        'posting_days_ago': 30,
        'posting_duration_days': 90,
        'district_code': 'riverside',
        'req_id': 'REQ-RIVERSIDE-20240010',
    },
    {
        'title': 'Riverside Science Department Head',
        'department': 'Science',
        'primary_job_title': 'High School Teacher',
        'status': 'Closed',
        'description': 'Leadership position for experienced science educator...',
        'posting_days_ago': 60,
        'posting_duration_days': 45,
        'district_code': 'riverside',
        'req_id': 'REQ-RIVERSIDE-20240011',
    },

    {
        'title': '5th Grade Teacher',
        'department': 'Elementary Education',
        'primary_job_title': 'Elementary School Teacher',
        'status': 'Open',
        'description': 'Seeking an enthusiastic and dedicated elementary school teacher...',
        'posting_days_ago': 14,
        'posting_duration_days': 30,
        'district_code': 'district308',
        'req_id': 'REQ-sd308-20240006',
    },
    {
        'title': 'High School Math Teacher',
        'department': 'Mathematics',
        'primary_job_title': 'High School Teacher',
        'status': 'Open',
        'description': 'Looking for a passionate math teacher to inspire students...',
        'posting_days_ago': 7,
        'posting_duration_days': 45,
        'district_code': 'district308',
        'req_id': 'REQ-sd308-20240007',
    },
    {
        'title': 'Special Education Coordinator',
        'department': 'Special Education',
        'primary_job_title': 'Special Education Teacher',
        'status': 'Open',
        'description': 'Lead our special education program and support diverse learners...',
        'posting_days_ago': 21,
        'posting_duration_days': 60,
        'district_code': 'district308',
        'req_id': 'REQ-sd308-20240008',
    },
    {
        'title': 'Front Office Administrator',
        'department': 'Administration',
        'primary_job_title': 'Administrative Assistant',
        'status': 'Open',
        'description': 'Organized and friendly administrative professional needed...',
        'posting_days_ago': 5,
        'posting_duration_days': 30,
        'district_code': 'district308',
        'req_id': 'REQ-sd308-20240009',
    },
    {
        'title': 'Substitute Teacher Pool',
        'department': 'Various',
        'primary_job_title': 'Substitute Teacher',
        'status': 'Open',
        'description': 'Join our substitute teacher pool for flexible opportunities...',
        'posting_days_ago': 30,
        'posting_duration_days': 90,
        'district_code': 'district308',
        'req_id': 'REQ-sd308-20240010',
    },
    {
        'title': 'Science Department Head',
        'department': 'Science',
        'primary_job_title': 'High School Teacher',
        'status': 'Closed',
        'description': 'Leadership position for experienced science educator...',
        'posting_days_ago': 60,
        'posting_duration_days': 45,
        'district_code': 'district308',
        'req_id': 'REQ-sd308-20240011',
    },
    # Generic positions for other districts
    {
        'title': '5th Grade Teacher',
        'department': 'Elementary Education',
        'primary_job_title': 'Elementary School Teacher',
        'status': 'Open',
        'description': 'Seeking an enthusiastic and dedicated elementary school teacher...',
        'posting_days_ago': 14,
        'posting_duration_days': 30,
        'district_code': None,
    },
    {
        'title': 'High School Math Teacher',
        'department': 'Mathematics',
        'primary_job_title': 'High School Teacher',
        'status': 'Open',
        'description': 'Looking for a passionate math teacher to inspire students...',
        'posting_days_ago': 7,
        'posting_duration_days': 45,
        'district_code': None,
    },
    {
        'title': 'Special Education Coordinator',
        'department': 'Special Education',
        'primary_job_title': 'Special Education Teacher',
        'status': 'Open',
        'description': 'Lead our special education program and support diverse learners...',
        'posting_days_ago': 21,
        'posting_duration_days': 60,
        'district_code': None,
    },
]

SCREENING_QUESTIONS = [
    {'question': 'Do you hold a valid teaching certificate?',
        'category': 'certification', 'required': True},
    {'question': 'How many years of teaching experience do you have?',
        'category': 'experience', 'required': True},
    {'question': 'What is your area of teaching specialization?',
        'category': 'skills', 'required': True},
    {'question': 'Are you available to start on the specified date?',
        'category': 'availability', 'required': True},
    {'question': 'Do you have experience with special education students?',
        'category': 'experience', 'required': False},
    {'question': 'Are you proficient with education technology platforms?',
        'category': 'skills', 'required': False},
]

APPLICANTS = [
    {
        'name': 'Jessica Thompson',
        'email': 'jessica.thompson@email.com',
        'phone': '555-1001',
        'current_role': 'Student Teacher',
        'years_experience': 1,
        'certified': True,
        'internal': False,
        'stage': 'Interview',
        'current_interview_stage': 1,
    },
    {
        'name': 'David Rodriguez',
        'email': 'david.rodriguez@email.com',
        'phone': '555-1002',
        'current_role': 'Math Teacher',
        'years_experience': 5,
        'certified': True,
        'internal': False,
        'stage': 'Interview',
        'current_interview_stage': 2,
    },
    {
        'name': 'Amanda Lee',
        'email': 'amanda.lee@email.com',
        'phone': '555-1003',
        'current_role': 'Special Education Teacher',
        'years_experience': 8,
        'certified': True,
        'internal': False,
        'stage': 'Offer',
        'current_interview_stage': 3,
    },
    {
        'name': 'Kevin Brown',
        'email': 'kevin.brown@email.com',
        'phone': '555-1004',
        'current_role': 'Recent Graduate',
        'years_experience': 0,
        'certified': True,
        'internal': False,
        'stage': 'Application Review',
        'current_interview_stage': 0,
    },
    {
        'name': 'Lisa Anderson',
        'email': 'lisa.anderson@email.com',
        'phone': '555-1005',
        'current_role': 'Administrative Assistant',
        'years_experience': 6,
        'certified': False,
        'internal': False,
        'stage': 'Interview',
        'current_interview_stage': 1,
    },
]

WORK_LOCATIONS = [
    {
        'name': 'APS Tower',
        'address': '105 E Galena Blvd, Aurora, IL 60505',
        'latitude': Decimal('41.7606'),
        'longitude': Decimal('-88.3111'),
    },
    {
        'name': 'Main Administration Building',
        'address': '100 District Drive',
        'latitude': Decimal('39.7817'),
        'longitude': Decimal('-89.6501'),
    },
    {
        'name': 'Lincoln Elementary School',
        'address': '200 Lincoln Ave',
        'latitude': Decimal('39.7850'),
        'longitude': Decimal('-89.6450'),
    },
    {
        'name': 'Washington High School',
        'address': '300 Washington Blvd',
        'latitude': Decimal('39.7900'),
        'longitude': Decimal('-89.6600'),
    },
]

DEFAULT_OFFER_TEMPLATE = """{{districtName}}
{{districtAddress}}

{{offerDate}}

Dear {{candidateName}},

We are pleased to offer you the position of {{positionTitle}} with {{districtName}}. We were impressed by your qualifications and believe you will be an excellent addition to our team.

POSITION DETAILS:
- Position Title: {{positionTitle}}
- Department: {{department}}
- Worksite: {{worksite}}
- FTE (Full-Time Equivalent): {{fte}}
- Salary: {{salary}}
- Start Date: {{startDate}}

BENEFITS PACKAGE:
{{benefits}}

This offer is contingent upon successful completion of a background check and verification of your credentials. This offer will expire on {{expirationDate}}.

We are excited about the possibility of you joining our team and look forward to your response.

Sincerely,

{{hrDirectorName}}
{{hrDirectorTitle}}
{{districtName}}
"""


# ============================================================
# SEEDING FUNCTIONS
# ============================================================

def clear_all_data():
    """Clear all data from the database"""
    print("\n" + "="*60)
    print("CLEARING ALL DATA")
    print("="*60)

    models = [
        HiredEmployee, Offer, Interview, Reference, JobApplication,
        Interviewer, InterviewStage, Position, JobTemplate, OfferTemplate, ScreeningQuestion,
        OnboardingSectionData, OnboardingCandidate,
        TimeEntry, Timecard, CalendarEvent, WorkLocation,
        ADGroupMapping, UserEmail, User, SchoolDistrict,
    ]

    for model in models:
        count = model.objects.count()
        if count > 0:
            model.objects.all().delete()
            print(f"[DELETED] {model.__name__}: {count} records")

    print("\n[OK] All data cleared successfully\n")


def seed_offer_template():
    """Create or update the default offer template"""
    print("\n" + "="*60)
    print("SEEDING OFFER TEMPLATE")
    print("="*60)

    template, created = OfferTemplate.objects.get_or_create(
        name='Default Offer Template',
        defaults={
            'template_text': DEFAULT_OFFER_TEMPLATE,
            'is_active': True
        }
    )

    if not created:
        # Update existing template
        template.template_text = DEFAULT_OFFER_TEMPLATE
        template.is_active = True
        template.save()
        print(f"[Updated] {template.name}")
    else:
        print(f"[Created] {template.name}")

    # Show extracted fields
    fields = template.extract_fields()
    print(f"\nExtracted fields ({len(fields)}):")
    for field in sorted(fields):
        print(f"  - {field}")

    return template


def seed_districts():
    """Create school districts with fixed UUIDs"""
    print("\n" + "="*60)
    print("SEEDING DISTRICTS")
    print("="*60)

    districts = []
    for district_data in DISTRICTS:
        # Extract the ID and convert to UUID if provided
        district_id = district_data.get('id')
        if district_id:
            district_id = UUID(district_id) if isinstance(
                district_id, str) else district_id

        # Try to get existing district by ID first, then by code
        if district_id:
            try:
                district = SchoolDistrict.objects.get(id=district_id)
                created = False
            except SchoolDistrict.DoesNotExist:
                # Create with the specified ID
                district_data_copy = district_data.copy()
                district_data_copy['id'] = district_id
                district = SchoolDistrict.objects.create(**district_data_copy)
                created = True
        else:
            # Fallback to get_or_create by code if no ID specified
            district, created = SchoolDistrict.objects.get_or_create(
                code=district_data['code'],
                defaults=district_data
            )

        districts.append(district)
        status = "Created" if created else "Exists"
        print(f"[{status}] {district.name} (ID: {district.id})")

    return districts


def seed_ad_groups(district):
    """Create AD group mappings"""
    print(f"\n[District: {district.name}] Seeding AD groups...")

    mappings = []
    for i, group_data in enumerate(AD_GROUPS):
        # Use real AD group ID if provided, otherwise generate one
        ad_group_id = group_data.get(
            'ad_group_id') or f"ad-group-{district.code}-{i}"

        mapping, created = ADGroupMapping.objects.get_or_create(
            district=district,
            ad_group_name=group_data['name'],
            ad_group_id=ad_group_id,
            internal_group=group_data['internal_group'],
            defaults={'description': f'AD group for {group_data["name"]}'}
        )
        mappings.append(mapping)
        status = "Created" if created else "Exists"
        print(f"  [{status}] {mapping.ad_group_name} -> {mapping.internal_group}")

    return mappings


def seed_users(district, ad_mappings):
    """Create users for a district"""
    print(f"\n[District: {district.name}] Seeding users...")

    users = []
    for user_data in USERS_PER_DISTRICT:
        # Skip district-specific users if they don't match current district
        user_district_code = user_data.get('district_code')
        if user_district_code and user_district_code != district.code:
            continue

        # Skip generic users for districts that have specific users
        if not user_district_code and district.code == 'district308':
            continue

        email = user_data['email'].format(code=district.code)
        username = f"{district.code}_{email.split('@')[0]}"

        # Use real Entra ID if provided, otherwise generate one
        entra_id = user_data.get(
            'entra_id') or f'entra-{district.code}-{email.split("@")[0]}'

        # Get AD group IDs (use real IDs if provided, otherwise find from mapping)
        if user_data.get('ad_group_ids'):
            # Use real AD group IDs from Entra
            ad_group_ids = user_data['ad_group_ids']
            # For users with multiple AD groups, get all group names
            ad_group_names = [user_data['ad_group']]
            if len(ad_group_ids) > 1:
                # Find additional group names
                for mapping in ad_mappings:
                    if mapping.ad_group_id in ad_group_ids and mapping.ad_group_name not in ad_group_names:
                        ad_group_names.append(mapping.ad_group_name)
        else:
            # Find the AD group mapping for generic users
            ad_group_mapping = next(
                (m for m in ad_mappings if m.ad_group_name ==
                 user_data['ad_group']),
                None
            )
            ad_group_ids = [
                ad_group_mapping.ad_group_id] if ad_group_mapping else []
            ad_group_names = [user_data['ad_group']]

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'district': district,
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'job_title': user_data['job_title'],
                'department': user_data['department'],
                'is_email_verified': True,
                'is_active': True,
                'ad_groups': ad_group_names,
                'ad_group_ids': ad_group_ids,
                'entra_id': entra_id,
            }
        )

        # Create UserEmail
        if created:
            UserEmail.objects.create(
                user=user,
                email=email,
                is_primary=True
            )

        users.append(user)
        status = "Created" if created else "Exists"
        # Get primary email from UserEmail
        primary_email = user.user_emails.filter(is_primary=True).first()
        email_display = primary_email.email if primary_email else 'no-email'
        print(f"  [{status}] {email_display} ({user.first_name} {user.last_name})")

    return users


def seed_screening_questions(district):
    """Create screening questions"""
    print(f"\n[District: {district.name}] Seeding screening questions...")

    questions = []
    for q_data in SCREENING_QUESTIONS:
        question, created = ScreeningQuestion.objects.get_or_create(
            district=district,
            question=q_data['question'],
            defaults={
                'category': q_data['category'],
                'required': q_data['required'],
            }
        )
        questions.append(question)
        status = "Created" if created else "Exists"
        print(f"  [{status}] {question.question[:50]}...")

    return questions


def seed_job_templates(district):
    """Create job templates"""
    print(f"\n[District: {district.name}] Seeding job templates...")

    templates = []
    for template_data in JOB_TEMPLATES:
        template, created = JobTemplate.objects.get_or_create(
            district=district,
            template_name=template_data['template_name'],
            defaults={
                **template_data,
                'worksite': 'Various',
                'eeoc_classification': 'Professional',
                'workers_comp_classification': 'Education',
                'leave_plan': 'Standard',
                'deduction_template': 'Default',
            }
        )
        templates.append(template)
        status = "Created" if created else "Exists"
        print(f"  [{status}] {template.template_name}")

    return templates


def seed_positions(district, templates, screening_questions, users=None):
    """Create job positions"""
    print(f"\n[District: {district.name}] Seeding positions...")

    positions = []
    for i, pos_data in enumerate(POSITIONS):
        # Find matching template
        template = next(
            (t for t in templates if t.primary_job_title ==
             pos_data['primary_job_title']),
            None
        )

        start_date = date.today() + timedelta(days=60)
        posting_start = date.today() - \
            timedelta(days=pos_data['posting_days_ago'])
        posting_end = posting_start + \
            timedelta(days=pos_data['posting_duration_days'])

        position, created = Position.objects.get_or_create(
            district=district,
            req_id=f'REQ-{district.code.upper()}-{2024}{i+1:04d}',
            defaults={
                'title': pos_data['title'],
                'department': pos_data['department'],
                'primary_job_title': pos_data['primary_job_title'],
                'worksite': 'Main Campus',
                'fte': template.fte if template else Decimal('1.0'),
                'salary_range': template.salary_range if template else '$40,000 - $60,000',
                'start_date': start_date,
                'probation_date': start_date + timedelta(days=90),
                'status': pos_data['status'],
                'employee_category': template.employee_category if template else 'Classified',
                'eeoc_classification': 'Professional',
                'workers_comp_classification': 'Education',
                'leave_plan': 'Standard',
                'deduction_template': 'Default',
                'description': pos_data['description'],
                'requirements': 'Bachelor\'s degree required. Master\'s preferred.',
                'posting_start_date': posting_start,
                'posting_end_date': posting_end,
                'interview_stages': template.interview_stages if template else 2,
                'template': template,
            }
        )

        # Add screening questions (only for open positions)
        if created and position.status == 'Open':
            position.screening_questions.set(screening_questions[:4])

            # Create interview stages
            for stage_num in range(1, position.interview_stages + 1):
                stage_name = f"Stage {stage_num}: {'Phone Screen' if stage_num == 1 else 'Panel Interview' if stage_num == 2 else 'Final Interview'}"
                stage, stage_created = InterviewStage.objects.get_or_create(
                    district=district,
                    position=position,
                    stage_number=stage_num,
                    defaults={'stage_name': stage_name}
                )

                # Add interviewers to stage
                if stage_created and users:
                    # Get HR users and principals for interviews
                    hr_users = [
                        u for u in users if 'HR' in u.job_title or 'Human Resources' in u.department]
                    admin_users = [
                        u for u in users if 'Principal' in u.job_title or 'Superintendent' in u.job_title]

                    # Stage 1: HR Screening
                    if stage_num == 1 and hr_users:
                        for hr_user in hr_users[:1]:  # Add 1 HR person
                            Interviewer.objects.get_or_create(
                                stage=stage,
                                district=district,
                                email=hr_user.email,
                                defaults={
                                    'name': f"{hr_user.first_name} {hr_user.last_name}",
                                    'role': hr_user.job_title
                                }
                            )
                    # Stage 2: Panel Interview
                    elif stage_num == 2:
                        # Add HR + Admin
                        if hr_users:
                            Interviewer.objects.get_or_create(
                                stage=stage,
                                district=district,
                                email=hr_users[0].email,
                                defaults={
                                    'name': f"{hr_users[0].first_name} {hr_users[0].last_name}",
                                    'role': hr_users[0].job_title
                                }
                            )
                        if admin_users:
                            for admin in admin_users[:1]:
                                Interviewer.objects.get_or_create(
                                    stage=stage,
                                    district=district,
                                    email=admin.email,
                                    defaults={
                                        'name': f"{admin.first_name} {admin.last_name}",
                                        'role': admin.job_title
                                    }
                                )
                    # Stage 3: Final Interview
                    elif stage_num == 3 and admin_users:
                        for admin in admin_users[:2]:  # Add up to 2 admins
                            Interviewer.objects.get_or_create(
                                stage=stage,
                                district=district,
                                email=admin.email,
                                defaults={
                                    'name': f"{admin.first_name} {admin.last_name}",
                                    'role': admin.job_title
                                }
                            )

        positions.append(position)
        status = "Created" if created else "Exists"
        print(
            f"  [{status}] {position.req_id}: {position.title} ({position.status})")

    return positions


def seed_applications(district, positions, users):
    """Create job applications"""
    print(f"\n[District: {district.name}] Seeding applications...")

    applications = []
    open_positions = [p for p in positions if p.status == 'Open']

    for i, applicant_data in enumerate(APPLICANTS):
        if i >= len(open_positions):
            break

        position = open_positions[i]

        application, created = JobApplication.objects.get_or_create(
            district=district,
            position=position,
            applicant_email=applicant_data['email'],
            defaults={
                'applicant_name': applicant_data['name'],
                'applicant_phone': applicant_data['phone'],
                'start_date_availability': date.today() + timedelta(days=30),
                'current_role': applicant_data['current_role'],
                'years_experience': applicant_data['years_experience'],
                'certified': applicant_data['certified'],
                'internal': applicant_data['internal'],
                'stage': applicant_data['stage'],
                'current_interview_stage': applicant_data['current_interview_stage'],
                'completed_interview_stages': max(0, applicant_data['current_interview_stage'] - 1),
                'screening_answers': {
                    'q1': 'Yes' if applicant_data['certified'] else 'No',
                    'q2': str(applicant_data['years_experience']),
                    'q3': position.department,
                    'q4': 'Yes',
                },
                'cover_letter': f'I am very interested in the {position.title} position...',
            }
        )

        # Create interviews for applications in interview stage
        if created and application.stage == 'Interview':
            for stage_num in range(1, application.current_interview_stage + 1):
                stage = InterviewStage.objects.filter(
                    position=position,
                    stage_number=stage_num
                ).first()

                if stage:
                    interview_date = date.today() + timedelta(days=random.randint(5, 14))
                    # Generate zoom link for virtual interviews
                    zoom_link = f"https://zoom.us/j/{random.randint(100000000, 999999999)}"
                    Interview.objects.create(
                        district=district,
                        application=application,
                        stage=stage,
                        scheduled_date=interview_date,
                        scheduled_time=time(10, 0),  # 10:00 AM
                        location='Virtual Meeting' if stage_num == 1 else 'Conference Room A',
                        zoom_link=zoom_link if stage_num == 1 else '',
                        status='Scheduled',
                    )

        # Create offer for applications in Offer stage
        if created and application.stage == 'Offer':
            # Get active offer template
            offer_template = OfferTemplate.objects.filter(
                is_active=True).first()

            salary_amount = '55,000'
            start_date_formatted = (
                date.today() + timedelta(days=45)).strftime('%B %d, %Y')
            offer_date_formatted = date.today().strftime('%B %d, %Y')
            expiration_date_formatted = (
                date.today() + timedelta(days=14)).strftime('%B %d, %Y')

            # Prepare template data for all expected fields
            template_data = {
                'candidateName': application.applicant_name,
                'candidateEmail': application.applicant_email,
                'positionTitle': position.title,
                'department': position.department,
                'worksite': position.worksite,
                'fte': '1.0',
                'salary': salary_amount,
                'startDate': start_date_formatted,
                'offerDate': offer_date_formatted,
                'expirationDate': expiration_date_formatted,
                'districtName': district.name,
                'districtAddress': getattr(district, 'address', '856 West Dundee Avenue, Oswego, IL 60543'),
                'hrDirectorName': 'Dr. Jennifer Davis',
                'hrDirectorTitle': 'Director of Human Resources',
                'benefits': 'Health Insurance\nDental & Vision\nRetirement Plan (401k)\nPaid Time Off (PTO)\nProfessional Development'
            }

            Offer.objects.create(
                district=district,
                application=application,
                salary=Decimal('55000.00'),
                fte=Decimal('1.0'),
                start_date=date.today() + timedelta(days=45),
                offer_date=date.today(),
                expiration_date=date.today() + timedelta(days=14),
                status='Pending',
                benefits=['Health Insurance', 'Dental',
                          'Vision', 'Retirement', 'PTO'],
                template_text=offer_template.template_text if offer_template else '',
                template_data=template_data,
            )

        applications.append(application)
        status = "Created" if created else "Exists"
        print(
            f"  [{status}] {application.applicant_name} -> {position.title} ({application.stage})")

    return applications


def seed_onboarding(district, applications):
    """Create onboarding candidates"""
    print(f"\n[District: {district.name}] Seeding onboarding candidates...")

    candidates = []

    # Create onboarding for applications with offers
    offer_applications = [a for a in applications if a.stage == 'Offer']

    for application in offer_applications[:2]:  # Just first 2 for demo
        token = f'token-{district.code}-{application.id.hex[:8]}'

        candidate, created = OnboardingCandidate.objects.get_or_create(
            district=district,
            email=application.applicant_email,
            defaults={
                'name': application.applicant_name,
                'position': application.position.title,
                'offer_date': date.today(),
                'start_date': date.today() + timedelta(days=45),
                'status': 'in_progress',
                'completed_sections': 2,
                'access_token': token,
                'token_expires_at': datetime.now() + timedelta(days=90),
                'job_application': application,
            }
        )

        candidates.append(candidate)
        status = "Created" if created else "Exists"
        print(f"  [{status}] {candidate.name} - {candidate.position}")

    return candidates


def seed_work_locations(district):
    """Create work locations"""
    print(f"\n[District: {district.name}] Seeding work locations...")

    locations = []
    for loc_data in WORK_LOCATIONS:
        location, created = WorkLocation.objects.get_or_create(
            district=district,
            name=loc_data['name'],
            defaults={
                'address': loc_data['address'],
                'latitude': loc_data['latitude'],
                'longitude': loc_data['longitude'],
                'radius_miles': Decimal('0.25'),
            }
        )
        locations.append(location)
        status = "Created" if created else "Exists"
        print(f"  [{status}] {location.name}")

    return locations


def seed_timecards(district, users):
    """Create timecards for users"""
    print(f"\n[District: {district.name}] Seeding timecards...")

    timecards = []

    # Create timecards for staff users (not admins/candidates)
    staff_users = [u for u in users if 'teacher' in u.job_title.lower(
    ) or 'principal' in u.job_title.lower()]

    for user in staff_users[:3]:  # Just first 3 for demo
        # Current pay period
        period_start = date.today() - timedelta(days=date.today().weekday())  # Monday
        period_end = period_start + timedelta(days=13)  # 2 weeks

        timecard, created = Timecard.objects.get_or_create(
            district=district,
            user=user,
            period_start=period_start,
            period_end=period_end,
            defaults={
                'status': 'draft',
            }
        )

        # Add some time entries
        if created:
            for day_offset in range(0, 5):  # 5 days
                work_date = period_start + timedelta(days=day_offset)
                clock_in = datetime.combine(
                    work_date, datetime.strptime('08:00', '%H:%M').time())
                clock_out = datetime.combine(
                    work_date, datetime.strptime('16:00', '%H:%M').time())

                TimeEntry.objects.create(
                    district=district,
                    timecard=timecard,
                    clock_in=clock_in,
                    clock_out=clock_out,
                    break_duration=30,  # 30 minutes
                )

        timecards.append(timecard)
        status = "Created" if created else "Exists"
        print(
            f"  [{status}] Timecard for {user.first_name} {user.last_name} ({period_start} to {period_end})")

    return timecards


def seed_calendar_events(district, users):
    """Create calendar events"""
    print(f"\n[District: {district.name}] Seeding calendar events...")

    events = []
    staff_users = [u for u in users if 'teacher' in u.job_title.lower()]

    for user in staff_users[:2]:  # Just first 2 for demo
        # Create a few events
        event_data = [
            {'title': 'PTO Request', 'days_ahead': 10,
                'type': 'pending', 'request': 'time_off'},
            {'title': 'Approved Vacation', 'days_ahead': 30,
                'type': 'approved', 'request': 'time_off'},
            {'title': 'Staff Meeting', 'days_ahead': 3,
                'type': 'scheduled', 'request': 'none'},
        ]

        for event_info in event_data:
            event, created = CalendarEvent.objects.get_or_create(
                district=district,
                user=user,
                date=date.today() + timedelta(days=event_info['days_ahead']),
                title=event_info['title'],
                defaults={
                    'time': '9:00 AM',
                    'type': event_info['type'],
                    'request': event_info['request'],
                    'description': f'{event_info["title"]} for {user.first_name}',
                }
            )
            events.append(event)

    print(f"  [Created] {len(events)} calendar events")
    return events


# ============================================================
# MAIN EXECUTION
# ============================================================

def main():
    import argparse

    parser = argparse.ArgumentParser(description='Seed demo data for K12 ERP')
    parser.add_argument('--clear', action='store_true',
                        help='Clear all data before seeding')
    parser.add_argument('--docker', action='store_true',
                        help='Running in Docker (for logging)')
    args = parser.parse_args()

    print("\n" + "="*60)
    print("K12 ERP DEMO DATA SEEDING")
    print("="*60)
    print(f"Started at: {datetime.now()}")

    if args.clear:
        clear_all_data()

    # Seed global resources (not district-specific)
    offer_template = seed_offer_template()

    # Seed districts
    districts = seed_districts()

    # Seed data for each district
    for district in districts:
        print(f"\n{'='*60}")
        print(f"SEEDING DATA FOR: {district.name}")
        print(f"{'='*60}")

        # Core data
        ad_mappings = seed_ad_groups(district)
        users = seed_users(district, ad_mappings)
        screening_questions = seed_screening_questions(district)

        # Hiring data
        templates = seed_job_templates(district)
        positions = seed_positions(
            district, templates, screening_questions, users)
        applications = seed_applications(district, positions, users)

        # Onboarding data (DISABLED: has signal handler bug with missing district_id)
        # onboarding_candidates = seed_onboarding(district, applications)

        # Time & Attendance data
        work_locations = seed_work_locations(district)
        timecards = seed_timecards(district, users)
        calendar_events = seed_calendar_events(district, users)

    print("\n" + "="*60)
    print("SEEDING COMPLETE!")
    print("="*60)
    print(f"Completed at: {datetime.now()}")
    print(f"\nTotal records created:")
    print(f"  - Districts: {SchoolDistrict.objects.count()}")
    print(f"  - Users: {User.objects.count()}")
    print(f"  - AD Mappings: {ADGroupMapping.objects.count()}")
    print(f"  - Positions: {Position.objects.count()}")
    print(f"  - Applications: {JobApplication.objects.count()}")
    print(f"  - Offer Templates: {OfferTemplate.objects.count()}")
    print(f"  - Onboarding Candidates: {OnboardingCandidate.objects.count()}")
    print(f"  - Timecards: {Timecard.objects.count()}")
    print(f"  - Work Locations: {WorkLocation.objects.count()}")
    print("\n" + "="*60)

    # Print sample login credentials
    print("\nSAMPLE LOGIN CREDENTIALS:")
    print("="*60)
    for district in districts:
        print(f"\n{district.name}:")
        sample_users = User.objects.filter(district=district)[:3]
        for user in sample_users:
            print(f"  Email: {user.email}")
            print(f"  Role: {user.job_title}")
            print(f"  Department: {user.department}")
            print()


if __name__ == '__main__':
    main()
