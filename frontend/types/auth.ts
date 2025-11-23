import { User } from './user.types';

// Auth Models - Data structures for authentication
export type { User } from './user.types';

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface EmailRequest {
    email: string;
}

export interface EmailVerification {
    email: string;
    token: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface AuthErrorResponse {
    error: string;
    details?: Record<string, string[]>;
}

export interface AuthError {
    error: string;
    details?: Record<string, string[]>;
}

// API Response types
export interface ApiResponse<T> {
    data?: T;
    message?: string;
    error?: string;
}

// Auth step types for UI flow
export type AuthStep = 'email-input' | 'email-verification' | 'authenticated';

// Form validation types
export interface ValidationError {
    field: string;
    message: string;
}

export interface FormState<T> {
    data: T;
    errors: ValidationError[];
    isValid: boolean;
    isSubmitting: boolean;
}

// Email verification flow state
export interface VerificationState {
    email: string;
    isCodeSent: boolean;
    canResend: boolean;
    resendCountdown: number;
    attempts: number;
    maxAttempts: number;
}