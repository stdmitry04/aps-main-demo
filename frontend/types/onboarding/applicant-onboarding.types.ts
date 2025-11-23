/**
 * Types for applicants and their onboarding status
 */

export interface ApplicantWithOnboardingStatus {
    id: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone?: string;
    positionTitle: string;
    positionReqId: string;
    stage: 'Application Review' | 'Screening' | 'Interview' | 'Reference Check' | 'Offer' | 'Rejected';
    submittedAt: string;
    offerDate?: string;
    offerStatus?: 'Pending' | 'Accepted' | 'Declined' | 'Expired' | 'Withdrawn';
    startDate?: string;
    hasOnboarding: boolean;
    onboardingId?: string;
    onboardingStatus?: 'not_started' | 'in_progress' | 'completed' | 'submitted';
    onboardingProgress?: number; // 0-8
    jobApplicationId: string;
}

export interface SendOnboardingPayload {
    name: string;
    email: string;
    position: string;
    offerDate: string;
    startDate?: string;
    jobApplication: string;
}

export interface OnboardingCreationResult {
    success: boolean;
    candidateId?: string;
    error?: string;
    message?: string;
}

export interface ApplicantsWithoutOnboardingFilters {
    search?: string;
    position?: string;
    offerStatus?: 'Pending' | 'Accepted' | 'all';
    sortBy?: 'name' | 'position' | 'offer_date' | 'submitted_at';
    sortOrder?: 'asc' | 'desc';
}

export interface BulkOnboardingPayload {
    applicantIds: string[];
}

export interface BulkOnboardingResult {
    successCount: number;
    failedCount: number;
    results: {
        applicantId: string;
        success: boolean;
        candidateId?: string;
        error?: string;
    }[];
}
