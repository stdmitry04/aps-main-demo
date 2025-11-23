'use client'

import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { AdminCandidateSelector, type OnboardingCandidate } from "./components/AdminCandidateSelector";
import { AdminOnboardingFormContainer } from "./components/AdminOnboardingFormContainer";
import { ApplicantsWithoutOnboarding } from "./components/ApplicantsWithoutOnboarding";

type TabView = 'candidates' | 'applicants-without-onboarding';

export default function AdminOnboardingPage() {
    const [selectedCandidate, setSelectedCandidate] = useState<OnboardingCandidate | null>(null);
    const [activeTab, setActiveTab] = useState<TabView>('candidates');

    const handleBackToDashboard = () => {
        setSelectedCandidate(null);
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {!selectedCandidate ? (
                    <div>
                        {/* Tab Navigation */}
                        <div className="bg-white border-b border-gray-200">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                    <button
                                        onClick={() => setActiveTab('candidates')}
                                        className={`${activeTab === 'candidates'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                    >
                                        Candidates
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('applicants-without-onboarding')}
                                        className={`${activeTab === 'applicants-without-onboarding'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                    >
                                        Applicants Without Onboarding
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'candidates' ? (
                            <AdminCandidateSelector onSelectCandidate={setSelectedCandidate} />
                        ) : (
                            <ApplicantsWithoutOnboarding />
                        )}
                    </div>
                ) : (
                    <AdminOnboardingFormContainer
                        candidate={selectedCandidate}
                        onBack={handleBackToDashboard}
                    />
                )}
            </div>
        </Layout>
    );
}
