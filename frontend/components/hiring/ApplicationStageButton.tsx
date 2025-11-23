/**
 * ApplicationStageButton Component
 * 
 * A dynamic button that changes its label, color, and action based on the
 * current stage of a job application. This component follows the MVVMC pattern:
 * 
 * - Model: Application type from types/hiring/application-stage.types.ts
 * - View: This component (presentational)
 * - Model-View: useApplications hook
 * - Controller: hiringApi from lib/api.ts
 * 
 * The button progresses through these stages:
 * 1. Application Review -> Accept Application (auto-advance)
 * 2. Screening -> Screen Applicant (auto-advance)
 * 3. Interview -> Schedule Interview (callback)
 * 4. Interviews Completed -> Complete Interviews (auto-advance)
 * 5. Reference Check -> Reference Check (auto-advance)
 * 6. Offer -> Send Offer (callback)
 * 7. Offer Accepted -> Send Onboarding (callback)
 */

'use client';

import React from 'react';
import { Application, STAGE_ACTIONS } from '@/types/hiring/application-stage.types';
import { useApplications } from '@/app/(modules)/hiring/hooks/useApplications';

interface ApplicationStageButtonProps {
    application: Application;
    onScheduleInterview?: (application: Application) => void;
    onSendOffer?: (application: Application) => void;
    onSendOnboarding?: (application: Application) => void;
    onRefresh?: () => void | Promise<void>;
    className?: string;
}

const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    purple: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
    yellow: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    orange: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
    teal: 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
};

const iconPaths = {
    'check-circle': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    'clipboard-check': 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    'calendar': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    'user-check': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    'mail': 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    'clipboard-list': 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    'x-circle': 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
};

export function ApplicationStageButton({
    application,
    onScheduleInterview,
    onSendOffer,
    onSendOnboarding,
    onRefresh,
    className = '',
}: ApplicationStageButtonProps) {
    const { advanceApplicationStage, canAdvanceStage, loading } = useApplications({ autoFetch: false });
    const [isProcessing, setIsProcessing] = React.useState(false);

    const stage = application.stage;
    const stageConfig = STAGE_ACTIONS[stage];

    // Debug logging
    console.log('ApplicationStageButton Debug:', {
        applicationId: application.id,
        stage,
        stageConfig,
        availableStages: Object.keys(STAGE_ACTIONS),
        hasStageConfig: !!stageConfig,
    });

    // Handle undefined stageConfig
    if (!stageConfig) {
        console.error('Unknown stage encountered:', {
            stage,
            application,
            availableStages: Object.keys(STAGE_ACTIONS),
        });
        return (
            <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 border border-gray-300">
                <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
                Unknown Stage: {stage}
            </span>
        );
    }

    // Don't show button for rejected applications
    if (stage === 'Rejected') {
        return (
            <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-red-100 text-red-800">
                <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={iconPaths['x-circle']}
                    />
                </svg>
                Rejected
            </span>
        );
    }

    // Determine the click handler based on the stage action
    const handleClick = async () => {
        const action = stageConfig.action;

        // Callback stages - check these FIRST before auto-advance
        if (action === 'schedule_interview' && onScheduleInterview) {
            onScheduleInterview(application);
            return;
        }

        if (action === 'send_offer' && onSendOffer) {
            onSendOffer(application);
            return;
        }

        if (action === 'send_onboarding' && onSendOnboarding) {
            onSendOnboarding(application);
            return;
        }

        // Auto-advance stages
        if (action === 'accept' || action === 'screen' || action === 'complete_interviews' || action === 'reference_check') {
            try {
                setIsProcessing(true);
                await advanceApplicationStage(application.id);
                // Refresh the candidates list after advancing stage
                if (onRefresh) {
                    await onRefresh();
                }
            } catch (error) {
                console.error('Error advancing stage:', error);
                alert('Failed to advance application stage. Please try again.');
            } finally {
                setIsProcessing(false);
            }
            return;
        }

        console.warn('Unknown action or missing callback:', action);
    };

    const isLoading = isProcessing || loading;
    const colorClass = colorClasses[stageConfig.color];
    const iconPath = iconPaths[stageConfig.icon as keyof typeof iconPaths];

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={`
        inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${colorClass}
        ${className}
      `}
            title={`Current stage: ${stage}. Click to ${stageConfig.label.toLowerCase()}`}
        >
            {isLoading ? (
                <>
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    Processing...
                </>
            ) : (
                <>
                    <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={iconPath}
                        />
                    </svg>
                    {stageConfig.label}
                </>
            )}
        </button>
    );
}
