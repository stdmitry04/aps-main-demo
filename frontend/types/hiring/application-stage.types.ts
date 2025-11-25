/**
 * Application Stage Types
 * 
 * Defines the stage progression for job applications
 * Matches backend STAGE_CHOICES in JobApplication model
 */

export type ApplicationStage =
    | 'Application Review'
    | 'Screening'
    | 'Interview'
    | 'Reference Check'
    | 'Offer'
    | 'Offer Accepted'
    | 'Rejected'
    | 'Onboarding';

export const STAGE_ORDER: ApplicationStage[] = [
    'Application Review',
    'Screening',
    'Interview',
    'Reference Check',
    'Offer',
    'Offer Accepted',
    'Onboarding'
];

export interface StageAction {
    stage: ApplicationStage;
    label: string;
    action: 'accept' | 'screen' | 'schedule_interview' | 'reference_check' | 'send_offer' | 'send_onboarding' | 'onboarding_complete';
    icon: string;
    color: 'blue' | 'green' | 'purple' | 'yellow' | 'orange' | 'teal' | 'indigo';
    nextStage?: ApplicationStage;
}

export const STAGE_ACTIONS: Record<ApplicationStage, StageAction> = {
    'Application Review': {
        stage: 'Application Review',
        label: 'Accept Application',
        action: 'accept',
        icon: 'check-circle',
        color: 'blue',
        nextStage: 'Screening',
    },
    'Screening': {
        stage: 'Screening',
        label: 'Screen Applicant',
        action: 'screen',
        icon: 'clipboard-check',
        color: 'green',
        nextStage: 'Interview',
    },
    'Interview': {
        stage: 'Interview',
        label: 'Schedule Interview',
        action: 'schedule_interview',
        icon: 'calendar',
        color: 'purple',
        nextStage: 'Offer',
    },
    'Reference Check': {
        stage: 'Reference Check',
        label: 'Reference Check',
        action: 'reference_check',
        icon: 'user-check',
        color: 'yellow',
        nextStage: 'Offer',
    },
    'Offer': {
        stage: 'Offer',
        label: 'Send Offer',
        action: 'send_offer',
        icon: 'mail',
        color: 'orange',
        nextStage: 'Offer Accepted',
    },
    'Offer Accepted': {
        stage: 'Offer Accepted',
        label: 'Send Onboarding',
        action: 'send_onboarding',
        icon: 'clipboard-list',
        color: 'teal',
    },
    'Rejected': {
        stage: 'Rejected',
        label: 'Rejected',
        action: 'accept', // Not used
        icon: 'x-circle',
        color: 'blue',
    },
    'Onboarding': {
        stage: 'Onboarding',
        label: 'Onboarding',
        action: 'onboarding_complete', // Not used
        icon: 'x-circle',
        color: 'blue',
    }
};

export interface Application {
    id: string;
    position: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone?: string;
    startDateAvailability: string;
    screeningAnswers: Record<string, string>;
    resume: string;
    coverLetter?: string;
    stage: ApplicationStage;
    currentRole?: string;
    yearsExperience?: number;
    certified: boolean;
    internal: boolean;
    completedInterviewStages: number;
    submittedAt: string;
    createdAt: string;
    updatedAt: string;
    positionTitle?: string;
    positionReqId?: string;
    totalInterviewStages?: number;
    references?: Array<{
        id: string;
        name: string;
        email: string;
        phone?: string;
        relationship: string;
    }>;
    interviewAvailability?: Array<{
        id: string;
        date: string;
        timeSlots: string[];
    }>;
}

export interface ApplicationsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Application[];
}
