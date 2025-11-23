from django.db import models
import uuid


class BaseModel(models.Model):
    """Abstract base model with common fields"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        abstract = True


class SchoolDistrict(models.Model):
    """
    Core tenant model - all data belongs to a school district.
    
    Multi-tenancy approach: Header-based (X-District-ID)
    - Frontend sends district ID in request headers
    - Middleware validates and attaches district to request
    - All queries automatically filtered by district
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True, help_text="District display name")
    code = models.SlugField(
        max_length=50,
        unique=True,
        help_text="Short code for district (e.g., 'district1', 'nyc-schools')"
    )
    
    # Contact & Settings
    contact_email = models.EmailField(blank=True, help_text="Primary contact email")
    contact_phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    
    # Configuration
    is_active = models.BooleanField(default=True, db_index=True)
    settings = models.JSONField(
        default=dict,
        blank=True,
        help_text="District-specific configuration (JSON)"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'school_districts'
        ordering = ['name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['is_active', 'name']),
        ]
        verbose_name = 'School District'
        verbose_name_plural = 'School Districts'
    
    def __str__(self):
        return self.name