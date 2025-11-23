from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, FileExtensionValidator
from core.models import BaseModel, SchoolDistrict
from authentication.models import User
import uuid
from builtins import list


class ScreeningQuestion(BaseModel):
    """Questions asked during application screening"""
    CATEGORY_CHOICES = [
        ('certification', 'Certification'),
        ('experience', 'Experience'),
        ('skills', 'Skills'),
        ('availability', 'Availability'),
        ('general', 'General'),
    ]

    # Multi-tenancy
    district = models.ForeignKey(
        SchoolDistrict,
        on_delete=models.CASCADE,
        related_name='screening_questions',
        help_text="School district this question belongs to"
    )

    question = models.TextField()
    category = models.CharField(
        max_length=50, choices=CATEGORY_CHOICES, db_index=True)
    required = models.BooleanField(default=True)

    class Meta:
        db_table = 'screening_questions'
        ordering = ['district', 'category', 'created_at']
        indexes = [
            models.Index(fields=['district', 'category']),
        ]

    def __str__(self):
        return f"{self.district.name} - {self.category}: {self.question[:50]}"


class JobTemplate(BaseModel):
    """
    Templates for creating new positions.

    Multi-Tenancy: District-isolated - each district has its own job templates.
    """
    # Multi-tenancy
    district = models.ForeignKey(
        SchoolDistrict,
        on_delete=models.CASCADE,
        related_name='job_templates',
        help_text="School district this template belongs to"
    )

    template_name = models.CharField(max_length=200, db_index=True)
    primary_job_title = models.CharField(max_length=200)
    department = models.CharField(max_length=200, blank=True, db_index=True)
    worksite = models.CharField(max_length=200, blank=True)
    fte = models.DecimalField(max_digits=3, decimal_places=2, default=1.0)
    salary_range = models.CharField(max_length=100)
    employee_category = models.CharField(max_length=100)
    eeoc_classification = models.CharField(max_length=200)
    workers_comp_classification = models.CharField(max_length=200)
    leave_plan = models.CharField(max_length=200)
    deduction_template = models.CharField(max_length=200)
    interview_stages = models.IntegerField(default=1)

    class Meta:
        db_table = 'job_templates'
        ordering = ['district', 'primary_job_title']
        indexes = [
            models.Index(fields=['district', 'template_name']),
            models.Index(fields=['district', 'department']),
        ]

    def __str__(self):
        return f"{self.district.name} - {self.template_name}"


