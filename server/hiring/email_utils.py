"""
Email utilities with inline CSS for Gmail compatibility
"""
from django.core.mail import EmailMultiAlternatives
from django.conf import settings


def get_email_base_styles():
    """Base inline styles for email consistency"""
    return {
        'body': 'font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f4f4f4;',
        'container': 'max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);',
        'header': 'background-color: #1a73e8; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; margin: -30px -30px 30px -30px;',
        'h1': 'margin: 0; font-size: 24px; font-weight: bold;',
        'h2': 'color: #1a73e8; font-size: 20px; margin-top: 25px; margin-bottom: 15px; border-bottom: 2px solid #e8f0fe; padding-bottom: 8px;',
        'p': 'margin: 15px 0; color: #333333;',
        'details_box': 'background-color: #f8f9fa; padding: 20px; border-left: 4px solid #1a73e8; margin: 20px 0; border-radius: 4px;',
        'detail_item': 'margin: 10px 0; color: #555555;',
        'detail_label': 'font-weight: bold; color: #333333; display: inline-block; min-width: 120px;',
        'button_primary': 'display: inline-block; background-color: #34a853; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 10px 5px;',
        'button_secondary': 'display: inline-block; background-color: #ea4335; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 10px 5px;',
        'button_container': 'text-align: center; margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 4px;',
        'footer': 'margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666666; font-size: 12px; text-align: center;',
        'list': 'margin: 15px 0; padding-left: 20px;',
        'list_item': 'margin: 8px 0; color: #555555;',
    }


def create_offer_email_html(offer, accept_url, reject_url):
    """Create HTML email for job offer with inline CSS"""
    styles = get_email_base_styles()

    # Use template_text if available, otherwise use default
    if offer.template_text and offer.template_data:
        message_body = offer.template_text
        for key, value in offer.template_data.items():
            message_body = message_body.replace(f'{{{{{key}}}}}', str(value))
        # Convert line breaks to HTML
        message_body = message_body.replace('\n', '<br>')
    else:
        # Build default message
        benefits_html = ''.join([f'<li style="{styles["list_item"]}">{benefit}</li>' for benefit in offer.benefits])

        message_body = f"""
        <p style="{styles['p']}">Dear {offer.application.applicant_name},</p>

        <p style="{styles['p']}">We are pleased to offer you the position of <strong>{offer.application.position.title}</strong> with School Demo District.</p>

        <h2 style="{styles['h2']}">Position Details</h2>
        <div style="{styles['details_box']}">
            <div style="{styles['detail_item']}">
                <span style="{styles['detail_label']}">Position Title:</span> {offer.application.position.title}
            </div>
            <div style="{styles['detail_item']}">
                <span style="{styles['detail_label']}">Department:</span> {offer.application.position.department}
            </div>
            <div style="{styles['detail_item']}">
                <span style="{styles['detail_label']}">Worksite:</span> {offer.application.position.worksite}
            </div>
            <div style="{styles['detail_item']}">
                <span style="{styles['detail_label']}">FTE:</span> {offer.fte} (Full-Time)
            </div>
            <div style="{styles['detail_item']}">
                <span style="{styles['detail_label']}">Salary:</span> ${offer.salary:,.2f}
            </div>
            <div style="{styles['detail_item']}">
                <span style="{styles['detail_label']}">Start Date:</span> {offer.start_date.strftime('%B %d, %Y')}
            </div>
        </div>

        <h2 style="{styles['h2']}">Benefits Include</h2>
        <ul style="{styles['list']}">
            {benefits_html}
        </ul>

        <p style="{styles['p']}">This offer is contingent upon successful completion of a background check and verification of your credentials.</p>

        <p style="{styles['p']}"><strong>Please respond to this offer by {offer.expiration_date.strftime('%B %d, %Y')}.</strong></p>
        """

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="{styles['body']}">
        <div style="{styles['container']}">
            <div style="{styles['header']}">
                <h1 style="{styles['h1']}">Job Offer - {offer.application.position.title}</h1>
            </div>

            {message_body}

            <div style="{styles['button_container']}">
                <p style="{styles['p']}; font-size: 16px; font-weight: bold;">Respond to this offer:</p>
                <a href="{accept_url}" style="{styles['button_primary']}">Accept Offer</a>
                <a href="{reject_url}" style="{styles['button_secondary']}">Decline Offer</a>
            </div>

            <div style="{styles['details_box']}">
                <p style="{styles['p']}; margin: 0;">
                    Sincerely,<br>
                    <strong>Dr. Jennifer Davis</strong><br>
                    Director of Human Resources<br>
                    School Demo District
                </p>
            </div>

            <div style="{styles['footer']}">
                <p style="margin: 5px 0;">School Demo District Human Resources</p>
                <p style="margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """

    return html_content


