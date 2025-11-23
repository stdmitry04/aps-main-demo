/**
 * Onboarding Utilities
 * Comprehensive utilities for onboarding API, status management, and data handling
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ============================================================================
// Types
// ============================================================================

export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed' | 'submitted';

export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  token?: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Section names mapping
 */
export const SECTION_NAMES = [
  'Personal Information',
  'Employment Details',
  'I-9 Form',
  'Tax Withholdings',
  'Payment Method',
  'Time Off',
  'Deductions',
  'Emergency Contact',
] as const;

/**
 * Status display labels
 */
export const STATUS_LABELS: Record<string, string> = {
  notStarted: 'Not Started',
  inProgress: 'In Progress',
  completed: 'Completed',
  submitted: 'Submitted ✓',
};

/**
 * Status colors for UI
 */
export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  notStarted: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
  },
  inProgress: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
  },
  completed: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  submitted: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
};

/**
 * Document type labels
 */
export const DOCUMENT_TYPES: Record<string, string> = {
  resume: 'Resume',
  i9DocumentA: 'I-9 List A Document',
  i9DocumentB: 'I-9 List B Document',
  i9DocumentC: 'I-9 List C Document',
  certification: 'Teaching Certification',
  license: 'Professional License',
  transcript: 'Transcript',
  other: 'Other',
};

// ============================================================================
// Low-level API Functions
// ============================================================================

/**
 * Make API request with token support
 */
