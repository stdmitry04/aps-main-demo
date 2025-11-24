from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import BaseModel, SchoolDistrict
from authentication.models import User
import uuid
import secrets


class OnboardingCandidate(BaseModel):
    """
    Main onboarding candidate model.

    Multi-Tenancy: District-isolated - each district has its own onboarding candidates.
    """
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('submitted', 'Submitted'),
    ]

    # Multi-tenancy
    district = models.ForeignKey(
        SchoolDistrict,
        on_delete=models.CASCADE,
        related_name='onboarding_candidates',
        help_text="School district this candidate belongs to"
    )

    # Basic Information
    name = models.CharField(max_length=200, db_index=True)
    email = models.EmailField(db_index=True)
    position = models.CharField(max_length=200)
    offer_date = models.DateField()
    start_date = models.DateField(null=True, blank=True, db_index=True)

    # Status Tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started', db_index=True)
    completed_sections = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(8)])
    last_updated = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)

    # Access Token for Candidate
    access_token = models.CharField(max_length=100, unique=True, editable=False, db_index=True)
    token_expires_at = models.DateTimeField(null=True, blank=True)

    # Link to hiring application if exists
    job_application = models.ForeignKey(
        'hiring.JobApplication',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='onboarding',
        db_index=True
    )

    # Admin Review
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_onboarding',
        db_index=True
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    admin_notes = models.TextField(blank=True)

    class Meta:
        db_table = 'onboarding_candidates'
        ordering = ['district', '-created_at']
        indexes = [
            models.Index(fields=['district', 'status']),
            models.Index(fields=['district', 'name']),
            models.Index(fields=['district', 'email']),
            models.Index(fields=['district', 'start_date']),
            models.Index(fields=['access_token']),
            models.Index(fields=['email']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.district.name} - {self.name} - {self.position}"
    
    def save(self, *args, **kwargs):
        # Generate access token if not exists
        if not self.access_token:
            self.access_token = secrets.token_urlsafe(32)
        
        # Auto-update status based on completed sections
        if self.completed_sections == 8 and self.submitted_at:
            self.status = 'submitted'
        elif self.completed_sections == 8:
            self.status = 'completed'
        elif self.completed_sections > 0:
            self.status = 'in_progress'
        else:
            self.status = 'not_started'
        
        super().save(*args, **kwargs)
    
    @property
    def onboarding_url(self):
        """Generate the onboarding URL for the candidate"""
        return f"/onboarding/{self.access_token}"
    
    @property
    def is_expired(self):
        """Check if the onboarding token is expired"""
        from django.utils import timezone
        if self.token_expires_at:
            return timezone.now() > self.token_expires_at
        return False
    
    @property
    def progress_percentage(self):
        """Calculate completion percentage"""
        return int((self.completed_sections / 8) * 100)


class OnboardingSectionData(BaseModel):
    """
    Individual section data for onboarding form.

    Multi-Tenancy: District-isolated through OnboardingCandidate relationship.
    """
    SECTION_CHOICES = [
        ('personal_info', 'Personal Information'),
        ('employment_details', 'Employment Details'),
        ('i9_form', 'I-9 Form'),
        ('tax_withholdings', 'Tax Withholdings'),
        ('payment_method', 'Payment Method'),
        ('time_off', 'Time Off'),
        ('deductions', 'Deductions'),
        ('emergency_contact', 'Emergency Contact'),
    ]

    # Multi-tenancy
    district = models.ForeignKey(
        SchoolDistrict,
        on_delete=models.CASCADE,
        related_name='onboarding_section_data',
        help_text="School district this section data belongs to"
    )

    candidate = models.ForeignKey(
        OnboardingCandidate,
        on_delete=models.CASCADE,
        related_name='section_data',
        db_index=True
    )
    section_name = models.CharField(max_length=50, choices=SECTION_CHOICES, db_index=True)
    section_index = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(7)])

    # Form Data (stored as JSON)
    form_data = models.JSONField(default=dict)

    # Completion Status
    is_completed = models.BooleanField(default=False, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Admin Review
    reviewed_by_admin = models.BooleanField(default=False, db_index=True)
    admin_reviewed_at = models.DateTimeField(null=True, blank=True)
    admin_comments = models.TextField(blank=True)

    class Meta:
        db_table = 'onboarding_section_data'
        ordering = ['district', 'section_index']
        unique_together = ['candidate', 'section_name']
        indexes = [
            models.Index(fields=['district', 'candidate']),
            models.Index(fields=['district', 'section_name']),
            models.Index(fields=['district', 'is_completed']),
            models.Index(fields=['district', 'reviewed_by_admin']),
            models.Index(fields=['candidate', 'section_index']),
        ]

    def __str__(self):
        return f"{self.candidate.name} - {self.get_section_name_display()}"


class OnboardingDocument(BaseModel):
    """
    Documents uploaded during onboarding.

    Multi-Tenancy: District-isolated through OnboardingCandidate relationship.
    """
    DOCUMENT_TYPES = [
        ('resume', 'Resume'),
        ('i9_document_a', 'I-9 List A Document'),
        ('i9_document_b', 'I-9 List B Document'),
        ('i9_document_c', 'I-9 List C Document'),
        ('certification', 'Teaching Certification'),
        ('license', 'Professional License'),
        ('transcript', 'Transcript'),
        ('other', 'Other'),
    ]

    # Multi-tenancy
    district = models.ForeignKey(
        SchoolDistrict,
        on_delete=models.CASCADE,
        related_name='onboarding_documents',
        help_text="School district this document belongs to"
    )

    candidate = models.ForeignKey(
        OnboardingCandidate,
        on_delete=models.CASCADE,
        related_name='documents',
        db_index=True
    )
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES, db_index=True)
    file = models.FileField(upload_to='onboarding_documents/%Y/%m/')
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField()  # in bytes

    # Verification
    verified = models.BooleanField(default=False, db_index=True)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_documents',
        db_index=True
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    verification_notes = models.TextField(blank=True)

    class Meta:
        db_table = 'onboarding_documents'
        ordering = ['district', '-created_at']
        indexes = [
            models.Index(fields=['district', 'candidate']),
            models.Index(fields=['district', 'document_type']),
            models.Index(fields=['district', 'verified']),
        ]

    def __str__(self):
        return f"{self.candidate.name} - {self.get_document_type_display()}"


