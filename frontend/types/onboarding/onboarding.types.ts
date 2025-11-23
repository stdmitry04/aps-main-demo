// types/onboarding.ts
// Shared TypeScript types for the onboarding system

/**
 * Status of the onboarding process
 */
export type OnboardingStatus = "not_started" | "in_progress" | "completed" | "submitted";

/**
 * Base candidate information
 */
export interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  offerDate: string;
  startDate?: string;
  status: OnboardingStatus;
  completedSections: number;
  lastUpdated?: string | null;
  submittedAt?: string | null;
}

/**
 * Extended candidate with form data
 */
export interface CandidateWithFormData extends Candidate {
  personalInfo?: PersonalInformation;
  employmentDetails?: EmploymentDetails;
  i9Form?: I9Form;
  taxWithholdings?: TaxWithholdings;
  paymentMethod?: PaymentMethod;
  timeOff?: TimeOff;
  deductions?: Deductions;
  emergencyContact?: EmergencyContact;
}

/**
 * Personal Information section
 */
export interface PersonalInformation {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: string;
  socialSecurityNumber: string;
  citizenship: string;
}

/**
 * Employment Details section
 */
export interface EmploymentDetails {
  status: string;
  hireDate: string;
  paySchedule: string;
  workLocation: string;
  manager: string;
  department: string;
  jobTitle: string;
  employeeId?: string;
  billingRate?: string;
}

/**
 * I-9 Form section
 */
export interface I9Form {
  citizenshipStatus: string;
  uscisNumber?: string;
  passportNumber?: string;
  passportCountry?: string;
  listADocument?: string;
  listBDocument?: string;
  listBDocNumber?: string;
  listCDocument?: string;
  listCDocNumber?: string;
  verificationDate: string;
}

/**
 * Tax Withholdings section
 */
export interface TaxWithholdings {
  w4Version: string;
  filingStatus: string;
  claimedDependents: string;
  otherIncome: string;
  deductions: string;
  extraWithholding: string;
  ilTaxStatus: string;
  ilAllowances: string;
  ilExtraWithholding: string;
}

/**
 * Payment Method section
 */
export interface PaymentMethod {
  paymentMethod: "paper_check" | "direct_deposit";
  bankName?: string;
  accountType?: "Checking" | "Savings";
  accountNumber?: string;
  routingNumber?: string;
  nameOnAccount?: string;
}

/**
 * Time Off section
 */
export interface TimeOff {
  sickDaysUnderstanding: boolean;
  vacationDaysUnderstanding: boolean;
  holidaysUnderstanding: boolean;
  timeOffContactName?: string;
  timeOffContactEmail?: string;
}

/**
 * Deductions section
 */
export interface Deductions {
  healthInsurance: boolean;
  healthAmount?: string;
  dentalVision: boolean;
  dentalVisionAmount?: string;
  retirementPlan: boolean;
  retirementAmount?: string;
  fsaAmount?: string;
  hsa: boolean;
  hsaAmount?: string;
}

/**
 * Emergency Contact information
 */
export interface EmergencyContactPerson {
  id: number;
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface EmergencyContact {
  contacts: EmergencyContactPerson[];
  acknowledgment: boolean;
}

/**
 * Section metadata
 */
export interface SectionMetadata {
  name: string;
  index: number;
  isCompleted: boolean;
  lastSaved?: string;
}

/**
 * Progress update payload
 */
export interface ProgressUpdatePayload {
  candidateId: string;
  completedSections: number;
  status: OnboardingStatus;
  sectionName?: string;
  sectionData?: any;
}

/**
 * API Response types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CandidateResponse extends ApiResponse {
  data?: Candidate;
}

export interface ProgressResponse extends ApiResponse {
  data?: {
    candidateId: string;
    completedSections: number;
    status: OnboardingStatus;
    lastUpdated: string;
  };
}

export interface SubmitResponse extends ApiResponse {
  data?: {
    candidateId: string;
    status: OnboardingStatus;
    submittedAt: string;
  };
}

/**
 * Email template data
 */
export interface OnboardingEmailData {
  candidateName: string;
  candidateEmail: string;
  position: string;
  startDate: string;
  onboardingUrl: string;
  hrEmail: string;
  hrPhone: string;
  companyName: string;
}

export interface ReminderEmailData extends OnboardingEmailData {
  completedSections: number;
  totalSections: number;
  lastUpdated?: string;
}

/**
 * Form validation errors
 */
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Section component props
 */
export interface SectionProps {
  candidate: Candidate;
  onDataChange?: (data: any) => void;
  initialData?: any;
}

/**
 * Admin view props
 */
export interface AdminOnboardingProps {
  candidate: CandidateWithFormData;
  onBack: () => void;
  isReadOnly?: boolean;
}

/**
 * User view props
 */
export interface UserOnboardingProps {
  candidate: Candidate;
}

/**
 * Status badge props
 */
export interface StatusBadgeProps {
  status: OnboardingStatus;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * Progress tracker props
 */
export interface ProgressTrackerProps {
  currentStep: number;
  completedSteps: boolean[];
  sections: string[];
  onStepChange: (step: number) => void;
}

/**
 * Auto-save state
 */
export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasChanges: boolean;
  error: string | null;
}

/**
 * Local storage keys
 */
export enum StorageKeys {
  FORM_DATA = "onboarding_form_data",
  PROGRESS = "onboarding_progress",
  LAST_SECTION = "onboarding_last_section",
}

/**
 * Event types for analytics
 */
export enum OnboardingEvent {
  STARTED = "onboarding_started",
  SECTION_COMPLETED = "section_completed",
  FORM_SUBMITTED = "form_submitted",
  SAVED = "progress_saved",
  ERROR = "onboarding_error",
}

/**
 * Analytics payload
 */
export interface AnalyticsPayload {
  event: OnboardingEvent;
  candidateId: string;
  timestamp: string;
  metadata?: {
    sectionIndex?: number;
    sectionName?: string;
    completedSections?: number;
    errorMessage?: string;
  };
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  emailReminders: boolean;
  smsReminders: boolean;
  reminderFrequency: "daily" | "every_3_days" | "weekly";
}

/**
 * Admin dashboard filters
 */
export interface OnboardingFilters {
  status?: OnboardingStatus | "all";
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  position?: string;
  department?: string;
}

/**
 * Bulk actions
 */
export enum BulkAction {
  SEND_REMINDER = "send_reminder",
  MARK_COMPLETE = "mark_complete",
  DELETE = "delete",
  EXPORT = "export",
}

export interface BulkActionPayload {
  action: BulkAction;
  candidateIds: string[];
}

/**
 * Export format
 */
export enum ExportFormat {
  CSV = "csv",
  XLSX = "xlsx",
  PDF = "pdf",
  JSON = "json",
}

export interface ExportOptions {
  format: ExportFormat;
  includeFormData: boolean;
  candidateIds?: string[];
  filters?: OnboardingFilters;
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  candidateId: string;
  action: string;
  performedBy: string;
  timestamp: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ipAddress?: string;
}

/**
 * System configuration
 */
export interface OnboardingConfig {
  maxSections: number;
  autoSaveInterval: number; // milliseconds
  linkExpirationDays: number;
  reminderSchedule: {
    firstReminder: number; // days before start date
    secondReminder: number;
    finalReminder: number;
  };
  requiredDocuments: string[];
  supportContact: {
    email: string;
    phone: string;
  };
}
