/**
 * ApplicantsWithoutOnboardingView Component
 * View layer for displaying applicants who need onboarding invitations sent
 * Follows MVVMC pattern - this is the View layer
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { ApplicantWithOnboardingStatus, ApplicantsWithoutOnboardingFilters } from '@/types/onboarding';

/**
 * Format date consistently for SSR/CSR compatibility
 * Using ISO format to avoid hydration mismatches
 */
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

interface ApplicantsWithoutOnboardingViewProps {
    applicants: ApplicantWithOnboardingStatus[];
    loading: boolean;
    error: string | null;
    stats: {
        total: number;
        withAcceptedOffer: number;
        pendingOffer: number;
        withoutOnboarding: number;
    };
    filters: ApplicantsWithoutOnboardingFilters;
    onSendOnboarding: (applicantId: string) => Promise<void>;
    onBulkSendOnboarding: (applicantIds: string[]) => Promise<void>;
    onFilterChange: (filters: Partial<ApplicantsWithoutOnboardingFilters>) => void;
    onRefresh: () => void;
}

export function ApplicantsWithoutOnboardingView({
    applicants,
    loading,
    error,
    stats,
    filters,
    onSendOnboarding,
    onBulkSendOnboarding,
    onFilterChange,
    onRefresh
}: ApplicantsWithoutOnboardingViewProps) {
    const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
    const [sendingTo, setSendingTo] = useState<string | null>(null);
    const [bulkSending, setBulkSending] = useState(false);

    // Filter to show only applicants without onboarding
    const applicantsWithoutOnboarding = applicants.filter(a => !a.hasOnboarding);

    const handleSelectApplicant = (applicantId: string) => {
        setSelectedApplicants(prev =>
            prev.includes(applicantId)
                ? prev.filter(id => id !== applicantId)
                : [...prev, applicantId]
        );
    };

    const handleSelectAll = () => {
        if (selectedApplicants.length === applicantsWithoutOnboarding.length) {
            setSelectedApplicants([]);
        } else {
            setSelectedApplicants(applicantsWithoutOnboarding.map(a => a.id));
        }
    };

    const handleSendOnboarding = async (applicantId: string) => {
        setSendingTo(applicantId);
        try {
            await onSendOnboarding(applicantId);
            setSelectedApplicants(prev => prev.filter(id => id !== applicantId));
        } finally {
            setSendingTo(null);
        }
    };

    const handleBulkSend = async () => {
        if (selectedApplicants.length === 0) return;

        setBulkSending(true);
        try {
            await onBulkSendOnboarding(selectedApplicants);
            setSelectedApplicants([]);
        } finally {
            setBulkSending(false);
        }
    };

    const getOfferStatusBadge = (status?: string) => {
        switch (status) {
            case 'Accepted':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Declined':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'Expired':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Applicants Awaiting Onboarding
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Send onboarding invitations to applicants with accepted offers
                            </p>
                        </div>
                        <Button
                            onClick={onRefresh}
                            disabled={loading}
                            variant="secondary"
                        >
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </Button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <svg
                                className="w-5 h-5 text-red-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <p className="text-red-800 font-medium">{error}</p>
                        </div>
                    </div>
                )}

                {/* Statistics Cards */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-600 font-medium">
                            Total Applicants with Offers
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-600 font-medium">Accepted Offers</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                            {stats.withAcceptedOffer}
                        </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-600 font-medium">Pending Offers</p>
                        <p className="text-2xl font-bold text-yellow-600 mt-1">
                            {stats.pendingOffer}
                        </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-600 font-medium">
                            Awaiting Onboarding
                        </p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">
                            {stats.withoutOnboarding}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 space-y-4">
                    <input
                        type="text"
                        placeholder="Search by name, email, or position..."
                        value={filters.search || ''}
                        onChange={e => onFilterChange({ search: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <div className="flex gap-4 items-center">
                        <div className="flex gap-2">
                            <button
                                onClick={() => onFilterChange({ offerStatus: 'all' })}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filters.offerStatus === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                All Offers
                            </button>
                            <button
                                onClick={() => onFilterChange({ offerStatus: 'Accepted' })}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filters.offerStatus === 'Accepted'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Accepted Only
                            </button>
                            <button
                                onClick={() => onFilterChange({ offerStatus: 'Pending' })}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filters.offerStatus === 'Pending'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Pending Only
                            </button>
                        </div>

                        {selectedApplicants.length > 0 && (
                            <div className="ml-auto flex items-center gap-3">
                                <span className="text-sm text-gray-600">
                                    {selectedApplicants.length} selected
                                </span>
                                <Button
                                    onClick={handleBulkSend}
                                    disabled={bulkSending}
                                    size="sm"
                                >
                                    {bulkSending
                                        ? 'Sending...'
                                        : `Send Onboarding to ${selectedApplicants.length}`}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Applicants Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={
                                            applicantsWithoutOnboarding.length > 0 &&
                                            selectedApplicants.length === applicantsWithoutOnboarding.length
                                        }
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Applicant
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Position
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Offer Status
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Offer Date
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Start Date
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading && applicantsWithoutOnboarding.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <p className="text-gray-500">Loading applicants...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : applicantsWithoutOnboarding.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <svg
                                                className="w-12 h-12 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <p className="text-gray-500 font-medium">
                                                All applicants have onboarding sent!
                                            </p>
                                            <p className="text-gray-400 text-sm">
                                                No applicants are awaiting onboarding invitations
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                applicantsWithoutOnboarding.map(applicant => (
                                    <tr
                                        key={applicant.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedApplicants.includes(applicant.id)}
                                                onChange={() => handleSelectApplicant(applicant.id)}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span className="text-blue-600 font-semibold text-sm">
                                                        {applicant.applicantName
                                                            .split(' ')
                                                            .map(n => n[0])
                                                            .join('')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {applicant.applicantName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {applicant.applicantEmail}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {applicant.positionTitle}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {applicant.positionReqId}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getOfferStatusBadge(
                                                    applicant.offerStatus
                                                )}`}
                                            >
                                                {applicant.offerStatus || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">
                                                {applicant.offerDate
                                                    ? formatDate(applicant.offerDate)
                                                    : 'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">
                                                {applicant.startDate
                                                    ? formatDate(applicant.startDate)
                                                    : 'Not set'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button
                                                onClick={() => handleSendOnboarding(applicant.id)}
                                                disabled={sendingTo === applicant.id}
                                                size="sm"
                                            >
                                                {sendingTo === applicant.id
                                                    ? 'Sending...'
                                                    : 'Send Onboarding'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Info Footer */}
                {applicantsWithoutOnboarding.length > 0 && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <svg
                                className="w-5 h-5 text-blue-600 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900">
                                    About Onboarding Invitations
                                </p>
                                <p className="text-sm text-blue-800 mt-1">
                                    Sending onboarding will create a secure link for the applicant to
                                    complete their employment forms. The applicant will receive an
                                    email with instructions and a unique access token.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
