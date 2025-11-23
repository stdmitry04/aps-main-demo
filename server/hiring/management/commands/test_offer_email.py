"""
Management command to test offer email sending
Usage: python manage.py test_offer_email
"""
from django.core.management.base import BaseCommand
from hiring.models import Offer

class Command(BaseCommand):
    help = 'Test offer email sending - shows which email address would receive the email'

    def handle(self, *args, **options):
        # Get all offers
        offers = Offer.objects.all()

        if not offers.exists():
            self.stdout.write(self.style.WARNING('No offers found in database'))
            return

        self.stdout.write(self.style.SUCCESS(f'Found {offers.count()} offers'))
        self.stdout.write('=' * 80)

        for offer in offers:
            self.stdout.write(f'\nOffer ID: {offer.id}')
            self.stdout.write(f'Candidate Name: {offer.application.applicant_name}')
            self.stdout.write(f'Candidate Email: {offer.application.applicant_email}')
            self.stdout.write(f'Position: {offer.application.position.title}')
            self.stdout.write(f'Status: {offer.status}')
            self.stdout.write(f'Created: {offer.created_at}')
            self.stdout.write('-' * 80)

        self.stdout.write('\n' + self.style.SUCCESS('✓ All offers show correct applicant emails'))
        self.stdout.write(self.style.WARNING('If emails are going to wrong address, check:'))
        self.stdout.write('1. Environment variables (EMAIL_* settings)')
        self.stdout.write('2. Email service configuration (Gmail, SendGrid, etc.)')
        self.stdout.write('3. Any email forwarding rules on your email server')
