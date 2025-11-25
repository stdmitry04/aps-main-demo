import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Interview {
  id: string;
  application: string;
  stage: string;
  scheduledDate: string;
  scheduledTime: string;
  location: string;
  zoomLink?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
  notes?: string;
  feedback?: string;
  rating?: number;
  // Read-only fields from serializer (camelCase from interceptor)
  candidateName: string;
  candidateEmail: string;
  positionTitle: string;
  positionReqId: string;
  stageName: string;
  stageNumber: number;
  interviewers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
  }>;
  worksite: string;
  createdAt: string;
  updatedAt: string;
}

interface InterviewScheduleData {
  application: string;
  stage: string;
  scheduledDate: string;
  scheduledTime: string;
  location: string;
}

interface InterviewFilters {
  searchTerm: string;
  statusFilter: string;
  dateFilter: string;
  districtFilter: string;
  positionFilter: string;
}

interface InterviewsState {
  // Data State
  interviews: Interview[];
  loading: boolean;
  error: string | null;

  // Filters
  filters: InterviewFilters;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: string) => void;
  setDateFilter: (date: string) => void;
  setDistrictFilter: (district: string) => void;
  setPositionFilter: (position: string) => void;
  clearFilters: () => void;

  // Computed/Derived State
  filteredInterviews: Interview[];

  // Modal State
  selectedInterview: Interview | null;
  showDetailsModal: boolean;
  setSelectedInterview: (interview: Interview | null) => void;
  setShowDetailsModal: (show: boolean) => void;

  // Actions
  viewInterviewDetails: (interview: Interview) => void;
  closeDetailsModal: () => void;

  // API Actions
  fetchInterviews: () => Promise<void>;
  fetchUpcomingInterviews: (days?: number) => Promise<Interview[]>;
  fetchInterviewsByDateRange: (startDate: string, endDate: string) => Promise<Interview[]>;
  scheduleInterview: (data: InterviewScheduleData) => Promise<Interview>;
  markInterviewCompleted: (interviewId: string, feedback?: string, rating?: number) => Promise<Interview>;
  cancelInterview: (interviewId: string) => Promise<Interview>;
  updateInterview: (interviewId: string, data: Partial<Interview>) => Promise<Interview>;
  deleteInterview: (interviewId: string) => Promise<void>;
  getInterviewStats: () => Promise<any>;
  filterByStatus: (status: Interview['status']) => Interview[];
  getInterviewsByDate: (date: string) => Interview[];
}

const initialFilters: InterviewFilters = {
  searchTerm: '',
  statusFilter: 'All',
  dateFilter: 'All',
  districtFilter: 'All',
  positionFilter: 'All',
};

