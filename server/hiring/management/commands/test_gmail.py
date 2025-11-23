"""
Management command to test Gmail SMTP configuration
Usage: python manage.py test_gmail [email_address]
"""
from django.core.management.base import BaseCommand
from django.core.mail import EmailMultiAlternatives
from django.conf import settings


class Command(BaseCommand):
    help = 'Test Gmail SMTP configuration by sending a test email'

    def add_arguments(self, parser):
        parser.add_argument(
            'email',
            nargs='?',
            type=str,
            default='starodu5@gmail.com',
            help='Email address to send test email to (default: starodu5@gmail.com)'
        )

    def handle(self, *args, **options):
        recipient_email = options['email']

        self.stdout.write('=' * 80)
        self.stdout.write(self.style.SUCCESS('Gmail SMTP Configuration Test'))
        self.stdout.write('=' * 80)

        # Display current settings
        self.stdout.write(f'\nEmail Backend: {settings.EMAIL_BACKEND}')
        self.stdout.write(f'SMTP Host: {settings.EMAIL_HOST}')
        self.stdout.write(f'SMTP Port: {settings.EMAIL_PORT}')
        self.stdout.write(f'Use TLS: {settings.EMAIL_USE_TLS}')
        self.stdout.write(f'From Email: {settings.EMAIL_HOST_USER}')
        self.stdout.write(f'Default From: {settings.DEFAULT_FROM_EMAIL}')
        self.stdout.write(f'Recipient: {recipient_email}\n')

        # Create HTML email
        subject = 'Test Email from K12 ERP System'

        plain_text = """
This is a test email from the K12 ERP system.

If you're receiving this, your Gmail SMTP configuration is working correctly!

Best regards,
K12 ERP System
"""

        html_content = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="background-color: #34a853; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; margin: -30px -30px 30px -30px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">✓ Gmail SMTP Test Successful</h1>
        </div>

        <p style="margin: 15px 0; color: #333333;">This is a test email from the K12 ERP system.</p>

        <p style="margin: 15px 0; color: #333333;">If you're receiving this, your <strong>Gmail SMTP configuration is working correctly!</strong></p>

        <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #34a853; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 5px 0; color: #555555;"><strong>Email Backend:</strong> {backend}</p>
            <p style="margin: 5px 0; color: #555555;"><strong>SMTP Host:</strong> {host}</p>
            <p style="margin: 5px 0; color: #555555;"><strong>SMTP Port:</strong> {port}</p>
            <p style="margin: 5px 0; color: #555555;"><strong>From:</strong> {from_email}</p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666666; font-size: 12px; text-align: center;">
            <p style="margin: 5px 0;"><strong>K12 ERP System</strong></p>
            <p style="margin: 5px 0;">This is an automated test message.</p>
        </div>
    </div>
</body>
</html>
""".format(
            backend=settings.EMAIL_BACKEND,
            host=settings.EMAIL_HOST,
            port=settings.EMAIL_PORT,
            from_email=settings.EMAIL_HOST_USER
        )

        try:
            self.stdout.write(self.style.WARNING('\nSending test email...'))

            msg = EmailMultiAlternatives(
                subject=subject,
                body=plain_text,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[recipient_email]
            )
            msg.attach_alternative(html_content, "text/html")
            msg.send(fail_silently=False)

            self.stdout.write(self.style.SUCCESS('\n✓ Test email sent successfully!'))
            self.stdout.write(f'Check {recipient_email} for the test message.\n')

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n✗ Failed to send email: {str(e)}'))
            self.stdout.write(self.style.WARNING('\nTroubleshooting tips:'))
            self.stdout.write('1. Verify EMAIL_HOST_USER is correct in .env')
            self.stdout.write('2. Verify EMAIL_HOST_PASSWORD is a valid Gmail App Password')
            self.stdout.write('3. Ensure 2-Step Verification is enabled on your Gmail account')
            self.stdout.write('4. Check that "Less secure app access" is enabled (if not using App Password)')
            self.stdout.write('5. Verify your internet connection\n')
