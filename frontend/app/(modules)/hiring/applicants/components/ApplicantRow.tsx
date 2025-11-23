import React from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Applicant } from "@/types/";
import { ApplicationStageButton } from "@/components/hiring";
import { hiringApi } from "@/lib/api";
import { STAGE_ORDER } from "@/types/hiring/application-stage.types";

interface ApplicantRowProps {
    applicant: Applicant;
    selected: boolean;
    onSelect: (id: string) => void;
    onScheduleInterview: (applicant: Applicant) => void;
    onSendOffer: (applicant: Applicant) => void;
    onViewProfile: (applicant: Applicant) => void;
    onRefresh?: () => void | Promise<void>;
}

export function ApplicantRow({
    applicant,
    selected,
    onSelect,
    onScheduleInterview,
    onSendOffer,
    onViewProfile,
    onRefresh
}: ApplicantRowProps) {
    const [isDemoLoading, setIsDemoLoading] = React.useState(false);
    const [showDemoDropdown, setShowDemoDropdown] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDemoDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    // Can send offer if all interview stages are completed
    const canSendOffer = applicant.totalInterviewStages > 0 && applicant.completedInterviewStages >= applicant.totalInterviewStages;

    // Can schedule interview if not all stages are completed
    const canScheduleInterview = applicant.totalInterviewStages > 0 && applicant.completedInterviewStages < applicant.totalInterviewStages;

    const handleDemoSetStage = async (stage: string) => {
        setIsDemoLoading(true);
        try {
            await hiringApi.demoSetApplicationStage(applicant.id, stage);
            setShowDemoDropdown(false);
            if (onRefresh) {
                await onRefresh();
            }
        } catch (error) {
            console.error('Error setting stage:', error);
            alert('Failed to set stage. Please try again.');
        } finally {
            setIsDemoLoading(false);
        }
    };

    const getStageVariant = (stage: Applicant['stage']) => {
        switch (stage) {
            case 'Application Review': return 'gray';
            case 'Screening': return 'yellow';
            case 'Interview': return 'blue';
            case 'Reference Check': return 'blue';
            case 'Offer': return 'green';
            default: return 'gray';
        }
    };

    // Convert Applicant to Application format for the button
    const applicationForButton = {
        id: applicant.id,
        position: applicant.positionId || applicant.position || '',
        applicantName: applicant.name,
        applicantEmail: applicant.email,
        applicantPhone: applicant.phone,
        startDateAvailability: applicant.startDate,
        screeningAnswers: {},
        resume: '',
        stage: applicant.stage,
        currentRole: applicant.currentRole,
        yearsExperience: applicant.experience,
        certified: applicant.certified,
        internal: applicant.internal,
        currentInterviewStage: applicant.currentInterviewStage,
        completedInterviewStages: applicant.completedInterviewStages,
        submittedAt: applicant.appliedDate,
        createdAt: applicant.appliedDate,
        updatedAt: applicant.appliedDate,
        positionTitle: applicant.positionTitle,
        positionReqId: applicant.positionReqId,
        totalInterviewStages: applicant.totalInterviewStages,
    };

    return (
        <div className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={selected}
                        onChange={() => onSelect(applicant.id)}
                    />

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-medium text-gray-900">{applicant.name}</h4>
                            <Badge variant={applicant.certified ? "green" : "yellow"}>
                                {applicant.certified ? "Certified" : "Pending License"}
                            </Badge>
                            {applicant.internal && <Badge variant="blue">Internal</Badge>}
                        </div>
                        <p className="text-sm text-gray-600">
                            {applicant.currentRole} • {applicant.experience} years experience
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {applicant.positionTitle} • {applicant.positionReqId}
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-center min-w-[140px]">
                            <div className="text-xs text-gray-500 mb-1">Stage</div>
                            <Badge variant={getStageVariant(applicant.stage)}>
                                {applicant.stage}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                                Interviews: {applicant.completedInterviewStages}/{applicant.totalInterviewStages}
                            </div>
                        </div>

                        <div className="text-center min-w-[100px]">
                            <div className="text-xs text-gray-500 mb-1">Applied</div>
                            <div className="text-sm font-medium text-gray-700">{applicant.appliedDate}</div>
                        </div>

                        <div className="flex flex-col gap-2 min-w-[160px]">
                            <ApplicationStageButton
                                application={applicationForButton}
                                onScheduleInterview={() => onScheduleInterview(applicant)}
                                onSendOffer={() => onSendOffer(applicant)}
                                onSendOnboarding={() => {
                                    // Navigate to onboarding or show onboarding modal
                                    console.log('Send onboarding for', applicant.name);
                                }}
                                onRefresh={onRefresh}
                                className="text-xs py-1.5"
                            />

                            {/* Demo Only Stage Selector */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowDemoDropdown(!showDemoDropdown)}
                                    disabled={isDemoLoading}
                                    className="w-full px-2 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 disabled:opacity-50"
                                    title="Demo only: Force set stage"
                                >
                                    {isDemoLoading ? 'Loading...' : '🔧 Demo: Set Stage'}
                                </button>

                                {showDemoDropdown && (
                                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                        <div className="px-2 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                                            Demo: Select Stage
                                        </div>
                                        {STAGE_ORDER.map((stage) => (
                                            <button
                                                key={stage}
                                                onClick={() => handleDemoSetStage(stage)}
                                                disabled={isDemoLoading}
                                                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${applicant.stage === stage ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                                    }`}
                                            >
                                                {stage}
                                                {applicant.stage === stage && (
                                                    <span className="ml-2 text-blue-500">✓ Current</span>
                                                )}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => handleDemoSetStage('Rejected')}
                                            disabled={isDemoLoading}
                                            className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors border-t ${applicant.stage === 'Rejected' ? 'bg-red-50 text-red-700 font-medium' : 'text-gray-700'
                                                }`}
                                        >
                                            Rejected
                                            {applicant.stage === 'Rejected' && (
                                                <span className="ml-2 text-red-500">✓ Current</span>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button variant="ghost" onClick={() => onViewProfile(applicant)}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
