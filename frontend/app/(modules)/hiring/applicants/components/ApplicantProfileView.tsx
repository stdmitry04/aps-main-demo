import React from 'react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

interface ScreeningQuestion {
    id: string;
    question: string;
    category: string;
    required: boolean;
}

interface ApplicantProfileProps {
    applicant: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        currentRole: string;
        experience: number;
        certified: boolean;
        internal: boolean;
        stage: string;
        positionTitle: string;
        positionReqId: string;
        appliedDate: string;
        completedInterviewStages: number;
        totalInterviewStages: number;
        startDateAvailability: string;
        screeningAnswers?: Record<string, string>;
        resume?: string;
        coverLetter?: string;
        references?: Array<{
            name: string;
            email: string;
            phone?: string;
            relationship: string;
        }>;
        interviewAvailability?: Array<{
            date: string;
            timeSlots: string[];
        }>;
        positionId?: string; // Add this to fetch screening questions
    };
    loading?: boolean;
    onClose: () => void;
    onScheduleInterview: (applicant: any) => void;
    onSendOffer: (applicant: any) => void;
}

export function ApplicantProfile({
    applicant,
    onClose,
    onScheduleInterview,
    onSendOffer
}: ApplicantProfileProps) {
    const [activeTab, setActiveTab] = React.useState<'overview' | 'screening' | 'documents' | 'references' | 'availability'>('overview');
    const [screeningQuestions, setScreeningQuestions] = React.useState<ScreeningQuestion[]>([]);
    const [loadingQuestions, setLoadingQuestions] = React.useState(false);

    const canSendOffer = applicant.completedInterviewStages >= applicant.totalInterviewStages;
    const canScheduleInterview = applicant.completedInterviewStages < applicant.totalInterviewStages;

    // Fetch screening questions when switching to screening tab
    React.useEffect(() => {
        if (activeTab === 'screening' && applicant.positionId && screeningQuestions.length === 0) {
            fetchScreeningQuestions();
        }
    }, [activeTab, applicant.positionId]);

    const fetchScreeningQuestions = async () => {
        try {
            setLoadingQuestions(true);
            const response = await api.get(`/hiring/positions/${applicant.positionId}/`);
            const position = response.data;

            // The position should have screening_questions array
            if (position.screeningQuestions && Array.isArray(position.screeningQuestions)) {
                setScreeningQuestions(position.screeningQuestions);
            }
        } catch (error) {
            console.error('Error fetching screening questions:', error);
        } finally {
            setLoadingQuestions(false);
        }
    };

    // Match question ID to question text
    const getQuestionText = (questionId: string): { question: string; category: string; required: boolean } => {
        const question = screeningQuestions.find(q => q.id === questionId);
        return question || {
            question: `Question ID: ${questionId}`,
            category: 'unknown',
            required: false
        };
    };

    // Handle resume download
    const handleDownloadResume = () => {
        if (applicant.resume) {
            // If resume is a URL, open it
            if (applicant.resume.startsWith('http')) {
                window.open(applicant.resume, '_blank');
            } else {
                // If resume is base64 or blob data, trigger download
                const link = document.createElement('a');
                link.href = applicant.resume;
                link.download = `${applicant.name.replace(/\s+/g, '_')}_Resume.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } else {
            alert('Resume not available for download');
        }
    };

    // Format date properly
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-6xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    {applicant.name ? applicant.name.split(' ').map(n => n[0]).join('') : '??'}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{applicant.name || 'Unknown'}</h2>
                                    <p className="text-sm text-gray-600">{applicant.email}</p>
                                    {applicant.phone && (
                                        <p className="text-sm text-gray-600">{applicant.phone}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-3">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${applicant.certified
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {applicant.certified ? '✓ Certified' : 'Pending License'}
                                </span>
                                {applicant.internal && (
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                        Internal Candidate
                                    </span>
                                )}
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                    Stage: {applicant.stage}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Quick Actions Bar */}
                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        <strong>Applied for:</strong> {applicant.positionTitle} ({applicant.positionReqId})
                    </div>
                    <div className="flex gap-2">
                        {canScheduleInterview && (
                            <Button
                                onClick={() => onScheduleInterview(applicant)}
                                className="text-sm py-1.5"
                            >
                                <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Schedule Interview
                            </Button>
                        )}
                        {canSendOffer && (
                            <Button
                                onClick={() => onSendOffer(applicant)}
                                variant="secondary"
                                className="text-sm py-1.5"
                            >
                                <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Send Offer
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 bg-white">
                    <div className="px-6 flex gap-6">
                        {[
                            { key: 'overview', label: 'Overview', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                            { key: 'screening', label: 'Screening Questions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                            { key: 'documents', label: 'Documents', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                            { key: 'references', label: 'References', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                            { key: 'availability', label: 'Availability', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`py-3 px-1 border-b-2 transition-colors ${activeTab === tab.key
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                                    </svg>
                                    <span className="text-sm font-medium">{tab.label}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Key Information */}
                            <div className="grid grid-cols-3 gap-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="text-sm text-blue-600 font-medium mb-1">Current Role</div>
                                    <div className="text-lg font-semibold text-gray-900">{applicant.currentRole}</div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="text-sm text-green-600 font-medium mb-1">Experience</div>
                                    <div className="text-lg font-semibold text-gray-900">{applicant.experience} years</div>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <div className="text-sm text-purple-600 font-medium mb-1">Applied</div>
                                    <div className="text-lg font-semibold text-gray-900">{applicant.appliedDate}</div>
                                </div>
                            </div>

                            {/* Interview Progress */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Progress</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Completed Stages</span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {applicant.completedInterviewStages} / {applicant.totalInterviewStages}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-blue-600 h-3 rounded-full transition-all"
                                            style={{ width: `${(applicant.completedInterviewStages / applicant.totalInterviewStages) * 100}%` }}
                                        />
                                    </div>
                                    {applicant.completedInterviewStages === applicant.totalInterviewStages ? (
                                        <div className="flex items-center gap-2 text-green-600 text-sm">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            All interview stages completed - Ready for offer
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-600">
                                            {applicant.totalInterviewStages - applicant.completedInterviewStages} stage(s) remaining
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Start Date Availability */}
                            {applicant.startDateAvailability && (
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Start Date Availability</h3>
                                    <p className="text-gray-700">
                                        Earliest start date: <strong>{formatDate(applicant.startDateAvailability)}</strong>
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'screening' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Screening Answers</h3>

                            {loadingQuestions ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-3 text-gray-600">Loading questions...</span>
                                </div>
                            ) : applicant.screeningAnswers && Object.keys(applicant.screeningAnswers).length > 0 ? (
                                Object.entries(applicant.screeningAnswers).map(([questionId, answer], index) => {
                                    const questionData = getQuestionText(questionId);
                                    return (
                                        <div key={questionId} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium text-gray-900 mb-1">
                                                                {questionData.question}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <span className="px-2 py-0.5 bg-gray-200 rounded">
                                                                    {questionData.category}
                                                                </span>
                                                                {questionData.required && (
                                                                    <span className="text-red-600">Required</span>
                                                                )}
                                                                <span className="text-gray-400">•</span>
                                                                <span className="font-mono">ID: {questionId}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                                                        {answer}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No screening answers available
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume</h3>
                                {applicant.resume ? (
                                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                                        <div className="flex items-center gap-4">
                                            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-900">Resume.pdf</div>
                                                <div className="text-sm text-gray-600">Uploaded on {applicant.appliedDate}</div>
                                            </div>
                                            <Button variant="secondary" onClick={handleDownloadResume}>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-gray-500">No resume available</p>
                                    </div>
                                )}
                            </div>

                            {applicant.coverLetter && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h3>
                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                                            {applicant.coverLetter}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'references' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional References</h3>
                            {applicant.references && applicant.references.length > 0 ? (
                                applicant.references.map((reference, index) => (
                                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                {reference.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{reference.name}</h4>
                                                <p className="text-sm text-gray-600 mb-3">{reference.relationship}</p>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Email:</span>
                                                        <p className="font-medium text-gray-900">{reference.email}</p>
                                                    </div>
                                                    {reference.phone && (
                                                        <div>
                                                            <span className="text-gray-500">Phone:</span>
                                                            <p className="font-medium text-gray-900">{reference.phone}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Button variant="secondary" className="text-sm">
                                                Contact
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No references provided
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'availability' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Availability</h3>
                            {applicant.interviewAvailability && applicant.interviewAvailability.length > 0 ? (
                                <div className="space-y-3">
                                    {applicant.interviewAvailability.map((day, index) => (
                                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                            <div className="font-semibold text-gray-900 mb-3">
                                                {formatDate(day.date)}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {day.timeSlots && day.timeSlots.map((slot, slotIndex) => (
                                                    <span
                                                        key={slotIndex}
                                                        className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full"
                                                    >
                                                        {slot}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No availability information provided
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Application ID: {applicant.id}
                    </div>
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}