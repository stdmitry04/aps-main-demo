export interface BrandColors {
  primary: string;
  secondary: string;
  ink: string;
  bg: string;
  subtle: string;
}

export interface SD308Type {
  name: string;
  short: string;
  brand: BrandColors;
}

export interface WeekRow {
  day: string;

  /** Legacy single-pair clock times (still supported for manual entry) */
  in: string;
  out: string;

  /** New: supports multiple clock sessions per day */
  sessions?: {
    in: string;
    out: string | null;
    note?: string;
    dutyCode?: string;
    type?: string;
    programTag?: string;
    grantCode?: string;
    costCenter?: string;
  }[];


  type: string;
  note: string;
  edits: number;
  meal: boolean;
  splitShift: boolean;
  period: string;
  courseId: string;
  room: string;
  dutyCode: string;
  rosterCount: number;
  requiresPara: boolean;
  oneOnOneMinutes: number;
  programTag: string;
  grantCode: string;
  costCenter: string;
  location: string;
}


export interface ComplianceAlert {
  type: string;
  day: string;
  sev: "high" | "med" | "low";
}

export interface PayrollAlert {
  type: string;
  day: string;
  sev: "high" | "med" | "low";
}

export interface SubSuggestion {
  id: string;
  name: string;
  roles: string[];
  sites: string[];
  rating: number;
  distance: number;
}

export interface Absence {
  day: string;
  role: string;
  site: string;
  subRequired: boolean;
  reason: string;
}

export interface PredictiveMetrics {
  absenteeNext14d: number;
  attrition90d: number;
  otForecastHrs: number;
  coverageRiskPct: number;
}

export interface ClockState {
  isIn: boolean;
  startedAt: string | null;
  forDay: string;
}

export interface GeoState {
  ok: boolean;
  site: string;
}

export interface BellScheduleSlot {
  period: string;
  start: string;
  end: string;
}

export interface AttendanceCodeMapping {
  ta: string;
  sis: string;
}

export type PillTone = "gray" | "green" | "yellow" | "red";
export type TimesheetStatus = "Draft" | "Submitted" | "Returned" | "Approved" | "Exported";
export type HoursType = "Regular" | "Overtime" | "Unpaid" | "Sick" | "Personal";

export interface TimesheetProps {
  employeeId?: string;
  employeeName?: string;
  defaultRole?: string;
  defaultSite?: string;
  defaultUnit?: string;
  payPeriodStart?: string;
  payPeriodEnd?: string;
  initialWeekData?: WeekRow[];
  initialStatus?: TimesheetStatus;
  bellSchedule?: BellScheduleSlot[];
  attendanceCodes?: AttendanceCodeMapping[];
  onSubmit?: (week: WeekRow[], status: TimesheetStatus) => void;
  onExport?: (data: string, format: string) => void;
  readOnly?: boolean;
  showPredictiveInsights?: boolean;
  showCoverage?: boolean;
  showCompliance?: boolean;
}

export interface TimeEntry {
  id: string;
  timecard: string;
  clockIn: string;
  clockOut: string | null;
  breakDuration: number;
  notes: string;
  duration: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  geoVerified?: boolean;
  clockInLocation?: string;
}

export interface Timecard {
  id: string;
  status: 'draft' | 'overdue' | 'pending_approval' | 'approved' | 'denied';
  periodStart: string;
  periodEnd: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewNotes: string;
  timeEntries: TimeEntry[];
  totalHours: number;
  isEditable: boolean;
  createdAt: string;
  updatedAt: string;
  overtimeReason?: string | null;
  approvedOvertimeRequests?: any[];
}