class Position(BaseModel):
    """
    Job positions/requisitions.

    Multi-Tenancy: District-isolated - each district has its own positions.
    """
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Open', 'Open'),
        ('Closed', 'Closed'),
    ]

    # Multi-tenancy
    district = models.ForeignKey(
        SchoolDistrict,
        on_delete=models.CASCADE,
        related_name='positions',
        help_text="School district this position belongs to"
    )

    # Basic Information
    req_id = models.CharField(max_length=50, db_index=True)
    title = models.CharField(max_length=200, db_index=True)
    department = models.CharField(max_length=200, db_index=True)
    worksite = models.CharField(max_length=200)
    primary_job_title = models.CharField(max_length=200)

    # Employment Details
    fte = models.DecimalField(max_digits=3, decimal_places=2, default=1.0)
    salary_range = models.CharField(max_length=100)
    start_date = models.DateField()
    probation_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='Draft', db_index=True)

    # Classifications
    employee_category = models.CharField(max_length=100)
    eeoc_classification = models.CharField(max_length=200)
    workers_comp_classification = models.CharField(max_length=200)
    leave_plan = models.CharField(max_length=200)
    deduction_template = models.CharField(max_length=200)

    # Job Description
    description = models.TextField(blank=True)
    requirements = models.TextField(blank=True)

    # Posting Dates
    posting_start_date = models.DateField(null=True, blank=True)
    posting_end_date = models.DateField(null=True, blank=True)

    # Interview Configuration
    interview_stages = models.IntegerField(default=1)

    # Screening Questions (Many-to-Many)
    screening_questions = models.ManyToManyField(ScreeningQuestion, blank=True)

    # Template reference
    template = models.ForeignKey(
        JobTemplate, null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        db_table = 'positions'
        ordering = ['district', '-created_at']
        indexes = [
            models.Index(fields=['district', 'status']),
            models.Index(fields=['district', 'req_id']),
            models.Index(fields=['district', 'title']),
            models.Index(fields=['district', 'department']),
        ]
        # req_id should be unique within district
        unique_together = [['district', 'req_id']]

    def __str__(self):
        return f"{self.district.name} - {self.req_id} - {self.title}"

    @property
    def is_open(self):
        """Check if position is currently open for applications"""
        from django.utils import timezone
        today = timezone.now().date()
        return (
            self.status == 'Open' and
            self.posting_start_date and
            self.posting_end_date and
            self.posting_start_date <= today <= self.posting_end_date
        )

    @property
    def applicant_count(self):
        """Get count of applications for this position"""
        return self.applications.count()

    @property
    def interview_count(self):
        """Get count of scheduled interviews for this position"""
        return Interview.objects.filter(
            application__position=self
        ).count()


class InterviewStage(BaseModel):
    """
    Configuration for interview stages.

    Multi-Tenancy: District-isolated through Position relationship.
    """
    # Multi-tenancy
    district = models.ForeignKey(
        SchoolDistrict,
        on_delete=models.CASCADE,
        related_name='interview_stages',
        help_text="School district this interview stage belongs to"
    )

    position = models.ForeignKey(
        Position, on_delete=models.CASCADE, related_name='stages', db_index=True)
    stage_number = models.IntegerField()
    stage_name = models.CharField(max_length=200)

    class Meta:
        db_table = 'interview_stages'
        ordering = ['district', 'position', 'stage_number']
        unique_together = ['position', 'stage_number']
        indexes = [
            models.Index(fields=['district', 'position']),
        ]

    def __str__(self):
        return f"{self.position.req_id} - Stage {self.stage_number}: {self.stage_name}"


class Interviewer(BaseModel):
    """
    Interviewers/panel members for interview stages.

    Multi-Tenancy: District-isolated through InterviewStage relationship.
    """
    # Multi-tenancy
    district = models.ForeignKey(
        SchoolDistrict,
        on_delete=models.CASCADE,
        related_name='interviewers',
        help_text="School district this interviewer belongs to"
    )

    stage = models.ForeignKey(
        InterviewStage, on_delete=models.CASCADE, related_name='interviewers', db_index=True)
    name = models.CharField(max_length=200)
    email = models.EmailField()
    role = models.CharField(max_length=200)

    class Meta:
        db_table = 'interviewers'
        indexes = [
            models.Index(fields=['district', 'stage']),
        ]

    def __str__(self):
        return f"{self.name} - {self.role}"


class JobApplication(BaseModel):
    """
    Applications submitted for positions.

    Multi-Tenancy: District-isolated through Position relationship.
    """
    # Multi-tenancy
    district = models.ForeignKey(
        SchoolDistrict,
        on_delete=models.CASCADE,
        related_name='job_applications',
        help_text="School district this application belongs to"
    )

    position = models.ForeignKey(
        Position, on_delete=models.CASCADE, related_name='applications', db_index=True)

    # Applicant Information
    applicant_name = models.CharField(max_length=200, db_index=True)
    applicant_email = models.EmailField(db_index=True)
    applicant_phone = models.CharField(max_length=20, blank=True)

    # Application Details
    start_date_availability = models.DateField()
    screening_answers = models.JSONField(default=dict)

    # Resume/Cover Letter
    resume = models.FileField(
        upload_to='resumes/%Y/%m/',
        validators=[FileExtensionValidator(
            allowed_extensions=['pdf', 'doc', 'docx'])]
    )
    cover_letter = models.TextField(blank=True)

    # Application Status
    STAGE_CHOICES = [
        ('Application Review', 'Application Review'),
        ('Screening', 'Screening'),
        ('Interview', 'Interview'),
        ('Interviews Completed', 'Interviews Completed'),
        ('Reference Check', 'Reference Check'),
        ('Offer', 'Offer'),
        ('Offer Accepted', 'Offer Accepted'),
        ('Rejected', 'Rejected'),
    ]
    stage = models.CharField(
        max_length=50, choices=STAGE_CHOICES, default='Application Review', db_index=True)

    # Additional Info
    current_role = models.CharField(max_length=200, blank=True)
    years_experience = models.IntegerField(default=0)
    certified = models.BooleanField(default=False)
    internal = models.BooleanField(default=False)

    # Interview Progress
    current_interview_stage = models.IntegerField(default=0)
    completed_interview_stages = models.IntegerField(default=0)

    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'job_applications'
        ordering = ['district', '-submitted_at']
        indexes = [
            models.Index(fields=['district', 'stage']),
            models.Index(fields=['district', 'applicant_name']),
            models.Index(fields=['district', 'applicant_email']),
            models.Index(fields=['district', 'position']),
        ]

    def __str__(self):
        return f"{self.applicant_name} - {self.position.title}"


class Reference(BaseModel):
    """
    Professional references for applications.

    Multi-Tenancy: District-isolated through JobApplication relationship.
    """
    # Multi-tenancy
    district = models.ForeignKey(
        SchoolDistrict,
        on_delete=models.CASCADE,
        related_name='references',
        help_text="School district this reference belongs to"
    )

    application = models.ForeignKey(
        JobApplication, on_delete=models.CASCADE, related_name='references', db_index=True)
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    relationship = models.CharField(max_length=200)

    class Meta:
        db_table = 'references'
        indexes = [
            models.Index(fields=['district', 'application']),
        ]

    def __str__(self):
        return f"{self.name} - {self.relationship}"


class InterviewAvailability(BaseModel):
    """
    Candidate's interview availability.

    Multi-Tenancy: District-isolated through JobApplication relationship.
    """
    # Multi-tenancy
    district = models.ForeignKey(
        SchoolDistrict,
        on_delete=models.CASCADE,
        related_name='interview_availability',
        help_text="School district this availability belongs to"
    )

    application = models.ForeignKey(
        JobApplication, on_delete=models.CASCADE, related_name='interview_availability', db_index=True)
    date = models.DateField(db_index=True)
    time_slots = models.JSONField(default=list)  # List of time slot strings

    class Meta:
        db_table = 'interview_availability'
        ordering = ['district', 'date']
        indexes = [
            models.Index(fields=['district', 'date']),
            models.Index(fields=['district', 'application']),
        ]

    def __str__(self):
        return f"{self.application.applicant_name} - {self.date}"


class Interview(BaseModel):
    """
    Scheduled interviews.

    Multi-Tenancy: District-isolated through JobApplication and InterviewStage relationships.
    """
    STATUS_CHOICES = [
        ('Scheduled', 'Scheduled'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
        ('No Show', 'No Show'),
    ]

    # Multi-tenancy
    district = models.ForeignKey(
        SchoolDistrict,
        on_delete=models.CASCADE,
        related_name='interviews',
        help_text="School district this interview belongs to"
    )

    application = models.ForeignKey(
        JobApplication, on_delete=models.CASCADE, related_name='interviews', db_index=True)
    stage = models.ForeignKey(
        InterviewStage, on_delete=models.CASCADE, related_name='interviews', db_index=True)

    # Interview Details
    scheduled_date = models.DateField(db_index=True)
    scheduled_time = models.TimeField()
    location = models.CharField(max_length=500)
    zoom_link = models.URLField(blank=True)

    # Status and Feedback
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='Scheduled', db_index=True)
    notes = models.TextField(blank=True)
    feedback = models.TextField(blank=True)
    rating = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )

    class Meta:
        db_table = 'interviews'
        ordering = ['district', 'scheduled_date', 'scheduled_time']
        indexes = [
            models.Index(fields=['district', 'status']),
            models.Index(fields=['district', 'scheduled_date']),
            models.Index(fields=['district', 'application']),
            models.Index(fields=['district', 'stage']),
        ]

    def __str__(self):
        return f"{self.application.applicant_name} - {self.stage.stage_name} - {self.scheduled_date}"


