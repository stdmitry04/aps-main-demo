/**
 * Applicants Management Page
 * 
 * This page displays all job applicants and fetches real data from the backend:
 * - Uses JobApplicationViewSet to fetch application data
 * - Uses InterviewViewSet to schedule interviews
 * - Uses PositionViewSet to fetch position details and interview stages
 * - Provides filtering by position, stage, and certification status
 * - Supports scheduling interviews with real backend integration
 * - Supports sending offers with real backend integration
 * - Shows applicant profiles with detailed information
 * - Uses ApplicationStageButton component for dynamic stage progression
 * 
 * Backend endpoints used:
 * - GET /hiring/applications/ - List all applications
 * - GET /hiring/applications/:id/ - Get application details
 * - GET /hiring/positions/:id/ - Get position details with interview stages
 * - POST /hiring/interviews/schedule/ - Schedule an interview
 * - POST /hiring/offers/ - Create an offer
 * - POST /hiring/applications/:id/advance_stage/ - Advance application stage
 * 
 * MVVMC Architecture:
 * - Model: Application types (types/hiring/application-stage.types.ts)
 * - View: ApplicantRow with ApplicationStageButton (components/)
 * - Model-View: useApplications hook (hooks/useApplications.ts)
 * - Controller: hiringApi (lib/api.ts)
 */
"use client";

import React, { Suspense } from "react";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ApplicantRow } from "./components/ApplicantRow";
import { ScheduleInterviewModal } from "./components/ScheduleInterviewModal";
import { SendOfferModal } from "./components/SendOfferModal";
import { CreateOfferModal } from "./components/CreateOfferModal";
import { useJobApplications } from "../hooks/useJobApplications";
import { useApplications } from "../hooks/useApplications";
import { usePositions } from "../hooks/usePositions";
import { useInterviews } from "../hooks/useInterviews";
import { useSearchParams, useRouter } from "next/navigation";
import { ApplicantProfile } from "./components";
import { api } from "@/lib/api";
import { Applicant } from "@/types/hiring/applicant.types";


interface InterviewStage {
    id: string;
    stageNumber: number;
    stageName: string;
    interviewers: Array<{
        id: string;
        name: string;
        email: string;
        role: string;
    }>;
}