class OnboardingAuditLog(BaseModel):
    """
    Audit trail for onboarding changes.

    Multi-Tenancy: District-isolated through OnboardingCandidate relationship.
    """
    ACTION_CHOICES = [
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('section_completed', 'Section Completed'),
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed by Admin'),
        ('document_uploaded', 'Document Uploaded'),
        ('email_sent', 'Email Sent'),
    ]

    # Multi-tenancy
    district = models.ForeignKey(
        SchoolDistrict,
        on_delete=models.CASCADE,
        related_name='onboarding_audit_logs',
        help_text="School district this audit log belongs to"
    )

    candidate = models.ForeignKey(
        OnboardingCandidate,
        on_delete=models.CASCADE,
        related_name='audit_logs',
        db_index=True
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES, db_index=True)
    section_name = models.CharField(max_length=50, blank=True)

    # Actor (can be candidate or admin)
    performed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='onboarding_actions',
        db_index=True
    )
    performed_by_candidate = models.BooleanField(default=False)

    # Details
    details = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    class Meta:
        db_table = 'onboarding_audit_logs'
        ordering = ['district', '-created_at']
        indexes = [
            models.Index(fields=['district', 'candidate']),
            models.Index(fields=['district', 'action']),
            models.Index(fields=['candidate', '-created_at']),
        ]

    def __str__(self):
        return f"{self.candidate.name} - {self.action} at {self.created_at}"


class OnboardingEmailLog(BaseModel):
    """
    Log of emails sent during onboarding.

    Multi-Tenancy: District-isolated through OnboardingCandidate relationship.
    """
    EMAIL_TYPES = [
        ('invitation', 'Onboarding Invitation'),
        ('reminder', 'Reminder'),
        ('submission_confirmation', 'Submission Confirmation'),
        ('admin_notification', 'Admin Notification'),
    ]

    # Multi-tenancy
    district = models.ForeignKey(
        SchoolDistrict,
        on_delete=models.CASCADE,
        related_name='onboarding_email_logs',
        help_text="School district this email log belongs to"
    )

    candidate = models.ForeignKey(
        OnboardingCandidate,
        on_delete=models.CASCADE,
        related_name='email_logs',
        db_index=True
    )
    email_type = models.CharField(max_length=50, choices=EMAIL_TYPES, db_index=True)
    recipient_email = models.EmailField()
    subject = models.CharField(max_length=255)

    # Status
    sent = models.BooleanField(default=False, db_index=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    failed = models.BooleanField(default=False, db_index=True)
    error_message = models.TextField(blank=True)

    class Meta:
        db_table = 'onboarding_email_logs'
        ordering = ['district', '-created_at']
        indexes = [
            models.Index(fields=['district', 'candidate']),
            models.Index(fields=['district', 'email_type']),
            models.Index(fields=['district', 'sent']),
            models.Index(fields=['district', 'failed']),
        ]

    def __str__(self):
        return f"{self.email_type} to {self.recipient_email}"
