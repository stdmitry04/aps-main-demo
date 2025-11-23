/**
 * ApplicantsWithoutOnboarding Container Component
 * Controller layer that connects the View with the ViewModel/business logic
 * Follows MVVMC pattern - this is the Controller layer
 */

'use client';

import React, { useCallback } from 'react';
import { ApplicantsWithoutOnboardingView } from './ApplicantsWithoutOnboardingView';
import { useApplicantsWithoutOnboarding } from '../hooks';
import { ApplicantsWithoutOnboardingFilters } from '@/types/onboarding';

export function ApplicantsWithoutOnboarding() {
    const {
        filteredApplicants,
        loading,
        error,
        filters,
        stats,
        fetchApplicants,
        sendOnboarding,
        bulkSendOnboarding,
        setFilters,
    } = useApplicantsWithoutOnboarding();

    /**
     * Handle sending onboarding to a single applicant
     */
    const handleSendOnboarding = useCallback(
        async (applicantId: string) => {
            const result = await sendOnboarding(applicantId);

            if (result.success) {
                // Show success message (you can integrate with a toast/notification system)
                console.log('Success:', result.message);
            } else {
                // Show error message
                console.error('Error:', result.error);
                alert(`Error: ${result.error}`);
            }
        },
        [sendOnboarding]
    );

    /**
     * Handle bulk sending onboarding to multiple applicants
     */
    const handleBulkSendOnboarding = useCallback(
        async (applicantIds: string[]) => {
            const result = await bulkSendOnboarding(applicantIds);

            // Show summary message
            const message = `Onboarding sent to ${result.successCount} applicant(s).${result.failedCount > 0 ? ` ${result.failedCount} failed.` : ''
                }`;

            console.log('Bulk send result:', message);
            alert(message);

            // Log individual failures if any
            if (result.failedCount > 0) {
                const failures = result.results.filter(r => !r.success);
                console.error('Failed sends:', failures);
            }
        },
        [bulkSendOnboarding]
    );

    /**
     * Handle filter changes
     */
    const handleFilterChange = useCallback(
        (newFilters: Partial<ApplicantsWithoutOnboardingFilters>) => {
            setFilters(newFilters);
        },
        [setFilters]
    );

    /**
     * Handle refresh
     */
    const handleRefresh = useCallback(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    return (
        <ApplicantsWithoutOnboardingView
            applicants={filteredApplicants}
            loading={loading}
            error={error}
            stats={stats}
            filters={filters}
            onSendOnboarding={handleSendOnboarding}
            onBulkSendOnboarding={handleBulkSendOnboarding}
            onFilterChange={handleFilterChange}
            onRefresh={handleRefresh}
        />
    );
}
