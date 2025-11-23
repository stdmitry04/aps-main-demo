'use client'

import React, { useEffect, useState } from "react";
import { UserOnboardingFormContainer } from "./components/UserOnboardingFormContainer";

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  offerDate: string;
  status: "not_started" | "in_progress" | "completed" | "submitted";
  completedSections: number;
}

// Mock function to fetch candidate data
// In production, this would call your API
async function fetchCandidateData(candidateId: string): Promise<Candidate | null> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/onboarding/candidate/${candidateId}`);
  // return response.json();

  // Mock data for development
  const mockCandidates: Record<string, Candidate> = {
    "abc123": {
      id: "abc123",
      name: "Sarah Chen",
      email: "sarah.chen@email.com",
      position: "Special Education Teacher",
      offerDate: "2025-10-10",
      status: "in_progress",
      completedSections: 2
    },
    "def456": {
      id: "def456",
      name: "James Wilson",
      email: "j.wilson@email.com",
      position: "High School Principal",
      offerDate: "2025-10-08",
      status: "not_started",
      completedSections: 0
    }
  };

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCandidates[candidateId] || null);
    }, 500);
  });
}

export default function UserOnboardingPage({
  params
}: {
  params: Promise<{ candidateId: string }>
}) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCandidate() {
      try {
        setLoading(true);

        const resolvedParams = await params;
        const data = await fetchCandidateData(resolvedParams.candidateId);
        setCandidate(data);
        
        if (!data) {
          setError("Invalid or expired onboarding link. Please contact HR for assistance.");
        } else if (data.status === "submitted") {
          setError("You have already submitted your onboarding form. If you need to make changes, please contact HR.");
        } else {
          setCandidate(data);
        }
      } catch (err) {
        setError("Failed to load onboarding form. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadCandidate();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your onboarding form...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Form</h2>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <a
                href="mailto:hr@district.edu"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium w-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact HR
              </a>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium w-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <UserOnboardingFormContainer candidate={candidate} />;
}
