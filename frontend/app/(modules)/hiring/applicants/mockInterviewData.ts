// Mock data for interview stages and interviewers by position

export interface InterviewerInfo {
  name: string;
  email: string;
  role: string;
}

export interface InterviewStageConfig {
  stageNumber: number;
  stageName: string;
  interviewers: InterviewerInfo[];
}

export interface PositionInterviewConfig {
  positionReqId: string;
  positionTitle: string;
  interviewStages: InterviewStageConfig[];
}

// Mock interviewers
export const mockInterviewers: InterviewerInfo[] = [
  { name: "Dr. Sarah Johnson", email: "sarah.johnson@district.edu", role: "Principal" },
  { name: "Michael Chen", email: "michael.chen@district.edu", role: "Assistant Principal" },
  { name: "Patricia Williams", email: "patricia.williams@district.edu", role: "Department Head - Science" },
  { name: "Robert Martinez", email: "robert.martinez@district.edu", role: "Department Head - Math" },
  { name: "Jennifer Davis", email: "jennifer.davis@district.edu", role: "HR Director" },
  { name: "David Thompson", email: "david.thompson@district.edu", role: "Superintendent" },
  { name: "Lisa Anderson", email: "lisa.anderson@district.edu", role: "Curriculum Director" },
  { name: "James Taylor", email: "james.taylor@district.edu", role: "Department Head - English" },
  { name: "Maria Garcia", email: "maria.garcia@district.edu", role: "Special Education Director" },
  { name: "William Brown", email: "william.brown@district.edu", role: "Lead Teacher - Science" },
];

// Position-specific interview configurations
export const positionInterviewConfigs: PositionInterviewConfig[] = [
  {
    positionReqId: 'REQ-2025-0193',
    positionTitle: 'High School Chemistry Teacher',
    interviewStages: [
      {
        stageNumber: 1,
        stageName: 'Initial Screening',
        interviewers: [
          { name: "Jennifer Davis", email: "jennifer.davis@district.edu", role: "HR Director" },
        ]
      },
      {
        stageNumber: 2,
        stageName: 'Department Interview',
        interviewers: [
          { name: "Patricia Williams", email: "patricia.williams@district.edu", role: "Department Head - Science" },
          { name: "William Brown", email: "william.brown@district.edu", role: "Lead Teacher - Science" },
        ]
      },
      {
        stageNumber: 3,
        stageName: 'Final Interview with Leadership',
        interviewers: [
          { name: "Dr. Sarah Johnson", email: "sarah.johnson@district.edu", role: "Principal" },
          { name: "Michael Chen", email: "michael.chen@district.edu", role: "Assistant Principal" },
          { name: "David Thompson", email: "david.thompson@district.edu", role: "Superintendent" },
        ]
      }
    ]
  },
  {
    positionReqId: 'REQ-2025-0194',
    positionTitle: 'Special Education Teacher',
    interviewStages: [
      {
        stageNumber: 1,
        stageName: 'Initial Screening',
        interviewers: [
          { name: "Jennifer Davis", email: "jennifer.davis@district.edu", role: "HR Director" },
        ]
      },
      {
        stageNumber: 2,
        stageName: 'Special Education Department Panel',
        interviewers: [
          { name: "Maria Garcia", email: "maria.garcia@district.edu", role: "Special Education Director" },
          { name: "Dr. Sarah Johnson", email: "sarah.johnson@district.edu", role: "Principal" },
        ]
      },
      {
        stageNumber: 3,
        stageName: 'Teaching Demonstration',
        interviewers: [
          { name: "Maria Garcia", email: "maria.garcia@district.edu", role: "Special Education Director" },
          { name: "Lisa Anderson", email: "lisa.anderson@district.edu", role: "Curriculum Director" },
        ]
      }
    ]
  },
  {
    positionReqId: 'REQ-2025-0195',
    positionTitle: 'ESL/Bilingual Teacher',
    interviewStages: [
      {
        stageNumber: 1,
        stageName: 'Phone Screening',
        interviewers: [
          { name: "Jennifer Davis", email: "jennifer.davis@district.edu", role: "HR Director" },
        ]
      },
      {
        stageNumber: 2,
        stageName: 'Department Interview',
        interviewers: [
          { name: "James Taylor", email: "james.taylor@district.edu", role: "Department Head - English" },
          { name: "Lisa Anderson", email: "lisa.anderson@district.edu", role: "Curriculum Director" },
        ]
      }
    ]
  },
  {
    positionReqId: 'REQ-RIVERSIDE-20240002',
    positionTitle: 'Riverside High School Math Teacher',
    interviewStages: [
      {
        stageNumber: 1,
        stageName: 'Initial HR Screening',
        interviewers: [
          { name: "Jennifer Davis", email: "jennifer.davis@district.edu", role: "HR Director" },
        ]
      },
      {
        stageNumber: 2,
        stageName: 'Department Interview',
        interviewers: [
          { name: "Robert Martinez", email: "robert.martinez@district.edu", role: "Department Head - Math" },
          { name: "Dr. Sarah Johnson", email: "sarah.johnson@district.edu", role: "Principal" },
        ]
      },
      {
        stageNumber: 3,
        stageName: 'Final Interview with Leadership',
        interviewers: [
          { name: "Dr. Sarah Johnson", email: "sarah.johnson@district.edu", role: "Principal" },
          { name: "David Thompson", email: "david.thompson@district.edu", role: "Superintendent" },
        ]
      }
    ]
  },
];

// Helper function to get interview config for a position
export function getInterviewConfigForPosition(positionReqId: string): PositionInterviewConfig | undefined {
  return positionInterviewConfigs.find(config => config.positionReqId === positionReqId);
}
