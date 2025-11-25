export const DEFAULT_INTERVIEW_FILTERS = {
  searchTerm: '',
  status: 'All Statuses',
  dateFilter: 'All Dates',
  stage: 'All Stages',
} as const;

export const POSITION_STATUSES = {
  DRAFT: 'Draft',
  OPEN: 'Open',
  CLOSED: 'Closed',
} as const;

export type PositionStatus = typeof POSITION_STATUSES[keyof typeof POSITION_STATUSES];

export const POSITION_STATUS_OPTIONS = [
  POSITION_STATUSES.DRAFT,
  POSITION_STATUSES.OPEN,
  POSITION_STATUSES.CLOSED,
] as const;
