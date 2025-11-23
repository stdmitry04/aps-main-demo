/**
 * useApplications Hook
 * 
 * Main hook for managing job application state across the hiring dashboard
 * This hook provides centralized state management for applications, supporting:
 * - Fetching applications with pagination
 * - Stage progression management
 * - Filtering and searching
 * - Real-time updates across components
 * 
 * MVVMC Architecture:
 * - Model: Application types from types/hiring/application-stage.types.ts
 * - View: Components that consume this hook
 * - Model-View: This hook (bridges model and view)
 * - Controller: hiringApi from lib/api.ts
 */

import { useState, useCallback, useEffect } from 'react';
import { hiringApi } from '@/lib/api';
import {
    Application,
    ApplicationsResponse,
    ApplicationStage,
    STAGE_ORDER
} from '@/types/hiring/application-stage.types';

interface UseApplicationsOptions {
    autoFetch?: boolean;
    positionId?: string;
    stage?: ApplicationStage;
}

interface UseApplicationsReturn {
    // State
    applications: Application[];
    loading: boolean;
    error: string | null;
    pagination: {
        count: number;
        next: string | null;
        previous: string | null;
    } | null;

    // Actions
    fetchApplications: (filters?: ApplicationFilters) => Promise<void>;
    fetchApplicationById: (id: string) => Promise<Application>;
    advanceApplicationStage: (id: string) => Promise<void>;
    rejectApplication: (id: string) => Promise<void>;
    refreshApplications: () => Promise<void>;

    // Filters & Search
    filterByStage: (stage: ApplicationStage | 'all') => Application[];
    filterByPosition: (positionId: string | 'all') => Application[];
    searchApplications: (query: string) => Application[];

    // Stats
    getStageCount: (stage: ApplicationStage) => number;
    getTotalCount: () => number;
    getNextStage: (currentStage: ApplicationStage) => ApplicationStage | null;
    canAdvanceStage: (application: Application) => boolean;
}

interface ApplicationFilters {
    stage?: ApplicationStage;
    position?: string;
    certified?: boolean;
    internal?: boolean;
    search?: string;
}

export function useApplications(options: UseApplicationsOptions = {}): UseApplicationsReturn {
    const { autoFetch = true, positionId, stage } = options;

    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<{
        count: number;
        next: string | null;
        previous: string | null;
    } | null>(null);
    const [currentFilters, setCurrentFilters] = useState<ApplicationFilters>({
        position: positionId,
        stage,
    });

    /**
     * Fetch applications from the API
     */
    const fetchApplications = useCallback(async (filters?: ApplicationFilters) => {
        try {
            setLoading(true);
            setError(null);

            const mergedFilters = { ...currentFilters, ...filters };
            setCurrentFilters(mergedFilters);

            const response = await hiringApi.getApplications();

            // Handle paginated response
            if (response.data && 'results' in response.data) {
                const paginatedData = response.data as ApplicationsResponse;
                setApplications(paginatedData.results);
                setPagination({
                    count: paginatedData.count,
                    next: paginatedData.next,
                    previous: paginatedData.previous,
                });
            } else if (Array.isArray(response.data)) {
                // Handle direct array response
                setApplications(response.data);
                setPagination(null);
            } else {
                setApplications([]);
                setPagination(null);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch applications';
            setError(errorMessage);
            console.error('Error fetching applications:', err);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    }, [currentFilters]);

    /**
     * Fetch a single application by ID
     */
    const fetchApplicationById = useCallback(async (id: string): Promise<Application> => {
        try {
            setLoading(true);
            setError(null);
            const response = await hiringApi.getApplicationById(id);
            return response.data as Application;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch application';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Advance application to the next stage
     */
    const advanceApplicationStage = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await hiringApi.advanceApplicationStage(id);
            const updatedApplication = response.data as Application;

            // Update local state
            setApplications(prev =>
                prev.map(app => app.id === id ? updatedApplication : app)
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to advance application stage';
            setError(errorMessage);
            console.error('Error advancing application stage:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Reject an application
     */
    const rejectApplication = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await hiringApi.rejectApplication(id);
            const rejectedApplication = response.data as Application;

            // Update local state
            setApplications(prev =>
                prev.map(app => app.id === id ? rejectedApplication : app)
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to reject application';
            setError(errorMessage);
            console.error('Error rejecting application:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Refresh applications (re-fetch with current filters)
     */
    const refreshApplications = useCallback(async () => {
        await fetchApplications(currentFilters);
    }, [fetchApplications, currentFilters]);

    /**
     * Filter applications by stage
     */
    const filterByStage = useCallback((stage: ApplicationStage | 'all'): Application[] => {
        if (stage === 'all') return applications;
        return applications.filter(app => app.stage === stage);
    }, [applications]);

    /**
     * Filter applications by position
     */
    const filterByPosition = useCallback((positionId: string | 'all'): Application[] => {
        if (positionId === 'all') return applications;
        return applications.filter(app => app.position === positionId);
    }, [applications]);

    /**
     * Search applications by applicant name or email
     */
    const searchApplications = useCallback((query: string): Application[] => {
        if (!query.trim()) return applications;

        const lowerQuery = query.toLowerCase();
        return applications.filter(app =>
            app.applicantName.toLowerCase().includes(lowerQuery) ||
            app.applicantEmail.toLowerCase().includes(lowerQuery) ||
            (app.currentRole && app.currentRole.toLowerCase().includes(lowerQuery))
        );
    }, [applications]);

    /**
     * Get count of applications in a specific stage
     */
    const getStageCount = useCallback((stage: ApplicationStage): number => {
        return applications.filter(app => app.stage === stage).length;
    }, [applications]);

    /**
     * Get total count of applications
     */
    const getTotalCount = useCallback((): number => {
        return pagination?.count || applications.length;
    }, [pagination, applications]);

    /**
     * Get the next stage for a given stage
     */
    const getNextStage = useCallback((currentStage: ApplicationStage): ApplicationStage | null => {
        const currentIndex = STAGE_ORDER.indexOf(currentStage);
        if (currentIndex === -1 || currentIndex === STAGE_ORDER.length - 1) {
            return null;
        }
        return STAGE_ORDER[currentIndex + 1];
    }, []);

    /**
     * Check if an application can advance to the next stage
     */
    const canAdvanceStage = useCallback((application: Application): boolean => {
        // Can't advance if already at final stage or rejected
        if (application.stage === 'Offer Accepted' || application.stage === 'Rejected') {
            return false;
        }

        // Check if interviews are required and completed
        if (application.stage === 'Interview') {
            const totalStages = application.totalInterviewStages || 0;
            const completedStages = application.completedInterviewStages || 0;
            return completedStages >= totalStages && totalStages > 0;
        }

        return true;
    }, []);

    // Auto-fetch on mount if enabled
    useEffect(() => {
        if (autoFetch) {
            fetchApplications();
        }
    }, [autoFetch]); // Only run on mount

    return {
        // State
        applications,
        loading,
        error,
        pagination,

        // Actions
        fetchApplications,
        fetchApplicationById,
        advanceApplicationStage,
        rejectApplication,
        refreshApplications,

        // Filters & Search
        filterByStage,
        filterByPosition,
        searchApplications,

        // Stats
        getStageCount,
        getTotalCount,
        getNextStage,
        canAdvanceStage,
    };
}
