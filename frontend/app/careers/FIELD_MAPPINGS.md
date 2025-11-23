# Careers Page - Field Mappings (snake_case → camelCase)

## Backend API Fields (snake_case) → Frontend Fields (camelCase)

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

### ScreeningQuestion Model
| Backend (snake_case) | Frontend (camelCase) | Type | Description |
|---------------------|---------------------|------|-------------|
| `id` | `id` | UUID | Question ID |
| `district` | `district` | UUID | District ID |
| `question` | `question` | string | Question text |
| `category` | `category` | string | certification/experience/skills/availability/general |
| `required` | `required` | boolean | Is required? |
| `created_at` | `createdAt` | datetime | Created timestamp |
| `updated_at` | `updatedAt` | datetime | Updated timestamp |
| `is_active` | `isActive` | boolean | Active status |

## Usage Example

```typescript
// Before (snake_case from API)
const position = {
  req_id: "REQ-2024-001",
  primary_job_title: "Math Teacher",
  start_date: "2024-09-01",
  posting_end_date: "2024-08-15",
  screening_questions: [...]
}

// After (camelCase for frontend)
const position = {
  reqId: "REQ-2024-001",
  primaryJobTitle: "Math Teacher",
  startDate: "2024-09-01",
  postingEndDate: "2024-08-15",
  screeningQuestions: [...]
}
```

## Transformation Applied
- Use `transformKeysToCamel()` from `lib/utils/caseTransform.ts` on API responses
- Use `transformKeysToSnake()` from `lib/utils/caseTransform.ts` when sending data to API
