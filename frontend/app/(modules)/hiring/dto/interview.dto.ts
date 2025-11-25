/**
 * Data Transfer Objects for Interview data
 * Maps between frontend UI models and backend API models
 */

// Frontend UI Model (used in components)
export interface InterviewUI {
    id: string;
    candidateName: string;
    candidateEmail: string;
    position: string;
    positionReqId: string;
    stage: number;
    stageName: string;
    scheduledDate: string; // YYYY-MM-DD format
    scheduledTime: string; // e.g., "10:00 AM"
    interviewers: InterviewerUI[];
    status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
    location: string;
    district: string;
    notes?: string;
    feedback?: string;
    rating?: number;
    zoomLink?: string;
    applicationId: string;
    stageId: string;
}

export interface InterviewerUI {
    id: string;
    name: string;
    email: string;
    role: string;
}

// Backend API Model (from Django serializer)
// Note: After axios interceptor transformation, these come in camelCase
export interface InterviewAPI {
    id: string;
    application: string;
    stage: string;
    scheduledDate: string; // YYYY-MM-DD (camelCase after axios transform)
    scheduledTime: string; // HH:MM:SS format (camelCase after axios transform)
    location: string;
    zoomLink?: string; // camelCase after axios transform
    status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
    notes?: string;
    feedback?: string;
    rating?: number;
    candidateName: string; // camelCase after axios transform
    candidateEmail: string; // camelCase after axios transform
    positionTitle: string; // camelCase after axios transform
    positionReqId: string; // camelCase after axios transform
    stageName: string; // camelCase after axios transform
    stageNumber: number; // camelCase after axios transform
    interviewers: InterviewerAPI[];
    worksite: string;
    createdAt: string; // camelCase after axios transform
    updatedAt: string; // camelCase after axios transform
    results?: [];
}

export interface PaginatedInterviewResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: InterviewAPI[];
}

export interface InterviewerAPI {
    id: string;
    name: string;
    email: string;
    role: string;
}

// Request DTOs
export interface ScheduleInterviewRequest {
    application_id: string;
    stage_id: string;
    scheduled_date: string;
    scheduled_time: string;
    location: string;
}

export interface UpdateInterviewRequest {
    scheduled_date?: string;
    scheduled_time?: string;
    location?: string;
    zoom_link?: string;
    status?: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
    notes?: string;
    feedback?: string;
    rating?: number;
}

/**
 * Convert 24-hour time (HH:MM:SS) to 12-hour format (HH:MM AM/PM)
 */
function convertTo12Hour(time24: string): string {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Convert 12-hour time (HH:MM AM/PM) to 24-hour format (HH:MM:SS)
 */
function convertTo24Hour(time12: string): string {
    const match = time12.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) {
        throw new Error(`Invalid time format: ${time12}`);
    }

    let [, hoursStr, minutesStr, period] = match;
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (period.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
}

/**
 * Map backend API Interview to frontend UI Interview
 * Note: API data is already in camelCase after axios transformation
 */
export function mapInterviewFromAPI(apiInterview: InterviewAPI): InterviewUI {
    return {
        id: apiInterview.id,
        candidateName: apiInterview.candidateName,
        candidateEmail: apiInterview.candidateEmail,
        position: apiInterview.positionTitle,
        positionReqId: apiInterview.positionReqId,
        stage: apiInterview.stageNumber,
        stageName: apiInterview.stageName,
        scheduledDate: apiInterview.scheduledDate,
        scheduledTime: convertTo12Hour(apiInterview.scheduledTime),
        interviewers: apiInterview.interviewers.map(mapInterviewerFromAPI),
        status: apiInterview.status,
        location: apiInterview.location,
        district: apiInterview.worksite,
        notes: apiInterview.notes,
        feedback: apiInterview.feedback,
        rating: apiInterview.rating,
        zoomLink: apiInterview.zoomLink,
        applicationId: apiInterview.application,
        stageId: apiInterview.stage,
    };
}

/**
 * Map frontend UI Interview to backend API update request
 */
export function mapInterviewToAPI(uiInterview: Partial<InterviewUI>): UpdateInterviewRequest {
    const apiData: UpdateInterviewRequest = {};

    if (uiInterview.scheduledDate !== undefined) {
        apiData.scheduled_date = uiInterview.scheduledDate;
    }

    if (uiInterview.scheduledTime !== undefined) {
        apiData.scheduled_time = convertTo24Hour(uiInterview.scheduledTime);
    }

    if (uiInterview.location !== undefined) {
        apiData.location = uiInterview.location;
    }

    if (uiInterview.zoomLink !== undefined) {
        apiData.zoom_link = uiInterview.zoomLink;
    }

    if (uiInterview.status !== undefined) {
        apiData.status = uiInterview.status;
    }

    if (uiInterview.notes !== undefined) {
        apiData.notes = uiInterview.notes;
    }

    if (uiInterview.feedback !== undefined) {
        apiData.feedback = uiInterview.feedback;
    }

    if (uiInterview.rating !== undefined) {
        apiData.rating = uiInterview.rating;
    }

    return apiData;
}

/**
 * Map interviewer from API to UI
 */
export function mapInterviewerFromAPI(apiInterviewer: InterviewerAPI): InterviewerUI {
    return {
        id: apiInterviewer.id,
        name: apiInterviewer.name,
        email: apiInterviewer.email,
        role: apiInterviewer.role,
    };
}

/**
 * Create schedule interview request
 */
export function createScheduleInterviewRequest(
    applicationId: string,
    stageId: string,
    scheduledDate: string,
    scheduledTime: string,
    location: string
): ScheduleInterviewRequest {
    return {
        application_id: applicationId,
        stage_id: stageId,
        scheduled_date: scheduledDate,
        scheduled_time: convertTo24Hour(scheduledTime),
        location,
    };
}
