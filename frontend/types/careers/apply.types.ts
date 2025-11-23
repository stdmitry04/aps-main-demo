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

export interface ScreeningQuestion {
    id: string | number;
    question: string;
    category: 'certification' | 'experience' | 'skills' | 'availability' | 'general';
    required: boolean;
    createdAt?: string;
}