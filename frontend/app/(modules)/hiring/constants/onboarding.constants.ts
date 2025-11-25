export const ONBOARDING_STATUSES = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SUBMITTED: 'submitted',
} as const;

export type OnboardingStatus = typeof ONBOARDING_STATUSES[keyof typeof ONBOARDING_STATUSES];

export const ONBOARDING_STATUS_OPTIONS = [
  ONBOARDING_STATUSES.NOT_STARTED,
  ONBOARDING_STATUSES.IN_PROGRESS,
  ONBOARDING_STATUSES.COMPLETED,
  ONBOARDING_STATUSES.SUBMITTED,
] as const;

export const ONBOARDING_STATUS_LABELS: Record<OnboardingStatus, string> = {
  [ONBOARDING_STATUSES.NOT_STARTED]: 'Not Started',
  [ONBOARDING_STATUSES.IN_PROGRESS]: 'In Progress',
  [ONBOARDING_STATUSES.COMPLETED]: 'Completed',
  [ONBOARDING_STATUSES.SUBMITTED]: 'Submitted',
};

export const ONBOARDING_STATUS_COLORS: Record<OnboardingStatus, string> = {
  [ONBOARDING_STATUSES.NOT_STARTED]: 'bg-gray-100 text-gray-800',
  [ONBOARDING_STATUSES.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [ONBOARDING_STATUSES.COMPLETED]: 'bg-green-100 text-green-800',
  [ONBOARDING_STATUSES.SUBMITTED]: 'bg-purple-100 text-purple-800',
};
