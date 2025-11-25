import { create } from 'zustand';
import { api } from '@/lib/api';

const mapApplicationData = (data: any): JobApplication => ({
  id: data.id,
  position: data.position, // shared ID
  applicantName: data.applicant_name, // snake -> camel
  applicantEmail: data.applicant_email,
  applicantPhone: data.applicant_phone,
  stage: data.stage,
  certified: data.certified,
  internal: data.internal,
  yearsExperience: data.years_experience,
  currentRole: data.current_role,
  submittedAt: data.submitted_at,
  completedInterviewStages: data.completed_interview_stages || 0,
  totalInterviewStages: data.total_interview_stages || 0,
  startDateAvailability: data.start_date_availability,
  positionTitle: data.position_title,
  positionReqId: data.position_req_id,
  // Pass through others or map as needed
  interviewAvailability: data.interview_availability,
  currentInterviewStage: (data.completed_interview_stages || 0) + 1,
});

export interface JobApplication {
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

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface ApplicationsState {
  applications: JobApplication[] | PaginatedResponse<JobApplication>;
  loading: boolean;
  error: string | null;
  lastFetchTime: number | null;

  // Actions
  fetchApplications: (positionId?: string, forceRefresh?: boolean) => Promise<void>;
  fetchApplicationById: (id: string) => Promise<JobApplication>;
  advanceStage: (applicationId: string) => Promise<JobApplication>;
  rejectApplication: (applicationId: string) => Promise<JobApplication>;
  setApplications: (applications: JobApplication[] | PaginatedResponse<JobApplication>) => void;
}

export const useApplicationsStore = create<ApplicationsState>((set, get) => ({
  applications: [],
  loading: false,
  error: null,
  lastFetchTime: null,

  setApplications: (applications) => set({ applications }),

  fetchApplications: async (positionId?: string, forceRefresh: boolean = false) => {
    // Don't re-fetch if we recently fetched (within 5 seconds) unless force refresh
    const { lastFetchTime } = get();
    const now = Date.now();
    if (!forceRefresh && lastFetchTime && (now - lastFetchTime) < 5000) {
      console.log('⚡ Using cached applications (fetched recently)');
      return;
    }

    try {
      set({ loading: true, error: null });
      const params = positionId ? { position: positionId } : {};
      const response = await api.get('/hiring/applications/', { params });

      const applicationsData = Array.isArray(response.data)
        ? response.data
        : response.data?.results
          ? { ...response.data, results: response.data.results }
          : [];

      set({
        applications: applicationsData,
        lastFetchTime: Date.now()
      });
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch applications';
      set({ error: errorMessage, applications: [] });
      console.error('Error fetching applications:', err);
    } finally {
      set({ loading: false });
    }
  },

  fetchApplicationById: async (id: string): Promise<JobApplication> => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/hiring/applications/${id}/`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch application';
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  advanceStage: async (applicationId: string): Promise<JobApplication> => {
    try {
      set({ loading: true, error: null });
      const response = await api.post(`/hiring/applications/${applicationId}/advance_stage/`);
      const updatedApplication = response.data;

      set((state) => ({
        applications: Array.isArray(state.applications)
          ? state.applications.map(app => (app.id === applicationId ? updatedApplication : app))
          : 'results' in state.applications
            ? {
                ...state.applications,
                results: state.applications.results.map(app => (app.id === applicationId ? updatedApplication : app))
              }
            : state.applications
      }));

      return updatedApplication;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to advance stage';
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  rejectApplication: async (applicationId: string): Promise<JobApplication> => {
    try {
      set({ loading: true, error: null });
      const response = await api.post(`/hiring/applications/${applicationId}/reject/`);
      const rejectedApplication = response.data;

      set((state) => ({
        applications: Array.isArray(state.applications)
          ? state.applications.map(app => (app.id === applicationId ? rejectedApplication : app))
          : 'results' in state.applications
            ? {
                ...state.applications,
                results: state.applications.results.map(app => (app.id === applicationId ? rejectedApplication : app))
              }
            : state.applications
      }));

      return rejectedApplication;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject application';
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));
