// ============================================================================
// Onboarding Types - Consolidated
// All onboarding-related types in one place
// ============================================================================

// ============================================================================
// Status Types
// ============================================================================

export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed' | 'submitted';

// ============================================================================
// Candidate Types
// ============================================================================

export interface OnboardingCandidate {
    id: string;
    name: string;
    email: string;
    position: string;
    offerDate: string;
    status: OnboardingStatus;
    completedSections: number;
    lastUpdated?: string | null;
    progressPercentage?: number;
}

export type Candidate = OnboardingCandidate;

export interface CandidateWithFormData extends OnboardingCandidate {
  personalInfo?: PersonalInformation;
  employmentDetails?: EmploymentDetails;
  i9Form?: I9Form;
  taxWithholdings?: TaxWithholdings;
  paymentMethod?: PaymentMethod;
  timeOff?: TimeOff;
  deductions?: Deductions;
  emergencyContact?: EmergencyContact;
  startDate?: string;
  submittedAt?: string | null;
}

export interface OnboardingData {
    candidateId: string;
    candidateName: string;
    candidateEmail: string;
    position: string;
    status: OnboardingStatus;
    startDate: string;
    completionDate?: string;
    personalInformation?: {
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        ssn: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        phone: string;
        email: string;
    };
    emergencyContact?: {
        name: string;
        relationship: string;
        phone: string;
        email?: string;
    };
    i9Verification?: {
        citizenshipStatus: string;
        documentType: string;
        documentNumber: string;
        expirationDate?: string;
    };
    taxWithholdings?: {
        filingStatus: string;
        allowances: number;
        additionalWithholding?: number;
    };
    paymentMethod?: {
        paymentType: 'direct_deposit' | 'check';
        bankName?: string;
        routingNumber?: string;
        accountNumber?: string;
    };
    deductions?: {
        healthInsurance?: boolean;
        dentalInsurance?: boolean;
        visionInsurance?: boolean;
        retirement401k?: boolean;
        retirement403b?: boolean;
    };
    employmentDetails?: {
        startDate: string;
        department: string;
        worksite: string;
        fte: number;
        salary: number;
        employeeCategory: string;
    };
    timeOff?: {
        vacationDays: number;
        sickDays: number;
        personalDays: number;
    };
}

// ============================================================================
// Form Section Types
// ============================================================================

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

export interface PaymentMethod {
  paymentMethod: "paper_check" | "direct_deposit";
  bankName?: string;
  accountType?: "Checking" | "Savings";
  accountNumber?: string;
  routingNumber?: string;
  nameOnAccount?: string;
}

export interface TimeOff {
  sickDaysUnderstanding: boolean;
  vacationDaysUnderstanding: boolean;
  holidaysUnderstanding: boolean;
  timeOffContactName?: string;
  timeOffContactEmail?: string;
}

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

// ============================================================================
// Applicant & Onboarding Integration Types
// ============================================================================

export interface ApplicantWithOnboardingStatus {
    id: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone?: string;
    positionTitle: string;
    positionReqId: string;
    stage: 'Application Review' | 'Screening' | 'Interview' | 'Reference Check' | 'Offer' | 'Rejected';
    submittedAt: string;
    offerDate?: string;
    offerStatus?: 'Pending' | 'Accepted' | 'Declined' | 'Expired' | 'Withdrawn';
    startDate?: string;
    hasOnboarding: boolean;
    onboardingId?: string;
    onboardingStatus?: OnboardingStatus;
    onboardingProgress?: number;
    jobApplicationId: string;
}

export interface SendOnboardingPayload {
    name: string;
    email: string;
    position: string;
    offerDate: string;
    startDate?: string;
    jobApplication: string;
}

export interface OnboardingCreationResult {
    success: boolean;
    candidateId?: string;
    error?: string;
    message?: string;
}

export interface ApplicantsWithoutOnboardingFilters {
    search?: string;
    position?: string;
    offerStatus?: 'Pending' | 'Accepted' | 'all';
    sortBy?: 'name' | 'position' | 'offer_date' | 'submitted_at';
    sortOrder?: 'asc' | 'desc';
}

export interface BulkOnboardingPayload {
    applicantIds: string[];
}

export interface BulkOnboardingResult {
    successCount: number;
    failedCount: number;
    results: {
        applicantId: string;
        success: boolean;
        candidateId?: string;
        error?: string;
    }[];
}

// ============================================================================
// Section Metadata
// ============================================================================

export interface SectionMetadata {
  name: string;
  index: number;
  isCompleted: boolean;
  lastSaved?: string;
}

// ============================================================================
// Progress and Update Types
// ============================================================================

export interface ProgressUpdatePayload {
  candidateId: string;
  completedSections: number;
  status: OnboardingStatus;
  sectionName?: string;
  sectionData?: any;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface OnboardingApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CandidateResponse extends OnboardingApiResponse {
  data?: Candidate;
}

export interface ProgressResponse extends OnboardingApiResponse {
  data?: {
    candidateId: string;
    completedSections: number;
    status: OnboardingStatus;
    lastUpdated: string;
  };
}

export interface SubmitResponse extends OnboardingApiResponse {
  data?: {
    candidateId: string;
    status: OnboardingStatus;
    submittedAt: string;
  };
}

// ============================================================================
// Email Types
// ============================================================================

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

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: ValidationError[];
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface SectionProps {
  candidate: Candidate;
  onDataChange?: (data: any) => void;
  initialData?: any;
}

export interface AdminOnboardingProps {
  candidate: CandidateWithFormData;
  onBack: () => void;
  isReadOnly?: boolean;
}

export interface UserOnboardingProps {
  candidate: Candidate;
}

export interface StatusBadgeProps {
  status: OnboardingStatus;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export interface ProgressTrackerProps {
  currentStep: number;
  completedSteps: boolean[];
  sections: string[];
  onStepChange: (step: number) => void;
}

// ============================================================================
// Auto-save Types
// ============================================================================

export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasChanges: boolean;
  error: string | null;
}

// ============================================================================
// Storage and Event Types
// ============================================================================

export enum StorageKeys {
  FORM_DATA = "onboarding_form_data",
  PROGRESS = "onboarding_progress",
  LAST_SECTION = "onboarding_last_section",
}

export enum OnboardingEvent {
  STARTED = "onboarding_started",
  SECTION_COMPLETED = "section_completed",
  FORM_SUBMITTED = "form_submitted",
  SAVED = "progress_saved",
  ERROR = "onboarding_error",
}

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

// ============================================================================
// Notification Types
// ============================================================================

export interface NotificationPreferences {
  emailReminders: boolean;
  smsReminders: boolean;
  reminderFrequency: "daily" | "every_3_days" | "weekly";
}

// ============================================================================
// Admin Dashboard Types
// ============================================================================

export interface OnboardingFilters {
  status?: OnboardingStatus | "all";
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  position?: string;
  department?: string;
}

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

// ============================================================================
// Export Types
// ============================================================================

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

// ============================================================================
// Audit Log Types
// ============================================================================

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

// ============================================================================
// Configuration Types
// ============================================================================

export interface OnboardingConfig {
  maxSections: number;
  autoSaveInterval: number;
  linkExpirationDays: number;
  reminderSchedule: {
    firstReminder: number;
    secondReminder: number;
    finalReminder: number;
  };
  requiredDocuments: string[];
  supportContact: {
    email: string;
    phone: string;
  };
}
