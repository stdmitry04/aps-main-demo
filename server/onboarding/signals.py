from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

from .models import (
    OnboardingCandidate,
    OnboardingSectionData,
    OnboardingEmailLog
)


@receiver(post_save, sender=OnboardingCandidate)
def send_onboarding_invitation(sender, instance, created, **kwargs):
    """Send onboarding invitation email when candidate is created"""
    if created:
        subject = f'Welcome to School Demo District - Complete Your Onboarding'
        
        onboarding_url = f"{settings.FRONTEND_URL}{instance.onboarding_url}"
        
        message = f"""
        Dear {instance.name},

        Congratulations on accepting the position of {instance.position} at School Demo District!

        To complete your onboarding process, please visit the following link:
        {onboarding_url}

        This link will expire on {instance.token_expires_at.strftime('%B %d, %Y')}.

        Your onboarding includes the following sections:
        1. Personal Information
        2. Employment Details
        3. I-9 Form (Employment Eligibility Verification)
        4. Tax Withholdings (W-4 Forms)
        5. Payment Method (Direct Deposit or Check)
        6. Time Off Policies
        7. Benefits and Deductions
        8. Emergency Contact Information

        Your progress will be automatically saved as you complete each section, so you can return
        at any time using the link above.

        Your start date is: {instance.start_date.strftime('%B %d, %Y') if instance.start_date else 'To be determined'}

        If you have any questions or need assistance, please contact our Human Resources department:
        Email: hr@demodist.edu
        Phone: (555) 123-4567

        We look forward to welcoming you to our team!

        Best regards,
        School Demo District Human Resources Team
        """

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [instance.email],
                fail_silently=False,
            )
            
            # Log the email
            OnboardingEmailLog.objects.create(
                candidate=instance,
                email_type='invitation',
                recipient_email=instance.email,
                subject=subject,
                sent=True,
                sent_at=timezone.now()
            )
        except Exception as e:
            # Log the failed email
            OnboardingEmailLog.objects.create(
                candidate=instance,
                email_type='invitation',
                recipient_email=instance.email,
                subject=subject,
                sent=False,
                failed=True,
                error_message=str(e)
            )
            print(f"Failed to send onboarding invitation: {e}")


@receiver(post_save, sender=OnboardingCandidate)
def send_submission_confirmation(sender, instance, created, **kwargs):
    """Send confirmation email when onboarding is submitted"""
    if not created and instance.status == 'submitted' and instance.submitted_at:
        # Check if we already sent this email
        existing_log = OnboardingEmailLog.objects.filter(
            candidate=instance,
            email_type='submission_confirmation',
            sent=True
        ).exists()
        
        if existing_log:
            return
        
        subject = f'Onboarding Submission Confirmation - {instance.position}'
        
        message = f"""
        Dear {instance.name},

        Thank you for completing your onboarding form for the {instance.position} position at School Demo District!

        We have received your submission on {instance.submitted_at.strftime('%B %d, %Y at %I:%M %p')}.

        Our Human Resources team will review your information and contact you if any additional details are needed.

        Next Steps:
        1. HR will review your submission within 2-3 business days
        2. You will receive confirmation once your onboarding is approved
        3. Additional pre-employment requirements may be communicated via email
        4. Please complete any remaining tasks before your start date

        Your start date: {instance.start_date.strftime('%B %d, %Y') if instance.start_date else 'To be confirmed'}

        If you need to make any changes or have questions, please contact:
        Email: hr@demodist.edu
        Phone: (555) 123-4567

        We're excited to have you join our team!

        Best regards,
        School Demo District Human Resources Team
        """

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [instance.email],
                fail_silently=False,
            )
            
            OnboardingEmailLog.objects.create(
                candidate=instance,
                email_type='submission_confirmation',
                recipient_email=instance.email,
                subject=subject,
                sent=True,
                sent_at=timezone.now()
            )
        except Exception as e:
            OnboardingEmailLog.objects.create(
                candidate=instance,
                email_type='submission_confirmation',
                recipient_email=instance.email,
                subject=subject,
                sent=False,
                failed=True,
                error_message=str(e)
            )
            print(f"Failed to send submission confirmation: {e}")


