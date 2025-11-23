from django.core.management.base import BaseCommand
from django.utils import timezone
from hiring.models import Position, JobApplication
from datetime import date, timedelta


class Command(BaseCommand):
    help = 'Creates test job applications for testing offer creation'

    def handle(self, *args, **options):
        # First, get or create a test position
        position, created = Position.objects.get_or_create(
            req_id='REQ-2025-0193',
            defaults={
                'title': 'High School Chemistry Teacher',
                'department': 'Science',
                'worksite': 'Central High School',
                'primary_job_title': 'Chemistry Teacher',
                'fte': 1.0,
                'salary_range': '$58,000 - $92,000',
                'start_date': date(2025, 8, 15),
                'status': 'Open',
                'employee_category': 'Certified Teacher',
                'eeoc_classification': 'Teacher',
                'workers_comp_classification': 'Teacher',
                'leave_plan': 'Standard',
                'deduction_template': 'Standard',
                'interview_stages': 3,
                'posting_start_date': date(2025, 9, 1),
                'posting_end_date': date(2025, 12, 31),
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'Created position: {position.title}'))
        else:
            self.stdout.write(self.style.WARNING(f'Using existing position: {position.title}'))

        # Create test applications
        test_applicants = [
            {
                'applicant_name': 'Sarah Johnson',
                'applicant_email': 'sarah.j.applicant@email.com',
                'applicant_phone': '555-0101',
                'current_role': 'Chemistry Teacher at District 204',
                'years_experience': 6,
                'certified': True,
                'internal': False,
                'stage': 'Interview',
                'current_interview_stage': 2,
                'completed_interview_stages': 2,
            },
            {
                'applicant_name': 'Michael Chen',
                'applicant_email': 'michael.chen.app@email.com',
                'applicant_phone': '555-0102',
                'current_role': 'Student Teacher - University of Illinois',
                'years_experience': 0,
                'certified': False,
                'internal': False,
                'stage': 'Screening',
                'current_interview_stage': 0,
                'completed_interview_stages': 0,
            },
            {
                'applicant_name': 'Amanda Rodriguez',
                'applicant_email': 'amanda.rodriguez@email.com',
                'applicant_phone': '555-0103',
                'current_role': 'Biology Teacher at Lincoln HS',
                'years_experience': 4,
                'certified': True,
                'internal': True,
                'stage': 'Reference Check',
                'current_interview_stage': 3,
                'completed_interview_stages': 3,
            },
        ]

        created_applications = []

        for applicant_data in test_applicants:
            # Check if application already exists
            existing = JobApplication.objects.filter(
                applicant_email=applicant_data['applicant_email'],
                position=position
            ).first()

            if existing:
                self.stdout.write(
                    self.style.WARNING(f'Application already exists for {applicant_data["applicant_name"]} (ID: {existing.id})')
                )
                created_applications.append(existing)
            else:
                # Create the application (resume is required, so we'll use a dummy path)
                application = JobApplication.objects.create(
                    position=position,
                    start_date_availability=date(2025, 8, 15),
                    resume='',  # Empty for now since it's a test
                    **applicant_data
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Created application for {applicant_data["applicant_name"]} (ID: {application.id})')
                )
                created_applications.append(application)

        # Print summary with UUIDs
        self.stdout.write(self.style.SUCCESS('\n=== Test Applications Created ==='))
        for app in created_applications:
            self.stdout.write(f'\nName: {app.applicant_name}')
            self.stdout.write(f'ID (UUID): {app.id}')
            self.stdout.write(f'Email: {app.applicant_email}')
            self.stdout.write(f'Stage: {app.stage}')
            self.stdout.write(f'Position: {app.position.title}')

        # Print curl command example
        if created_applications:
            app = created_applications[0]
            self.stdout.write(self.style.SUCCESS('\n=== Example cURL Command ==='))
            curl_cmd = f'''
curl -X POST http://localhost:8000/api/hiring/offers/ \\
  -H "Content-Type: application/json" \\
  -d '{{
    "application": "{app.id}",
    "salary": 65000,
    "fte": 1.0,
    "start_date": "2025-08-15",
    "benefits": ["Health Insurance", "Dental & Vision", "Retirement Plan"],
    "offer_date": "2025-11-03",
    "expiration_date": "2025-11-17"
  }}'
'''
            self.stdout.write(curl_cmd)
