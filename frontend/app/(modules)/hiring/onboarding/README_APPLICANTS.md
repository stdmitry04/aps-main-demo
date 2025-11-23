# Applicants Without Onboarding Feature

This feature allows HR staff to view applicants who have received job offers but haven't been sent onboarding invitations yet. It follows the **MVVMC (Model-View-ViewModel-Controller)** architectural pattern for clean separation of concerns.

## Architecture Overview

### MVVMC Pattern

```
┌─────────────────────────────────────────────────────────┐
│                        User Interface                    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  View (ApplicantsWithoutOnboardingView.tsx)             │
│  - Pure presentation component                           │
│  - No business logic                                     │
│  - Receives data and callbacks via props                 │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Controller (ApplicantsWithoutOnboarding.tsx)           │
│  - Connects View with ViewModel                          │
│  - Handles user interactions                             │
│  - Manages component state                               │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  ViewModel (useApplicantsWithoutOnboarding.ts)          │
│  - Business logic                                        │
│  - Data fetching and transformation                      │
│  - State management                                      │
│  - API interactions                                      │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Model (applicant-onboarding.types.ts)                  │
│  - Type definitions                                      │
│  - Data structures                                       │
│  - Interface contracts                                   │
└─────────────────────────────────────────────────────────┘
```

## File Structure

```
frontend/
├── app/(modules)/hiring/onboarding/
│   ├── applicants/
│   │   └── page.tsx                          # Page route
│   ├── components/
│   │   ├── ApplicantsWithoutOnboarding.tsx   # Controller
│   │   ├── ApplicantsWithoutOnboardingView.tsx # View
│   │   └── index.ts
│   └── hooks/
│       ├── useApplicantsWithoutOnboarding.ts # ViewModel
│       └── index.ts
└── types/onboarding/
    ├── applicant-onboarding.types.ts         # Model
    └── index.ts
```

## Component Breakdown

### 1. Model Layer (`applicant-onboarding.types.ts`)

**Responsibility**: Define data structures and type contracts

**Key Types**:
- `ApplicantWithOnboardingStatus` - Main data model for an applicant
- `SendOnboardingPayload` - Payload for creating onboarding
- `OnboardingCreationResult` - Result of onboarding creation
- `ApplicantsWithoutOnboardingFilters` - Filter configuration
- `BulkOnboardingPayload` & `BulkOnboardingResult` - Bulk operations

### 2. ViewModel Layer (`useApplicantsWithoutOnboarding.ts`)

**Responsibility**: Business logic and data management

**Features**:
- Fetches applicants from hiring module
- Fetches offers from hiring module
- Fetches onboarding candidates from onboarding module
- Combines and transforms data
- Manages filters and sorting
- Handles single and bulk onboarding creation
- Calculates statistics

**Key Functions**:
```typescript
const {
  applicants,              // Raw applicants data
  filteredApplicants,      // Filtered and sorted applicants
  loading,                 // Loading state
  error,                   // Error state
  filters,                 // Current filters
  stats,                   // Statistics
  fetchApplicants,         // Refresh data
  sendOnboarding,          // Send to single applicant
  bulkSendOnboarding,      // Send to multiple applicants
  setFilters,              // Update filters
  clearFilters,            // Reset filters
} = useApplicantsWithoutOnboarding();
```

### 3. Controller Layer (`ApplicantsWithoutOnboarding.tsx`)

**Responsibility**: Connect View with ViewModel and handle user interactions

**Key Functions**:
- `handleSendOnboarding` - Sends onboarding to single applicant
- `handleBulkSendOnboarding` - Sends onboarding to multiple applicants
- `handleFilterChange` - Updates filters
- `handleRefresh` - Refreshes data

### 4. View Layer (`ApplicantsWithoutOnboardingView.tsx`)

**Responsibility**: Pure presentation - renders UI based on props

**Features**:
- Statistics cards (Total, Accepted, Pending, Awaiting)
- Search and filter controls
- Bulk selection with checkboxes
- Data table with applicant information
- Individual and bulk action buttons
- Loading and empty states
- Error display

## Data Flow

### Fetching Applicants

1. **User** navigates to `/hiring/onboarding/applicants`
2. **Page** renders `ApplicantsWithoutOnboarding` controller
3. **Controller** uses `useApplicantsWithoutOnboarding` hook
4. **Hook** automatically fetches on mount:
   - GET `/hiring/applications/?stage=Offer`
   - GET `/hiring/offers/`
   - GET `/onboarding/candidates/`
5. **Hook** transforms and combines data
6. **Hook** filters out applicants who already have onboarding
7. **Controller** passes data to View
8. **View** renders the UI

### Sending Onboarding (Single)

1. **User** clicks "Send Onboarding" button
2. **View** calls `onSendOnboarding(applicantId)`
3. **Controller** handles the call with `handleSendOnboarding`
4. **Controller** calls `sendOnboarding` from hook
5. **Hook**:
   - Validates applicant doesn't already have onboarding
   - Prepares payload with applicant data
   - POST `/onboarding/candidates/` with payload
   - Refreshes applicants list
   - Returns success/error result
6. **Controller** displays result (alert/toast)
7. **View** updates with new data

### Sending Onboarding (Bulk)

