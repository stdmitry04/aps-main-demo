import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';

interface Interview {
    id: string;
    applicationId: string;
    stageId: string;
    scheduledDate: string;
    scheduledTime: string;
    location: string;
    zoomLink?: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
    notes?: string;
    feedback?: string;
    rating?: number;
}

interface InterviewScheduleData {
    application: string;
    stage: string;
    scheduledDate: string;
    scheduledTime: string;
    location: string;
}

interface UseInterviewsReturn {
    interviews: Interview[];
    loading: boolean;
    error: string | null;
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

export function useInterviews(): UseInterviewsReturn {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInterviews = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/hiring/interviews/');
            setInterviews(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch interviews';
            setError(errorMessage);
            console.error('Error fetching interviews:', err);
            setInterviews([]); // Reset to empty array on error
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInterviews();
    }, [fetchInterviews]);

    const fetchUpcomingInterviews = useCallback(
        async (days: number = 30): Promise<Interview[]> => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get('/hiring/interviews/upcoming/', {
                    params: { days }
                });
                return response.data;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch upcoming interviews';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const fetchInterviewsByDateRange = useCallback(
        async (startDate: string, endDate: string): Promise<Interview[]> => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get('/hiring/interviews/by_date_range/', {
                    params: { startDate, endDate }
                });
                return response.data;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch interviews by date range';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const scheduleInterview = useCallback(
        async (data: InterviewScheduleData): Promise<Interview> => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.post('/hiring/interviews/schedule/', data);
                const newInterview = response.data;
                setInterviews(prev => Array.isArray(prev) ? [...prev, newInterview] : [newInterview]);
                return newInterview;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to schedule interview';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const markInterviewCompleted = useCallback(
        async (interviewId: string, feedback?: string, rating?: number): Promise<Interview> => {
            try {
                setLoading(true);
                setError(null);
                const data: any = {};
                if (feedback) data.feedback = feedback;
                if (rating) data.rating = rating;

                const response = await api.post(`/hiring/interviews/${interviewId}/mark_completed/`, data);
                const updatedInterview = response.data;
                setInterviews(prev =>
                    Array.isArray(prev) ? prev.map(int => (int.id === interviewId ? updatedInterview : int)) : [updatedInterview]
                );
                return updatedInterview;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to mark interview completed';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const cancelInterview = useCallback(
        async (interviewId: string): Promise<Interview> => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.patch(`/hiring/interviews/${interviewId}/`, {
                    status: 'Cancelled'
                });
                const updatedInterview = response.data;
                setInterviews(prev =>
                    Array.isArray(prev) ? prev.map(int => (int.id === interviewId ? updatedInterview : int)) : [updatedInterview]
                );
                return updatedInterview;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to cancel interview';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const updateInterview = useCallback(
        async (interviewId: string, data: Partial<Interview>): Promise<Interview> => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.patch(`/hiring/interviews/${interviewId}/`, data);
                const updatedInterview = response.data;
                setInterviews(prev =>
                    Array.isArray(prev) ? prev.map(int => (int.id === interviewId ? updatedInterview : int)) : [updatedInterview]
                );
                return updatedInterview;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to update interview';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const deleteInterview = useCallback(
        async (interviewId: string) => {
            try {
                setLoading(true);
                setError(null);
                await api.delete(`/hiring/interviews/${interviewId}/`);
                setInterviews(prev => Array.isArray(prev) ? prev.filter(int => int.id !== interviewId) : []);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to delete interview';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const getInterviewStats = useCallback(async () => {
        try {
            const response = await api.get('/hiring/interviews/stats/');
            return response.data;
        } catch (err) {
            console.error('Error fetching interview stats:', err);
            throw err;
        }
    }, []);

    const filterByStatus = useCallback(
        (status: Interview['status']): Interview[] => {
            return interviews.filter(int => int.status === status);
        },
        [interviews]
    );

    const getInterviewsByDate = useCallback(
        (date: string): Interview[] => {
            return interviews.filter(int => int.scheduledDate === date);
        },
        [interviews]
    );

    return {
        interviews,
        loading,
        error,
        fetchInterviews,
        fetchUpcomingInterviews,
        fetchInterviewsByDateRange,
        scheduleInterview,
        markInterviewCompleted,
        cancelInterview,
        updateInterview,
        deleteInterview,
        getInterviewStats,
        filterByStatus,
        getInterviewsByDate
    };
}
