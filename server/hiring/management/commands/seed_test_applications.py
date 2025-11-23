from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from hiring.models import Position, JobApplication
from core.models import SchoolDistrict
from datetime import date, timedelta
import uuid


class Command(BaseCommand):
    help = 'Seeds test positions and job applications for development'

    def handle(self, *args, **options):
        self.stdout.write('Seeding test positions and applications...')

        # Get or create default district
        district, _ = SchoolDistrict.objects.get_or_create(
            name='Default School District',
            defaults={
                'address': '123 Main St',
                'city': 'Springfield',
                'state': 'IL',
                'zip_code': '62701',
                'phone': '555-0100'
            }
        )

        # Create test positions
        positions_data = [
            {
                'title': 'High School Chemistry Teacher',
                'req_id': 'REQ-2025-0193',
                'department': 'Science',
                'worksite': 'Central High School',
                'salary_range': '$58,000 - $92,000',
                'fte': 1.0,
                'start_date': date(2025, 8, 15),
                'status': 'Open',
                'interview_stages': 3,
                'district': district,
            },
            {
                'title': 'Special Education Teacher',
                'req_id': 'REQ-2025-0194',
                'department': 'Special Education',
                'worksite': 'Lincoln Elementary',
                'salary_range': '$60,000 - $95,000',
                'fte': 1.0,
                'start_date': date(2025, 8, 15),
                'status': 'Open',
                'interview_stages': 3,
                'district': district,
            },
            {
                'title': 'ESL/Bilingual Teacher',
                'req_id': 'REQ-2025-0195',
                'department': 'English Language Development',
                'worksite': 'Washington Middle School',
                'salary_range': '$55,000 - $88,000',
                'fte': 1.0,
                'start_date': date(2025, 8, 15),
                'status': 'Open',
                'interview_stages': 2,
                'district': district,
            },
        ]

        positions = []
        for pos_data in positions_data:
            position, created = Position.objects.get_or_create(
                req_id=pos_data['req_id'],
                defaults=pos_data
            )
            positions.append(position)
            if created:
                self.stdout.write(f'  ✓ Created position: {position.title}')
            else:
                self.stdout.write(f'  → Position already exists: {position.title}')

        # Create test applications
        chemistry_position = positions[0]
        special_ed_position = positions[1]
        esl_position = positions[2]

        applications_data = [
            {
                'applicant_name': 'Sarah Johnson',
                'applicant_email': 'sarah.j.applicant@email.com',
                'position': chemistry_position,
                'current_role': 'Chemistry Teacher at District 204',
                'years_experience': 6,
                'certified': True,
                'internal': False,
                'stage': 'Interview',
                'current_interview_stage': 2,
                'completed_interview_stages': 2,
                'submitted_at': date.today() - timedelta(days=10),
                'start_date_availability': date(2025, 8, 1),
            },
            {
                'applicant_name': 'Michael Chen',
                'applicant_email': 'michael.chen.app@email.com',
                'position': chemistry_position,
                'current_role': 'Student Teacher - University of Illinois',
                'years_experience': 0,
                'certified': False,
                'internal': False,
                'stage': 'Screening',
                'current_interview_stage': 0,
                'completed_interview_stages': 0,
                'submitted_at': date.today() - timedelta(days=7),
                'start_date_availability': date(2025, 8, 15),
            },
            {
                'applicant_name': 'Amanda Rodriguez',
                'applicant_email': 'amanda.rodriguez@email.com',
                'position': chemistry_position,
                'current_role': 'Biology Teacher at Lincoln HS',
                'years_experience': 4,
                'certified': True,
                'internal': True,
                'stage': 'Reference Check',
                'current_interview_stage': 3,
                'completed_interview_stages': 3,
                'submitted_at': date.today() - timedelta(days=13),
                'start_date_availability': date(2025, 8, 1),
            },
            {
                'applicant_name': 'David Park',
                'applicant_email': 'david.park@email.com',
                'position': chemistry_position,
                'current_role': 'Chemistry Teacher at Private Academy',
                'years_experience': 8,
                'certified': True,
                'internal': False,
                'stage': 'Application Review',
                'current_interview_stage': 0,
                'completed_interview_stages': 0,
                'submitted_at': date.today() - timedelta(days=5),
                'start_date_availability': date(2025, 7, 15),
            },
            {
                'applicant_name': 'Emily Martinez',
                'applicant_email': 'emily.martinez@email.com',
                'position': special_ed_position,
                'current_role': 'Special Ed Teacher at Roosevelt Elementary',
                'years_experience': 5,
                'certified': True,
                'internal': False,
                'stage': 'Interview',
                'current_interview_stage': 1,
                'completed_interview_stages': 1,
                'submitted_at': date.today() - timedelta(days=15),
                'start_date_availability': date(2025, 8, 1),
            },
            {
                'applicant_name': 'Robert Thompson',
                'applicant_email': 'robert.t@email.com',
                'position': esl_position,
                'current_role': 'ESL Teacher at Washington MS',
                'years_experience': 3,
                'certified': True,
                'internal': False,
                'stage': 'Interview',
                'current_interview_stage': 2,
                'completed_interview_stages': 2,
                'submitted_at': date.today() - timedelta(days=11),
                'start_date_availability': date(2025, 8, 15),
            },
            {
                'applicant_name': 'Jennifer Williams',
                'applicant_email': 'jennifer.williams@email.com',
                'position': chemistry_position,
                'current_role': 'Chemistry Teacher at Oak Park High School',
                'years_experience': 7,
                'certified': True,
                'internal': False,
                'stage': 'Offer',
                'current_interview_stage': 3,
                'completed_interview_stages': 3,
                'submitted_at': date.today() - timedelta(days=20),
                'start_date_availability': date(2025, 8, 1),
            },
            {
                'applicant_name': 'Lisa Anderson',
                'applicant_email': 'lisa.anderson@email.com',
                'position': special_ed_position,
                'current_role': 'Special Education Teacher at Jefferson Elementary',
                'years_experience': 9,
                'certified': True,
                'internal': False,
                'stage': 'Offer',
                'current_interview_stage': 3,
                'completed_interview_stages': 3,
                'submitted_at': date.today() - timedelta(days=18),
                'start_date_availability': date(2025, 8, 1),
            },
        ]

        # Create a dummy resume file
        dummy_pdf_content = b'%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R /MediaBox [0 0 612 792] >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Sample Resume) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000317 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n408\n%%EOF'

        for app_data in applications_data:
            # Check if application already exists by email + position
            existing = JobApplication.objects.filter(
                applicant_email=app_data['applicant_email'],
                position=app_data['position']
            ).first()

            if existing:
                self.stdout.write(f'  → Application already exists: {app_data["applicant_name"]}')
            else:
                # Create resume file
                resume_filename = f"resume_{app_data['applicant_name'].replace(' ', '_')}.pdf"
                resume_file = ContentFile(dummy_pdf_content, name=resume_filename)

                # Add resume and district to app_data
                app_data['resume'] = resume_file
                app_data['district'] = district

                application = JobApplication.objects.create(**app_data)
                self.stdout.write(f'  ✓ Created application: {application.applicant_name} for {application.position.title}')

        self.stdout.write(self.style.SUCCESS('\n✅ Seeding complete!'))
        self.stdout.write(f'   Positions: {Position.objects.count()}')
        self.stdout.write(f'   Applications: {JobApplication.objects.count()}')
