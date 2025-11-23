"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Position, Applicant } from "@/types";
import { ApplicantRow } from "./ApplicantRow";
import { useJobApplications } from "../../hooks/useJobApplications";

interface ApplicantsViewProps {
    position?: Position;  // Now optional
    onBack: () => void;
}

// Transform JobApplication to Applicant type
function transformToApplicant(app: any): Applicant {
    return {
        id: app.id,
        name: app.applicantName || '',
        email: app.applicantEmail || '',
        phone: app.applicantPhone || '',
        currentRole: app.currentRole || '',
        experience: app.yearsExperience || 0,
        certified: app.certified || false,
        internal: app.internal || false,
        stage: app.stage || 'Application Review',
        appliedDate: app.submittedAt || app.createdAt || '',
        positionTitle: app.positionTitle || '',
        positionReqId: app.positionReqId || '',
        positionId: app.position || app.positionId || '',
        currentInterviewStage: app.currentInterviewStage || 0,
        completedInterviewStages: app.completedInterviewStages || 0,
        totalInterviewStages: app.totalInterviewStages || 0,
        department: '',
        worksite: '',
        salary: '',
        fte: '',
        startDate: ''
    };
}

export function ApplicantsView({ position, onBack }: ApplicantsViewProps) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [stageFilter, setStageFilter] = React.useState('all');
    const [certFilter, setCertFilter] = React.useState('all');
    const [positionFilter, setPositionFilter] = React.useState('all');
    const [selectedApplicants, setSelectedApplicants] = React.useState<Set<string>>(new Set());

    // Use the existing hook with proper case transformation
    const { applications, loading, error } = useJobApplications();

    // Transform applications to applicants
    const applicants = React.useMemo(() => {
        const appsArray = Array.isArray(applications) ? applications : applications?.results || [];
        return appsArray.map(transformToApplicant);
    }, [applications]);

    // Get unique positions for filter dropdown
    const uniquePositions = React.useMemo(() => {
        const positions = new Set<string>();
        applicants.forEach(app => {
            if (app.positionReqId) {
                positions.add(app.positionReqId);
            }
        });
        return Array.from(positions).sort();
    }, [applicants]);

    const filteredApplicants = applicants.filter(applicant => {
        const matchesSearch = applicant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            applicant.currentRole?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            applicant.positionTitle?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStage = stageFilter === 'all' || applicant.stage === stageFilter;

        const matchesCert = certFilter === 'all' ||
            (certFilter === 'certified' && applicant.certified) ||
            (certFilter === 'pending' && !applicant.certified);

        const matchesPosition = positionFilter === 'all' || applicant.positionReqId === positionFilter;

        // If viewing from a specific position, filter to that position
        const matchesContextPosition = !position || applicant.positionReqId === position.reqId;

        return matchesSearch && matchesStage && matchesCert && matchesPosition && matchesContextPosition;
    });

    const handleSelectApplicant = (id: string) => {
        setSelectedApplicants(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleViewProfile = (applicant: Applicant) => {
        alert(`Viewing profile for ${applicant.name}`);
    };

    const handleScheduleInterview = (applicant: Applicant) => {
        alert(`Schedule interview for ${applicant.name}`);
    };

    const handleSendOffer = (applicant: Applicant) => {
        alert(`Send offer to ${applicant.name}`);
    };

    return (
        <>
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to {position ? 'Position' : 'Dashboard'}
                </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {position ? `${position.title} - Applicants` : 'All Applicants'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {position ? `${position.reqId} • ` : ''}{filteredApplicants.length} of {applicants.length} applications
                    </p>
                </div>

                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-4 flex-wrap">
                        <Input
                            placeholder="Search applicants, roles, positions..."
                            className="flex-1 min-w-[250px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        {!position && (
                            <Select
                                className="w-48"
                                value={positionFilter}
                                onChange={(e) => setPositionFilter(e.target.value)}
                            >
                                <option value="all">All Positions</option>
                                {uniquePositions.map(reqId => (
                                    <option key={reqId} value={reqId}>{reqId}</option>
                                ))}
                            </Select>
                        )}

                        <Select
                            className="w-48"
                            value={stageFilter}
                            onChange={(e) => setStageFilter(e.target.value)}
                        >
                            <option value="all">All Stages</option>
                            <option value="Application Review">Application Review</option>
                            <option value="Screening">Screening</option>
                            <option value="Interview">Interview</option>
                            <option value="Reference Check">Reference Check</option>
                            <option value="Offer">Offer</option>
                        </Select>

                        <Select
                            className="w-48"
                            value={certFilter}
                            onChange={(e) => setCertFilter(e.target.value)}
                        >
                            <option value="all">All Certifications</option>
                            <option value="certified">Certified Only</option>
                            <option value="pending">Pending License</option>
                        </Select>
                    </div>

                    {selectedApplicants.size > 0 && (
                        <div className="mt-4 flex items-center gap-3">
                            <span className="text-sm text-gray-600">
                                {selectedApplicants.size} selected
                            </span>
                            <Button variant="secondary" onClick={() => alert('Bulk action would be performed')}>
                                Schedule Interview
                            </Button>
                            <Button variant="secondary" onClick={() => alert('Bulk send offer')}>
                                Send Offer
                            </Button>
                            <Button variant="secondary" onClick={() => setSelectedApplicants(new Set())}>
                                Clear Selection
                            </Button>
                        </div>
                    )}
                </div>

                <div>
                    {loading && (
                        <div className="px-6 py-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="text-gray-500 mt-4">Loading applicants...</p>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="px-6 py-12 text-center">
                            <div className="text-red-600 mb-2">
                                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-700 font-medium">{error}</p>
                            <Button
                                onClick={() => window.location.reload()}
                                className="mt-4"
                                variant="secondary"
                            >
                                Retry
                            </Button>
                        </div>
                    )}

                    {!loading && !error && filteredApplicants.length > 0 && filteredApplicants.map((applicant) => (
                        <ApplicantRow
                            key={applicant.id}
                            applicant={applicant}
                            selected={selectedApplicants.has(applicant.id)}
                            onSelect={handleSelectApplicant}
                            onViewProfile={handleViewProfile}
                            onScheduleInterview={handleScheduleInterview}
                            onSendOffer={handleSendOffer}
                        />
                    ))}

                    {!loading && !error && filteredApplicants.length === 0 && applicants.length > 0 && (
                        <div className="px-6 py-12 text-center text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <p className="font-medium">No applicants match your filters</p>
                            <p className="text-sm mt-1">Try adjusting your search criteria</p>
                        </div>
                    )}

                    {!loading && !error && applicants.length === 0 && (
                        <div className="px-6 py-12 text-center text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="font-medium">No applicants yet</p>
                            <p className="text-sm mt-1">Applications will appear here once candidates apply to positions</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}