import React, { useState } from "react";
import { Button } from "@/components/ui";
import { PersonalInformationSection } from "./sections/PersonalInformationSection";
import { EmploymentDetailsSection } from "./sections/EmploymentDetailsSection";
import { I9FormSection } from "./sections/I9FormSection";
import { TaxWithholdingsSection } from "./sections/TaxWithholdingsSection";
import { PaymentMethodSection } from "./sections/PaymentMethodSection";
import { TimeOffSection } from "./sections/TimeOffSection";
import { DeductionsSection } from "./sections/DeductionsSection";
import { EmergencyContactSection } from "./sections/EmergencyContactSection";

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  offerDate: string;
  status: "not_started" | "in_progress" | "completed" | "submitted";
  completedSections: number;
}

interface AdminOnboardingFormContainerProps {
  candidate: Candidate;
  onBack: () => void;
}

export function AdminOnboardingFormContainer({
  candidate,
  onBack
}: AdminOnboardingFormContainerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(
    Array(8).fill(false)
  );
  const [candidateCompletedSteps, setCandidateCompletedSteps] = useState<boolean[]>(
    // Mark sections as completed based on candidate's progress
    Array(8).fill(false).map((_, i) => i < candidate.completedSections)
  );

  const sections = [
    { name: "Personal Information", component: PersonalInformationSection },
    { name: "Employment Details", component: EmploymentDetailsSection },
    { name: "I-9 Form", component: I9FormSection },
    { name: "Tax Withholdings", component: TaxWithholdingsSection },
    { name: "Payment Method", component: PaymentMethodSection },
    { name: "Time Off", component: TimeOffSection },
    { name: "Deductions", component: DeductionsSection },
    { name: "Emergency Contact", component: EmergencyContactSection }
  ];

  const CurrentSection = sections[currentStep].component;
  const isCompletedByCandidate = candidateCompletedSteps[currentStep];
  const isCompletedByAdmin = completedSteps[currentStep];

  const handleStepComplete = () => {
    const newCompleted = [...completedSteps];
    newCompleted[currentStep] = true;
    setCompletedSteps(newCompleted);

    if (currentStep < sections.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const allStepsComplete = completedSteps.every(step => step);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{candidate.name}</h1>
              <p className="text-gray-600 mt-1">{candidate.position}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium">Status</p>
              <p className="text-sm font-semibold text-blue-600 mt-1">Admin Review</p>
            </div>
          </div>
        </div>

        {/* Info Banner - What candidate filled */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-blue-900">Candidate Progress</h3>
              <p className="text-sm text-blue-700 mt-1">
                Candidate has completed {candidate.completedSections} of 8 sections. 
                You can review their submissions and complete any remaining sections.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {sections.length}
            </span>
            <span className="text-sm text-gray-600">
              {completedSteps.filter(s => s).length} of {sections.length} reviewed by admin
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {sections.map((section, index) => {
              const candidateCompleted = candidateCompletedSteps[index];
              const adminCompleted = completedSteps[index];

              return (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-xs sm:text-sm ${
                    index === currentStep
                      ? "bg-blue-600 text-white"
                      : adminCompleted
                      ? "bg-green-100 text-green-800"
                      : candidateCompleted
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  title={section.name}
                >
                  {adminCompleted && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>{section.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mb-6 flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Admin Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Candidate Filled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-xs text-gray-600">Not Started</span>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {sections[currentStep].name}
            </h2>
            {isCompletedByCandidate && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Candidate Submitted
              </span>
            )}
          </div>

          {/* Show what candidate filled if they filled it */}
          {isCompletedByCandidate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 font-medium">
                ✓ Candidate has filled out this section. Review their answers below.
              </p>
            </div>
          )}

          <CurrentSection candidate={candidate} />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            variant="secondary"
            onClick={handlePreviousStep}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          <div className="flex gap-4">
            {currentStep === sections.length - 1 && allStepsComplete && (
              <Button variant="success">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark as Submitted
              </Button>
            )}

            {currentStep < sections.length - 1 && (
              <Button onClick={handleStepComplete}>
                Next Step
              </Button>
            )}

            {currentStep === sections.length - 1 && !allStepsComplete && (
              <Button onClick={handleStepComplete}>
                Review Complete
              </Button>
            )}
          </div>
        </div>

        {/* Summary Card */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Review Summary</h3>
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{section.name}</span>
                  {candidateCompletedSteps[index] && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Candidate filled
                    </span>
                  )}
                </div>
                {completedSteps[index] ? (
                  <span className="text-xs font-medium text-green-600">✓ Reviewed</span>
                ) : (
                  <span className="text-xs font-medium text-gray-400">Pending</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

