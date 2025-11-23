from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

from .models import (
    JobApplication,
    Interview,
    Offer,
    HiredEmployee
)
from .email_utils import (
    send_html_email,
    create_offer_email_html,
    create_application_confirmation_html,
    create_interview_invitation_html
)


@receiver(post_save, sender=JobApplication)
def send_application_confirmation(sender, instance, created, **kwargs):
    """Send confirmation email when application is submitted"""
    if created:
        subject = f'Application Received - {instance.position.title}'

        # Plain text version
        plain_text = f"""Dear {instance.applicant_name},

Thank you for applying for the {instance.position.title} position at School District 308.

We have received your application and will review it carefully. You will hear from us within the next 2-3 weeks regarding the next steps in the hiring process.

Application Details:
- Position: {instance.position.title}
- Requisition ID: {instance.position.req_id}
- Department: {instance.position.department}
- Worksite: {instance.position.worksite}
- Submitted: {instance.submitted_at.strftime('%B %d, %Y at %I:%M %p')}

If you have any questions, please don't hesitate to contact our Human Resources department.

Best regards,
School District 308 Human Resources Team
"""

        # HTML version with inline CSS
        html_content = create_application_confirmation_html(instance)

        try:
            send_html_email(
                subject,
                html_content,
                plain_text,
                settings.DEFAULT_FROM_EMAIL,
                [instance.applicant_email]
            )
        except Exception as e:
            # Log error but don't fail the application submission
            print(f"Failed to send application confirmation email: {e}")


@receiver(post_save, sender=Interview)
def send_interview_notifications(sender, instance, created, **kwargs):
    """Send notifications when interview is scheduled"""
    if created:
        # Send to candidate
        send_candidate_interview_invitation(instance)

        # Send to interviewers
        send_interviewer_notifications(instance)


def send_candidate_interview_invitation(interview):
    """Send interview invitation to candidate"""
    subject = f'Interview Scheduled - {interview.application.position.title}'

    # Plain text version
    plain_text = f"""Dear {interview.application.applicant_name},

We are pleased to invite you to an interview for the {interview.application.position.title} position.

Interview Details:
- Stage: {interview.stage.stage_name}
- Date: {interview.scheduled_date.strftime('%A, %B %d, %Y')}
- Time: {interview.scheduled_time.strftime('%I:%M %p')}
- Location: {interview.location}
{f'- Join Meeting: {interview.zoom_link}' if interview.zoom_link else ''}

Please confirm your attendance by replying to this email.

We look forward to speaking with you.

Best regards,
School District 308 HR Team
"""

    # HTML version with inline CSS
    html_content = create_interview_invitation_html(interview)

    try:
        send_html_email(
            subject,
            html_content,
            plain_text,
            settings.DEFAULT_FROM_EMAIL,
            [interview.application.applicant_email]
        )
    except Exception as e:
        print(f"Failed to send interview invitation: {e}")


