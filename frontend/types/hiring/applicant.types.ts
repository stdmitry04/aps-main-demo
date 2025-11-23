import { ApplicationStage } from './application-stage.types';

export interface ScreeningQuestion {
    id: string;
    question: string;
    category: 'experience' | 'certification' | 'availability' | 'skills' | 'general';
    required: boolean;
}

export interface Reference {
    name: string;
    email: string;
    phone?: string;
    relationship: string;
}

export interface InterviewAvailability {
    date: string;
    timeSlots: string[];
}

export interface JobApplication {
    positionReqId: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone?: string;
    startDateAvailability: string;
    screeningAnswers: Record<string, string>;
    references: Reference[];
    interviewAvailability: InterviewAvailability[];
    resumeFile: File | null;
    coverLetter?: string;
    submittedAt?: string;
}

export interface PublicPosition {
    id: number | string;
    reqId: string;
    title: string;
    department: string;
    worksite: string;
    fte: string;
    salaryRange: string;
    startDate: string;
    description: string;
    requirements: string;
    postingStartDate: string;
    postingEndDate: string;
    status: 'Open' | 'Closed' | 'Draft';
    screeningQuestions: (ScreeningQuestion | string | number)[];
}

export interface Applicant {
    id: string;
    name: string;
    email: string;
    phone: string;
    currentRole: string;
    experience: number;
    certified: boolean;
    internal: boolean;
    stage: ApplicationStage;
    appliedDate: string;
    positionTitle: string;
    positionReqId: string;
    positionId: string;
    position?: string; // Backend API compatibility - ID of the position
    currentInterviewStage: number;
    completedInterviewStages: number;
    totalInterviewStages: number;
    department: string;
    worksite: string;
    salary: string;
    fte: string;
    startDate: string;
}
