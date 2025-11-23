// app/(modules)/hiring/hooks/useCareersPositions.ts

import { useState, useCallback, useEffect } from 'react';
import { PublicPosition, JobApplication } from '@/types';
import { api } from '@/lib/api';

interface UseCareersPositionsReturn {
    positions: PublicPosition[];
    loading: boolean;
    error: string | null;
    fetchPositions: () => Promise<void>;
    submitApplication: (application: JobApplication) => Promise<void>;
}

// The api.ts interceptor already transforms snake_case to camelCase
// So we just need to ensure the data matches PublicPosition type
function transformToPublicPosition(position: any): PublicPosition {
    return {
        id: position.id,
        reqId: position.reqId,
        title: position.title,
        department: position.department,
        worksite: position.worksite,
        fte: position.fte?.toString() || '1.0',
        salaryRange: position.salaryRange,
        startDate: position.startDate,
        description: position.description || '',
        requirements: position.requirements || '',
        postingStartDate: position.postingStartDate,
        postingEndDate: position.postingEndDate,
        status: position.status,
        screeningQuestions: position.screeningQuestions || []
    };
}

export function useCareersPositions(): UseCareersPositionsReturn {
    const [positions, setPositions] = useState<PublicPosition[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPositions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get('/hiring/positions/public/');

            console.log('Careers: Raw API response:', response.data);

            let positionsData = [];
            if (Array.isArray(response.data)) {
                positionsData = response.data;
            } else if (response.data && Array.isArray(response.data.results)) {
                positionsData = response.data.results;
            } else {
                console.warn('Unexpected response format:', response.data);
                positionsData = [];
            }

            const transformedPositions = positionsData.map(transformToPublicPosition);

            console.log('Careers: Transformed positions:', transformedPositions);

            setPositions(transformedPositions);
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail
                || err.response?.data?.message
                || err.message
                || 'Failed to load open positions';
            setError(errorMessage);
            console.error('Error fetching positions:', err);
            console.error('Error response:', err.response?.data);
            setPositions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const submitApplication = useCallback(async (application: JobApplication) => {
        try {
            // Find the position by reqId
            const position = positions.find(p => p.reqId === application.positionReqId);
            if (!position || !position.id) {
                throw new Error('Position not found');
            }

            // Prepare FormData for file upload
            const formData = new FormData();

            // Add required fields
            formData.append('position', position.id.toString());
            formData.append('applicant_name', application.applicantName);
            formData.append('applicant_email', application.applicantEmail);

            if (application.applicantPhone) {
                formData.append('applicant_phone', application.applicantPhone);
            }

            formData.append('start_date_availability', application.startDateAvailability);

            // Add screening answers as JSON string
            formData.append('screening_answers', JSON.stringify(application.screeningAnswers || {}));

            // Add references as JSON string
            if (application.references && application.references.length > 0) {
                const validReferences = application.references.filter(ref => ref.name && ref.email);
                formData.append('references', JSON.stringify(validReferences));
            } else {
                formData.append('references', JSON.stringify([]));
            }

            // Add interview availability as JSON string
            if (application.interviewAvailability && application.interviewAvailability.length > 0) {
                formData.append('interview_availability', JSON.stringify(application.interviewAvailability));
            } else {
                formData.append('interview_availability', JSON.stringify([]));
            }

            // CRITICAL FIX: Add resume file - ensure it exists first
            if (!application.resumeFile) {
                throw new Error('Resume file is required');
            }
            formData.append('resume', application.resumeFile, application.resumeFile.name);

            // Add cover letter
            if (application.coverLetter) {
                formData.append('cover_letter', application.coverLetter);
            }

            console.log('Submitting application for position:', position.id);
            console.log('Resume file details:', {
                name: application.resumeFile.name,
                size: application.resumeFile.size,
                type: application.resumeFile.type
            });

            // Submit application to backend
            // Let axios set the Content-Type with boundary automatically
            const response = await api.post('/hiring/applications/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Application submitted successfully:', response.data);

            return response.data;

        } catch (err: any) {
            const errorMessage = err.response?.data?.detail
                || err.response?.data?.error
                || err.message
                || 'Failed to submit application';
            console.error('Error submitting application:', err);
            console.error('Error response:', err.response?.data);
            throw new Error(errorMessage);
        }
    }, [positions]);

    // Auto-fetch on mount
    useEffect(() => {
        fetchPositions();
    }, [fetchPositions]);

    return {
        positions,
        loading,
        error,
        fetchPositions,
        submitApplication
    };
}