import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';

interface JobApplication {
  id: string;
  position: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  stage: 'Application Review' | 'Screening' | 'Interview' | 'Reference Check' | 'Offer' | 'Rejected';
  certified: boolean;
  internal: boolean;
  yearsExperience: number;
  currentRole?: string;
  submittedAt: string;
  currentInterviewStage: number;
  completedInterviewStages: number;
  positionTitle?: string;
  positionReqId?: string;
  totalInterviewStages?: number;
  // Additional fields for detailed view
  startDateAvailability?: string;
  screeningAnswers?: Record<string, string>;
  resume?: string;
  coverLetter?: string;
  references?: Array<{
    name: string;
    email: string;
    phone?: string;
    relationship: string;
  }>;
  interviewAvailability?: Array<{
    date: string;
    timeSlots: string[];
  }>;
}

// Type for paginated API response
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface UseJobApplicationsReturn {
  applications: JobApplication[] | PaginatedResponse<JobApplication>;
  loading: boolean;
  error: string | null;
  fetchApplications: (positionId?: string) => Promise<void>;
  fetchApplicationsByPosition: (positionId: string) => Promise<JobApplication[]>;
  fetchApplicationById: (id: string) => Promise<JobApplication>;
  advanceStage: (applicationId: string) => Promise<JobApplication>;
  rejectApplication: (applicationId: string) => Promise<JobApplication>;
  filterByStage: (stage: JobApplication['stage']) => JobApplication[];
  filterByCertification: (certified: boolean) => JobApplication[];
  getApplicationStats: (positionId?: string) => Promise<any>;
}

export function useJobApplications(): UseJobApplicationsReturn {
  const [applications, setApplications] = useState<JobApplication[] | PaginatedResponse<JobApplication>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async (positionId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const params = positionId ? { position: positionId } : {};
      const response = await api.get('/hiring/applications/', { params });

      // api.ts interceptor automatically transforms snake_case to camelCase
      const applicationsData = Array.isArray(response.data)
        ? response.data
        : response.data?.results
          ? { ...response.data, results: response.data.results }
          : [];

      setApplications(applicationsData);
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch applications';
      setError(errorMessage);
      console.error('Error fetching applications:', err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch only if no data exists (manual fetch can be called)
  useEffect(() => {
    if (Array.isArray(applications) && applications.length === 0) {
      fetchApplications();
    }
  }, []);  // Only run once on mount

  const fetchApplicationsByPosition = useCallback(
    async (positionId: string): Promise<JobApplication[]> => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/hiring/positions/${positionId}/applicants/`);

        // api.ts interceptor automatically transforms snake_case to camelCase
        const applicationsData = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

        return applicationsData;
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch position applications';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchApplicationById = useCallback(
    async (id: string): Promise<JobApplication> => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/hiring/applications/${id}/`);
        return response.data;
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch application';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const advanceStage = useCallback(
    async (applicationId: string): Promise<JobApplication> => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.post(`/hiring/applications/${applicationId}/advance_stage/`);
        const updatedApplication = response.data;

        // Update applications array (handle both formats)
        setApplications(prev => {
          if (Array.isArray(prev)) {
            return prev.map(app => (app.id === applicationId ? updatedApplication : app));
          } else if (prev && 'results' in prev) {
            return {
              ...prev,
              results: prev.results.map(app => (app.id === applicationId ? updatedApplication : app))
            };
          }
          return prev;
        });

        return updatedApplication;
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to advance stage';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const rejectApplication = useCallback(
    async (applicationId: string): Promise<JobApplication> => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.post(`/hiring/applications/${applicationId}/reject/`);
        const rejectedApplication = response.data;

        // Update applications array (handle both formats)
        setApplications(prev => {
          if (Array.isArray(prev)) {
            return prev.map(app => (app.id === applicationId ? rejectedApplication : app));
          } else if (prev && 'results' in prev) {
            return {
              ...prev,
              results: prev.results.map(app => (app.id === applicationId ? rejectedApplication : app))
            };
          }
          return prev;
        });

        return rejectedApplication;
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to reject application';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const filterByStage = useCallback(
    (stage: JobApplication['stage']): JobApplication[] => {
      // Handle both array and paginated response
      const appsArray = Array.isArray(applications) 
        ? applications 
        : (applications && 'results' in applications ? applications.results : []);
      
      return appsArray.filter(app => app.stage === stage);
    },
    [applications]
  );

  const filterByCertification = useCallback(
    (certified: boolean): JobApplication[] => {
      // Handle both array and paginated response
      const appsArray = Array.isArray(applications) 
        ? applications 
        : (applications && 'results' in applications ? applications.results : []);
      
      return appsArray.filter(app => app.certified === certified);
    },
    [applications]
  );

  const getApplicationStats = useCallback(
    async (positionId?: string): Promise<any> => {
      try {
        const params = positionId ? { positionId } : {};
        const response = await api.get('/hiring/positions/stats/', { params });
        return response.data;
      } catch (err: any) {
        console.error('Error fetching application stats:', err);
        throw err;
      }
    },
    []
  );

  return {
    applications,
    loading,
    error,
    fetchApplications,
    fetchApplicationsByPosition,
    fetchApplicationById,
    advanceStage,
    rejectApplication,
    filterByStage,
    filterByCertification,
    getApplicationStats
  };
}