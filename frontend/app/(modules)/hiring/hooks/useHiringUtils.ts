import { useState, useCallback } from 'react';
import { PositionFormData } from '@/types/hiring';

interface ValidationErrors {
  [key: string]: string;
}

interface UseFormValidationReturn {
  errors: ValidationErrors;
  validateField: (field: string, value: any, rules?: ValidationRule[]) => boolean;
  validateForm: (data: any, schema: ValidationSchema) => boolean;
  clearErrors: () => void;
  clearFieldError: (field: string) => void;
}

interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validate?: (value: any) => boolean;
}

interface ValidationSchema {
  [key: string]: ValidationRule[];
}

export function useFormValidation(): UseFormValidationReturn {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback(
    (field: string, value: any, rules?: ValidationRule[]): boolean => {
      if (!rules || rules.length === 0) {
        return true;
      }

      for (const rule of rules) {
        let isValid = true;
        let errorMessage = rule.message;

        switch (rule.type) {
          case 'required':
            isValid = value !== null && value !== undefined && value !== '';
            break;
          case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            break;
          case 'min':
            isValid = value && value.length >= rule.value;
            break;
          case 'max':
            isValid = value && value.length <= rule.value;
            break;
          case 'pattern':
            isValid = new RegExp(rule.value).test(value);
            break;
          case 'custom':
            isValid = rule.validate ? rule.validate(value) : true;
            break;
        }

        if (!isValid) {
          setErrors(prev => ({ ...prev, [field]: errorMessage }));
          return false;
        }
      }

      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    },
    []
  );

  const validateForm = useCallback(
    (data: any, schema: ValidationSchema): boolean => {
      const newErrors: ValidationErrors = {};
      let isValid = true;

      for (const [field, rules] of Object.entries(schema)) {
        for (const rule of rules) {
          let fieldIsValid = true;
          const value = data[field];

          switch (rule.type) {
            case 'required':
              fieldIsValid = value !== null && value !== undefined && value !== '';
              break;
            case 'email':
              fieldIsValid = !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
              break;
            case 'min':
              fieldIsValid = !value || value.length >= rule.value;
              break;
            case 'max':
              fieldIsValid = !value || value.length <= rule.value;
              break;
            case 'pattern':
              fieldIsValid = !value || new RegExp(rule.value).test(value);
              break;
            case 'custom':
              fieldIsValid = rule.validate ? rule.validate(value) : true;
              break;
          }

          if (!fieldIsValid) {
            newErrors[field] = rule.message;
            isValid = false;
            break;
          }
        }
      }

      setErrors(newErrors);
      return isValid;
    },
    []
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError
  };
}

// Validation schema for position creation
export const positionValidationSchema: ValidationSchema = {
  title: [
    { type: 'required', message: 'Position title is required' },
    { type: 'min', value: 3, message: 'Title must be at least 3 characters' }
  ],
  department: [
    { type: 'required', message: 'Department is required' }
  ],
  worksite: [
    { type: 'required', message: 'Worksite is required' }
  ],
  primaryJobTitle: [
    { type: 'required', message: 'Primary job title is required' }
  ],
  reqId: [
    { type: 'required', message: 'Requisition ID is required' },
    { type: 'pattern', value: '^REQ-\\d{4}-\\d{4}$', message: 'Invalid requisition ID format' }
  ],
  fte: [
    { type: 'required', message: 'FTE is required' },
    {
      type: 'custom',
      message: 'FTE must be between 0 and 1',
      validate: (value) => parseFloat(value) >= 0 && parseFloat(value) <= 1
    }
  ],
  salaryRange: [
    { type: 'required', message: 'Salary range is required' }
  ],
  startDate: [
    { type: 'required', message: 'Start date is required' }
  ],
  employeeCategory: [
    { type: 'required', message: 'Employee category is required' }
  ],
  eeocClassification: [
    { type: 'required', message: 'EEOC classification is required' }
  ],
  workersCompClassification: [
    { type: 'required', message: "Workers' comp classification is required" }
  ],
  leavePlan: [
    { type: 'required', message: 'Leave plan is required' }
  ],
  deductionTemplate: [
    { type: 'required', message: 'Deduction template is required' }
  ]
};

// Hook for managing hirings pipeline
interface UsePipelineStatsReturn {
  stats: {
    totalPositions: number;
    openPositions: number;
    draftPositions: number;
    closedPositions: number;
    totalApplications: number;
    applicationsThisMonth: number;
    pendingOffers: number;
    acceptedOffers: number;
    averageTimeToFill: string;
    activeApplicants: number;
  };
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export function usePipelineStats(): UsePipelineStatsReturn {
  const [stats, setStats] = useState({
    totalPositions: 0,
    openPositions: 0,
    draftPositions: 0,
    closedPositions: 0,
    totalApplications: 0,
    applicationsThisMonth: 0,
    pendingOffers: 0,
    acceptedOffers: 0,
    averageTimeToFill: '0 days',
    activeApplicants: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // This would call the API endpoint you have in Django
      // const response = await api.get('/hiring/positions/stats/');
      // setStats(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(errorMessage);
      console.error('Error fetching pipeline stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    loading,
    error,
    refreshStats
  };
}

// Hook for managing position modal state
interface UsePositionModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  step: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
}

export function usePositionModal(): UsePositionModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setStep(1);
  }, []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const nextStep = useCallback(() => setStep(prev => Math.min(prev + 1, 4)), []);
  const prevStep = useCallback(() => setStep(prev => Math.max(prev - 1, 1)), []);
  const goToStep = useCallback((newStep: number) => {
    if (newStep >= 1 && newStep <= 4) setStep(newStep);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    step,
    nextStep,
    prevStep,
    goToStep
  };
}

// Hook for managing interview panel selection
interface Interviewer {
  email: string;
  name: string;
  role: string;
}

interface UseInterviewPanelReturn {
  selectedInterviewers: string[];
  addInterviewer: (email: string) => void;
  removeInterviewer: (email: string) => void;
  clearPanel: () => void;
  searchInterviewers: (query: string, availableInterviewers: Interviewer[]) => Interviewer[];
  getSelectedDetails: (availableInterviewers: Interviewer[]) => Interviewer[];
}

export function useInterviewPanel(): UseInterviewPanelReturn {
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([]);

  const addInterviewer = useCallback((email: string) => {
    setSelectedInterviewers(prev =>
      prev.includes(email) ? prev : [...prev, email]
    );
  }, []);

  const removeInterviewer = useCallback((email: string) => {
    setSelectedInterviewers(prev => prev.filter(e => e !== email));
  }, []);

  const clearPanel = useCallback(() => {
    setSelectedInterviewers([]);
  }, []);

  const searchInterviewers = useCallback(
    (query: string, availableInterviewers: Interviewer[]): Interviewer[] => {
      const lowerQuery = query.toLowerCase();
      return availableInterviewers.filter(
        int =>
          int.name.toLowerCase().includes(lowerQuery) ||
          int.role.toLowerCase().includes(lowerQuery)
      );
    },
    []
  );

  const getSelectedDetails = useCallback(
    (availableInterviewers: Interviewer[]): Interviewer[] => {
      return availableInterviewers.filter(int =>
        selectedInterviewers.includes(int.email)
      );
    },
    [selectedInterviewers]
  );

  return {
    selectedInterviewers,
    addInterviewer,
    removeInterviewer,
    clearPanel,
    searchInterviewers,
    getSelectedDetails
  };
}
