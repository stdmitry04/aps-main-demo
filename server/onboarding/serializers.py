from rest_framework import serializers
from django.utils import timezone
from .models import (
    OnboardingCandidate,
    OnboardingSectionData,
    OnboardingDocument,
    OnboardingAuditLog,
    OnboardingEmailLog
)


class OnboardingSectionDataSerializer(serializers.ModelSerializer):
    """Serializer for individual section data"""
    
    section_display_name = serializers.CharField(source='get_section_name_display', read_only=True)
    
    class Meta:
        model = OnboardingSectionData
        fields = [
            'id',
            'section_name',
            'section_index',
            'section_display_name',
            'form_data',
            'is_completed',
            'completed_at',
            'reviewed_by_admin',
            'admin_reviewed_at',
            'admin_comments',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def update(self, instance, validated_data):
        # Mark as completed if form_data is provided and not empty
        if 'form_data' in validated_data and validated_data['form_data']:
            instance.is_completed = True
            if not instance.completed_at:
                instance.completed_at = timezone.now()
        
        return super().update(instance, validated_data)


class OnboardingDocumentSerializer(serializers.ModelSerializer):
    """Serializer for onboarding documents"""
    
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = OnboardingDocument
        fields = [
            'id',
            'document_type',
            'document_type_display',
            'file',
            'file_url',
            'file_name',
            'file_size',
            'verified',
            'verified_by',
            'verified_at',
            'verification_notes',
            'created_at',
        ]
        read_only_fields = ['id', 'file_size', 'created_at']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None


class OnboardingCandidateListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing candidates"""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = OnboardingCandidate
        fields = [
            'id',
            'name',
            'email',
            'position',
            'offer_date',
            'start_date',
            'status',
            'status_display',
            'completed_sections',
            'progress_percentage',
            'last_updated',
            'submitted_at',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class OnboardingCandidateDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for candidate with all form data"""
    
    section_data = OnboardingSectionDataSerializer(many=True, read_only=True)
    documents = OnboardingDocumentSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    onboarding_url = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()
    
    # Section-specific data fields for easier access
    personal_info = serializers.SerializerMethodField()
    employment_details = serializers.SerializerMethodField()
    i9_form = serializers.SerializerMethodField()
    tax_withholdings = serializers.SerializerMethodField()
    payment_method = serializers.SerializerMethodField()
    time_off = serializers.SerializerMethodField()
    deductions = serializers.SerializerMethodField()
    emergency_contact = serializers.SerializerMethodField()
    
    class Meta:
        model = OnboardingCandidate
        fields = [
            'id',
            'name',
            'email',
            'position',
            'offer_date',
            'start_date',
            'status',
            'status_display',
            'completed_sections',
            'progress_percentage',
            'last_updated',
            'submitted_at',
            'access_token',
            'token_expires_at',
            'onboarding_url',
            'is_expired',
            'reviewed_by',
            'reviewed_at',
            'admin_notes',
            'section_data',
            'documents',
            'personal_info',
            'employment_details',
            'i9_form',
            'tax_withholdings',
            'payment_method',
            'time_off',
            'deductions',
            'emergency_contact',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'access_token', 'created_at', 'updated_at']
    
    def get_section_data(self, obj, section_name):
        """Helper to get data for a specific section"""
        try:
            section = obj.section_data.get(section_name=section_name)
            return section.form_data
        except OnboardingSectionData.DoesNotExist:
            return None
    
    def get_personal_info(self, obj):
        return self.get_section_data(obj, 'personal_info')
    
    def get_employment_details(self, obj):
        return self.get_section_data(obj, 'employment_details')
    
    def get_i9_form(self, obj):
        return self.get_section_data(obj, 'i9_form')
    
    def get_tax_withholdings(self, obj):
        return self.get_section_data(obj, 'tax_withholdings')
    
    def get_payment_method(self, obj):
        return self.get_section_data(obj, 'payment_method')
    
    def get_time_off(self, obj):
        return self.get_section_data(obj, 'time_off')
    
    def get_deductions(self, obj):
        return self.get_section_data(obj, 'deductions')
    
    def get_emergency_contact(self, obj):
        return self.get_section_data(obj, 'emergency_contact')


class OnboardingCandidateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new onboarding candidates"""
    
    class Meta:
        model = OnboardingCandidate
        fields = [
            'name',
            'email',
            'position',
            'offer_date',
            'start_date',
            'job_application',
        ]
    
    def create(self, validated_data):
        # Set token expiration (30 days from now)
        from datetime import timedelta
        validated_data['token_expires_at'] = timezone.now() + timedelta(days=30)
        
        candidate = OnboardingCandidate.objects.create(**validated_data)
        
        # Create empty sections
        section_names = [
            ('personal_info', 0),
            ('employment_details', 1),
            ('i9_form', 2),
            ('tax_withholdings', 3),
            ('payment_method', 4),
            ('time_off', 5),
            ('deductions', 6),
            ('emergency_contact', 7),
        ]
        
        for section_name, index in section_names:
            OnboardingSectionData.objects.create(
                candidate=candidate,
                section_name=section_name,
                section_index=index,
                form_data={}
            )
        
        return candidate


class SectionUpdateSerializer(serializers.Serializer):
    """Serializer for updating a section's data"""
    
    section_index = serializers.IntegerField(min_value=0, max_value=7)
    form_data = serializers.JSONField()
    is_completed = serializers.BooleanField(default=False)


class ProgressUpdateSerializer(serializers.Serializer):
    """Serializer for progress updates"""
    
    completed_sections = serializers.IntegerField(min_value=0, max_value=8)
    section_name = serializers.CharField(required=False, allow_blank=True)
    section_data = serializers.JSONField(required=False)


class SubmitOnboardingSerializer(serializers.Serializer):
    """Serializer for submitting the onboarding form"""
    
    confirm_completion = serializers.BooleanField(required=True)
    
    def validate_confirm_completion(self, value):
        if not value:
            raise serializers.ValidationError("You must confirm that all information is complete.")
        return value


class OnboardingAuditLogSerializer(serializers.ModelSerializer):
    """Serializer for audit logs"""
    
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    performed_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = OnboardingAuditLog
        fields = [
            'id',
            'action',
            'action_display',
            'section_name',
            'performed_by',
            'performed_by_name',
            'performed_by_candidate',
            'details',
            'ip_address',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_performed_by_name(self, obj):
        if obj.performed_by_candidate:
            return obj.candidate.name
        elif obj.performed_by:
            return f"{obj.performed_by.first_name} {obj.performed_by.last_name}"
        return "System"


class AdminReviewSerializer(serializers.Serializer):
    """Serializer for admin review actions"""
    
    section_index = serializers.IntegerField(min_value=0, max_value=7, required=False)
    admin_comments = serializers.CharField(required=False, allow_blank=True)
    mark_as_reviewed = serializers.BooleanField(default=True)


class OnboardingStatsSerializer(serializers.Serializer):
    """Serializer for onboarding statistics"""
    
    total_candidates = serializers.IntegerField()
    not_started = serializers.IntegerField()
    in_progress = serializers.IntegerField()
    completed = serializers.IntegerField()
    submitted = serializers.IntegerField()
    average_completion_time = serializers.FloatField()
    completion_rate = serializers.FloatField()
