'use client'

import { useState, useEffect, useCallback } from 'react';

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
  token_expires_at: string;
  onboarding_url: string;
  is_expired: boolean;
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

export interface SectionUpdatePayload {
  section_index: number;
  form_data: any;
  is_completed: boolean;
}

export interface ProgressData {
  candidate_id: string;
  name: string;
  status: string;
  completed_sections: number;
  progress_percentage: number;
  sections: Array<{
    index: number;
    name: string;
    is_completed: boolean;
    completed_at?: string;
    reviewed_by_admin: boolean;
  }>;
  last_updated?: string;
  submitted_at?: string;
}

/**
 * Custom hook for candidate onboarding functionality
 * Uses token-based authentication for candidate access
 */
export function useOnboardingCandidate(token: string) {
  const [candidate, setCandidate] = useState<OnboardingCandidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Validate token and load candidate data
  const validateAndLoad = useCallback(async () => {
    if (!token) {
      setError('No token provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/onboarding/candidates/validate_token/?token=${token}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid token');
      }

      const data = await response.json();
      setCandidate(data.candidate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load onboarding data');
      setCandidate(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load on mount
  useEffect(() => {
    validateAndLoad();
  }, [validateAndLoad]);

  // Update a section
  const updateSection = useCallback(async (payload: SectionUpdatePayload) => {
    if (!candidate) {
      throw new Error('No candidate loaded');
    }

    setSaving(true);
    try {
      const response = await fetch(
        `${API_URL}/onboarding/candidates/${candidate.id}/update_section/?token=${token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Onboarding-Token': token,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update section');
      }

      const data = await response.json();
      setCandidate(data.candidate);
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update section';
      setError(errorMsg);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [candidate, token]);

  // Submit onboarding form
  const submitForm = useCallback(async () => {
    if (!candidate) {
      throw new Error('No candidate loaded');
    }

    if (candidate.completed_sections < 8) {
      throw new Error('All sections must be completed before submission');
    }

    setSaving(true);
    try {
      const response = await fetch(
        `${API_URL}/onboarding/candidates/${candidate.id}/submit/?token=${token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Onboarding-Token': token,
          },
          body: JSON.stringify({ confirm_completion: true }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit onboarding');
      }

      const data = await response.json();
      setCandidate(data.candidate);
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit form';
      setError(errorMsg);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [candidate, token]);

  // Get progress
  const getProgress = useCallback(async (): Promise<ProgressData> => {
    if (!candidate) {
      throw new Error('No candidate loaded');
    }

    try {
      const response = await fetch(
        `${API_URL}/onboarding/candidates/${candidate.id}/progress/?token=${token}`,
        {
          headers: {
            'X-Onboarding-Token': token,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }

      return response.json();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get progress';
      setError(errorMsg);
      throw err;
    }
  }, [candidate, token]);

  // Upload document
  const uploadDocument = useCallback(async (documentType: string, file: File) => {
    if (!candidate) {
      throw new Error('No candidate loaded');
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('candidate_id', candidate.id);
      formData.append('document_type', documentType);
      formData.append('file', file);

      const response = await fetch(
        `${API_URL}/onboarding/documents/?token=${token}`,
        {
          method: 'POST',
          headers: {
            'X-Onboarding-Token': token,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      return response.json();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload document';
      setError(errorMsg);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [candidate, token]);

  // Refresh candidate data
  const refresh = useCallback(() => {
    return validateAndLoad();
  }, [validateAndLoad]);

  return {
    candidate,
    loading,
    error,
    saving,
    updateSection,
    submitForm,
    getProgress,
    uploadDocument,
    refresh,
  };
}