1. **User** selects multiple applicants via checkboxes
2. **User** clicks "Send Onboarding to X" button
3. **View** calls `onBulkSendOnboarding(applicantIds)`
4. **Controller** handles with `handleBulkSendOnboarding`
5. **Controller** calls `bulkSendOnboarding` from hook
6. **Hook**:
   - Iterates through each applicant ID
   - Calls `sendOnboarding` for each
   - Collects success/failure results
   - Returns summary
7. **Controller** displays summary
8. **View** clears selections and updates

## API Integration

### Endpoints Used

#### Read Operations
- `GET /hiring/applications/?stage=Offer` - Fetch applicants with offers
- `GET /hiring/offers/` - Fetch all job offers
- `GET /onboarding/candidates/` - Fetch existing onboarding candidates

#### Write Operations
- `POST /onboarding/candidates/` - Create new onboarding candidate

### Request Format (Create Onboarding)

```json
{
  "name": "John Doe",
  "email": "john.doe@email.com",
  "position": "High School Math Teacher",
  "offer_date": "2025-10-15",
  "start_date": "2025-11-01",
  "job_application": "123"
}
```

### Response Format

```json
{
  "id": "456",
  "name": "John Doe",
  "email": "john.doe@email.com",
  "position": "High School Math Teacher",
  "offer_date": "2025-10-15",
  "start_date": "2025-11-01",
  "status": "not_started",
  "completed_sections": 0,
  "access_token": "abc123...",
  "onboarding_url": "/onboarding/abc123...",
  "job_application": 123
}
```

## Features

### 1. Statistics Dashboard
- Total applicants with offers
- Applicants with accepted offers
- Applicants with pending offers
- Applicants awaiting onboarding invitations

### 2. Search and Filtering
- Search by name, email, position, or req ID
- Filter by offer status (All, Accepted, Pending)
- Automatic real-time filtering

### 3. Bulk Operations
- Select multiple applicants
- Send onboarding to all selected
- Select/deselect all checkbox

### 4. Data Display
- Applicant name and email with avatar
- Position title and requisition ID
- Offer status with color-coded badges
- Offer date and start date
- Individual action buttons

### 5. States
- Loading state with spinner
- Empty state when all applicants have onboarding
- Error state with message display

## Usage Example

### In a Page Component

```tsx
import { ApplicantsWithoutOnboarding } from '@/app/(modules)/hiring/onboarding/components';

export default function OnboardingManagementPage() {
  return (
    <Layout>
      <ApplicantsWithoutOnboarding />
    </Layout>
  );
}
```

### Using the Hook Directly

```tsx
import { useApplicantsWithoutOnboarding } from '@/app/(modules)/hiring/onboarding/hooks';

function CustomComponent() {
  const {
    filteredApplicants,
    loading,
    stats,
    sendOnboarding
  } = useApplicantsWithoutOnboarding();

  // Custom implementation
}
```

## Benefits of MVVMC Pattern

### 1. Separation of Concerns
- **Model**: Pure data types, no logic
- **View**: Pure presentation, no business logic
- **ViewModel**: All business logic, reusable
- **Controller**: Thin layer connecting View and ViewModel

### 2. Testability
- Each layer can be tested independently
- Mock data easily in any layer
- Business logic isolated in hook

### 3. Reusability
- Hook can be used in different components
- View can be rendered with different controllers
- Types are shared across the application

### 4. Maintainability
- Changes to business logic don't affect UI
- UI changes don't affect business logic
- Clear file structure and naming

### 5. Scalability
- Easy to add new features
- Simple to extend filters and actions
- Clean addition of new data sources

## Future Enhancements

### Potential Features
1. **Email Preview** - Preview onboarding email before sending
2. **Scheduling** - Schedule onboarding to be sent at specific time
3. **Templates** - Different onboarding templates per position type
4. **Notifications** - Real-time notifications when offers are accepted
5. **Analytics** - Track onboarding send rates and completion rates
6. **Export** - Export applicant list to CSV/Excel
7. **Batch Import** - Import multiple applicants from file

### Technical Improvements
1. Add React Query for better caching
2. Add optimistic updates
3. Add toast notifications instead of alerts
4. Add pagination for large datasets
5. Add advanced filtering (date ranges, departments)
6. Add sorting by multiple columns
7. Add column visibility controls

## Testing

### Unit Tests (Recommended)

```typescript
// Test the hook
describe('useApplicantsWithoutOnboarding', () => {
  it('should fetch applicants on mount', () => {});
  it('should filter applicants without onboarding', () => {});
  it('should send onboarding successfully', () => {});
  it('should handle errors gracefully', () => {});
});

// Test the view
describe('ApplicantsWithoutOnboardingView', () => {
  it('should render applicants table', () => {});
  it('should handle search input', () => {});
  it('should select/deselect applicants', () => {});
  it('should show empty state', () => {});
});
```

## Troubleshooting

### No applicants showing up
- Check that applications exist with stage "Offer"
- Verify offers are linked to applications
- Check API responses in Network tab

### Onboarding not sending
- Check that offer_date is provided
- Verify API endpoint is correct
- Check backend logs for errors

### Performance issues
- Implement pagination if >100 applicants
- Add debouncing to search input
- Use React.memo for View component

## Related Documentation
- [Onboarding Types Documentation](../../types/onboarding/README.md)
- [Backend API Documentation](../../../../server/onboarding/README.md)
- [MVVMC Architecture Guide](../../../../docs/ARCHITECTURE.md)
