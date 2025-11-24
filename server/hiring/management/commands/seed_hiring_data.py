from django.core.management.base import BaseCommand
from hiring.models import ScreeningQuestion, JobTemplate, InterviewStage, Interviewer


class Command(BaseCommand):
    help = 'Seeds the database with initial hiring and onboarding data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding screening questions...')
        self.seed_screening_questions()

        self.stdout.write('Seeding job templates...')
        self.seed_job_templates()

        self.stdout.write(self.style.SUCCESS('Successfully seeded hiring data!'))

    def seed_screening_questions(self):
        questions = [
            {
                'question': 'Do you currently hold a valid teaching certification in the state of Illinois?',
                'category': 'certification',
                'required': True
            },
            {
                'question': 'What type of teaching certification do you hold? (e.g., Type 03, Type 09, LBS1, etc.)',
                'category': 'certification',
                'required': True
            },
            {
                'question': 'How many years of teaching experience do you have in your subject area?',
                'category': 'experience',
                'required': True
            },
            {
                'question': 'Describe your experience working with diverse student populations.',
                'category': 'experience',
                'required': True
            },
            {
                'question': 'Have you previously worked in a K-12 educational setting?',
                'category': 'experience',
                'required': True
            },
            {
                'question': 'What learning management systems (LMS) are you proficient in? (e.g., Canvas, Schoology, Google Classroom)',
                'category': 'skills',
                'required': False
            },
            {
                'question': 'Describe your approach to classroom management and student engagement.',
                'category': 'skills',
                'required': True
            },
            {
                'question': 'What strategies do you use to differentiate instruction for students with varying abilities?',
                'category': 'skills',
                'required': True
            },
            {
                'question': 'Are you available to work full-time (1.0 FTE)?',
                'category': 'availability',
                'required': True
            },
            {
                'question': 'Are you willing to participate in after-school activities, professional development, or extracurricular programs?',
                'category': 'availability',
                'required': False
            },
            {
                'question': 'Why are you interested in joining School Demo District?',
                'category': 'general',
                'required': True
            },
            {
                'question': 'What do you believe are the most important qualities of an effective educator?',
                'category': 'general',
                'required': True
            },
            {
                'question': 'How do you stay current with educational best practices and pedagogical approaches?',
                'category': 'general',
                'required': False
            },
            {
                'question': 'Do you have experience developing and implementing Individualized Education Programs (IEPs)?',
                'category': 'skills',
                'required': False
            },
            {
                'question': 'What is your experience working with students with special needs?',
                'category': 'experience',
                'required': False
            }
        ]

        for q_data in questions:
            ScreeningQuestion.objects.get_or_create(**q_data)

        self.stdout.write(f'  Created {len(questions)} screening questions')

    def seed_job_templates(self):
        templates = [
            {
                'template_name': 'High School Teacher',
                'primary_job_title': 'High School Teacher',
                'department': 'Science',
                'worksite': 'Central High School',
                'fte': 1.0,
                'salary_range': '$58,000 - $92,000',
                'employee_category': 'Certified Teacher',
                'eeoc_classification': '2 - Professionals',
                'workers_comp_classification': '8868 - Teachers',
                'leave_plan': 'Teacher - 10 Month',
                'deduction_template': 'Teacher - Standard',
                'interview_stages': 2
            },
            {
                'template_name': 'Middle School Teacher',
                'primary_job_title': 'Middle School Teacher',
                'department': 'Mathematics',
                'worksite': 'Washington Middle School',
                'fte': 1.0,
                'salary_range': '$55,000 - $88,000',
                'employee_category': 'Certified Teacher',
                'eeoc_classification': '2 - Professionals',
                'workers_comp_classification': '8868 - Teachers',
                'leave_plan': 'Teacher - 10 Month',
                'deduction_template': 'Teacher - Standard',
                'interview_stages': 2
            },
            {
                'template_name': 'Elementary Teacher',
                'primary_job_title': 'Elementary Teacher',
                'department': 'Elementary Education',
                'worksite': 'Lincoln Elementary',
                'fte': 1.0,
                'salary_range': '$55,000 - $88,000',
                'employee_category': 'Certified Teacher',
                'eeoc_classification': '2 - Professionals',
                'workers_comp_classification': '8868 - Teachers',
                'leave_plan': 'Teacher - 10 Month',
                'deduction_template': 'Teacher - Standard',
                'interview_stages': 2
            },
            {
                'template_name': 'Special Education Teacher',
                'primary_job_title': 'Special Education Teacher',
                'department': 'Special Education',
                'worksite': '',
                'fte': 1.0,
                'salary_range': '$60,000 - $95,000',
                'employee_category': 'Certified Teacher',
                'eeoc_classification': '2 - Professionals',
                'workers_comp_classification': '8868 - Teachers',
                'leave_plan': 'Teacher - 10 Month',
                'deduction_template': 'Teacher - Standard',
                'interview_stages': 3
            },
            {
                'template_name': 'ESL Teacher',
                'primary_job_title': 'ESL Teacher',
                'department': 'English Language Development',
                'worksite': '',
                'fte': 1.0,
                'salary_range': '$55,000 - $88,000',
                'employee_category': 'Certified Teacher',
                'eeoc_classification': '2 - Professionals',
                'workers_comp_classification': '8868 - Teachers',
                'leave_plan': 'Teacher - 10 Month',
                'deduction_template': 'Teacher - Standard',
                'interview_stages': 2
            },
            {
                'template_name': 'School Administrator',
                'primary_job_title': 'School Administrator',
                'department': 'Administration',
                'worksite': '',
                'fte': 1.0,
                'salary_range': '$85,000 - $130,000',
                'employee_category': 'Administrator',
                'eeoc_classification': '1.2 - First/Mid Officials & Managers',
                'workers_comp_classification': '8842 - School Administrators',
                'leave_plan': 'Administrator - 12 Month',
                'deduction_template': 'Administrator - Standard',
                'interview_stages': 3
            },
            {
                'template_name': 'Principal',
                'primary_job_title': 'Principal',
                'department': 'Administration',
                'worksite': '',
                'fte': 1.0,
                'salary_range': '$95,000 - $145,000',
                'employee_category': 'Administrator',
                'eeoc_classification': '1.2 - First/Mid Officials & Managers',
                'workers_comp_classification': '8842 - School Administrators',
                'leave_plan': 'Administrator - 12 Month',
                'deduction_template': 'Administrator - Standard',
                'interview_stages': 3
            },
            {
                'template_name': 'Support Staff',
                'primary_job_title': 'Support Staff',
                'department': '',
                'worksite': '',
                'fte': 1.0,
                'salary_range': '$35,000 - $52,000',
                'employee_category': 'Support Staff',
                'eeoc_classification': '5 - Administrative Support',
                'workers_comp_classification': '8810 - Clerical Office',
                'leave_plan': 'Support Staff - 10 Days',
                'deduction_template': 'Support Staff - Standard',
                'interview_stages': 1
            },
            {
                'template_name': 'Paraprofessional',
                'primary_job_title': 'Paraprofessional',
                'department': 'Special Education',
                'worksite': '',
                'fte': 1.0,
                'salary_range': '$35,000 - $52,000',
                'employee_category': 'Paraprofessional',
                'eeoc_classification': '5 - Administrative Support',
                'workers_comp_classification': '8868 - Teachers',
                'leave_plan': 'Support Staff - 10 Days',
                'deduction_template': 'Support Staff - Standard',
                'interview_stages': 1
            }
        ]

        for template_data in templates:
            JobTemplate.objects.get_or_create(
                template_name=template_data['template_name'],
                defaults=template_data
            )

        self.stdout.write(f'  Created {len(templates)} job templates')