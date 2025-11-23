from datetime import date, time
from hiring.models import Position, JobApplication, InterviewStage, Interview, Interviewer

# Create a test position with all required fields
position, created = Position.objects.get_or_create(
    req_id='TEST-2025-001',
    defaults={
        'title': 'High School Math Teacher',
        'department': 'Mathematics',
        'worksite': 'Central High School',
        'primary_job_title': 'Teacher',
        'fte': 1.0,
        'salary_range': '$45,000 - $65,000',
        'start_date': date(2025, 8, 15),
        'description': 'Teaching mathematics to high school students',
        'requirements': "Bachelor's degree in Mathematics or Education",
        'posting_start_date': date(2025, 1, 1),
        'posting_end_date': date(2025, 6, 30),
        'status': 'Open',
        'employee_category': 'Teacher',
        'eeoc_classification': 'Professional',
        'workers_comp_classification': 'Education',
        'leave_plan': 'Teacher Leave Plan',
        'deduction_template': 'Standard',
    }
)

print(f"{'Created' if created else 'Found'} position: {position.title} ({position.req_id})")

# Create interview stage
stage1, created = InterviewStage.objects.get_or_create(
    position=position,
    stage_number=1,
    defaults={
        'stage_name': 'Initial Screening',
    }
)

print(f"{'Created' if created else 'Found'} stage: {stage1.stage_name}")

# Create interviewers if stage was just created
if created or not stage1.interviewers.exists():
    Interviewer.objects.get_or_create(
        stage=stage1,
        email='sarah.johnson@district.edu',
        defaults={
            'name': 'Dr. Sarah Johnson',
            'role': 'HR Manager'
        }
    )
    Interviewer.objects.get_or_create(
        stage=stage1,
        email='robert.martinez@district.edu',
        defaults={
            'name': 'Robert Martinez',
            'role': 'Department Head'
        }
    )
    print("Added interviewers")

# Create a test application
application, created = JobApplication.objects.get_or_create(
    applicant_email='john.doe@example.com',
    position=position,
    defaults={
        'applicant_name': 'John Doe',
        'applicant_phone': '555-0123',
        'start_date_availability': date(2025, 8, 15),
        'current_role': 'Math Teacher',
        'years_experience': 5,
        'cover_letter': 'I am passionate about teaching mathematics...',
        'stage': 'Interview',
        'certified': True,
        'internal': False,
    }
)

print(f"{'Created' if created else 'Found'} application: {application.applicant_name}")

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

print(f"\n{'✓ Created' if created else '✓ Found existing'} interview:")
print(f"  ID: {interview.id}")
print(f"  Candidate: {application.applicant_name}")
print(f"  Position: {position.title}")
print(f"  Date: {interview.scheduled_date}")
print(f"  Time: {interview.scheduled_time}")
print(f"  Status: {interview.status}")
print(f"\n✅ Check the interviews page at http://localhost:3000/hiring/interviews")
