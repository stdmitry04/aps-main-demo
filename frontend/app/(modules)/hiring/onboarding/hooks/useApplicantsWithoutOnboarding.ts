/**
 * Custom hook for managing applicants without onboarding
 * Follows MVVMC pattern - this is the ViewModel/Controller layer
 */

import { useState, useCallback, useEffect } from 'react';
import { api, onboardingApi } from '@/lib/api';
import {
    ApplicantWithOnboardingStatus,
    SendOnboardingPayload,
    OnboardingCreationResult,
    ApplicantsWithoutOnboardingFilters,
    BulkOnboardingPayload,
    BulkOnboardingResult
} from '@/types/onboarding';

interface UseApplicantsWithoutOnboardingReturn {
    applicants: ApplicantWithOnboardingStatus[];
    filteredApplicants: ApplicantWithOnboardingStatus[];
    loading: boolean;
    error: string | null;
    filters: ApplicantsWithoutOnboardingFilters;
    stats: {
        total: number;
        withAcceptedOffer: number;
        pendingOffer: number;
        withoutOnboarding: number;
    };
    fetchApplicants: () => Promise<void>;
    sendOnboarding: (applicantId: string) => Promise<OnboardingCreationResult>;
    bulkSendOnboarding: (applicantIds: string[]) => Promise<BulkOnboardingResult>;
    setFilters: (filters: Partial<ApplicantsWithoutOnboardingFilters>) => void;
    clearFilters: () => void;
}

/**
 * Main hook for managing applicants without onboarding
 */
export function useApplicantsWithoutOnboarding(): UseApplicantsWithoutOnboardingReturn {
    const [applicants, setApplicants] = useState<ApplicantWithOnboardingStatus[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        withAcceptedOffer: 0,
        pendingOffer: 0,
        withoutOnboarding: 0
    });
    const [filters, setFiltersState] = useState<ApplicantsWithoutOnboardingFilters>({
        search: '',
        offerStatus: 'all',
        sortBy: 'offer_date',
        sortOrder: 'desc'
    });

    /**
     * Fetch all applicants awaiting onboarding from the backend
     */
    const fetchApplicants = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await onboardingApi.getApplicantsAwaitingOnboarding();

            setApplicants(response.data.applicants || []);
            setStats(response.data.stats || {
                total: 0,
                withAcceptedOffer: 0,
                pendingOffer: 0,
                withoutOnboarding: 0
            });
        } catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : 'Failed to fetch applicants';
            setError(errorMessage);
            console.error('Error fetching applicants:', err);
            setApplicants([]);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Send onboarding invitation to a single applicant
     */
    const sendOnboarding = useCallback(
        async (applicantId: string): Promise<OnboardingCreationResult> => {
            try {
                setLoading(true);
                setError(null);

                // Find the applicant
                const applicant = applicants.find(a => a.id === applicantId);
                if (!applicant) {
                    return {
                        success: false,
                        error: 'Applicant not found'
                    };
                }

                // Check if onboarding already exists
                if (applicant.hasOnboarding) {
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
                await fetchApplicants();

                return {
                    success: true,
                    candidateId: response.data.id,
                    message: `Onboarding sent successfully to ${applicant.applicantName}`
                };
            } catch (err: any) {
                const errorMessage = err.response?.data?.error
                    || err.message
                    || 'Failed to send onboarding';
                setError(errorMessage);
                return {
                    success: false,
                    error: errorMessage
                };
            } finally {
                setLoading(false);
            }
        },
        [applicants, fetchApplicants]
    );

    /**
     * Send onboarding invitations to multiple applicants
     */
    const bulkSendOnboarding = useCallback(
        async (applicantIds: string[]): Promise<BulkOnboardingResult> => {
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
        },
        [sendOnboarding]
    );

    /**
     * Update filters
     */
    const setFilters = useCallback((newFilters: Partial<ApplicantsWithoutOnboardingFilters>) => {
        setFiltersState(prev => ({ ...prev, ...newFilters }));
    }, []);

    /**
     * Clear all filters
     */
    const clearFilters = useCallback(() => {
        setFiltersState({
            search: '',
            offerStatus: 'all',
            sortBy: 'offer_date',
            sortOrder: 'desc'
        });
    }, []);

    /**
     * Apply filters and sorting to applicants
     */
    const filteredApplicants = useCallback(() => {
        let filtered = [...applicants];

        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(
                a =>
                    a.applicantName.toLowerCase().includes(searchLower) ||
                    a.applicantEmail.toLowerCase().includes(searchLower) ||
                    a.positionTitle.toLowerCase().includes(searchLower) ||
                    a.positionReqId.toLowerCase().includes(searchLower)
            );
        }

        // Apply offer status filter
        if (filters.offerStatus && filters.offerStatus !== 'all') {
            filtered = filtered.filter(a => a.offerStatus === filters.offerStatus);
        }

        // Apply sorting
        if (filters.sortBy) {
            filtered.sort((a, b) => {
                let aValue: any;
                let bValue: any;

                switch (filters.sortBy) {
                    case 'name':
                        aValue = a.applicantName;
                        bValue = b.applicantName;
                        break;
                    case 'position':
                        aValue = a.positionTitle;
                        bValue = b.positionTitle;
                        break;
                    case 'offer_date':
                        aValue = a.offerDate || '';
                        bValue = b.offerDate || '';
                        break;
                    case 'submitted_at':
                        aValue = a.submittedAt;
                        bValue = b.submittedAt;
                        break;
                    default:
                        return 0;
                }

                if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
                if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [applicants, filters])();

    // Initial fetch
    useEffect(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    return {
        applicants,
        filteredApplicants,
        loading,
        error,
        filters,
        stats,
        fetchApplicants,
        sendOnboarding,
        bulkSendOnboarding,
        setFilters,
        clearFilters
    };
}
