import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { transformKeysToCamel, transformKeysToSnake } from './utils/caseTransform'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add request interceptor for authentication and district header
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Add authentication token
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        } else {
            console.warn('No access token found in localStorage for request:', config.url)
        }

        // Add district ID header for multi-tenancy
        // Try to get district_id from auth-storage (Zustand persist) first, then fallback to direct localStorage
        let districtId = localStorage.getItem('district_id')

        if (!districtId) {
            // Try to get it from auth-storage (Zustand persist)
            const authStorage = localStorage.getItem('auth-storage')
            if (authStorage) {
                try {
                    const authState = JSON.parse(authStorage)
                    districtId = authState?.state?.user?.districtId
                } catch (e) {
                    console.warn('Failed to parse auth-storage:', e)
                }
            }
        }

        if (districtId) {
            config.headers['X-District-ID'] = districtId
        } else {
            console.warn('No district ID found for request:', config.url)
        }

        // Debug logging for district ID
        console.log('📤 API Request:', {
            url: config.url,
            method: config.method?.toUpperCase(),
            headers: {
                'Authorization': config.headers.Authorization ? 'Bearer ***' : 'None',
                'X-District-ID': config.headers['X-District-ID'] || 'Missing',
            },
            data: config.data,
        })

        // Transform request data from camelCase to snake_case
        // Skip transformation for FormData (used in file uploads)
        if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
            // Special handling for template_data - don't transform its keys
            if (config.data.template_data) {
                const templateData = config.data.template_data;
                config.data = transformKeysToSnake(config.data);
                config.data.template_data = templateData; // Restore original template_data with camelCase keys
            } else {
                config.data = transformKeysToSnake(config.data);
            }
        }

        return config
    },
    (error: AxiosError) => {
        return Promise.reject(error)
    }
)

// Add response interceptor for error handling, token refresh, and camelCase transformation
const onFulfilled = (response: AxiosResponse) => {
    // Transform response data from snake_case to camelCase
    if (response.data && typeof response.data === 'object') {
        response.data = transformKeysToCamel(response.data)
    }
    return response
};

const onRejected = async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            try {
                const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
                    refresh: refreshToken
                });

                const { access } = response.data;
                localStorage.setItem('access_token', access);

                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');

                // Only redirect if we're not already on the auth page
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
                    window.location.href = '/auth';
                }

                return Promise.reject(refreshError);
            }
        } else {
            // No refresh token available, clear storage and redirect
            localStorage.removeItem('access_token');

            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
                window.location.href = '/auth';
            }
        }
    }

    return Promise.reject(error);
};

api.interceptors.response.use(onFulfilled, onRejected);

export default api

// API endpoints
export const onboardingApi = {
    /**
     * Get all applicants with offers who are awaiting onboarding
     * Returns combined data from applications, offers, and onboarding candidates
     */
    getApplicantsAwaitingOnboarding: async () => {
        return api.get('/onboarding/candidates/applicants-awaiting-onboarding/');
    },
};

// Hiring API endpoints
export const hiringApi = {
    /**
     * Get all job applications
     * Returns paginated list of applications
     */
    getApplications: async () => {
        return api.get('/hiring/applications/');
    },

    /**
     * Get a specific application by ID
     * @param id - Application ID
     */
    getApplicationById: async (id: string) => {
        return api.get(`/hiring/applications/${id}/`);
    },

    /**
     * Advance application to next stage
     * @param id - Application ID
     */
    advanceApplicationStage: async (id: string) => {
        return api.post(`/hiring/applications/${id}/advance_stage/`);
    },

    /**
     * Reject an application
     * @param id - Application ID
     */
    rejectApplication: async (id: string) => {
        return api.post(`/hiring/applications/${id}/reject/`);
    },

    /**
     * DEMO ONLY: Force set application to any stage
     * @param id - Application ID
     * @param stage - Target stage name
     */
    demoSetApplicationStage: async (id: string, stage: string) => {
        return api.post(`/hiring/applications/${id}/demo_set_stage/`, { stage });
    },

    /**
     * Get all positions
     */
    getPositions: async () => {
        return api.get('/hiring/positions/');
    },

    /**
     * Get position by ID
     * @param id - Position ID
     */
    getPositionById: async (id: string) => {
        return api.get(`/hiring/positions/${id}/`);
    },

    /**
     * Schedule an interview
     * @param data - Interview data
     */
    scheduleInterview: async (data: {
        application: string;
        stage: string;
        scheduledDate: string;
        scheduledTime: string;
        location: string;
    }) => {
        return api.post('/hiring/interviews/schedule/', data);
    },

    /**
     * Create an offer
     * @param data - Offer data
     */
    createOffer: async (data: {
        application: string;
        salary: string;
        fte: string;
        startDate: string;
        benefits: string;
        offerDate: string;
        expirationDate: string;
        status: string;
    }) => {
        return api.post('/hiring/offers/', data);
    },
};

// Helpers to safely parse fetch responses which may sometimes be HTML (e.g. auth redirect)
async function safeReadText(response: Response): Promise<string> {
    try {
        const txt = await response.text();
        return txt;
    } catch (e) {
        return '';
    }
}

;