export interface Interviewer {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface InterviewStage {
  id: string;
  stageNumber: number;
  stageName: string;
  interviewers: Interviewer[];
}

export interface InterviewStageFormData {
  name: string;
  interviewers: string[]; // email addresses
}

export interface PositionFormData {
  title: string;
  department: string;
  worksite: string;
  primaryJobTitle: string;
  reqId: string;
  fte: string;
  salaryRange: string;
  startDate: string;
  probationDate: string;
  status: 'Draft' | 'Open' | 'Closed';
  employeeCategory: string;
  eeocClassification: string;
  workersCompClassification: string;
  leavePlan: string;
  deductionTemplate: string;
  description: string;
  requirements: string;
  postingStartDate: string;
  postingEndDate: string;
  interviewStages: number;
  screeningQuestionIds?: string[];  // Changed from screeningQuestions
  stageData?: Array<{
    stageNumber: number;
    stageName: string;
    interviewerData: Array<{
      name: string;
      email: string;
      role: string;
    }>;
  }>;
}

export interface JobTemplate extends Omit<PositionFormData, 'title' | 'reqId' | 'startDate' | 'postingStartDate' | 'postingEndDate' | 'description' | 'requirements'> {
  id?: string;
  templateName: string;
  interviewStageDetails?: InterviewStageFormData[];
}

export interface Position {
  id?: string;
  reqId: string;
  title: string;
  worksite: string;
  department: string;
  status: 'Open' | 'Draft' | 'Closed';
  fte: number;
  salaryRange: string;
  startDate: string;
  postingStartDate?: string;
  postingEndDate?: string;
  applicantCount: number;
  interviewCount: number;
  isOpen: boolean;
  createdAt: string;
  stages?: InterviewStage[];  // Interview stages with interviewers
  interviewStages?: number;   // Number of interview stages
}
