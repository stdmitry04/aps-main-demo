# Hiring Module - Field Mappings (snake_case → camelCase)

## Applicants & Positions Pages Only

### Position Model
| Backend (snake_case) | Frontend (camelCase) | Type | Description |
|---------------------|---------------------|------|-------------|
| `id` | `id` | UUID | Position ID |
| `district` | `district` | UUID | District ID |
| `req_id` | `reqId` | string | Requisition ID |
| `title` | `title` | string | Job title |
| `department` | `department` | string | Department name |
| `worksite` | `worksite` | string | Work location |
| `primary_job_title` | `primaryJobTitle` | string | Primary job title |
| `fte` | `fte` | decimal | Full-time equivalent |
| `salary_range` | `salaryRange` | string | Salary range |
| `start_date` | `startDate` | date | Position start date |
| `probation_date` | `probationDate` | date | Probation end date |
| `status` | `status` | string | Draft/Open/Closed |
| `employee_category` | `employeeCategory` | string | Employee category |
| `eeoc_classification` | `eeocClassification` | string | EEOC classification |
| `workers_comp_classification` | `workersCompClassification` | string | Workers comp class |
| `leave_plan` | `leavePlan` | string | Leave plan |
| `deduction_template` | `deductionTemplate` | string | Deduction template |
| `description` | `description` | string | Job description |
| `requirements` | `requirements` | string | Job requirements |
| `posting_start_date` | `postingStartDate` | date | Posting start date |
| `posting_end_date` | `postingEndDate` | date | Posting end date |
| `interview_stages` | `interviewStages` | number | Number of stages |
| `screening_questions` | `screeningQuestions` | array | Screening questions |
| `template` | `template` | UUID | Template reference |
| `created_at` | `createdAt` | datetime | Created timestamp |
| `updated_at` | `updatedAt` | datetime | Updated timestamp |
| `is_active` | `isActive` | boolean | Active status |

### JobApplication Model
| Backend (snake_case) | Frontend (camelCase) | Type | Description |
|---------------------|---------------------|------|-------------|
| `id` | `id` | UUID | Application ID |
| `district` | `district` | UUID | District ID |
| `position` | `position` | UUID | Position ID |
| `applicant_name` | `applicantName` | string | Applicant full name |
| `applicant_email` | `applicantEmail` | email | Applicant email |
| `applicant_phone` | `applicantPhone` | string | Phone number |
| `start_date_availability` | `startDateAvailability` | date | Available start date |
| `screening_answers` | `screeningAnswers` | object | Screening responses |
| `resume` | `resume` | file | Resume file |
| `cover_letter` | `coverLetter` | string | Cover letter text |
| `stage` | `stage` | string | Application Review/Screening/Interview/Reference Check/Offer |
| `current_role` | `currentRole` | string | Current job title |
| `years_experience` | `yearsExperience` | number | Years of experience |
| `certified` | `certified` | boolean | Has certification? |
| `internal` | `internal` | boolean | Internal candidate? |
| `current_interview_stage` | `currentInterviewStage` | number | Current stage number |
| `completed_interview_stages` | `completedInterviewStages` | number | Completed stages |
| `submitted_at` | `submittedAt` | datetime | Submission timestamp |
| `created_at` | `createdAt` | datetime | Created timestamp |
| `updated_at` | `updatedAt` | datetime | Updated timestamp |
| `is_active` | `isActive` | boolean | Active status |

### InterviewStage Model
| Backend (snake_case) | Frontend (camelCase) | Type | Description |
|---------------------|---------------------|------|-------------|
| `id` | `id` | UUID | Stage ID |
| `district` | `district` | UUID | District ID |
| `position` | `position` | UUID | Position ID |
| `stage_number` | `stageNumber` | number | Stage sequence |
| `stage_name` | `stageName` | string | Stage name |
| `created_at` | `createdAt` | datetime | Created timestamp |
| `updated_at` | `updatedAt` | datetime | Updated timestamp |
| `is_active` | `isActive` | boolean | Active status |

### Interview Model
| Backend (snake_case) | Frontend (camelCase) | Type | Description |
|---------------------|---------------------|------|-------------|
| `id` | `id` | UUID | Interview ID |
| `district` | `district` | UUID | District ID |
| `application` | `application` | UUID | Application ID |
| `stage` | `stage` | UUID | Interview stage ID |
| `scheduled_time` | `scheduledTime` | datetime | Scheduled time |
| `duration_minutes` | `durationMinutes` | number | Duration |
| `location` | `location` | string | Interview location |
| `interviewers` | `interviewers` | array | Interviewer IDs |
| `status` | `status` | string | scheduled/completed/cancelled/no_show |
| `feedback` | `feedback` | string | Interview feedback |
| `rating` | `rating` | number | Rating (1-5) |
| `created_at` | `createdAt` | datetime | Created timestamp |
| `updated_at` | `updatedAt` | datetime | Updated timestamp |
| `is_active` | `isActive` | boolean | Active status |

## Usage Example

```typescript
// Before (snake_case from API)
const application = {
  applicant_name: "John Doe",
  applicant_email: "john@example.com",
  start_date_availability: "2024-09-01",
  years_experience: 5,
  current_interview_stage: 2,
  completed_interview_stages: 1
}

// After (camelCase for frontend)
const application = {
  applicantName: "John Doe",
  applicantEmail: "john@example.com",
  startDateAvailability: "2024-09-01",
  yearsExperience: 5,
  currentInterviewStage: 2,
  completedInterviewStages: 1
}
```

## Pages Affected
- `/hiring/positions` - Position list and management
- `/hiring/applicants` - Applicant tracking and management

## Other Pages (NO CHANGES)
- `/hiring/interviews` - Leave as-is
- `/hiring/offers` - Leave as-is
- `/hiring/onboarding` - Leave as-is
- `/hiring/reports` - Leave as-is

## Transformation Applied
- Use `transformKeysToCamel()` from `lib/utils/caseTransform.ts` on API responses
- Use `transformKeysToSnake()` from `lib/utils/caseTransform.ts` when sending data to API
