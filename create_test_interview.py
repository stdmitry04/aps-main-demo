#!/usr/bin/env python
"""
Script to create a test interview in the database
"""
import os
import sys
import django
from datetime import date, time

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from hiring.models import Position, JobApplication, InterviewStage, Interview, Interviewer

def create_test_data():
    # Create a test position
    position, created = Position.objects.get_or_create(
        req_id='TEST-2025-001',
        defaults={
            'title': 'High School Math Teacher',
            'department': 'Mathematics',
            'worksite': 'Central High School',
            'fte': 1.0,
            'salary_range': '$45,000 - $65,000',
            'start_date': date(2025, 8, 15),
            'description': 'Teaching mathematics to high school students',
            'requirements': 'Bachelor\'s degree in Mathematics or Education',
            'posting_start_date': date(2025, 1, 1),
            'posting_end_date': date(2025, 6, 30),
            'status': 'Open',
            'employee_category': 'Teacher',
        }
    )

    if created:
        print(f"✓ Created position: {position.title} ({position.req_id})")
    else:
        print(f"✓ Using existing position: {position.title} ({position.req_id})")

    # Create interview stages
    stage1, created = InterviewStage.objects.get_or_create(
        position=position,
        stage_number=1,
        defaults={
            'stage_name': 'Initial Screening',
            'description': 'Phone screening with HR'
        }
    )

    if created:
        print(f"✓ Created stage: {stage1.stage_name}")

        # Create interviewers for stage 1
        interviewer1 = Interviewer.objects.create(
            stage=stage1,
            name='Dr. Sarah Johnson',
            email='sarah.johnson@district.edu',
            role='HR Manager'
        )
        print(f"  ✓ Added interviewer: {interviewer1.name}")

        interviewer2 = Interviewer.objects.create(
            stage=stage1,
            name='Robert Martinez',
            email='robert.martinez@district.edu',
            role='Department Head'
        )
        print(f"  ✓ Added interviewer: {interviewer2.name}")
    else:
        print(f"✓ Using existing stage: {stage1.stage_name}")

    # Create a test application
    application, created = JobApplication.objects.get_or_create(
        applicant_email='john.doe@example.com',
        position=position,
        defaults={
            'applicant_name': 'John Doe',
            'phone': '555-0123',
            'current_role': 'Math Teacher',
            'years_experience': 5,
            'education': 'Master of Education - Mathematics',
            'certifications': 'State Teaching License, AP Calculus Certified',
            'resume_url': 'https://example.com/resume.pdf',
            'cover_letter': 'I am passionate about teaching mathematics...',
            'stage': 'Interview',
            'certified': True,
            'internal': False,
        }
    )

    if created:
        print(f"✓ Created application: {application.applicant_name}")
    else:
        print(f"✓ Using existing application: {application.applicant_name}")

    # Create a test interview
    interview, created = Interview.objects.get_or_create(
        application=application,
        stage=stage1,
        scheduled_date=date(2025, 11, 15),
        defaults={
            'scheduled_time': time(10, 0),
            'location': 'Central High School - Room 204',
            'zoom_link': 'https://zoom.us/j/1234567890',
            'status': 'Scheduled',
            'notes': 'First round screening interview',
        }
    )

    if created:
        print(f"✓ Created interview: {interview.id}")
        print(f"  - Candidate: {application.applicant_name}")
        print(f"  - Position: {position.title}")
        print(f"  - Date: {interview.scheduled_date}")
        print(f"  - Time: {interview.scheduled_time}")
        print(f"  - Status: {interview.status}")
    else:
        print(f"✓ Interview already exists: {interview.id}")

    print("\n" + "="*50)
    print("Test data created successfully!")
    print("="*50)
    print(f"\nInterview ID: {interview.id}")
    print(f"Application ID: {application.id}")
    print(f"Position ID: {position.id}")
    print(f"Stage ID: {stage1.id}")

    return interview

if __name__ == '__main__':
    try:
        interview = create_test_data()
        print("\n✅ You can now check the interviews page in the frontend!")
    except Exception as e:
        print(f"\n❌ Error creating test data: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