export const useInterviewsStore = create<InterviewsState>((set, get) => ({
  // Initial state
  interviews: [],
  loading: false,
  error: null,
  filters: initialFilters,
  selectedInterview: null,
  showDetailsModal: false,

  // Filter actions
  setSearchTerm: (term) => set((state) => ({
    filters: { ...state.filters, searchTerm: term }
  })),

  setStatusFilter: (status) => set((state) => ({
    filters: { ...state.filters, statusFilter: status }
  })),

  setDateFilter: (date) => set((state) => ({
    filters: { ...state.filters, dateFilter: date }
  })),

  setDistrictFilter: (district) => set((state) => ({
    filters: { ...state.filters, districtFilter: district }
  })),

  setPositionFilter: (position) => set((state) => ({
    filters: { ...state.filters, positionFilter: position }
  })),

  clearFilters: () => set({ filters: initialFilters }),

  // Computed/Derived State
  get filteredInterviews(): Interview[] {
    const { interviews, filters } = get();
    return interviews.filter(interview => {
      const matchesSearch =
        interview.candidateName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        interview.positionTitle.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        interview.candidateEmail.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesStatus = filters.statusFilter === 'All' || interview.status === filters.statusFilter;
      const matchesDistrict = filters.districtFilter === 'All' || interview.worksite === filters.districtFilter;
      const matchesPosition = filters.positionFilter === 'All' || interview.positionTitle === filters.positionFilter;

      // Date filtering
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const interviewDate = new Date(interview.scheduledDate);
      interviewDate.setHours(0, 0, 0, 0);

      let matchesDate = true;
      if (filters.dateFilter === 'Today') {
        matchesDate = interviewDate.getTime() === today.getTime();
      } else if (filters.dateFilter === 'This Week') {
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        matchesDate = interviewDate >= today && interviewDate <= weekFromNow;
      } else if (filters.dateFilter === 'This Month') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        matchesDate = interviewDate >= startOfMonth && interviewDate <= endOfMonth;
      } else if (filters.dateFilter === 'Past') {
        matchesDate = interviewDate < today;
      } else if (filters.dateFilter === 'Upcoming') {
        matchesDate = interviewDate >= today;
      }

      return matchesSearch && matchesStatus && matchesDate && matchesDistrict && matchesPosition;
    });
  },

  // Modal state actions
  setSelectedInterview: (interview) => set({ selectedInterview: interview }),
  setShowDetailsModal: (show) => set({ showDetailsModal: show }),

  // Combined actions
  viewInterviewDetails: (interview) => set({
    selectedInterview: interview,
    showDetailsModal: true
  }),

  closeDetailsModal: () => set({
    selectedInterview: null,
    showDetailsModal: false
  }),

  // API Actions
  fetchInterviews: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/hiring/interviews/');
      set({ interviews: Array.isArray(response.data) ? response.data : [] });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch interviews';
      set({ error: errorMessage, interviews: [] });
      console.error('Error fetching interviews:', err);
    } finally {
      set({ loading: false });
    }
  },

  fetchUpcomingInterviews: async (days: number = 30): Promise<Interview[]> => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/hiring/interviews/upcoming/', {
        params: { days }
      });
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch upcoming interviews';
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchInterviewsByDateRange: async (startDate: string, endDate: string): Promise<Interview[]> => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/hiring/interviews/by_date_range/', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch interviews by date range';
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  scheduleInterview: async (data: InterviewScheduleData): Promise<Interview> => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/hiring/interviews/schedule/', data);
      const newInterview = response.data;
      set((state) => ({
        interviews: Array.isArray(state.interviews) ? [...state.interviews, newInterview] : [newInterview]
      }));
      return newInterview;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule interview';
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  markInterviewCompleted: async (interviewId: string, feedback?: string, rating?: number): Promise<Interview> => {
    try {
      set({ loading: true, error: null });
      const data: any = {};
      if (feedback) data.feedback = feedback;
      if (rating) data.rating = rating;

      const response = await api.post(`/hiring/interviews/${interviewId}/mark_completed/`, data);
      const updatedInterview = response.data;
      set((state) => ({
        interviews: Array.isArray(state.interviews)
          ? state.interviews.map(int => (int.id === interviewId ? updatedInterview : int))
          : [updatedInterview]
      }));
      return updatedInterview;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark interview completed';
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  cancelInterview: async (interviewId: string): Promise<Interview> => {
    try {
      set({ loading: true, error: null });
      const response = await api.patch(`/hiring/interviews/${interviewId}/`, {
        status: 'Cancelled'
      });
      const updatedInterview = response.data;
      set((state) => ({
        interviews: Array.isArray(state.interviews)
          ? state.interviews.map(int => (int.id === interviewId ? updatedInterview : int))
          : [updatedInterview]
      }));
      return updatedInterview;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel interview';
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateInterview: async (interviewId: string, data: Partial<Interview>): Promise<Interview> => {
    try {
      set({ loading: true, error: null });
      const response = await api.patch(`/hiring/interviews/${interviewId}/`, data);
      const updatedInterview = response.data;
      set((state) => ({
        interviews: Array.isArray(state.interviews)
          ? state.interviews.map(int => (int.id === interviewId ? updatedInterview : int))
          : [updatedInterview]
      }));
      return updatedInterview;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update interview';
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  deleteInterview: async (interviewId: string) => {
    try {
      set({ loading: true, error: null });
      await api.delete(`/hiring/interviews/${interviewId}/`);
      set((state) => ({
        interviews: Array.isArray(state.interviews)
          ? state.interviews.filter(int => int.id !== interviewId)
          : []
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete interview';
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  getInterviewStats: async () => {
    try {
      const response = await api.get('/hiring/interviews/stats/');
      return response.data;
    } catch (err) {
      console.error('Error fetching interview stats:', err);
      throw err;
    }
  },

  filterByStatus: (status: Interview['status']): Interview[] => {
    return get().interviews.filter(int => int.status === status);
  },

  getInterviewsByDate: (date: string): Interview[] => {
    return get().interviews.filter(int => int.scheduledDate === date);
  },
}));