def create_application_confirmation_html(application):
    """Create HTML email for application confirmation"""
    styles = get_email_base_styles()

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="{styles['body']}">
        <div style="{styles['container']}">
            <div style="{styles['header']}">
                <h1 style="{styles['h1']}">Application Received</h1>
            </div>

            <p style="{styles['p']}">Dear {application.applicant_name},</p>

            <p style="{styles['p']}">Thank you for applying for the <strong>{application.position.title}</strong> position at School Demo District.</p>

            <p style="{styles['p']}">We have received your application and will review it carefully. You will hear from us within the next 2-3 weeks regarding the next steps in the hiring process.</p>

            <h2 style="{styles['h2']}">Application Details</h2>
            <div style="{styles['details_box']}">
                <div style="{styles['detail_item']}">
                    <span style="{styles['detail_label']}">Position:</span> {application.position.title}
                </div>
                <div style="{styles['detail_item']}">
                    <span style="{styles['detail_label']}">Requisition ID:</span> {application.position.req_id}
                </div>
                <div style="{styles['detail_item']}">
                    <span style="{styles['detail_label']}">Department:</span> {application.position.department}
                </div>
                <div style="{styles['detail_item']}">
                    <span style="{styles['detail_label']}">Worksite:</span> {application.position.worksite}
                </div>
                <div style="{styles['detail_item']}">
                    <span style="{styles['detail_label']}">Submitted:</span> {application.submitted_at.strftime('%B %d, %Y at %I:%M %p')}
                </div>
            </div>

            <p style="{styles['p']}">If you have any questions, please don't hesitate to contact our Human Resources department.</p>

            <div style="{styles['footer']}">
                <p style="margin: 5px 0;"><strong>School Demo District Human Resources Team</strong></p>
                <p style="margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """

    return html_content


def create_interview_invitation_html(interview):
    """Create HTML email for interview invitation"""
    styles = get_email_base_styles()

    zoom_section = f"""
        <div style="{styles['detail_item']}">
            <span style="{styles['detail_label']}">Join Meeting:</span>
            <a href="{interview.zoom_link}" style="color: #1a73e8; text-decoration: none;">{interview.zoom_link}</a>
        </div>
    """ if interview.zoom_link else ''

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="{styles['body']}">
        <div style="{styles['container']}">
            <div style="{styles['header']}">
                <h1 style="{styles['h1']}">Interview Scheduled</h1>
            </div>

            <p style="{styles['p']}">Dear {interview.application.applicant_name},</p>

            <p style="{styles['p']}">We are pleased to invite you to an interview for the <strong>{interview.application.position.title}</strong> position.</p>

            <h2 style="{styles['h2']}">Interview Details</h2>
            <div style="{styles['details_box']}">
                <div style="{styles['detail_item']}">
                    <span style="{styles['detail_label']}">Stage:</span> {interview.stage.stage_name}
                </div>
                <div style="{styles['detail_item']}">
                    <span style="{styles['detail_label']}">Date:</span> {interview.scheduled_date.strftime('%A, %B %d, %Y')}
                </div>
                <div style="{styles['detail_item']}">
                    <span style="{styles['detail_label']}">Time:</span> {interview.scheduled_time.strftime('%I:%M %p')}
                </div>
                <div style="{styles['detail_item']}">
                    <span style="{styles['detail_label']}">Location:</span> {interview.location}
                </div>
                {zoom_section}
            </div>

            <p style="{styles['p']}">Please confirm your attendance by replying to this email.</p>

            <p style="{styles['p']}">We look forward to speaking with you.</p>

            <div style="{styles['footer']}">
                <p style="margin: 5px 0;"><strong>School Demo District HR Team</strong></p>
                <p style="margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """

    return html_content


def send_html_email(subject, html_content, plain_text, from_email, recipient_list):
    """Send email with both HTML and plain text versions"""
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain_text,
            from_email=from_email,
            to=recipient_list
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
