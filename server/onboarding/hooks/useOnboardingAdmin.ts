'use client'

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface OnboardingCandidate {
  id: string;
  name: string;
  email: string;
  position: string;
  offer_date: string;
  start_date?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'submitted';
  completed_sections: number;
  progress_percentage: number;
  last_updated?: string | null;
  submitted_at?: string | null;
  access_token: string;
  onboarding_url: string;
  reviewed_by?: string;
  reviewed_at?: string;
  admin_notes?: string;
  section_data?: any[];
  personal_info?: any;
  employment_details?: any;
  i9_form?: any;
  tax_withholdings?: any;
  payment_method?: any;
  time_off?: any;
  deductions?: any;
  emergency_contact?: any;
}

export interface CreateCandidatePayload {
  name: string;
  email: string;
  position: string;
  offer_date: string;
  start_date?: string;
  job_application?: number;
}

export interface ReviewPayload {
  section_index?: number;
  admin_comments?: string;
  mark_as_reviewed: boolean;
}

export interface OnboardingStats {
  total_candidates: number;
  not_started: number;
  in_progress: number;
  completed: number;
  submitted: number;
  average_completion_time: number;
  completion_rate: number;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  action_display: string;
  section_name?: string;
  performed_by_name: string;
  performed_by_candidate: boolean;
  details: any;
  ip_address?: string;
  created_at: string;
}

/**
 * Custom hook for admin onboarding management
 * Requires authentication (HR staff)
 */
export function useOnboardingAdmin() {
  const [candidates, setCandidates] = useState<OnboardingCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<OnboardingCandidate | null>(null);
  const [stats, setStats] = useState<OnboardingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all candidates
  const loadCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/onboarding/candidates/');
      setCandidates(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load candidate by ID
  const loadCandidate = useCallback(async (candidateId: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/onboarding/candidates/${candidateId}/`);
      setSelectedCandidate(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidate');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new candidate
  const createCandidate = useCallback(async (payload: CreateCandidatePayload) => {
    setLoading(true);
    try {
      const response = await api.post('/onboarding/candidates/', payload);
      setCandidates(prev => [response.data, ...prev]);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create candidate');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update section (admin edit)
  const updateSection = useCallback(async (
    candidateId: string,
    payload: {
      section_index: number;
      form_data: any;
      is_completed: boolean;
    }
  ) => {
    setLoading(true);
    try {
      const response = await api.post(
        `/onboarding/candidates/${candidateId}/update_section/`,
        payload
      );
      
      // Update selected candidate if it's the one being edited
      if (selectedCandidate?.id === candidateId) {
        setSelectedCandidate(response.data.candidate);
      }
      
      // Update in candidates list
      setCandidates(prev =>
        prev.map(c => c.id === candidateId ? response.data.candidate : c)
      );
      
      setError(null);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update section');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedCandidate]);

  // Review onboarding
  const reviewOnboarding = useCallback(async (
    candidateId: string,
    payload: ReviewPayload
  ) => {
    setLoading(true);
    try {
      const response = await api.post(
        `/onboarding/candidates/${candidateId}/review/`,
        payload
      );
      
      // Update selected candidate
      if (selectedCandidate?.id === candidateId) {
        setSelectedCandidate(response.data.candidate);
      }
      
      // Update in candidates list
      setCandidates(prev =>
        prev.map(c => c.id === candidateId ? response.data.candidate : c)
      );
      
      setError(null);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to review onboarding');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedCandidate]);

  // Load statistics
  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/onboarding/candidates/stats/');
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get audit log
  const getAuditLog = useCallback(async (candidateId: string): Promise<AuditLogEntry[]> => {
    try {
      const response = await api.get(`/onboarding/candidates/${candidateId}/audit_log/`);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit log');
      throw err;
    }
  }, []);

  // Get progress for a candidate
  const getProgress = useCallback(async (candidateId: string) => {
    try {
      const response = await api.get(`/onboarding/candidates/${candidateId}/progress/`);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get progress');
      throw err;
    }
  }, []);

  // Send reminder email (if you implement this endpoint)
  const sendReminder = useCallback(async (candidateId: string) => {
    setLoading(true);
    try {
      const response = await api.post(`/onboarding/candidates/${candidateId}/send_reminder/`);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reminder');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete candidate
  const deleteCandidate = useCallback(async (candidateId: string) => {
    setLoading(true);
    try {
      await api.delete(`/onboarding/candidates/${candidateId}/`);
      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      if (selectedCandidate?.id === candidateId) {
        setSelectedCandidate(null);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete candidate');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedCandidate]);

  // Load candidates on mount
  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  return {
    // State
    candidates,
    selectedCandidate,
    stats,
    loading,
    error,

    // Actions
    loadCandidates,
    loadCandidate,
    createCandidate,
    updateSection,
    reviewOnboarding,
    loadStats,
    getAuditLog,
    getProgress,
    sendReminder,
    deleteCandidate,
    setSelectedCandidate,
  };
}