class OfferTemplate(BaseModel):
    """Template for job offers with extractable fields"""
    name = models.CharField(max_length=200, default='Default Offer Template')
    template_text = models.TextField(
        help_text='Use {{fieldName}} syntax for placeholders'
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'offer_templates'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def extract_fields(self):
        """Extract {{field}} placeholders from template"""
        import re
        regex = r'\{\{(\w+)\}\}'
        fields = set(re.findall(regex, self.template_text))
        return list(fields)

    def fill_template(self, data: dict) -> str:
        """Fill template with provided data"""
        result = self.template_text
        for key, value in data.items():
            placeholder = f'{{{{{key}}}}}'
            result = result.replace(placeholder, str(value))
        return result


class Offer(BaseModel):
    """
    Job offers extended to candidates.

    Multi-Tenancy: District-isolated through JobApplication relationship.
    """
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Accepted', 'Accepted'),
        ('Declined', 'Declined'),
        ('Expired', 'Expired'),
        ('Withdrawn', 'Withdrawn'),
    ]

    # Multi-tenancy
    district = models.ForeignKey(
        SchoolDistrict,
        on_delete=models.CASCADE,
        related_name='offers',
        help_text="School district this offer belongs to"
    )

    application = models.OneToOneField(
        JobApplication, on_delete=models.CASCADE, related_name='offer', db_index=True)

    # Offer Details
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    fte = models.DecimalField(max_digits=3, decimal_places=2)
    start_date = models.DateField()
    benefits = models.JSONField(default=list)

    # Offer Timeline
    offer_date = models.DateField()
    expiration_date = models.DateField()

    # Template
    template_text = models.TextField(blank=True, default='')
    template_data = models.JSONField(default=dict)  # Store filled template field values

    # Response
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='Pending', db_index=True)
    accepted_date = models.DateField(null=True, blank=True)
    declined_reason = models.TextField(blank=True)

    class Meta:
        db_table = 'offers'
        ordering = ['district', '-offer_date']
        indexes = [
            models.Index(fields=['district', 'status']),
            models.Index(fields=['district', 'application']),
        ]

    def __str__(self):
        return f"Offer to {self.application.applicant_name} - {self.status}"

    def get_filled_text(self) -> str:
        """Get the offer text with all template fields filled"""
        if self.template_text and self.template_data:
            # Fill the stored template_text with template_data
            result = self.template_text
            for key, value in self.template_data.items():
                placeholder = f'{{{{{key}}}}}'
                result = result.replace(placeholder, str(value))
            return result
        return self.template_text if self.template_text else ''


class HiredEmployee(BaseModel):
    """
    Track employees hired through the system for Infinite Vision export.

    Multi-Tenancy: District-isolated through JobApplication relationship.
    """
    # Multi-tenancy
    district = models.ForeignKey(
        SchoolDistrict,
        on_delete=models.CASCADE,
        related_name='hired_employees',
        help_text="School district this hired employee belongs to"
    )

    application = models.OneToOneField(
        JobApplication, on_delete=models.CASCADE, db_index=True)
    offer = models.OneToOneField(
        Offer, on_delete=models.CASCADE, db_index=True)

    # Export Status
    exported_to_infinite_vision = models.BooleanField(
        default=False, db_index=True)
    export_date = models.DateTimeField(null=True, blank=True)
    infinite_vision_employee_id = models.CharField(max_length=100, blank=True)

    # Additional Data
    hire_date = models.DateField()

    class Meta:
        db_table = 'hired_employees'
        ordering = ['district', '-hire_date']
        indexes = [
            models.Index(fields=['district', 'exported_to_infinite_vision']),
            models.Index(fields=['district', 'application']),
            models.Index(fields=['district', 'offer']),
        ]

    def __str__(self):
        return f"{self.application.applicant_name} - Hired {self.hire_date}"
