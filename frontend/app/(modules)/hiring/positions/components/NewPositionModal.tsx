import React from 'react';
import { PositionFormData, InterviewStageFormData, JobTemplate, Position } from "@/types/hiring";
import { Input, Select, Button, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";
import { initialTemplates, salaryRanges, primaryJobTitles } from "./positionTemplates";
import type { ScreeningQuestion } from "@/types";
import { WorkLocation } from '../../../timeandattendance/hooks/locations';
import { useScreeningQuestions } from "@/app/(modules)/hiring/hooks";

// Mock interviewer data
const availableInterviewers = [
    { name: "Dr. Sarah Johnson", email: "sarah.johnson@district.edu", role: "Principal" },
    { name: "Michael Chen", email: "michael.chen@district.edu", role: "Assistant Principal" },
    { name: "Patricia Williams", email: "patricia.williams@district.edu", role: "Department Head - Science" },
    { name: "Robert Martinez", email: "robert.martinez@district.edu", role: "Department Head - Math" },
    { name: "Jennifer Davis", email: "jennifer.davis@district.edu", role: "HR Director" },
    { name: "David Thompson", email: "david.thompson@district.edu", role: "Superintendent" },
    { name: "Lisa Anderson", email: "lisa.anderson@district.edu", role: "Curriculum Director" },
    { name: "James Taylor", email: "james.taylor@district.edu", role: "Department Head - English" },
    { name: "Maria Garcia", email: "maria.garcia@district.edu", role: "Special Education Director" },
    { name: "William Brown", email: "william.brown@district.edu", role: "Lead Teacher - Science" },
    { name: "Elizabeth Wilson", email: "elizabeth.wilson@district.edu", role: "Lead Teacher - Math" },
    { name: "Christopher Lee", email: "christopher.lee@district.edu", role: "Assistant Superintendent" }
];

interface NewPositionModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: PositionFormData) => void;
    availableLocations?: WorkLocation[];
    initialTemplate?: JobTemplate | null;
    editingPosition?: Position | null;
}

