from rest_framework import serializers
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
    OfferTemplate,
    Offer,
    HiredEmployee
)


class ScreeningQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScreeningQuestion
        fields = ['id', 'question', 'category', 'required', 'created_at']
        read_only_fields = ['id', 'created_at']


class InterviewerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interviewer
        fields = ['id', 'name', 'email', 'role']
        read_only_fields = ['id']


class InterviewStageSerializer(serializers.ModelSerializer):
    interviewers = InterviewerSerializer(many=True, read_only=True)
    interviewer_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = InterviewStage
        fields = ['id', 'stage_number', 'stage_name',
                  'interviewers', 'interviewer_data']
        read_only_fields = ['id']

    def create(self, validated_data):
        interviewer_data = validated_data.pop('interviewer_data', [])
        stage = InterviewStage.objects.create(**validated_data)

        for interviewer_info in interviewer_data:
            Interviewer.objects.create(stage=stage, **interviewer_info)

        return stage


class JobTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobTemplate
        fields = [
            'id', 'template_name', 'primary_job_title', 'department', 'worksite',
            'fte', 'salary_range', 'employee_category', 'eeoc_classification',
            'workers_comp_classification', 'leave_plan', 'deduction_template',
            'interview_stages', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PositionListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing positions"""
    applicant_count = serializers.ReadOnlyField()
    interview_count = serializers.ReadOnlyField()
    is_open = serializers.ReadOnlyField()
    screening_questions = ScreeningQuestionSerializer(
        many=True, read_only=True)
    stages = InterviewStageSerializer(many=True, read_only=True)

    class Meta:
        model = Position
        fields = [
            'id', 'req_id', 'title', 'department', 'worksite', 'status',
            'fte', 'salary_range', 'start_date', 'posting_start_date',
            'posting_end_date', 'applicant_count', 'interview_count',
            'is_open', 'created_at', 'screening_questions', 'stages'
        ]
        read_only_fields = ['id', 'created_at']


class PositionDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for position CRUD"""
    screening_questions = ScreeningQuestionSerializer(
        many=True, read_only=True)
    screening_question_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=ScreeningQuestion.objects.all(),
        write_only=True,
        required=False,
        source='screening_questions'
    )
    stages = InterviewStageSerializer(many=True, read_only=True)
    stage_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    applicant_count = serializers.ReadOnlyField()
    interview_count = serializers.ReadOnlyField()
    is_open = serializers.ReadOnlyField()

    class Meta:
        model = Position
        fields = [
            'id', 'req_id', 'title', 'department', 'worksite', 'primary_job_title',
            'fte', 'salary_range', 'start_date', 'probation_date', 'status',
            'employee_category', 'eeoc_classification', 'workers_comp_classification',
            'leave_plan', 'deduction_template', 'description', 'requirements',
            'posting_start_date', 'posting_end_date', 'interview_stages',
            'screening_questions', 'screening_question_ids', 'stages', 'stage_data',
            'template', 'applicant_count', 'interview_count', 'is_open',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        stage_data = validated_data.pop('stage_data', [])
        screening_questions = validated_data.pop('screening_questions', [])

        # District should be passed from perform_create
        position = Position.objects.create(**validated_data)

        # Set screening questions (ManyToMany field)
        if screening_questions:
            position.screening_questions.set(screening_questions)

        # Create interview stages
        for stage_info in stage_data:
            # Pop interviewer_data (what frontend sends) or interviewers (alternative)
            interviewer_data = stage_info.pop(
                'interviewer_data', stage_info.pop('interviewers', []))
            # Ensure we only pass valid model fields to InterviewStage
            stage = InterviewStage.objects.create(
                position=position,
                district=position.district,  # Set district from position
                stage_number=stage_info.get('stage_number', 1),
                stage_name=stage_info.get('stage_name', 'Interview Stage')
            )

            # Create interviewers for this stage
            for interviewer_info in interviewer_data:
                Interviewer.objects.create(
                    stage=stage,
                    district=position.district,  # Set district from position
                    **interviewer_info
                )

        return position

    def update(self, instance, validated_data):
        stage_data = validated_data.pop('stage_data', None)
        screening_questions = validated_data.pop('screening_questions', None)

        # Update position fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update screening questions if provided
        if screening_questions is not None:
            instance.screening_questions.set(screening_questions)

        # Update interview stages if provided
        if stage_data is not None:
            # Delete existing stages
            instance.stages.all().delete()

            # Create new stages
            for stage_info in stage_data:
                # Pop interviewer_data (what frontend sends) or interviewers (alternative)
                interviewer_data = stage_info.pop(
                    'interviewer_data', stage_info.pop('interviewers', []))
                # Ensure we only pass valid model fields to InterviewStage
                stage = InterviewStage.objects.create(
                    position=instance,
                    district=instance.district,  # Set district from position
                    stage_number=stage_info.get('stage_number', 1),
                    stage_name=stage_info.get('stage_name', 'Interview Stage')
                )

                for interviewer_info in interviewer_data:
                    Interviewer.objects.create(
                        stage=stage,
                        district=instance.district,  # Set district from position
                        **interviewer_info
                    )

        return instance


class PublicPositionSerializer(serializers.ModelSerializer):
    """Public-facing serializer for job board"""
    screening_questions = ScreeningQuestionSerializer(
        many=True, read_only=True)

    class Meta:
        model = Position
        fields = [
            'id', 'req_id', 'title', 'department', 'worksite',
            'fte', 'salary_range', 'start_date', 'description',
            'requirements', 'posting_start_date', 'posting_end_date',
            'status', 'screening_questions'
        ]
        read_only_fields = fields


class ReferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reference
        fields = ['id', 'name', 'email', 'phone', 'relationship']
        read_only_fields = ['id']


class InterviewAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewAvailability
        fields = ['id', 'date', 'time_slots']
        read_only_fields = ['id']


class JobApplicationListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing applications"""
    position_title = serializers.CharField(
        source='position.title', read_only=True)
    position_req_id = serializers.CharField(
        source='position.req_id', read_only=True)
    total_interview_stages = serializers.IntegerField(
        source='position.interview_stages', read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'position', 'applicant_name', 'applicant_email', 'applicant_phone',
            'current_role', 'years_experience', 'certified', 'internal', 'stage',
            'position_title', 'position_req_id', 'current_interview_stage',
            'completed_interview_stages', 'total_interview_stages',
            'start_date_availability', 'submitted_at'
        ]
        read_only_fields = ['id', 'submitted_at']


class JobApplicationDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for application CRUD"""
    references = ReferenceSerializer(many=True, required=False)
    interview_availability = InterviewAvailabilitySerializer(
        many=True, required=False)
    position_title = serializers.CharField(
        source='position.title', read_only=True)
    position_req_id = serializers.CharField(
        source='position.req_id', read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'position', 'district', 'applicant_name', 'applicant_email', 'applicant_phone',
            'start_date_availability', 'screening_answers', 'resume', 'cover_letter',
            'stage', 'current_role', 'years_experience', 'certified', 'internal',
            'current_interview_stage', 'completed_interview_stages', 'references',
            'interview_availability', 'position_title', 'position_req_id',
            'submitted_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'submitted_at', 'created_at', 'updated_at']

    def create(self, validated_data):
        references_data = validated_data.pop('references', [])
        availability_data = validated_data.pop('interview_availability', [])

        application = JobApplication.objects.create(**validated_data)

        # Create references
        for reference_data in references_data:
            Reference.objects.create(application=application, **reference_data)

        # Create interview availability
        for availability in availability_data:
            InterviewAvailability.objects.create(
                application=application, **availability)

        return application

    def update(self, instance, validated_data):
        references_data = validated_data.pop('references', None)
        availability_data = validated_data.pop('interview_availability', None)

        # Update application fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update references if provided
        if references_data is not None:
            instance.references.all().delete()
            for reference_data in references_data:
                Reference.objects.create(
                    application=instance, **reference_data)

        # Update availability if provided
        if availability_data is not None:
            instance.interview_availability.all().delete()
            for availability in availability_data:
                InterviewAvailability.objects.create(
                    application=instance, **availability)

        return instance


class InterviewSerializer(serializers.ModelSerializer):
    """Serializer for interviews"""
    candidate_name = serializers.CharField(
        source='application.applicant_name', read_only=True)
    candidate_email = serializers.CharField(
        source='application.applicant_email', read_only=True)
    position_title = serializers.CharField(
        source='application.position.title', read_only=True)
    position_req_id = serializers.CharField(
        source='application.position.req_id', read_only=True)
    stage_name = serializers.CharField(
        source='stage.stage_name', read_only=True)
    stage_number = serializers.IntegerField(
        source='stage.stage_number', read_only=True)
    interviewers = InterviewerSerializer(
        source='stage.interviewers', many=True, read_only=True)
    worksite = serializers.CharField(
        source='application.position.worksite', read_only=True)

    class Meta:
        model = Interview
        fields = [
            'id', 'application', 'stage', 'scheduled_date', 'scheduled_time',
            'location', 'zoom_link', 'status', 'notes', 'feedback', 'rating',
            'candidate_name', 'candidate_email', 'position_title', 'position_req_id',
            'stage_name', 'stage_number', 'interviewers', 'worksite',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class OfferTemplateSerializer(serializers.ModelSerializer):
    """Serializer for offer templates"""
    extracted_fields = serializers.SerializerMethodField()

    class Meta:
        model = OfferTemplate
        fields = ['id', 'name', 'template_text', 'is_active',
                  'extracted_fields', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_extracted_fields(self, obj):
        return obj.extract_fields()


class OfferSerializer(serializers.ModelSerializer):
    """Serializer for offers"""
    candidate_name = serializers.CharField(
        source='application.applicant_name', read_only=True)
    candidate_email = serializers.CharField(
        source='application.applicant_email', read_only=True)
    position_title = serializers.CharField(
        source='application.position.title', read_only=True)
    position_req_id = serializers.CharField(
        source='application.position.req_id', read_only=True)
    department = serializers.CharField(
        source='application.position.department', read_only=True)
    worksite = serializers.CharField(
        source='application.position.worksite', read_only=True)
    employee_category = serializers.CharField(
        source='application.position.employee_category', read_only=True)
    filled_text = serializers.SerializerMethodField()

    class Meta:
        model = Offer
        fields = [
            'id', 'application', 'salary', 'fte', 'start_date', 'benefits',
            'offer_date', 'expiration_date', 'template_text', 'template_data', 'filled_text',
            'status', 'accepted_date', 'declined_reason', 'candidate_name',
            'candidate_email', 'position_title', 'position_req_id', 'department',
            'worksite', 'employee_category', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_filled_text(self, obj):
        return obj.get_filled_text()

    def create(self, validated_data):
        """Override create to automatically set district from application"""
        application = validated_data.get('application')
        validated_data['district'] = application.district
        return super().create(validated_data)


class HiredEmployeeSerializer(serializers.ModelSerializer):
    """Serializer for hired employees"""
    employee_name = serializers.CharField(
        source='application.applicant_name', read_only=True)
    employee_email = serializers.CharField(
        source='application.applicant_email', read_only=True)
    position_title = serializers.CharField(
        source='application.position.title', read_only=True)
    position_data = PositionDetailSerializer(
        source='application.position', read_only=True)

    class Meta:
        model = HiredEmployee
        fields = [
            'id', 'application', 'offer', 'hire_date', 'exported_to_infinite_vision',
            'export_date', 'infinite_vision_employee_id', 'employee_name',
            'employee_email', 'position_title', 'position_data',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'export_date']
