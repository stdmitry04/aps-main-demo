'use client'

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { PersonalInformationSection } from "@/app/(modules)/hiring/onboarding/components/sections/PersonalInformationSection";
import { EmploymentDetailsSection } from "@/app/(modules)/hiring/onboarding/components/sections/EmploymentDetailsSection";
import { I9FormSection } from "@/app/(modules)/hiring/onboarding/components/sections/I9FormSection";
import { TaxWithholdingsSection } from "@/app/(modules)/hiring/onboarding/components/sections/TaxWithholdingsSection";
import { PaymentMethodSection } from "@/app/(modules)/hiring/onboarding/components/sections/PaymentMethodSection";
import { TimeOffSection } from "@/app/(modules)/hiring/onboarding/components/sections/TimeOffSection";
import { DeductionsSection } from "@/app/(modules)/hiring/onboarding/components/sections/DeductionsSection";
import { EmergencyContactSection } from "@/app/(modules)/hiring/onboarding/components/sections/EmergencyContactSection";

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  offerDate: string;
  status: "not_started" | "in_progress" | "completed" | "submitted";
  completedSections: number;
}

interface UserOnboardingFormContainerProps {
  candidate: Candidate;
}

export function UserOnboardingFormContainer({
  candidate
}: UserOnboardingFormContainerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(
    Array(8).fill(false).map((_, i) => i < candidate.completedSections)
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
  const completedCount = completedSteps.filter(s => s).length;
  const allStepsComplete = completedSteps.every(step => step);

  // Auto-save functionality
  useEffect(() => {
    if (hasChanges) {
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasChanges]);

  const handleAutoSave = async () => {
    setIsSaving(true);
    // TODO: Implement actual API call to save progress
    await new Promise(resolve => setTimeout(resolve, 500));
    setLastSaved(new Date());
    setHasChanges(false);
    setIsSaving(false);
  };

  const handleStepComplete = () => {
    const newCompleted = [...completedSteps];
    newCompleted[currentStep] = true;
    setCompletedSteps(newCompleted);
    setHasChanges(true);

    // TODO: Update backend with progress
    // updateCandidateProgress(candidate.id, newCompleted.filter(s => s).length);

    if (currentStep < sections.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitForm = async () => {
    if (!allStepsComplete) {
      alert("Please complete all sections before submitting.");
      return;
    }

    setIsSaving(true);
    // TODO: Implement actual API call to submit form
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // TODO: Update candidate status to "submitted"
    // submitOnboardingForm(candidate.id);
    
    alert("Your onboarding form has been submitted successfully!");
    setIsSaving(false);
  };

  const handleSaveAndContinueLater = async () => {
    await handleAutoSave();
    alert("Your progress has been saved. You can continue anytime using the link sent to your email.");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome, {candidate.name.split(' ')[0]}!</h1>
                <p className="text-gray-600 mt-2">{candidate.position}</p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-900">
                    {completedCount}/{sections.length} Complete
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900">Complete Your Onboarding</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Please fill out all sections of this form before your start date. Your progress is automatically saved.
                  </p>
                </div>
              </div>
            </div>

            {/* Auto-save indicator */}
            {lastSaved && (
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Last saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
            {isSaving && (
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving...</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Section {currentStep + 1} of {sections.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round((completedCount / sections.length) * 100)}% Complete
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${(completedCount / sections.length) * 100}%` }}
            />
          </div>

          {/* Section tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sections.map((section, index) => {
              const isCompleted = completedSteps[index];
              const isCurrent = index === currentStep;

              return (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-xs sm:text-sm ${
                    isCurrent
                      ? "bg-blue-600 text-white"
                      : isCompleted
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  title={section.name}
                >
                  {isCompleted && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {!isCompleted && !isCurrent && (
                    <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                  )}
                  <span className="hidden sm:inline">{section.name}</span>
                  <span className="sm:hidden">{index + 1}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {sections[currentStep].name}
            </h2>
            {completedSteps[currentStep] && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-800 text-xs font-medium rounded-full border border-green-200">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Completed
              </span>
            )}
          </div>

          <CurrentSection candidate={candidate} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
          <Button
            variant="secondary"
            onClick={handlePreviousStep}
            disabled={currentStep === 0}
            className="w-full sm:w-auto"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </Button>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              variant="secondary"
              onClick={handleSaveAndContinueLater}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              Save & Continue Later
            </Button>

            {currentStep === sections.length - 1 ? (
              allStepsComplete ? (
                <Button
                  variant="success"
                  onClick={handleSubmitForm}
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit Form
                </Button>
              ) : (
                <Button
                  onClick={handleStepComplete}
                  className="w-full sm:w-auto"
                >
                  Mark as Complete
                </Button>
              )
            ) : (
              <Button
                onClick={handleStepComplete}
                className="w-full sm:w-auto"
              >
                Save & Continue
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            )}
          </div>
        </div>

        {/* Completion Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Completion Progress</h3>
          <div className="space-y-2">
            {sections.map((section, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    completedSteps[index]
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {completedSteps[index] ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-sm text-gray-700">{section.name}</span>
                </div>
                {completedSteps[index] ? (
                  <span className="text-xs font-medium text-green-600">✓ Complete</span>
                ) : (
                  <span className="text-xs font-medium text-gray-400">Pending</span>
                )}
              </div>
            ))}
          </div>

          {allStepsComplete && (
            <div className="mt-6 pt-6 border-t border-gray-300">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-green-900">All Sections Complete!</h4>
                    <p className="text-sm text-green-700 mt-1">
                      You've completed all sections. Please review and submit your onboarding form.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-700 mb-3">
            If you have questions about any section or need assistance, please contact HR:
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:hr@district.edu"
              className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              hr@district.edu
            </a>
            <span className="hidden sm:inline text-blue-300">|</span>
            <a
              href="tel:555-123-4567"
              className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              (555) 123-4567
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
