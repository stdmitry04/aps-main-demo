from django.contrib import admin
from .models import (
    OnboardingCandidate,
    OnboardingSectionData,
    OnboardingDocument,
    OnboardingAuditLog,
    OnboardingEmailLog
)


class OnboardingSectionDataInline(admin.TabularInline):
    model = OnboardingSectionData
    extra = 0
    readonly_fields = ['section_name', 'section_index', 'is_completed', 'completed_at']
    fields = ['section_name', 'is_completed', 'completed_at', 'reviewed_by_admin']


class OnboardingDocumentInline(admin.TabularInline):
    model = OnboardingDocument
    extra = 0
    readonly_fields = ['document_type', 'file_name', 'file_size', 'created_at', 'verified']
    fields = ['document_type', 'file_name', 'verified', 'verified_by']


@admin.register(OnboardingCandidate)
class OnboardingCandidateAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'email',
        'position',
        'status',
        'completed_sections',
        'progress_percentage',
        'offer_date',
        'submitted_at'
    ]
    list_filter = ['status', 'position', 'offer_date', 'created_at']
    search_fields = ['name', 'email', 'position']
    readonly_fields = [
        'access_token',
        'onboarding_url',
        'progress_percentage',
        'is_expired',
        'created_at',
        'updated_at'
    ]
    inlines = [OnboardingSectionDataInline, OnboardingDocumentInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'email', 'position', 'offer_date', 'start_date')
        }),
        ('Status & Progress', {
            'fields': (
                'status',
                'completed_sections',
                'progress_percentage',
                'last_updated',
                'submitted_at'
            )
        }),
        ('Access', {
            'fields': ('access_token', 'onboarding_url', 'token_expires_at', 'is_expired')
        }),
        ('Admin Review', {
            'fields': ('reviewed_by', 'reviewed_at', 'admin_notes')
        }),
        ('Metadata', {
            'fields': ('job_application', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def progress_percentage(self, obj):
        return f"{obj.progress_percentage}%"
    progress_percentage.short_description = 'Progress'


@admin.register(OnboardingSectionData)
class OnboardingSectionDataAdmin(admin.ModelAdmin):
    list_display = [
        'candidate',
        'section_name',
        'section_index',
        'is_completed',
        'completed_at',
        'reviewed_by_admin'
    ]
    list_filter = ['section_name', 'is_completed', 'reviewed_by_admin']
    search_fields = ['candidate__name', 'candidate__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(OnboardingDocument)
class OnboardingDocumentAdmin(admin.ModelAdmin):
    list_display = [
        'candidate',
        'document_type',
        'file_name',
        'file_size_display',
        'verified',
        'verified_by',
        'created_at'
    ]
    list_filter = ['document_type', 'verified', 'created_at']
    search_fields = ['candidate__name', 'candidate__email', 'file_name']
    readonly_fields = ['file_size', 'created_at']
    
    def file_size_display(self, obj):
        """Display file size in human-readable format"""
        size_bytes = obj.file_size
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            return f"{size_bytes / 1024:.2f} KB"
        else:
            return f"{size_bytes / (1024 * 1024):.2f} MB"
    file_size_display.short_description = 'File Size'


@admin.register(OnboardingAuditLog)
class OnboardingAuditLogAdmin(admin.ModelAdmin):
    list_display = [
        'candidate',
        'action',
        'section_name',
        'performed_by_display',
        'ip_address',
        'created_at'
    ]
    list_filter = ['action', 'performed_by_candidate', 'created_at']
    search_fields = ['candidate__name', 'candidate__email']
    readonly_fields = ['created_at']
    
    def performed_by_display(self, obj):
        if obj.performed_by_candidate:
            return f"{obj.candidate.name} (Candidate)"
        elif obj.performed_by:
            return f"{obj.performed_by.first_name} {obj.performed_by.last_name} (Staff)"
        return "System"
    performed_by_display.short_description = 'Performed By'


@admin.register(OnboardingEmailLog)
class OnboardingEmailLogAdmin(admin.ModelAdmin):
    list_display = [
        'candidate',
        'email_type',
        'recipient_email',
        'sent',
        'sent_at',
        'failed'
    ]
    list_filter = ['email_type', 'sent', 'failed', 'created_at']
    search_fields = ['candidate__name', 'recipient_email', 'subject']
    readonly_fields = ['created_at']