export function NewPositionModal({
    open,
    onClose,
    onSubmit,
    availableLocations = [],
    initialTemplate = null,
    editingPosition = null
}: NewPositionModalProps) {
    const [templates, setTemplates] = React.useState<Record<string, JobTemplate>>(initialTemplates);
    const [formData, setFormData] = React.useState<PositionFormData>({
        title: '',
        department: '',
        worksite: '',
        primaryJobTitle: '',
        reqId: '',
        fte: '1.0',
        salaryRange: '',
        startDate: '',
        probationDate: '',
        status: 'Draft',
        employeeCategory: '',
        eeocClassification: '',
        workersCompClassification: '',
        leavePlan: '',
        deductionTemplate: '',
        description: '',
        requirements: '',
        postingStartDate: '',
        postingEndDate: '',
        interviewStages: 1
    });

    const [interviewStageDetails, setInterviewStageDetails] = React.useState<InterviewStageFormData[]>([
        { name: 'Initial Interview', interviewers: [] }
    ]);

    // Hook for screening questions from backend
    const { questions: questionBank, createQuestion: createScreeningQuestion, loading: questionsLoading } = useScreeningQuestions();
    const [selectedQuestionIds, setSelectedQuestionIds] = React.useState<string[]>([]);
    // Store full question objects from backend when editing (for questions that might not be in questionBank yet)
    const [backendQuestions, setBackendQuestions] = React.useState<ScreeningQuestion[]>([]);

    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [currentStep, setCurrentStep] = React.useState(1);
    const [showSaveTemplate, setShowSaveTemplate] = React.useState(false);

    // Load template or editing position data when modal opens
    React.useEffect(() => {
        if (!open) return;

        if (editingPosition && editingPosition.id) {
            // Load editing position data
            const positionData = editingPosition as any;
            setFormData({
                title: positionData.title || '',
                department: positionData.department || '',
                worksite: positionData.worksite || positionData.school || '',
                primaryJobTitle: positionData.primaryJobTitle || positionData.primaryJobTitle || '',
                reqId: positionData.reqId || positionData.reqId || '',
                fte: positionData.fte?.toString() || '1.0',
                salaryRange: positionData.salaryRange || positionData.salaryRange || '',
                startDate: positionData.startDate || positionData.startDate || '',
                probationDate: positionData.probationDate || positionData.probationDate || '',
                status: positionData.status || 'Draft',
                employeeCategory: positionData.employeeCategory || positionData.employeeCategory || '',
                eeocClassification: positionData.eeocClassification || positionData.eeocClassification || '',
                workersCompClassification: positionData.workersCompClassification || positionData.workersCompClassification || '',
                leavePlan: positionData.leavePlan || positionData.leavePlan || '',
                deductionTemplate: positionData.deductionTemplate || positionData.deductionTemplate || '',
                description: positionData.description || '',
                requirements: positionData.requirements || '',
                postingStartDate: positionData.postingStartDate || positionData.postingStartDate || '',
                postingEndDate: positionData.postingEndDate || positionData.postingEndDate || '',
                interviewStages: positionData.interviewStages || positionData.interviewStages || 1
            });

            // Load interview stage details
            if (positionData.stages && Array.isArray(positionData.stages)) {
                setInterviewStageDetails(positionData.stages.map((stage: any) => ({
                    name: stage.stageName || stage.name,
                    interviewers: stage.interviewers?.map((int: any) => int.email || int) || []
                })));
                setCurrentStep(1);
            }

            // Load selected screening question IDs and store full question objects
            if (positionData.screeningQuestions) {
                const questions = positionData.screeningQuestions.map((q: any) => {
                    // Convert backend response to ScreeningQuestion format
                    return {
                        id: String(q.id || q),
                        question: q.question || '',
                        category: q.category || 'general',
                        required: q.required !== undefined ? q.required : true
                    } as ScreeningQuestion;
                });

                const questionIds = questions.map((q: ScreeningQuestion) => String(q.id));
                setSelectedQuestionIds(questionIds);
                // Store the full question objects for display
                setBackendQuestions(questions);
            } else {
                setBackendQuestions([]);
            }
        } else if (initialTemplate) {
            // Load template data
            const templateData = {
                ...formData,
                primaryJobTitle: initialTemplate.primaryJobTitle,
                department: initialTemplate.department || formData.department,
                worksite: initialTemplate.worksite || formData.worksite,
                fte: initialTemplate.fte,
                salaryRange: initialTemplate.salaryRange,
                probationDate: initialTemplate.probationDate || '',
                status: initialTemplate.status,
                employeeCategory: initialTemplate.employeeCategory,
                eeocClassification: initialTemplate.eeocClassification,
                workersCompClassification: initialTemplate.workersCompClassification,
                leavePlan: initialTemplate.leavePlan,
                deductionTemplate: initialTemplate.deductionTemplate,
                interviewStages: initialTemplate.interviewStages
            };

            // Auto-set posting start date to today if status is "Open" and no date set
            if (templateData.status === 'Open' && !templateData.postingStartDate) {
                templateData.postingStartDate = new Date().toISOString().split('T')[0];
            }

            setFormData(templateData);

            if (initialTemplate.interviewStageDetails) {
                setInterviewStageDetails(initialTemplate.interviewStageDetails);
            }
        } else {
            // Reset form for new position
            resetForm();
        }
    }, [open, initialTemplate, editingPosition]);

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.title?.trim()) newErrors.title = 'Position title is required';
            if (!formData.department) newErrors.department = 'Department is required';
            if (!formData.worksite) newErrors.worksite = 'Worksite is required';
            if (!formData.primaryJobTitle) newErrors.primaryJobTitle = 'Primary job title is required';
            if (!formData.reqId?.trim()) newErrors.reqId = 'Requisition ID is required';
        } else if (step === 2) {
            if (!formData.fte) newErrors.fte = 'FTE is required';
            if (!formData.salaryRange) newErrors.salaryRange = 'Salary range is required';
            if (!formData.startDate) newErrors.startDate = 'Start date is required';
            if (!formData.employeeCategory) newErrors.employeeCategory = 'Employee category is required';
            if (!formData.interviewStages || formData.interviewStages < 1) newErrors.interviewStages = 'At least 1 interview stage is required';
        } else if (step === 3) {
            if (!formData.eeocClassification) newErrors.eeocClassification = 'EEOC classification is required';
            if (!formData.workersCompClassification) newErrors.workersCompClassification = 'Workers comp classification is required';
            if (!formData.leavePlan) newErrors.leavePlan = 'Leave plan is required';
            if (!formData.deductionTemplate) newErrors.deductionTemplate = 'Deduction template is required';
        } else if (step === 4) {
            if (!formData.postingStartDate) newErrors.postingStartDate = 'Posting start date is required';
            if (!formData.postingEndDate) newErrors.postingEndDate = 'Posting end date is required';
        }

        setErrors(newErrors);

        // Scroll to first error if validation fails
        if (Object.keys(newErrors).length > 0) {
            const firstErrorField = Object.keys(newErrors)[0];
            const element = document.querySelector(`[data-field="${firstErrorField}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        return Object.keys(newErrors).length === 0;
    };

    const handleNext = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
        }
        if (!validateStep(currentStep)) {
            // Validation failed - errors are already set
            return;
        }
        setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = () => {
        if (validateStep(currentStep)) {
            // Transform interview stage details to match backend expectations
            const stageData = interviewStageDetails.map((stage, index) => ({
                stageNumber: index + 1,
                stageName: stage.name,
                interviewerData: stage.interviewers.map(email => {
                    const interviewer = availableInterviewers.find(i => i.email === email);
                    return interviewer ? {
                        name: interviewer.name,
                        email: interviewer.email,
                        role: interviewer.role
                    } : null;
                }).filter(Boolean)
            }));

            const submitData = {
                ...formData,
                screeningQuestionIds: selectedQuestionIds,  // Use screening_question_ids field
                stageData: stageData  // Use stageData instead of interviewStageDetails
            };

            onSubmit(submitData as any);
            onClose();
            resetForm();
        }
    };

    const handleChange = (field: keyof PositionFormData, value: any) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };

            // Auto-set posting start date to today when status changes to "Open"
            if (field === 'status' && value === 'Open' && !prev.postingStartDate) {
                const today = new Date().toISOString().split('T')[0];
                updated.postingStartDate = today;
            }

            return updated;
        });

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }

        // Handle interview stages count change
        if (field === 'interviewStages') {
            const count = parseInt(value) || 1;
            setInterviewStageDetails(prev => {
                const newStages = [...prev];

                // Add new stages if count increased
                while (newStages.length < count) {
                    newStages.push({
                        name: `Interview Stage ${newStages.length + 1}`,
                        interviewers: []
                    });
                }

                // Remove stages if count decreased
                if (newStages.length > count) {
                    return newStages.slice(0, count);
                }

                return newStages;
            });
        }
    };

    const handlePrimaryJobTitleChange = (jobTitle: string) => {
        handleChange('primaryJobTitle', jobTitle);

        // Auto-populate from template if exists
        if (jobTitle && templates[jobTitle]) {
            const template = templates[jobTitle];
            setFormData(prev => ({
                ...prev,
                primaryJobTitle: jobTitle,
                department: template.department || prev.department,
                worksite: template.worksite || prev.worksite,
                fte: template.fte,
                salaryRange: template.salaryRange,
                employeeCategory: template.employeeCategory,
                eeocClassification: template.eeocClassification,
                workersCompClassification: template.workersCompClassification,
                leavePlan: template.leavePlan,
                deductionTemplate: template.deductionTemplate,
                interviewStages: template.interviewStages
            }));


            if (template.interviewStageDetails) {
                setInterviewStageDetails(template.interviewStageDetails);
            }
        }
    };

    const handleSaveAsTemplate = () => {
        if (!formData.primaryJobTitle) {
            alert('Please select a primary job title first');
            return;
        }

        const template: JobTemplate = {
            templateName: formData.primaryJobTitle,
            primaryJobTitle: formData.primaryJobTitle,
            department: formData.department,
            worksite: formData.worksite,
            fte: formData.fte,
            salaryRange: formData.salaryRange,
            probationDate: formData.probationDate,
            status: formData.status,
            employeeCategory: formData.employeeCategory,
            eeocClassification: formData.eeocClassification,
            workersCompClassification: formData.workersCompClassification,
            leavePlan: formData.leavePlan,
            deductionTemplate: formData.deductionTemplate,
            interviewStages: formData.interviewStages,
            interviewStageDetails: interviewStageDetails
        };

        setTemplates(prev => ({
            ...prev,
            [formData.primaryJobTitle]: template
        }));

        setShowSaveTemplate(true);
        setTimeout(() => setShowSaveTemplate(false), 3000);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            department: '',
            worksite: '',
            primaryJobTitle: '',
            reqId: '',
            fte: '1.0',
            salaryRange: '',
            startDate: '',
            probationDate: '',
            status: 'Draft',
            employeeCategory: '',
            eeocClassification: '',
            workersCompClassification: '',
            leavePlan: '',
            deductionTemplate: '',
            description: '',
            requirements: '',
            postingStartDate: '',
            postingEndDate: '',
            interviewStages: 1
        });
        setInterviewStageDetails([
            { name: 'Initial Interview', interviewers: [] }
        ]);
        setSelectedQuestionIds([]);
        setBackendQuestions([]);
        setCurrentStep(1);
        setErrors({});
    };

    const renderTemplateBanner = () => {
        if (!initialTemplate) return null;

        return (
            <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {initialTemplate.templateName.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">
                            Using template: {initialTemplate.templateName}
                        </p>
                        <p className="text-xs text-blue-700">
                            Form has been pre-filled with template defaults
                        </p>
                    </div>
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        );
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {editingPosition ? 'Edit Position' : 'Create New Position'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Step {currentStep} of 4: {
                                currentStep === 1 ? 'Position Information' :
                                    currentStep === 2 ? 'Employment Details' :
                                        currentStep === 3 ? 'Classifications & Benefits' :
                                            'Job Description & Posting'
                            }
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {showSaveTemplate && (
                            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Template Saved!
                            </div>
                        )}
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="px-6 py-3 bg-gray-50 border-b">
                    <div className="flex items-center justify-between mb-2">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex items-center flex-1">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                                    step <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                                )}>
                                    {step}
                                </div>
                                {step < 4 && (
                                    <div className={cn(
                                        "flex-1 h-1 mx-2",
                                        step < currentStep ? "bg-blue-600" : "bg-gray-200"
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Template Banner */}
                {renderTemplateBanner()}

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="px-6 py-6">
                        {/* Error Summary Banner */}
                        {Object.keys(errors).length > 0 && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-red-900 mb-1">Please fix the following errors:</h4>
                                        <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
                                            {Object.values(errors).filter(Boolean).map((error, index) => (
                                                <li key={index}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 1: Position Information */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div data-field="title">
                                        <Input
                                            label="Position Title *"
                                            placeholder="e.g., High School Chemistry Teacher"
                                            value={formData.title}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('title', e.target.value)}
                                            error={errors.title}
                                        />
                                    </div>
                                    <div data-field="reqId">
                                        <Input
                                            label="Requisition ID *"
                                            placeholder="e.g., REQ-2025-0193"
                                            value={formData.reqId}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('reqId', e.target.value)}
                                            error={errors.reqId}
                                        />
                                    </div>
                                </div>

                                <div data-field="primaryJobTitle">
                                    <Select
                                        label="Primary Job Title *"
                                        value={formData.primaryJobTitle}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handlePrimaryJobTitleChange(e.target.value)}
                                        error={errors.primaryJobTitle}
                                    >
                                        <option value="">Select job title</option>
                                        {primaryJobTitles.map(title => (
                                            <option key={title} value={title}>{title}</option>
                                        ))}
                                    </Select>
                                </div>

                                {formData.primaryJobTitle && templates[formData.primaryJobTitle] && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-blue-700 text-sm">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Template loaded - fields have been auto-populated
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div data-field="department">
                                        <Select
                                            label="Department *"
                                            value={formData.department}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('department', e.target.value)}
                                            error={errors.department}
                                        >
                                            <option value="">Select department</option>
                                            <option value="Science">Science</option>
                                            <option value="Mathematics">Mathematics</option>
                                            <option value="English">English</option>
                                            <option value="Social Studies">Social Studies</option>
                                            <option value="Special Education">Special Education</option>
                                            <option value="English Language Development">English Language Development</option>
                                            <option value="Fine Arts">Fine Arts</option>
                                            <option value="Physical Education">Physical Education</option>
                                            <option value="Administration">Administration</option>
                                            <option value="Student Services">Student Services</option>
                                            <option value="Elementary Education">Elementary Education</option>
                                        </Select>
                                    </div>

                                    <div data-field="worksite">
                                        <Select
                                            label="Worksite *"
                                            value={formData.worksite}
                                            onChange={(e) => handleChange('worksite', e.target.value)}
                                            error={errors.worksite}
                                        >
                                            <option value="">Select worksite</option>
                                            {availableLocations.length > 0 ? (
                                                availableLocations.map((location) => (
                                                    <option key={location.id} value={location.name}>
                                                        {location.name}
                                                    </option>
                                                ))
                                            ) : (
                                                <>
                                                    <option value="Central High School">Central High School</option>
                                                    <option value="Lincoln Elementary">Lincoln Elementary</option>
                                                    <option value="Washington Middle School">Washington Middle School</option>
                                                    <option value="Roosevelt Elementary">Roosevelt Elementary</option>
                                                    <option value="District Office">District Office</option>
                                                </>
                                            )}
                                        </Select>
                                    </div>
                                </div>

                                <Select
                                    label="Position Status"
                                    value={formData.status}
                                    onChange={(e) => handleChange('status', e.target.value as 'Draft' | 'Open' | 'Closed')}
                                >
                                    <option value="Draft">Draft - Not Posted Yet</option>
                                    <option value="Open">Open - Accepting Applications</option>
                                    <option value="Closed">Closed - Not Accepting Applications</option>
                                </Select>
                            </div>
                        )}

                        {/* Step 2: Employment Details */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="FTE (Full-Time Equivalent) *"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="1"
                                        placeholder="1.0"
                                        value={formData.fte}
                                        onChange={(e: any) => handleChange('fte', e.target.value)}
                                        error={errors.fte}
                                    />
                                    <Select
                                        label="Salary Range *"
                                        value={formData.salaryRange}
                                        onChange={(e: any) => handleChange('salaryRange', e.target.value)}
                                        error={errors.salaryRange}
                                    >
                                        <option value="">Select salary range</option>
                                        {salaryRanges.map(range => (
                                            <option key={range} value={range}>{range}</option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Expected Start Date *"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e: any) => handleChange('startDate', e.target.value)}
                                        error={errors.startDate}
                                    />
                                    <Input
                                        label="Probation End Date"
                                        type="date"
                                        value={formData.probationDate}
                                        onChange={(e: any) => handleChange('probationDate', e.target.value)}
                                        error={errors.probationDate}
                                    />
                                </div>

                                <Select
                                    label="Employee Category *"
                                    value={formData.employeeCategory}
                                    onChange={(e) => handleChange('employeeCategory', e.target.value)}
                                    error={errors.employeeCategory}
                                >
                                    <option value="">Select category</option>
                                    <option value="Certified Teacher">Certified Teacher</option>
                                    <option value="Non-Certified Teacher">Non-Certified Teacher</option>
                                    <option value="Administrator">Administrator</option>
                                    <option value="Support Staff">Support Staff</option>
                                    <option value="Paraprofessional">Paraprofessional</option>
                                    <option value="Substitute">Substitute</option>
                                </Select>

                                <div className="bg-white border border-gray-300 rounded-lg p-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Number of Interview Stages *
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            min="1"
                                            max="5"
                                            value={formData.interviewStages}
                                            onChange={(e) => handleChange('interviewStages', parseInt(e.target.value) || 1)}
                                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <span className="text-sm text-gray-600">
                                            Defines how many interview rounds this position requires
                                        </span>
                                    </div>
                                    {errors.interviewStages && <p className="text-xs text-red-600 mt-1">{errors.interviewStages}</p>}
                                </div>

                                {/* Interview Stage Details */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-900">Configure Interview Stages</h3>
                                    {interviewStageDetails.map((stage, index) => (
                                        <InterviewStageConfig
                                            key={index}
                                            stageNumber={index + 1}
                                            stage={stage}
                                            availableInterviewers={availableInterviewers}
                                            onChange={(updatedStage) => {
                                                const newStages = [...interviewStageDetails];
                                                newStages[index] = updatedStage;
                                                setInterviewStageDetails(newStages);
                                            }}
                                        />
                                    ))}
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-blue-900 mb-2">ERP System Export</h4>
                                    <p className="text-xs text-blue-700">
                                        These fields will be automatically exported to the ERP system when a candidate is hired.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Classifications & Benefits */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <Select
                                    label="EEOC Classification *"
                                    value={formData.eeocClassification}
                                    onChange={(e) => handleChange('eeocClassification', e.target.value)}
                                    error={errors.eeocClassification}
                                >
                                    <option value="">Select EEOC classification</option>
                                    <option value="1.1 - Executive/Senior Officials">1.1 - Executive/Senior Officials</option>
                                    <option value="1.2 - First/Mid Officials & Managers">1.2 - First/Mid Officials & Managers</option>
                                    <option value="2 - Professionals">2 - Professionals</option>
                                    <option value="3 - Technicians">3 - Technicians</option>
                                    <option value="4 - Sales Workers">4 - Sales Workers</option>
                                    <option value="5 - Administrative Support">5 - Administrative Support</option>
                                    <option value="6 - Craft Workers">6 - Craft Workers</option>
                                    <option value="7 - Operatives">7 - Operatives</option>
                                    <option value="8 - Laborers and Helpers">8 - Laborers and Helpers</option>
                                    <option value="9 - Service Workers">9 - Service Workers</option>
                                </Select>

                                <Select
                                    label="Workers' Compensation Classification *"
                                    value={formData.workersCompClassification}
                                    onChange={(e) => handleChange('workersCompClassification', e.target.value)}
                                    error={errors.workersCompClassification}
                                >
                                    <option value="">Select workers comp classification</option>
                                    <option value="8868 - Teachers">8868 - Teachers</option>
                                    <option value="8810 - Clerical Office">8810 - Clerical Office</option>
                                    <option value="9101 - Maintenance">9101 - Maintenance</option>
                                    <option value="7720 - Drivers">7720 - Drivers</option>
                                    <option value="8842 - School Administrators">8842 - School Administrators</option>
                                </Select>

                                <Select
                                    label="Leave Plan *"
                                    value={formData.leavePlan}
                                    onChange={(e) => handleChange('leavePlan', e.target.value)}
                                    error={errors.leavePlan}
                                >
                                    <option value="">Select leave plan</option>
                                    <option value="Teacher - 10 Month">Teacher - 10 Month</option>
                                    <option value="Teacher - 12 Month">Teacher - 12 Month</option>
                                    <option value="Administrator - 12 Month">Administrator - 12 Month</option>
                                    <option value="Support Staff - 10 Days">Support Staff - 10 Days</option>
                                    <option value="Support Staff - 12 Days">Support Staff - 12 Days</option>
                                    <option value="Support Staff - 15 Days">Support Staff - 15 Days</option>
                                </Select>

                                <Select
                                    label="Deduction Template *"
                                    value={formData.deductionTemplate}
                                    onChange={(e) => handleChange('deductionTemplate', e.target.value)}
                                    error={errors.deductionTemplate}
                                >
                                    <option value="">Select deduction template</option>
                                    <option value="Teacher - Standard">Teacher - Standard</option>
                                    <option value="Teacher - TRS Pension">Teacher - TRS Pension</option>
                                    <option value="Administrator - Standard">Administrator - Standard</option>
                                    <option value="Support Staff - Standard">Support Staff - Standard</option>
                                    <option value="Part-Time - No Benefits">Part-Time - No Benefits</option>
                                </Select>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex gap-2">
                                        <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div>
                                            <h4 className="text-sm font-medium text-yellow-900">Important Note</h4>
                                            <p className="text-xs text-yellow-700 mt-1">
                                                Deduction template includes IL and Federal taxes, insurance, retirement contributions, and other benefit deductions based on position type.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Job Description & Posting */}
                        {currentStep === 4 && (
                            <div className="space-y-4">
                                <Textarea
                                    label="Job Description"
                                    rows={6}
                                    placeholder="Provide a detailed description of the position responsibilities..."
                                    value={formData.description}
                                    onChange={(e: any) => handleChange('description', e.target.value)}
                                />

                                <Textarea
                                    label="Requirements & Qualifications"
                                    rows={6}
                                    placeholder="List required certifications, education, experience, and skills..."
                                    value={formData.requirements}
                                    onChange={(e: any) => handleChange('requirements', e.target.value)}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <div data-field="postingStartDate">
                                        <Input
                                            label="Posting Start Date *"
                                            type="date"
                                            value={formData.postingStartDate}
                                            onChange={(e: any) => handleChange('postingStartDate', e.target.value)}
                                            error={errors.postingStartDate}
                                            disabled={formData.status === 'Open' && !!formData.postingStartDate}
                                        />
                                        {formData.status === 'Open' && formData.postingStartDate && (
                                            <p className="text-xs text-blue-600 mt-1">
                                                Posting start date is locked for open positions
                                            </p>
                                        )}
                                    </div>
                                    <div data-field="postingEndDate">
                                        <Input
                                            label="Posting End Date *"
                                            type="date"
                                            value={formData.postingEndDate}
                                            onChange={(e: any) => handleChange('postingEndDate', e.target.value)}
                                            error={errors.postingEndDate}
                                        />
                                    </div>
                                </div>

                                {/* Screening Questions Section */}
                                <div className="border-t border-gray-200 pt-4 mt-6">
                                    <ScreeningQuestionsSelector
                                        questionBank={questionBank}
                                        selectedQuestionIds={selectedQuestionIds}
                                        onQuestionsChange={setSelectedQuestionIds}
                                        onCreateQuestion={createScreeningQuestion}
                                        loading={questionsLoading}
                                        backendQuestions={backendQuestions}
                                    />
                                </div>

                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex gap-2">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <h4 className="text-sm font-medium text-green-900">Ready to Post</h4>
                                            <p className="text-xs text-green-700 mt-1">
                                                Once submitted, this position will be created with {formData.interviewStages} interview stage(s), {selectedQuestionIds.length} screening question(s), and can be published to job boards. All required fields for ERP export are complete.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">* Required fields</span>
                        {formData.primaryJobTitle && (
                            <Button variant="success" onClick={handleSaveAsTemplate} type="button">
                                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                                Save as Template
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        {currentStep > 1 && (
                            <Button variant="secondary" onClick={handleBack} type="button">
                                Back
                            </Button>
                        )}
                        <Button variant="secondary" onClick={onClose} type="button">
                            Cancel
                        </Button>
                        {currentStep < 4 ? (
                            <Button onClick={handleNext} type="button">
                                Next
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} type="button">
                                {editingPosition ? 'Update Position' : 'Create Position'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Interview Stage Configuration Component
interface InterviewStageConfigProps {
    stageNumber: number;
    stage: InterviewStageFormData;
    availableInterviewers: typeof availableInterviewers;
    onChange: (stage: InterviewStageFormData) => void;
}

function InterviewStageConfig({ stageNumber, stage, availableInterviewers, onChange }: InterviewStageConfigProps) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [showDropdown, setShowDropdown] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredInterviewers = availableInterviewers.filter(interviewer =>
        interviewer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interviewer.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedInterviewers = availableInterviewers.filter(interviewer =>
        stage.interviewers.includes(interviewer.email)
    );

    const handleAddInterviewer = (email: string) => {
        if (!stage.interviewers.includes(email)) {
            onChange({
                ...stage,
                interviewers: [...stage.interviewers, email]
            });
        }
        setSearchTerm('');
        setShowDropdown(false);
    };

    const handleRemoveInterviewer = (email: string) => {
        onChange({
            ...stage,
            interviewers: stage.interviewers.filter(e => e !== email)
        });
    };

    return (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                    {stageNumber}
                </div>
                <Input
                    label=""
                    placeholder={`Stage ${stageNumber} Name`}
                    value={stage.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...stage, name: e.target.value })}
                    className="flex-1"
                />
            </div>

            <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                    Interview Panel ({stage.interviewers.length} selected)
                </label>

                {/* Search Input */}
                <div className="relative" ref={dropdownRef}>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search interviewers by name..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
                        />
                        <svg
                            className="w-5 h-5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Dropdown */}
                    {showDropdown && searchTerm && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredInterviewers.length > 0 ? (
                                filteredInterviewers.map((interviewer) => {
                                    const isSelected = stage.interviewers.includes(interviewer.email);
                                    return (
                                        <button
                                            key={interviewer.email}
                                            type="button"
                                            onClick={() => !isSelected && handleAddInterviewer(interviewer.email)}
                                            disabled={isSelected}
                                            className={cn(
                                                "w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0",
                                                isSelected && "opacity-50 cursor-not-allowed bg-gray-50"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{interviewer.name}</div>
                                                    <div className="text-xs text-gray-500">{interviewer.role}</div>
                                                </div>
                                                {isSelected && (
                                                    <span className="text-xs text-green-600 font-medium">Added</span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                                    No interviewers found
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Interviewers */}
            {selectedInterviewers.length > 0 && (
                <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-700">Selected Panel Members:</label>
                    <div className="space-y-1">
                        {selectedInterviewers.map((interviewer) => (
                            <div
                                key={interviewer.email}
                                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2"
                            >
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">{interviewer.name}</div>
                                    <div className="text-xs text-gray-500">{interviewer.role} • {interviewer.email}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveInterviewer(interviewer.email)}
                                    className="ml-2 text-red-600 hover:text-red-800"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Screening Questions Selector Component
interface ScreeningQuestionsSelectorProps {
    questionBank: ScreeningQuestion[];
    selectedQuestionIds: string[];
    onQuestionsChange: (questionIds: string[]) => void;
    onCreateQuestion: (data: Partial<ScreeningQuestion>) => Promise<ScreeningQuestion>;
    loading?: boolean;
    backendQuestions?: ScreeningQuestion[]; // Questions from backend when editing
}

function ScreeningQuestionsSelector({
    questionBank,
    selectedQuestionIds,
    onQuestionsChange,
    onCreateQuestion,
    loading = false,
    backendQuestions = []
}: ScreeningQuestionsSelectorProps) {
    const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [showDropdown, setShowDropdown] = React.useState(false);
    const [showNewQuestionForm, setShowNewQuestionForm] = React.useState(false);
    const [isCreatingQuestion, setIsCreatingQuestion] = React.useState(false);
    const [newQuestion, setNewQuestion] = React.useState({
        question: '',
        category: 'general',
        required: true,
        saveToBank: false
    });
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Ensure questionBank is always an array
    const safeQuestionBank = Array.isArray(questionBank) ? questionBank : [];

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const categories = ['all', 'certification', 'experience', 'skills', 'availability', 'general'];

    const filteredQuestions = safeQuestionBank.filter(q => {
        const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
        const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Get selected questions - match from questionBank first, then fallback to backendQuestions
    const selectedQuestions = React.useMemo(() => {
        const questions: ScreeningQuestion[] = [];
        const processedIds = new Set<string>();

        // First, try to find questions in the questionBank by ID
        selectedQuestionIds.forEach(id => {
            const found = safeQuestionBank.find(q => String(q.id) === id);
            if (found) {
                questions.push(found);
                processedIds.add(id);
            }
        });

        // For any IDs not found in questionBank, check backendQuestions
        selectedQuestionIds.forEach(id => {
            if (!processedIds.has(id)) {
                const found = backendQuestions.find(q => String(q.id) === id);
                if (found) {
                    questions.push(found);
                    processedIds.add(id);
                }
            }
        });

        // Sort by the order they appear in selectedQuestionIds
        return selectedQuestionIds
            .map(id => questions.find(q => String(q.id) === id))
            .filter((q): q is ScreeningQuestion => q !== undefined);
    }, [safeQuestionBank, backendQuestions, selectedQuestionIds]);

    const handleAddQuestion = (questionId: string | number) => {
        if (selectedQuestionIds.length >= 5) {
            alert('Maximum 5 screening questions allowed');
            return;
        }
        const questionIdStr = String(questionId);
        if (!selectedQuestionIds.includes(questionIdStr)) {
            onQuestionsChange([...selectedQuestionIds, questionIdStr]);
        }
        setSearchTerm('');
        setShowDropdown(false);
    };

    const handleRemoveQuestion = (questionId: string | number) => {
        const questionIdStr = String(questionId);
        onQuestionsChange(selectedQuestionIds.filter(id => id !== questionIdStr));
    };

    const handleCreateNewQuestion = async () => {
        if (!newQuestion.question.trim()) {
            alert('Please enter a question');
            return;
        }

        if (selectedQuestionIds.length >= 5) {
            alert('Maximum 5 screening questions allowed');
            return;
        }

        try {
            setIsCreatingQuestion(true);

            // Create question in backend
            const createdQuestion = await onCreateQuestion({
                question: newQuestion.question.trim(),
                category: newQuestion.category as any,
                required: newQuestion.required
            });

            // Add to position - ensure ID is converted to string for consistency
            const questionId = String(createdQuestion.id);
            onQuestionsChange([...selectedQuestionIds, questionId]);

            // Reset form
            setNewQuestion({
                question: '',
                category: 'general',
                required: true,
                saveToBank: false
            });
            setShowNewQuestionForm(false);
        } catch (error) {
            console.error('Failed to create question:', error);
            alert('Failed to create question. Please try again.');
        } finally {
            setIsCreatingQuestion(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Screening Questions</h3>
                <p className="text-xs text-gray-600 mb-4">
                    Add up to 5 screening questions to help evaluate candidates (optional)
                    {selectedQuestions.length > 0 && ` • ${selectedQuestions.length} question${selectedQuestions.length !== 1 ? 's' : ''} selected`}
                </p>
            </div>

            {/* Show selected questions at the top if any are selected */}
            {selectedQuestions.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-blue-900">
                            Selected Questions ({selectedQuestions.length}/5)
                        </h4>
                    </div>
                    <div className="space-y-2">
                        {selectedQuestions.map((question, index) => (
                            <div
                                key={question.id}
                                className="flex items-start gap-3 bg-white border border-blue-200 rounded-lg p-3"
                            >
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center mt-0.5">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900">{question.question}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-500 capitalize">{question.category}</span>
                                        {question.required && (
                                            <span className="text-xs text-red-600">• Required</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveQuestion(String(question.id))}
                                    className="flex-shrink-0 text-red-600 hover:text-red-800 p-1"
                                    title="Remove question"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Category Filter and Search */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Category</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Search Questions ({selectedQuestionIds.length}/5 selected)
                    </label>
                    <div className="relative" ref={dropdownRef}>
                        <input
                            type="text"
                            placeholder="Type to search questions..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            disabled={selectedQuestionIds.length >= 5}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <svg
                            className="w-5 h-5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>

                        {/* Dropdown */}
                        {showDropdown && searchTerm && selectedQuestionIds.length < 5 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {filteredQuestions.length > 0 ? (
                                    <>
                                        {filteredQuestions.map((question) => {
                                            const questionIdStr = String(question.id);
                                            const isSelected = selectedQuestionIds.includes(questionIdStr);
                                            return (
                                                <button
                                                    key={question.id}
                                                    type="button"
                                                    onClick={() => !isSelected && handleAddQuestion(question.id)}
                                                    disabled={isSelected}
                                                    className={cn(
                                                        "w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0",
                                                        isSelected && "opacity-50 cursor-not-allowed bg-gray-50"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1 pr-2">
                                                            <div className="text-xs font-medium text-gray-900 line-clamp-2">{question.question}</div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-gray-500 capitalize">{question.category}</span>
                                                                {question.required && (
                                                                    <span className="text-xs text-red-600">• Required</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {isSelected && (
                                                            <span className="text-xs text-green-600 font-medium flex-shrink-0">Added</span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowNewQuestionForm(true);
                                                setShowDropdown(false);
                                            }}
                                            className="w-full px-3 py-2 text-left hover:bg-blue-50 bg-blue-50/50 border-t border-blue-200"
                                        >
                                            <div className="flex items-center gap-2 text-blue-700">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                <span className="text-xs font-medium">Create new question</span>
                                            </div>
                                        </button>
                                    </>
                                ) : (
                                    <div className="px-3 py-4">
                                        <div className="text-sm text-gray-500 text-center mb-3">
                                            No questions found
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowNewQuestionForm(true);
                                                setShowDropdown(false);
                                            }}
                                            className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium"
                                        >
                                            + Create New Question
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* New Question Form */}
            {showNewQuestionForm && (
                <div className="border border-blue-300 rounded-lg p-4 bg-blue-50">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">Create New Question</h4>
                        <button
                            type="button"
                            onClick={() => setShowNewQuestionForm(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Question Text</label>
                            <textarea
                                value={newQuestion.question}
                                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                                rows={3}
                                placeholder="Enter your screening question..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={newQuestion.category}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                >
                                    <option value="certification">Certification</option>
                                    <option value="experience">Experience</option>
                                    <option value="skills">Skills</option>
                                    <option value="availability">Availability</option>
                                    <option value="general">General</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Response Type</label>
                                <select
                                    value={newQuestion.required ? 'required' : 'optional'}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, required: e.target.value === 'required' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                >
                                    <option value="required">Required</option>
                                    <option value="optional">Optional</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="saveToBank"
                                checked={newQuestion.saveToBank}
                                onChange={(e) => setNewQuestion({ ...newQuestion, saveToBank: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="saveToBank" className="text-xs text-gray-700">
                                Save this question to the question bank for future use
                            </label>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={handleCreateNewQuestion}
                                disabled={isCreatingQuestion || loading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreatingQuestion ? 'Creating...' : 'Add Question'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowNewQuestionForm(false)}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {selectedQuestionIds.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-600">No screening questions added yet</p>
                    <p className="text-xs text-gray-500 mt-1">Search for questions or create a new one</p>
                </div>
            )}
        </div>
    );
}