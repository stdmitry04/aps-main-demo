import { create } from 'zustand';
import { api, onboardingApi } from '@/lib/api';
import {
  OnboardingCandidate,
  ApplicantWithOnboardingStatus,
  SendOnboardingPayload,
  OnboardingCreationResult,
  ApplicantsWithoutOnboardingFilters,
  BulkOnboardingResult
} from '@/types/hiring/onboarding';

interface OnboardingState {
  // Candidates data
  candidates: OnboardingCandidate[];
  candidatesLoading: boolean;
  candidatesError: string | null;
  candidatesLastFetchTime: number | null;

  // Applicants without onboarding data
  applicantsWithoutOnboarding: ApplicantWithOnboardingStatus[];
  applicantsLoading: boolean;
  applicantsError: string | null;
  applicantsLastFetchTime: number | null;
  applicantsStats: {
    total: number;
    withAcceptedOffer: number;
    pendingOffer: number;
    withoutOnboarding: number;
  };

  // Actions
  fetchCandidates: () => Promise<void>;
  fetchApplicantsWithoutOnboarding: () => Promise<void>;
  sendOnboarding: (applicantId: string) => Promise<OnboardingCreationResult>;
  bulkSendOnboarding: (applicantIds: string[]) => Promise<BulkOnboardingResult>;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  // Initial state
  candidates: [],
  candidatesLoading: false,
  candidatesError: null,
  candidatesLastFetchTime: null,

  applicantsWithoutOnboarding: [],
  applicantsLoading: false,
  applicantsError: null,
  applicantsLastFetchTime: null,
  applicantsStats: {
    total: 0,
    withAcceptedOffer: 0,
    pendingOffer: 0,
    withoutOnboarding: 0
  },

  // Fetch candidates
  fetchCandidates: async () => {
    const { candidatesLastFetchTime } = get();
    const now = Date.now();

    // Smart caching - skip if fetched within last 5 seconds
    if (candidatesLastFetchTime && (now - candidatesLastFetchTime) < 5000) {
      console.log('⚡ Using cached onboarding candidates');
      return;
    }

    try {
      set({ candidatesLoading: true, candidatesError: null });
      const response = await onboardingApi.getCandidates();

      // Handle both paginated (results array) and direct array responses
      const candidateData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      set({
        candidates: candidateData,
        candidatesLoading: false,
        candidatesLastFetchTime: now
      });
      console.log('✅ Fetched onboarding candidates into store');
    } catch (error: any) {
      console.error('Failed to fetch onboarding candidates:', error);
      set({
        candidatesError: 'Failed to load onboarding candidates. Please try again.',
        candidatesLoading: false
      });
    }
  },

  // Fetch applicants without onboarding
  fetchApplicantsWithoutOnboarding: async () => {
    const { applicantsLastFetchTime } = get();
    const now = Date.now();

    // Smart caching - skip if fetched within last 5 seconds
    if (applicantsLastFetchTime && (now - applicantsLastFetchTime) < 5000) {
      console.log('⚡ Using cached applicants without onboarding');
      return;
    }

    try {
      set({ applicantsLoading: true, applicantsError: null });
      const response = await onboardingApi.getApplicantsAwaitingOnboarding();

      set({
        applicantsWithoutOnboarding: response.data.applicants || [],
        applicantsStats: response.data.stats || {
          total: 0,
          withAcceptedOffer: 0,
          pendingOffer: 0,
          withoutOnboarding: 0
        },
        applicantsLoading: false,
        applicantsLastFetchTime: now
      });
      console.log('✅ Fetched applicants without onboarding into store');
    } catch (error: any) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to fetch applicants';
      console.error('Error fetching applicants:', error);
      set({
        applicantsError: errorMessage,
        applicantsWithoutOnboarding: [],
        applicantsLoading: false
      });
    }
  },

  // Send onboarding to a single applicant
  sendOnboarding: async (applicantId: string): Promise<OnboardingCreationResult> => {
    const { applicantsWithoutOnboarding, fetchApplicantsWithoutOnboarding } = get();

    try {
      set({ applicantsLoading: true, applicantsError: null });

      // Find the applicant
      const applicant = applicantsWithoutOnboarding.find(a => a.id === applicantId);
      if (!applicant) {
        set({ applicantsLoading: false });
        return {
          success: false,
          error: 'Applicant not found'
        };
      }

      // Check if onboarding already exists
      if (applicant.hasOnboarding) {
        set({ applicantsLoading: false });
        return {
          success: false,
          error: 'Onboarding has already been sent to this applicant'
        };
      }

      // Prepare the payload
      const payload: SendOnboardingPayload = {
        name: applicant.applicantName,
        email: applicant.applicantEmail,
        position: applicant.positionTitle,
        offerDate: applicant.offerDate || new Date().toISOString().split('T')[0],
        startDate: applicant.startDate,
        jobApplication: applicant.jobApplicationId
      };

      // Create onboarding candidate
      const response = await api.post('/onboarding/candidates/', payload);

      // Refresh the applicants list
      await fetchApplicantsWithoutOnboarding();

      set({ applicantsLoading: false });
      return {
        success: true,
        candidateId: response.data.id,
        message: `Onboarding sent successfully to ${applicant.applicantName}`
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error
        || error.message
        || 'Failed to send onboarding';
      set({
        applicantsError: errorMessage,
        applicantsLoading: false
      });
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Send onboarding to multiple applicants
  bulkSendOnboarding: async (applicantIds: string[]): Promise<BulkOnboardingResult> => {
    const { sendOnboarding } = get();

    const results: BulkOnboardingResult = {
      successCount: 0,
      failedCount: 0,
      results: []
    };

    for (const applicantId of applicantIds) {
      const result = await sendOnboarding(applicantId);
      results.results.push({
        applicantId: applicantId,
        success: result.success,
        candidateId: result.candidateId,
        error: result.error
      });

      if (result.success) {
        results.successCount++;
      } else {
        results.failedCount++;
      }
    }

    return results;
  }
}));
