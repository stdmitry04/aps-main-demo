export interface InterviewFilters {
  searchTerm: string;
  statusFilter: string;
  dateFilter: string;
  districtFilter: string;
  positionFilter: string;
}

export interface InterviewScheduleData {
  application_id: string;
  stage_id: string;
  scheduled_date: string;
  scheduled_time: string;
  location: string;
}

export interface InterviewStats {
  total_interviews: number;
  scheduled: number;
  completed: number;
  upcoming_this_week: number;
  today: number;
}

export interface InterviewStageConfig {
  stageNumber: number;
  stageName: string;
  interviewers: Array<{
    name: string;
    email: string;
    role: string;
  }>;
}

export interface Interview {
  id: string;
  applicantName: string;
  applicantEmail: string;
  positionTitle: string;
  stage: string;
  date: string;
  time: string;
  location: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
  interviewers: string[];
  notes?: string;
}
