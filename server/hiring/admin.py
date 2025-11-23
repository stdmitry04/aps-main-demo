from django.contrib import admin
from .models import (
    ScreeningQuestion,
    JobTemplate,
    Position,
    InterviewStage,
    Interviewer,
    JobApplication,
    Reference,
    InterviewAvailability,
    Interview,
    Offer,
    HiredEmployee
)


@admin.register(ScreeningQuestion)
class ScreeningQuestionAdmin(admin.ModelAdmin):
    list_display = ['question', 'category', 'required', 'created_at']
    list_filter = ['category', 'required']
    search_fields = ['question']


@admin.register(JobTemplate)
class JobTemplateAdmin(admin.ModelAdmin):
    list_display = ['template_name', 'primary_job_title', 'department', 'salary_range']
    list_filter = ['employee_category', 'department']
    search_fields = ['template_name', 'primary_job_title']


class InterviewStageInline(admin.TabularInline):
    model = InterviewStage
    extra = 1


class InterviewerInline(admin.TabularInline):
    model = Interviewer
    extra = 1


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ['req_id', 'title', 'department', 'worksite', 'status', 'start_date', 'applicant_count']
    list_filter = ['status', 'department', 'worksite', 'employee_category']
    search_fields = ['req_id', 'title', 'department']
    date_hierarchy = 'start_date'
    inlines = [InterviewStageInline]

    fieldsets = (
        ('Basic Information', {
            'fields': ('req_id', 'title', 'department', 'worksite', 'primary_job_title', 'status')
        }),
        ('Employment Details', {
            'fields': ('fte', 'salary_range', 'start_date', 'probation_date', 'employee_category')
        }),
        ('Classifications', {
            'fields': ('eeoc_classification', 'workers_comp_classification', 'leave_plan', 'deduction_template')
        }),
        ('Job Description', {
            'fields': ('description', 'requirements')
        }),
        ('Posting Dates', {
            'fields': ('posting_start_date', 'posting_end_date')
        }),
        ('Interview Configuration', {
            'fields': ('interview_stages', 'screening_questions')
        }),
    )

    def applicant_count(self, obj):
        return obj.applicant_count
    applicant_count.short_description = 'Applicants'


@admin.register(InterviewStage)
class InterviewStageAdmin(admin.ModelAdmin):
    list_display = ['position', 'stage_number', 'stage_name']
    list_filter = ['position']
    inlines = [InterviewerInline]


class ReferenceInline(admin.TabularInline):
    model = Reference
    extra = 1


class InterviewAvailabilityInline(admin.TabularInline):
    model = InterviewAvailability
    extra = 0


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['applicant_name', 'position', 'stage', 'certified', 'submitted_at']
    list_filter = ['stage', 'certified', 'internal', 'position']
    search_fields = ['applicant_name', 'applicant_email', 'current_role']
    date_hierarchy = 'submitted_at'
    inlines = [ReferenceInline, InterviewAvailabilityInline]

    fieldsets = (
        ('Applicant Information', {
            'fields': ('applicant_name', 'applicant_email', 'applicant_phone')
        }),
        ('Position & Status', {
            'fields': ('position', 'stage', 'current_role', 'years_experience', 'certified', 'internal')
        }),
        ('Application Details', {
            'fields': ('start_date_availability', 'screening_answers', 'resume', 'cover_letter')
        }),
        ('Interview Progress', {
            'fields': ('current_interview_stage', 'completed_interview_stages')
        }),
    )


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ['candidate_name', 'position_title', 'stage', 'scheduled_date', 'scheduled_time', 'status']
    list_filter = ['status', 'scheduled_date']
    search_fields = ['application__applicant_name', 'application__position__title']
    date_hierarchy = 'scheduled_date'

    def candidate_name(self, obj):
        return obj.application.applicant_name
    candidate_name.short_description = 'Candidate'

    def position_title(self, obj):
        return obj.application.position.title
    position_title.short_description = 'Position'


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ['candidate_name', 'position_title', 'salary', 'status', 'offer_date', 'expiration_date']
    list_filter = ['status', 'offer_date']
    search_fields = ['application__applicant_name', 'application__position__title']
    date_hierarchy = 'offer_date'

    def candidate_name(self, obj):
        return obj.application.applicant_name
    candidate_name.short_description = 'Candidate'

    def position_title(self, obj):
        return obj.application.position.title
    position_title.short_description = 'Position'


@admin.register(HiredEmployee)
class HiredEmployeeAdmin(admin.ModelAdmin):
    list_display = ['employee_name', 'position_title', 'hire_date', 'exported_to_infinite_vision', 'export_date']
    list_filter = ['exported_to_infinite_vision', 'hire_date']
    search_fields = ['application__applicant_name', 'application__position__title', 'infinite_vision_employee_id']
    date_hierarchy = 'hire_date'

    def employee_name(self, obj):
        return obj.application.applicant_name
    employee_name.short_description = 'Employee'

    def position_title(self, obj):
        return obj.application.position.title
    position_title.short_description = 'Position'