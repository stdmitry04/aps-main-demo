export const OFFER_STATUSES = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
  EXPIRED: 'Expired',
  WITHDRAWN: 'Withdrawn',
} as const;

export type OfferStatus = typeof OFFER_STATUSES[keyof typeof OFFER_STATUSES];

export const OFFER_STATUS_OPTIONS = [
  OFFER_STATUSES.PENDING,
  OFFER_STATUSES.ACCEPTED,
  OFFER_STATUSES.DECLINED,
  OFFER_STATUSES.EXPIRED,
  OFFER_STATUSES.WITHDRAWN,
] as const;

export const OFFER_DATE_FILTERS = {
  ALL: 'All Dates',
  THIS_WEEK: 'This Week',
  THIS_MONTH: 'This Month',
  LAST_30_DAYS: 'Last 30 Days',
  EXPIRING_SOON: 'Expiring Soon',
} as const;

export const OFFER_DATE_FILTER_OPTIONS = [
  OFFER_DATE_FILTERS.ALL,
  OFFER_DATE_FILTERS.THIS_WEEK,
  OFFER_DATE_FILTERS.THIS_MONTH,
  OFFER_DATE_FILTERS.LAST_30_DAYS,
  OFFER_DATE_FILTERS.EXPIRING_SOON,
] as const;

export const OFFER_LETTER_TEMPLATE = `{{districtName}}
{{districtAddress}}

{{offerDate}}

Dear {{candidateName}},

We are pleased to offer you the position of {{positionTitle}} with {{districtName}}. We were impressed by your qualifications and believe you will be an excellent addition to our team.

POSITION DETAILS:
- Position Title: {{positionTitle}}
- Department: {{department}}
- Worksite: {{worksite}}
- FTE (Full-Time Equivalent): {{fte}}
- Salary: {{salary}}
- Start Date: {{startDate}}

BENEFITS PACKAGE:
{{benefits}}

This offer is contingent upon successful completion of a background check and verification of your credentials. This offer will expire on {{expirationDate}}.

We are excited about the possibility of you joining our team and look forward to your response.

Sincerely,

{{hrDirectorName}}
{{hrDirectorTitle}}
{{districtName}}
`;

export const OFFER_TEMPLATE_FIELDS = [
  'districtName',
  'districtAddress',
  'offerDate',
  'candidateName',
  'positionTitle',
  'department',
  'worksite',
  'fte',
  'salary',
  'startDate',
  'benefits',
  'expirationDate',
  'hrDirectorName',
  'hrDirectorTitle',
] as const;
