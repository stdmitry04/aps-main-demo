import { create } from 'zustand';
import { useEffect } from 'react';
import { api } from '@/lib/api';
import {
  InterviewAPI,
  PaginatedInterviewResponse
} from '../dto/interview.dto';

interface InterviewScheduleData {
  application_id: string;
  stage_id: string;
  scheduled_date: string;
  scheduled_time: string;
  location: string;
}

interface InterviewStats {
  total_interviews: number;
  scheduled: number;
  completed: number;
  upcoming_this_week: number;
  today: number;
}

interface InterviewFilters {
  searchTerm: string;
  statusFilter: string;
  dateFilter: string;
  districtFilter: string;
  positionFilter: string;
}

interface InterviewStore {
  // State
  interviews: InterviewAPI[];
  loading: boolean;
  error: string | null;
  filters: InterviewFilters;
  selectedInterview: InterviewAPI | null;
  showDetailsModal: boolean;

  // Computed values
  filteredInterviews: InterviewAPI[];
  districts: string[];
  positions: string[];
  stats: {
    scheduled: number;
    completed: number;
    upcoming: number;
  };

  // Actions - Data fetching
  fetchInterviews: () => Promise<void>;
  fetchUpcomingInterviews: (days?: number) => Promise<InterviewAPI[]>;
  fetchInterviewsByDateRange: (startDate: string, endDate: string) => Promise<InterviewAPI[]>;
  getInterviewStats: () => Promise<InterviewStats>;

  // Actions - CRUD operations
  scheduleInterview: (data: InterviewScheduleData) => Promise<InterviewAPI>;
  updateInterview: (interviewId: string, data: Partial<InterviewAPI>) => Promise<InterviewAPI>;
  markInterviewCompleted: (interviewId: string, feedback?: string, rating?: number) => Promise<InterviewAPI>;
  cancelInterview: (interviewId: string) => Promise<InterviewAPI>;
  deleteInterview: (interviewId: string) => Promise<void>;

  // Actions - UI state
  setFilter: (filterName: keyof InterviewFilters, value: string) => void;
  clearFilters: () => void;
  setSelectedInterview: (interview: InterviewAPI | null) => void;
  setShowDetailsModal: (show: boolean) => void;

  // Helper actions
  filterByStatus: (status: InterviewAPI['status']) => InterviewAPI[];
  getInterviewsByDate: (date: string) => InterviewAPI[];
}

const initialFilters: InterviewFilters = {
  searchTerm: '',
  statusFilter: 'All',
  dateFilter: 'All',
  districtFilter: 'All',
  positionFilter: 'All',
};