def send_interviewer_notifications(interview):
    """Send notifications to interview panel members"""
    for interviewer in interview.stage.interviewers.all():
        subject = f'Interview Scheduled - {interview.application.applicant_name}'
        message = f"""
        Hello {interviewer.name},

        You have been assigned to interview {interview.application.applicant_name} for the {interview.application.position.title} position.

        Interview Details:
        - Stage: {interview.stage.stage_name}
        - Candidate: {interview.application.applicant_name} ({interview.application.applicant_email})
        - Date: {interview.scheduled_date.strftime('%A, %B %d, %Y')}
        - Time: {interview.scheduled_time.strftime('%I:%M %p')}
        - Location: {interview.location}
        
        {f'Join Meeting: {interview.zoom_link}' if interview.zoom_link else ''}

        Panel Members:
        {chr(10).join([f'- {i.name} ({i.role})' for i in interview.stage.interviewers.all()])}

        Please add this to your calendar.

        Best regards,
        HR System
        """

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [interviewer.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send interviewer notification: {e}")


@receiver(post_save, sender=Offer)
def send_offer_notification(sender, instance, created, **kwargs):
    """Send offer letter to candidate"""
    if created:
        # Get frontend URL from settings
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        accept_url = f"{frontend_url}/hiring/offers/accept/{instance.id}"
        reject_url = f"{frontend_url}/hiring/offers/reject/{instance.id}"

        subject = f'Job Offer - {instance.application.position.title}'

        # Plain text version
        if instance.template_text and instance.template_data:
            plain_message_body = instance.template_text
            for key, value in instance.template_data.items():
                plain_message_body = plain_message_body.replace(f'{{{{{key}}}}}', str(value))
        else:
            plain_message_body = f"""Dear {instance.application.applicant_name},

We are pleased to offer you the position of {instance.application.position.title} with School District 308.

Position Details:
- Position Title: {instance.application.position.title}
- Department: {instance.application.position.department}
- Worksite: {instance.application.position.worksite}
- FTE: {instance.fte} (Full-Time)
- Salary: ${instance.salary:,.2f}
- Start Date: {instance.start_date.strftime('%B %d, %Y')}

Benefits Include:
{chr(10).join([f'- {benefit}' for benefit in instance.benefits])}

This offer is contingent upon successful completion of a background check and verification of your credentials.

Please respond to this offer by {instance.expiration_date.strftime('%B %d, %Y')}.

Sincerely,
Dr. Jennifer Davis
Director of Human Resources
School District 308"""

        plain_text = f"""{plain_message_body}

================================================================================
RESPOND TO THIS OFFER:

To ACCEPT this offer, visit: {accept_url}
To DECLINE this offer, visit: {reject_url}
================================================================================

Please respond by {instance.expiration_date.strftime('%B %d, %Y')}.
"""

        # HTML version with inline CSS
        html_content = create_offer_email_html(instance, accept_url, reject_url)

        try:
            send_html_email(
                subject,
                html_content,
                plain_text,
                settings.DEFAULT_FROM_EMAIL,
                [instance.application.applicant_email, "starodu5@gmail.com", "admin@apsdatatechnologies.com"]
            )
            print(f"Offer email sent to: {instance.application.applicant_email}")
        except Exception as e:
            print(f"Failed to send offer notification to {instance.application.applicant_email}: {e}")


@receiver(pre_save, sender=Offer)
def check_offer_expiration(sender, instance, **kwargs):
    """Automatically mark offers as expired if expiration date has passed"""
    if instance.status == 'Pending':
        if instance.expiration_date < timezone.now().date():
            instance.status = 'Expired'


@receiver(post_save, sender=Offer)
def notify_offer_status_change(sender, instance, created, **kwargs):
    """Send notifications when offer status changes"""
    if not created and instance.status in ['Accepted', 'Declined']:
        # Notify HR team
        subject = f'Offer {instance.status} - {instance.application.applicant_name}'
        message = f"""
        The job offer to {instance.application.applicant_name} for {instance.application.position.title} has been {instance.status.lower()}.

        Candidate: {instance.application.applicant_name}
        Position: {instance.application.position.title} ({instance.application.position.req_id})
        Offer Date: {instance.offer_date.strftime('%B %d, %Y')}
        Status: {instance.status}
        
        {f'Accepted Date: {instance.accepted_date.strftime("%B %d, %Y")}' if instance.accepted_date else ''}
        {f'Decline Reason: {instance.declined_reason}' if instance.declined_reason else ''}

        Please take appropriate action.

        HR System
        """

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [settings.DEFAULT_FROM_EMAIL],  # Send to HR email
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send offer status notification: {e}")


@receiver(post_save, sender=HiredEmployee)
def send_onboarding_notification(sender, instance, created, **kwargs):
    """Send onboarding information to newly hired employee"""
    if created:
        subject = f'Welcome to School District 308!'
        message = f"""
        Dear {instance.application.applicant_name},

        Congratulations on accepting the position of {instance.application.position.title}!

        Your Start Date: {instance.hire_date.strftime('%B %d, %Y')}

        Next Steps:
        1. Complete all onboarding paperwork (link will be sent separately)
        2. Attend new employee orientation
        3. Complete required background checks and fingerprinting
        4. Submit required certifications and documentation

        A member of our Human Resources team will contact you within the next few days to guide you through the onboarding process.

        We're excited to have you join our team!

        Best regards,
        School District 308 Human Resources Team
        """

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [instance.application.applicant_email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send onboarding notification: {e}")