// Separate component that uses useSearchParams
function ApplicantsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const positionParam = searchParams.get('position');

    const [loadingDetail, setLoadingDetail] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [positionFilter, setPositionFilter] = React.useState(positionParam || 'all');
    const [stageFilter, setStageFilter] = React.useState('all');
    const [certFilter, setCertFilter] = React.useState('all');
    const [selectedApplicants, setSelectedApplicants] = React.useState<Set<string>>(new Set());

    const [showScheduleModal, setShowScheduleModal] = React.useState(false);
    const [showCreateOfferModal, setShowCreateOfferModal] = React.useState(false);

    const { positions, fetchPositions, loading: positionsLoading } = usePositions();

    const [showProfileModal, setShowProfileModal] = React.useState(false);
    const [selectedApplicant, setSelectedApplicant] = React.useState<Applicant | null>(null);
    const [detailedApplicant, setDetailedApplicant] = React.useState<any | null>(null);
    const [interviewStages, setInterviewStages] = React.useState<InterviewStage[]>([]);
    const [positionDetails, setPositionDetails] = React.useState<any>(null);

    const { applications, fetchApplications, fetchApplicationById, advanceStage, rejectApplication } = useJobApplications();
    const { getStageCount, getTotalCount } = useApplications({ autoFetch: false }); // Use for stats only
    const { scheduleInterview } = useInterviews();

    // Update position filter when URL parameter changes
    React.useEffect(() => {
        if (positionParam) {
            setPositionFilter(positionParam);
        }
    }, [positionParam]);

    React.useEffect(() => {
        fetchApplications();
        fetchPositions();
    }, [fetchApplications, fetchPositions]);

    // Debug modal state changes
    React.useEffect(() => {
        console.log('🔍 Modal State Changed:', {
            showCreateOfferModal,
            showScheduleModal,
            showProfileModal,
            hasSelectedApplicant: !!selectedApplicant,
            selectedApplicantName: selectedApplicant?.name
        });
    }, [showCreateOfferModal, showScheduleModal, showProfileModal, selectedApplicant]);

    const allApplicants: Applicant[] = React.useMemo(() => {
        console.log("these are the applications", applications);

        // Handle paginated response format
        let applicationsArray: any[] = [];

        if (Array.isArray(applications)) {
            // Direct array
            applicationsArray = applications;
        } else if (applications && typeof applications === 'object' && 'results' in applications) {
            // Paginated response from DRF
            applicationsArray = applications.results;
        } else {
            console.warn('Unexpected applications format:', applications);
            applicationsArray = [];
        }

        return applicationsArray.map((a: any) => ({
            id: String(a.id),
            name: a.applicantName,
            email: a.applicantEmail,
            phone: a.applicantPhone || '',
            currentRole: a.currentRole || '',
            experience: a.yearsExperience || 0,
            certified: Boolean(a.certified),
            internal: Boolean(a.internal),
            stage: a.stage,
            appliedDate: new Date(a.submittedAt).toLocaleDateString(),
            positionTitle: a.positionTitle,
            positionReqId: a.positionReqId,
            positionId: String(a.position || a.positionId || ''),
            currentInterviewStage: a.currentInterviewStage || 0,
            completedInterviewStages: a.completedInterviewStages || 0,
            totalInterviewStages: a.totalInterviewStages || 0,
            department: '',
            worksite: '',
            salary: '',
            fte: '',
            startDate: a.startDateAvailability || ''
        }));

    }, [applications]);

    const filteredApplicants = React.useMemo(() => {
        return allApplicants.filter(applicant => {
            const matchesSearch = searchQuery === '' ||
                applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                applicant.currentRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
                applicant.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPosition = positionFilter === 'all' || applicant.positionReqId === positionFilter;
            const matchesStage = stageFilter === 'all' || applicant.stage === stageFilter;
            const matchesCert = certFilter === 'all' ||
                (certFilter === 'certified' && applicant.certified) ||
                (certFilter === 'pending' && !applicant.certified);

            return matchesSearch && matchesPosition && matchesStage && matchesCert;
        });

    }, [allApplicants, searchQuery, positionFilter, stageFilter, certFilter]);

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

    const handleScheduleInterview = async (applicant: Applicant) => {
        setSelectedApplicant(applicant);

        // Fetch position details to get interview stages
        if (applicant.positionId) {
            try {
                const response = await api.get(`/hiring/positions/${applicant.positionId}/`);
                setPositionDetails(response.data);
                setInterviewStages(response.data.stages || []);
            } catch (error) {
                console.error('Error fetching position details:', error);
                setInterviewStages([]);
            }
        }

        setShowScheduleModal(true);
    };

    const handleSendOffer = async (applicant: Applicant) => {
        console.log('🎯 handleSendOffer called for applicant:', applicant.name);
        console.log('📋 Current applicant stage:', applicant.stage);
        console.log('💼 Applicant position ID:', applicant.positionId);

        setSelectedApplicant(applicant);

        // Fetch position details to get department, worksite, salary, fte
        if (applicant.positionId) {
            try {
                const response = await api.get(`/hiring/positions/${applicant.positionId}/`);
                console.log('✅ Position details fetched:', response.data);
                setPositionDetails(response.data);
            } catch (error) {
                console.error('❌ Error fetching position details:', error);
            }
        }

        console.log('🚀 Opening CreateOfferModal...');
        setShowCreateOfferModal(true);
    };

    // Helper function to get interview stages for a position
    const getInterviewStagesForPosition = React.useCallback((positionReqId: string) => {
        const positionsArray = Array.isArray(positions) ? positions : [];
        const position = positionsArray.find((p: any) =>
            (p.reqId === positionReqId || p.req_id === positionReqId)
        );

        if (!position?.stages) {
            return [];
        }

        // Transform API stages to modal format
        return position.stages.map((stage: any) => ({
            id: stage.id,
            stageNumber: stage.stageNumber || stage.stage_number,
            stageName: stage.stageName || stage.stage_name,
            interviewers: (stage.interviewers || []).map((interviewer: any) => ({
                id: interviewer.id,
                name: interviewer.name,
                email: interviewer.email,
                role: interviewer.role
            }))
        }));
    }, [positions]);

    const handleInterviewScheduled = async (scheduleData: any) => {
        console.log('Interview scheduled:', scheduleData);

        try {
            // Find the stage ID from the interview stages
            const stage = interviewStages.find(s => s.stageNumber === scheduleData.stage);

            if (!stage) {
                throw new Error('Invalid interview stage');
            }

            // Call the backend API to schedule the interview
            await scheduleInterview({
                application: scheduleData.applicantId,
                stage: stage.id,
                scheduledDate: scheduleData.date,
                scheduledTime: scheduleData.time,
                location: scheduleData.location
            });

            // Refresh applications to update the interview stage
            await fetchApplications();

            alert('Interview scheduled successfully!');
        } catch (error) {
            console.error('Error scheduling interview:', error);
            alert('Failed to schedule interview. Please try again.');
        }
    };

    const handleOfferSent = async (offerData: any) => {
        console.log('Offer sent:', offerData);

        try {
            // Note: Offer is already created by CreateOfferModal, just update UI state

            // Refresh applications to show updated stage
            await fetchApplications();

        } catch (error) {
            console.error('Error refreshing applications:', error);
        }
    };

    // Get unique positions from fetched positions data
    const availablePositions = React.useMemo(() => {
        // Ensure positions is an array
        const positionsArray = Array.isArray(positions) ? positions : [];

        // Create a map to avoid duplicates, keyed by reqId
        const positionsMap = new Map();

        positionsArray.forEach((pos: any) => {
            const reqId = pos.reqId || pos.reqId;
            const title = pos.title;
            if (reqId && title) {
                positionsMap.set(reqId, { reqId, title });
            }
        });

        return Array.from(positionsMap.values());
    }, [positions]);

    // Find the currently filtered position details
    const currentPosition = React.useMemo(() => {
        if (positionFilter === 'all') return null;
        return availablePositions.find((p: any) => p.reqId === positionFilter);
    }, [positionFilter, availablePositions]);

    const stats = {
        total: allApplicants.length,
        readyForInterview: allApplicants.filter(a =>
            a.stage === 'Interview' ||
            (a.completedInterviewStages < a.totalInterviewStages && a.totalInterviewStages > 0)
        ).length,
        readyForOffer: allApplicants.filter(a =>
            a.stage === 'Reference Check' ||
            (a.completedInterviewStages >= a.totalInterviewStages && a.totalInterviewStages > 0 && a.stage !== 'Offer')
        ).length,
        inReview: allApplicants.filter(a => a.stage === 'Application Review').length
    };

    // Handle clearing position filter and URL parameter
    const handleClearPositionFilter = () => {
        setPositionFilter('all');
        router.push('/hiring/applicants');
    };

    const handleViewProfile = async (applicant: Applicant) => {
        setSelectedApplicant(applicant);
        setShowProfileModal(true);
        setLoadingDetail(true);

        try {
            // Fetch the full application details including screening answers, references, etc.
            const fullDetails = await fetchApplicationById(applicant.id);
            console.log('Full application details:', fullDetails);
            setDetailedApplicant(fullDetails);
        } catch (error) {
            console.error('Error fetching application details:', error);
            // Still show modal even if detail fetch fails
        } finally {
            setLoadingDetail(false);
        }
    };

    return (
        <>
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {currentPosition ? `Applicants - ${currentPosition.title}` : 'All Applicants'}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {currentPosition
                                ? `Viewing applicants for ${currentPosition.reqId}`
                                : 'Manage all applicants across all positions'
                            }
                        </p>
                    </div>
                    {currentPosition && (
                        <button
                            onClick={handleClearPositionFilter}
                            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear Filter
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-sm text-gray-500 mb-1">Total Applicants</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-sm text-gray-500 mb-1">Ready for Interview</div>
                    <div className="text-3xl font-bold text-blue-600">{stats.readyForInterview}</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-sm text-gray-500 mb-1">Ready for Offer</div>
                    <div className="text-3xl font-bold text-green-600">{stats.readyForOffer}</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-sm text-gray-500 mb-1">In Review</div>
                    <div className="text-3xl font-bold text-yellow-600">{stats.inReview}</div>
                </div>
            </div>

            {/* Position Filter Banner - show when filtered */}
            {currentPosition && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-blue-900">
                                    Filtering by: <span className="font-bold">{currentPosition.title}</span>
                                </p>
                                <p className="text-xs text-blue-700">
                                    Showing {filteredApplicants.length} applicant{filteredApplicants.length !== 1 ? 's' : ''} for this position
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClearPositionFilter}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            View All Applicants
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 space-y-4">
                    <div className="flex items-center gap-4">
                        <Input
                            placeholder="Search by name, email, or role..."
                            className=""
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Select
                            className="w-64"
                            value={positionFilter}
                            onChange={(e) => setPositionFilter(e.target.value)}
                            disabled={positionsLoading}
                        >
                            <option value="all">
                                {positionsLoading ? 'Loading positions...' : 'All Positions'}
                            </option>
                            {availablePositions.map((pos: any) => (
                                <option key={pos.reqId} value={pos.reqId}>
                                    {pos.reqId} - {pos.title}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex items-center gap-4">
                        <Select
                            className="flex-1"
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
                            className="flex-1"
                            value={certFilter}
                            onChange={(e) => setCertFilter(e.target.value)}
                        >
                            <option value="all">All Certifications</option>
                            <option value="certified">Certified Only</option>
                            <option value="pending">Pending License</option>
                        </Select>
                    </div>
                </div>

                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <p className="text-sm text-gray-600">
                        Showing {filteredApplicants.length} of {allApplicants.length} applicants
                    </p>
                </div>

                <div>
                    {allApplicants.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applicants Yet</h3>
                            <p className="text-gray-500">Applications will appear here once candidates apply to open positions.</p>
                        </div>
                    ) : filteredApplicants.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Matches Found</h3>
                            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                        </div>
                    ) : (
                        filteredApplicants.map((applicant) => (
                            <ApplicantRow
                                key={applicant.id}
                                applicant={applicant}
                                selected={selectedApplicants.has(applicant.id)}
                                onSelect={handleSelectApplicant}
                                onScheduleInterview={handleScheduleInterview}
                                onSendOffer={handleSendOffer}
                                onViewProfile={handleViewProfile}
                                onRefresh={fetchApplications}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Modals */}
            {showScheduleModal && selectedApplicant && (
                <ScheduleInterviewModal
                    applicant={{
                        id: selectedApplicant.id,
                        name: selectedApplicant.name,
                        email: selectedApplicant.email,
                        positionTitle: selectedApplicant.positionTitle,
                        currentStage: selectedApplicant.currentInterviewStage
                    }}
                    interviewStages={getInterviewStagesForPosition(selectedApplicant.positionReqId)}
                    onClose={() => setShowScheduleModal(false)}
                    onSchedule={handleInterviewScheduled}
                />
            )}

            {showCreateOfferModal && selectedApplicant && (
                <CreateOfferModal
                    applicant={{
                        id: selectedApplicant.id,
                        name: selectedApplicant.name,
                        email: selectedApplicant.email,
                        positionTitle: selectedApplicant.positionTitle,
                        department: selectedApplicant.department,
                        worksite: selectedApplicant.worksite,
                        salary: selectedApplicant.salary,
                        fte: selectedApplicant.fte,
                        startDate: selectedApplicant.startDate
                    }}
                    onClose={() => setShowCreateOfferModal(false)}
                    onOfferCreated={handleOfferSent}
                />
            )}

            {showProfileModal && selectedApplicant && (
                <ApplicantProfile
                    applicant={{
                        id: selectedApplicant.id,
                        name: selectedApplicant.name,
                        email: selectedApplicant.email,
                        phone: detailedApplicant?.applicantPhone || '',
                        currentRole: selectedApplicant.currentRole,
                        experience: selectedApplicant.experience,
                        certified: selectedApplicant.certified,
                        internal: selectedApplicant.internal,
                        stage: selectedApplicant.stage,
                        positionTitle: selectedApplicant.positionTitle,
                        positionReqId: selectedApplicant.positionReqId,
                        appliedDate: selectedApplicant.appliedDate,
                        completedInterviewStages: selectedApplicant.completedInterviewStages,
                        totalInterviewStages: selectedApplicant.totalInterviewStages,
                        startDateAvailability: detailedApplicant?.startDateAvailability || selectedApplicant.startDate,
                        screeningAnswers: detailedApplicant?.screeningAnswers || {},
                        resume: detailedApplicant?.resume || '',
                        coverLetter: detailedApplicant?.coverLetter || '',
                        references: detailedApplicant?.references || [],
                        interviewAvailability: detailedApplicant?.interviewAvailability || []
                    }}
                    loading={loadingDetail}
                    onClose={() => {
                        setShowProfileModal(false);
                        setDetailedApplicant(null);
                    }}
                    onScheduleInterview={handleScheduleInterview}
                    onSendOffer={handleSendOffer}
                />
            )}

        </>
    );
}

export default function ApplicantsPage() {
    return (
        <Layout>
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading applicants...</p>
                    </div>
                </div>
            }>
                <ApplicantsContent />
            </Suspense>
        </Layout>
    );
}