"""
Management command to seed the default offer template
Usage: python manage.py seed_offer_template
"""
from django.core.management.base import BaseCommand
from hiring.models import OfferTemplate

DEFAULT_TEMPLATE = """{{districtName}}
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


class Command(BaseCommand):
    help = 'Seed the default offer template'

    def handle(self, *args, **options):
        # Check if template already exists
        template = OfferTemplate.objects.filter(name='Default Offer Template').first()

        if template:
            self.stdout.write(self.style.WARNING('Default template already exists. Updating...'))
            template.template_text = DEFAULT_TEMPLATE
            template.is_active = True
            template.save()
            self.stdout.write(self.style.SUCCESS('✓ Default template updated'))
        else:
            template = OfferTemplate.objects.create(
                name='Default Offer Template',
                template_text=DEFAULT_TEMPLATE,
                is_active=True
            )
            self.stdout.write(self.style.SUCCESS('✓ Default template created'))

        # Show extracted fields
        fields = template.extract_fields()
        self.stdout.write(f'\nExtracted fields ({len(fields)}):')
        for field in sorted(fields):
            self.stdout.write(f'  - {field}')

        self.stdout.write('\n' + self.style.SUCCESS('Done! Template is ready to use.'))