@receiver(post_save, sender=OnboardingCandidate)
def notify_hr_on_submission(sender, instance, created, **kwargs):
    """Notify HR when a candidate submits their onboarding"""
    if not created and instance.status == 'submitted' and instance.submitted_at:
        # Check if we already sent this notification
        existing_log = OnboardingEmailLog.objects.filter(
            candidate=instance,
            email_type='admin_notification',
            sent=True
        ).exists()
        
        if existing_log:
            return
        
        subject = f'New Onboarding Submission - {instance.name}'
        
        admin_url = f"{settings.FRONTEND_URL}/hiring/onboarding"
        
        message = f"""
        A new onboarding form has been submitted and is ready for review.

        Candidate Details:
        - Name: {instance.name}
        - Email: {instance.email}
        - Position: {instance.position}
        - Start Date: {instance.start_date.strftime('%B %d, %Y') if instance.start_date else 'Not specified'}
        - Submitted: {instance.submitted_at.strftime('%B %d, %Y at %I:%M %p')}
        - Completion: {instance.completed_sections}/8 sections

        To review and approve this onboarding:
        {admin_url}

        Please review the submission and complete any necessary verification steps.

        ---
        This is an automated notification from the School Demo District HR System.
        """

        try:
            # Send to HR email (configure in settings)
            hr_email = getattr(settings, 'HR_EMAIL', settings.DEFAULT_FROM_EMAIL)
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [hr_email],
                fail_silently=False,
            )
            
            OnboardingEmailLog.objects.create(
                candidate=instance,
                email_type='admin_notification',
                recipient_email=hr_email,
                subject=subject,
                sent=True,
                sent_at=timezone.now()
            )
        except Exception as e:
            OnboardingEmailLog.objects.create(
                candidate=instance,
                email_type='admin_notification',
                recipient_email=hr_email,
                subject=subject,
                sent=False,
                failed=True,
                error_message=str(e)
            )
            print(f"Failed to send HR notification: {e}")


def send_reminder_email(candidate):
    """
    Utility function to send reminder emails.
    Can be called from a management command or scheduled task.
    """
    subject = f'Reminder: Complete Your Onboarding - {candidate.position}'
    
    onboarding_url = f"{settings.FRONTEND_URL}{candidate.onboarding_url}"
    days_until_expiry = (candidate.token_expires_at - timezone.now()).days
    
    message = f"""
    Dear {candidate.name},

    This is a friendly reminder to complete your onboarding for the {candidate.position} position at School Demo District.

    Current Progress: {candidate.completed_sections}/8 sections completed ({candidate.progress_percentage}%)

    Your onboarding link will expire in {days_until_expiry} days.

    To continue where you left off, please visit:
    {onboarding_url}

    Remaining sections:
    """
    
    # Add list of incomplete sections
    section_names = [
        'Personal Information',
        'Employment Details',
        'I-9 Form',
        'Tax Withholdings',
        'Payment Method',
        'Time Off',
        'Deductions',
        'Emergency Contact'
    ]
    
    for i, section_name in enumerate(section_names):
        try:
            section = candidate.section_data.get(section_index=i)
            if not section.is_completed:
                message += f"\n    - {section_name}"
        except OnboardingSectionData.DoesNotExist:
            message += f"\n    - {section_name}"
    
    message += f"""

    If you have any questions or need assistance, please contact:
    Email: hr@demodist.edu
    Phone: (555) 123-4567

    Best regards,
    School Demo District Human Resources Team
    """

    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [candidate.email],
            fail_silently=False,
        )
        
        OnboardingEmailLog.objects.create(
            candidate=candidate,
            email_type='reminder',
            recipient_email=candidate.email,
            subject=subject,
            sent=True,
            sent_at=timezone.now()
        )
        
        return True
    except Exception as e:
        OnboardingEmailLog.objects.create(
            candidate=candidate,
            email_type='reminder',
            recipient_email=candidate.email,
            subject=subject,
            sent=False,
            failed=True,
            error_message=str(e)
        )
        print(f"Failed to send reminder email: {e}")
        return False