export const  useInterviewStore = create<InterviewStore>((set, get) => ({
  // Initial state
  interviews: [],
  loading: false,
  error: null,
  filters: initialFilters,
  selectedInterview: null,
  showDetailsModal: false,

  // Computed values - these are now regular properties that will be computed via selectors
  filteredInterviews: [],
  districts: [],
  positions: [],
  stats: {
    scheduled: 0,
    completed: 0,
    upcoming: 0
  },

  // Data fetching actions
  fetchInterviews: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get<PaginatedInterviewResponse>('/hiring/interviews/');

      // Ensure response.data is an array
      const data: InterviewAPI[] = Array.isArray(response.data.results) ? response.data.results : [];

      if (!Array.isArray(response.data)) {
        console.warn('Expected array from API but got:', typeof response.data, response.data);
      }

      set({ interviews: data, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch interviews';
      set({ error: errorMessage, loading: false });
      console.error('Error fetching interviews:', err);
    }
  },

  fetchUpcomingInterviews: async (days: number = 30) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get<InterviewAPI[]>('/hiring/interviews/upcoming/', {
        params: { days }
      });
      const data = Array.isArray(response.data) ? response.data : [];
      set({ loading: false });
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch upcoming interviews';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  fetchInterviewsByDateRange: async (startDate: string, endDate: string) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get<InterviewAPI[]>('/hiring/interviews/by_date_range/', {
        params: { start_date: startDate, end_date: endDate }
      });
      const data = Array.isArray(response.data) ? response.data : [];
      set({ loading: false });
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch interviews by date range';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  getInterviewStats: async () => {
    try {
      const response = await api.get<InterviewStats>('/hiring/interviews/stats/');
      return response.data;
    } catch (err) {
      console.error('Error fetching interview stats:', err);
      throw err;
    }
  },

  // CRUD operations
  scheduleInterview: async (data: InterviewScheduleData) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post<InterviewAPI>('/hiring/interviews/schedule/', data);
      const newInterview = response.data;

      set(state => ({
        interviews: [...state.interviews, newInterview],
        loading: false
      }));

      return newInterview;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule interview';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  updateInterview: async (interviewId: string, data: Partial<InterviewAPI>) => {
    try {
      set({ loading: true, error: null });
      const response = await api.patch<InterviewAPI>(`/hiring/interviews/${interviewId}/`, data);
      const updatedInterview = response.data;

      set(state => ({
        interviews: state.interviews.map(int =>
          int.id === interviewId ? updatedInterview : int
        ),
        selectedInterview: state.selectedInterview?.id === interviewId
          ? updatedInterview
          : state.selectedInterview,
        loading: false
      }));

      return updatedInterview;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update interview';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  markInterviewCompleted: async (interviewId: string, feedback?: string, rating?: number) => {
    try {
      set({ loading: true, error: null });
      const data: any = {};
      if (feedback) data.feedback = feedback;
      if (rating) data.rating = rating;

      const response = await api.post<InterviewAPI>(`/hiring/interviews/${interviewId}/mark_completed/`, data);
      const updatedInterview = response.data;

      set(state => ({
        interviews: state.interviews.map(int =>
          int.id === interviewId ? updatedInterview : int
        ),
        loading: false
      }));

      return updatedInterview;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark interview completed';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  cancelInterview: async (interviewId: string) => {
    try {
      set({ loading: true, error: null });
      const response = await api.patch<InterviewAPI>(`/hiring/interviews/${interviewId}/`, {
        status: 'Cancelled'
      });
      const updatedInterview = response.data;

      set(state => ({
        interviews: state.interviews.map(int =>
          int.id === interviewId ? updatedInterview : int
        ),
        loading: false
      }));

      return updatedInterview;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel interview';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  deleteInterview: async (interviewId: string) => {
    try {
      set({ loading: true, error: null });
      await api.delete(`/hiring/interviews/${interviewId}/`);

      set(state => ({
        interviews: state.interviews.filter(int => int.id !== interviewId),
        loading: false
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete interview';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  // UI state actions
  setFilter: (filterName: keyof InterviewFilters, value: string) => {
    set(state => ({
      filters: {
        ...state.filters,
        [filterName]: value
      }
    }));
  },

  clearFilters: () => {
    set({ filters: initialFilters });
  },

  setSelectedInterview: (interview: InterviewAPI | null) => {
    set({ selectedInterview: interview });
  },

  setShowDetailsModal: (show: boolean) => {
    set({ showDetailsModal: show });
  },

  // Helper actions
  filterByStatus: (status: InterviewAPI['status']) => {
    return get().interviews.filter(int => int.status === status);
  },

  getInterviewsByDate: (date: string) => {
    return get().interviews.filter(int => int.scheduled_date === date);
  },
}));

// Selector functions for computed values
export const selectFilteredInterviews = (state: ReturnType<typeof useInterviewStore.getState>) => {
  const { interviews, filters } = state;
  const { searchTerm, statusFilter, dateFilter, districtFilter, positionFilter } = filters;

  return interviews.filter(interview => {
    const matchesSearch =
      interview.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.position_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.candidate_email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || interview.status === statusFilter;
    const matchesDistrict = districtFilter === 'All' || interview.worksite === districtFilter;
    const matchesPosition = positionFilter === 'All' || interview.position_title === positionFilter;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const interviewDate = new Date(interview.scheduled_date);
    interviewDate.setHours(0, 0, 0, 0);

    let matchesDate = true;
    if (dateFilter === 'Today') {
      matchesDate = interviewDate.getTime() === today.getTime();
    } else if (dateFilter === 'This Week') {
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      matchesDate = interviewDate >= today && interviewDate <= weekFromNow;
    } else if (dateFilter === 'This Month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      matchesDate = interviewDate >= startOfMonth && interviewDate <= endOfMonth;
    } else if (dateFilter === 'Past') {
      matchesDate = interviewDate < today;
    } else if (dateFilter === 'Upcoming') {
      matchesDate = interviewDate >= today;
    }

    return matchesSearch && matchesStatus && matchesDate && matchesDistrict && matchesPosition;
  });
};

export const selectDistricts = (state: ReturnType<typeof useInterviewStore.getState>) => {
  return Array.from(new Set(state.interviews.map(i => i.worksite))).sort();
};

export const selectPositions = (state: ReturnType<typeof useInterviewStore.getState>) => {
  return Array.from(new Set(state.interviews.map(i => i.position_title))).sort();
};

export const selectStats = (state: ReturnType<typeof useInterviewStore.getState>) => {
  const { interviews } = state;
  const today = new Date();

  return {
    scheduled: interviews.filter(i => i.status === 'Scheduled').length,
    completed: interviews.filter(i => i.status === 'Completed').length,
    upcoming: interviews.filter(i => {
      const interviewDate = new Date(i.scheduled_date);
      return i.status === 'Scheduled' && interviewDate >= today;
    }).length
  };
};

// Hook to fetch interviews on mount
export const useInitializeInterviews = () => {
  const fetchInterviews = useInterviewStore(state => state.fetchInterviews);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);
};