export async function fetchOnboarding(
  endpoint: string,
  options: FetchOptions = {}
): Promise<any> {
  const { method = 'GET', headers = {}, body, token } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    finalHeaders['X-Onboarding-Token'] = token;
  }

  const config: RequestInit = {
    method,
    headers: finalHeaders,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const url = token && !endpoint.includes('?')
    ? `${API_URL}${endpoint}?token=${token}`
    : `${API_URL}${endpoint}`;

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Upload file with token support
 */
export async function uploadFile(
  endpoint: string,
  formData: FormData,
  token?: string
): Promise<any> {
  const headers: Record<string, string> = {};

  if (token) {
    headers['X-Onboarding-Token'] = token;
  }

  const url = token
    ? `${API_URL}${endpoint}?token=${token}`
    : `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return response.json();
}

// ============================================================================
// API Client Class
// ============================================================================

/**
 * API client for onboarding operations
 */
export class OnboardingAPI {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/onboarding') {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch candidate data
   */
  async getCandidateData(candidateId: string) {
    const response = await fetch(`${this.baseUrl}/candidate/${candidateId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch candidate data');
    }
    return response.json();
  }

  /**
   * Update candidate progress
   */
  async updateProgress(
    candidateId: string,
    completedSections: number,
    formData?: any
  ) {
    const status = determineStatus(completedSections);
    
    const response = await fetch(
      `${this.baseUrl}/candidate/${candidateId}/progress`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completedSections,
          status,
          formData,
          lastUpdated: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update progress');
    }

    return response.json();
  }

  /**
   * Submit onboarding form
   */
  async submitForm(candidateId: string) {
    const response = await fetch(
      `${this.baseUrl}/candidate/${candidateId}/submit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completedSections: 8,
          status: 'submitted',
          submittedAt: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to submit form');
    }

    return response.json();
  }

  /**
   * Save section data
   */
  async saveSectionData(
    candidateId: string,
    sectionName: string,
    sectionData: any
  ) {
    const response = await fetch(
      `${this.baseUrl}/candidate/${candidateId}/section`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: sectionName,
          data: sectionData,
          updatedAt: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to save section data');
    }

    return response.json();
  }
}

// ============================================================================
// Status Management
// ============================================================================

/**
 * Determine the status based on completed sections count and submission state
 */
export function determineStatus(
  completedSections: number,
  isSubmitted: boolean = false
): OnboardingStatus {
  if (isSubmitted && completedSections === 8) {
    return 'submitted';
  }
  if (completedSections === 8) {
    return 'completed';
  }
  if (completedSections > 0) {
    return 'in_progress';
  }
  return 'not_started';
}

/**
 * Get status display label
 */
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}

/**
 * Format the status for display
 */
export function formatStatus(status: OnboardingStatus): string {
  return STATUS_LABELS[status];
}

/**
 * Get status color classes
 */
export function getStatusColors(status: string) {
  return STATUS_COLORS[status] || STATUS_COLORS.notStarted;
}

/**
 * Get status color for UI (alias)
 */
export function getStatusColor(status: OnboardingStatus): {
  bg: string;
  text: string;
  border: string;
} {
  return STATUS_COLORS[status];
}

// ============================================================================
// Progress and Validation
// ============================================================================

/**
 * Calculate progress percentage
 */
export function calculateProgress(completedSections: number, totalSections: number = 8): number {
  return Math.round((completedSections / totalSections) * 100);
}

/**
 * Check if all sections are completed
 */
export function isFormComplete(completedSections: number): boolean {
  return completedSections === 8;
}

/**
 * Validate section index
 */
export function isValidSectionIndex(index: number): boolean {
  return index >= 0 && index < 8;
}

/**
 * Get incomplete sections
 */
export function getIncompleteSections(completedSections: boolean[]): number[] {
  return completedSections
    .map((completed, index) => (!completed ? index : -1))
    .filter(index => index !== -1);
}

/**
 * Validate if all required sections are completed
 */
export function validateCompletedSections(completedSections: boolean[]): {
  isValid: boolean;
  missingIndices: number[];
} {
  const missingIndices = getIncompleteSections(completedSections);

  return {
    isValid: missingIndices.length === 0,
    missingIndices,
  };
}

// ============================================================================
// Section Management
// ============================================================================

/**
 * Get section name by index
 */
export function getSectionName(index: number): string {
  return SECTION_NAMES[index] || 'Unknown Section';
}

// ============================================================================
// Document Management
// ============================================================================

/**
 * Get document type label
 */
export function getDocumentTypeLabel(type: string): string {
  return DOCUMENT_TYPES[type] || type;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ============================================================================
// Date and Time Formatting
// ============================================================================

/**
 * Format date for display
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Never';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format datetime for display
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return 'Never';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return 'Never';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return formatDate(dateString);
}

/**
 * Format last updated time for display
 */
export function formatLastUpdated(date: Date | string | null): string {
  if (!date) return 'Never';
  
  const dateString = typeof date === 'string' ? date : date.toISOString();
  return formatRelativeTime(dateString);
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?1?\d{9,15}$/;
  const cleaned = phone.replace(/[-() ]/g, '');
  return phoneRegex.test(cleaned);
}

// ============================================================================
// Link and Token Management
// ============================================================================

/**
 * Check if onboarding link is expired
 */
export function isLinkExpired(offerDate: string, expirationDays: number = 30): boolean {
  const offer = new Date(offerDate);
  const expirationDate = new Date(offer);
  expirationDate.setDate(expirationDate.getDate() + expirationDays);
  
  return new Date() > expirationDate;
}

/**
 * Generate a secure candidate token
 */
export function generateCandidateToken(): string {
  // In production, use crypto.randomUUID() or similar
  // This is a simplified version
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// Local Storage Helper
// ============================================================================

/**
 * Local storage helpers for saving progress offline
 */
export class LocalStorageHelper {
  private prefix = 'onboarding_';

  /**
   * Save form data to local storage
   */
  saveFormData(candidateId: string, sectionIndex: number, data: any): void {
    try {
      const key = `${this.prefix}${candidateId}_section_${sectionIndex}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to local storage:', error);
    }
  }

  /**
   * Load form data from local storage
   */
  loadFormData(candidateId: string, sectionIndex: number): any | null {
    try {
      const key = `${this.prefix}${candidateId}_section_${sectionIndex}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load from local storage:', error);
      return null;
    }
  }

  /**
   * Save progress metadata
   */
  saveProgress(candidateId: string, completedSections: boolean[]): void {
    try {
      const key = `${this.prefix}${candidateId}_progress`;
      localStorage.setItem(
        key,
        JSON.stringify({
          completedSections,
          lastSaved: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  /**
   * Load progress metadata
   */
  loadProgress(candidateId: string): { completedSections: boolean[]; lastSaved: string } | null {
    try {
      const key = `${this.prefix}${candidateId}_progress`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load progress:', error);
      return null;
    }
  }

  /**
   * Clear all data for a candidate
   */
  clearCandidateData(candidateId: string): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(`${this.prefix}${candidateId}`)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear local storage:', error);
    }
  }
}
