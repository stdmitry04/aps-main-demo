import React from 'react';
import { PublicPosition, JobApplication, Reference, InterviewAvailability, ScreeningQuestion } from '@/types';
import { screeningQuestionsPool } from './mockData';
import { Button, Input } from '@/components/ui';
import { ScreeningQuestions } from './ScreeningQuestions';
import { ReferencesSection } from './ReferencesSection';
import { AvailabilitySection } from './AvailabilitySection';
import { ResumeUpload } from './ResumeUpload';

interface ApplicationModalProps {
  position: PublicPosition;
  onClose: () => void;
  onSubmit: (application: JobApplication) => void;
}

type ApplicationStep = 'personal' | 'screening' | 'availability' | 'references' | 'resume' | 'review';

export function ApplicationModal({ position, onClose, onSubmit }: ApplicationModalProps) {
  const [currentStep, setCurrentStep] = React.useState<ApplicationStep>('personal');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [applicantName, setApplicantName] = React.useState('');
  const [applicantEmail, setApplicantEmail] = React.useState('');
  const [applicantPhone, setApplicantPhone] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [screeningAnswers, setScreeningAnswers] = React.useState<Record<string, string>>({});
  const [references, setReferences] = React.useState<Reference[]>([
    { name: '', email: '', phone: '', relationship: '' },
    { name: '', email: '', phone: '', relationship: '' },
    { name: '', email: '', phone: '', relationship: '' }
  ]);
  const [interviewAvailability, setInterviewAvailability] = React.useState<InterviewAvailability[]>([]);
  const [resumeFile, setResumeFile] = React.useState<File | null>(null);
  const [coverLetter, setCoverLetter] = React.useState('');

  // Errors
  const [personalErrors, setPersonalErrors] = React.useState<Record<string, string>>({});
  const [screeningErrors, setScreeningErrors] = React.useState<Record<string, string>>({});
  const [availabilityErrors, setAvailabilityErrors] = React.useState<Record<string, string>>({});
  const [referenceErrors, setReferenceErrors] = React.useState<Record<number, Record<string, string>>>({});
  const [resumeError, setResumeError] = React.useState('');

  // Get screening questions for this position
  const positionQuestions = React.useMemo(() => {
    if (position.screeningQuestions && position.screeningQuestions.length > 0) {
      const firstQuestion = position.screeningQuestions[0];
      
      // Check if they're already full question objects (from backend)
      if (typeof firstQuestion === 'object' && 'question' in firstQuestion) {
        return position.screeningQuestions as ScreeningQuestion[];
      }
      
      // Otherwise, they're IDs that need to be mapped from the pool
      return position.screeningQuestions
        .map(qId => screeningQuestionsPool.find(q => q.id === qId))
        .filter((q): q is NonNullable<typeof q> => q !== undefined);
    }
    
    return [];
  }, [position.screeningQuestions]);

  console.log('=== SCREENING QUESTIONS DEBUG ===');
  console.log('position.screeningQuestions:', position.screeningQuestions);
  console.log('positionQuestions result:', positionQuestions);
  console.log('================================');

  const steps: { key: ApplicationStep; label: string }[] = [
    { key: 'personal', label: 'Personal Info' },
    { key: 'screening', label: 'Screening' },
    { key: 'availability', label: 'Availability' },
    { key: 'references', label: 'References' },
    { key: 'resume', label: 'Resume' },
    { key: 'review', label: 'Review' }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  const validatePersonalInfo = (): boolean => {
    const errors: Record<string, string> = {};

    if (!applicantName.trim()) errors.name = 'Name is required';
    if (!applicantEmail.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicantEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    setPersonalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateScreeningQuestions = (): boolean => {
    const errors: Record<string, string> = {};

    positionQuestions.forEach(q => {
      if (q.required && !screeningAnswers[q.id]?.trim()) {
        errors[q.id] = 'This question is required';
      }
    });

    setScreeningErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAvailability = (): boolean => {
    const errors: Record<string, string> = {};

    if (!startDate) {
      errors.startDate = 'Start date is required';
    }

    const totalSlots = interviewAvailability.reduce((sum, day) => sum + day.timeSlots.length, 0);
    if (totalSlots < 3) {
      errors.interviewAvailability = 'Please select at least 3 available time slots';
    }

    setAvailabilityErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateReferences = (): boolean => {
    const errors: Record<number, Record<string, string>> = {};
    let hasErrors = false;

    references.slice(0, 3).forEach((ref, index) => {
      const refErrors: Record<string, string> = {};

      if (!ref.name.trim()) refErrors.name = 'Name is required';
      if (!ref.email.trim()) refErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ref.email)) {
        refErrors.email = 'Invalid email address';
      }
      if (!ref.relationship.trim()) refErrors.relationship = 'Relationship/title is required';

      if (Object.keys(refErrors).length > 0) {
        errors[index] = refErrors;
        hasErrors = true;
      }
    });

    setReferenceErrors(errors);
    return !hasErrors;
  };

  const validateResume = (): boolean => {
    console.log('=== RESUME VALIDATION DEBUG ===');
    console.log('resumeFile:', resumeFile);
    console.log('resumeFile is null?', resumeFile === null);
    console.log('================================');
    
    if (!resumeFile) {
      setResumeError('Resume is required');
      return false;
    }
    setResumeError('');
    return true;
  };

  const handleNext = () => {
    let isValid = true;

    switch (currentStep) {
      case 'personal':
        isValid = validatePersonalInfo();
        break;
      case 'screening':
        isValid = validateScreeningQuestions();
        break;
      case 'availability':
        isValid = validateAvailability();
        break;
      case 'references':
        isValid = validateReferences();
        break;
      case 'resume':
        isValid = validateResume();
        break;
    }

    if (isValid && currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].key);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].key);
    }
  };

  const handleSubmit = async () => {
    if (!validateResume()) return;

    setIsSubmitting(true);

    const application: JobApplication = {
      positionReqId: position.reqId,
      applicantName,
      applicantEmail,
      applicantPhone,
      startDateAvailability: startDate,
      screeningAnswers,
      references: references.filter(r => r.name && r.email),
      interviewAvailability,
      resumeFile,
      coverLetter,
      submittedAt: new Date().toISOString()
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    onSubmit(application);
    setIsSubmitting(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            <Input
              label="Full Name *"
              value={applicantName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApplicantName(e.target.value)}
              placeholder="John Doe"
              error={personalErrors.name}
            />
            <Input
              label="Email Address *"
              type="email"
              value={applicantEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApplicantEmail(e.target.value)}
              placeholder="john.doe@email.com"
              error={personalErrors.email}
            />
            <Input
              label="Phone Number (Optional)"
              type="tel"
              value={applicantPhone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApplicantPhone(e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
        );

      case 'screening':
        return (
          <ScreeningQuestions
            questions={positionQuestions}
            answers={screeningAnswers}
            onChange={(qId, answer) => setScreeningAnswers({ ...screeningAnswers, [qId]: answer })}
            errors={screeningErrors}
          />
        );

      case 'availability':
        return (
          <AvailabilitySection
            startDate={startDate}
            onStartDateChange={setStartDate}
            interviewAvailability={interviewAvailability}
            onInterviewAvailabilityChange={setInterviewAvailability}
            errors={availabilityErrors}
          />
        );

      case 'references':
        return (
          <ReferencesSection
            references={references}
            onChange={setReferences}
            errors={referenceErrors}
          />
        );

      case 'resume':
        return (
          <div className="space-y-6">
            <ResumeUpload
              file={resumeFile}
              onFileChange={setResumeFile}
              error={resumeError}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter (Optional)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                placeholder="Tell us why you're interested in this position..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        );

      case 'review':
        return <ReviewStep 
          position={position}
          applicantName={applicantName}
          applicantEmail={applicantEmail}
          applicantPhone={applicantPhone}
          startDate={startDate}
          screeningAnswers={screeningAnswers}
          positionQuestions={positionQuestions}
          references={references}
          interviewAvailability={interviewAvailability}
          resumeFile={resumeFile}
          coverLetter={coverLetter}
        />;

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Apply for Position</h2>
              <p className="text-sm text-gray-600 mt-1">{position.title}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.key} className="flex items-center flex-1">
                  <div className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index <= currentStepIndex ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`ml-2 text-xs font-medium hidden md:block ${
                      index <= currentStepIndex ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between bg-gray-50 rounded-b-2xl">
          <Button
            variant="secondary"
            onClick={currentStepIndex === 0 ? onClose : handleBack}
          >
            {currentStepIndex === 0 ? 'Cancel' : 'Back'}
          </Button>

          {currentStep === 'review' ? (
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Review Step Component
interface ReviewStepProps {
  position: PublicPosition;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  startDate: string;
  screeningAnswers: Record<string, string>;
  positionQuestions: any[];
  references: Reference[];
  interviewAvailability: InterviewAvailability[];
  resumeFile: File | null;
  coverLetter?: string;
}

function ReviewStep(props: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Application</h3>
        <p className="text-sm text-gray-600">
          Please review your information before submitting. You can go back to make changes if needed.
        </p>
      </div>

      {/* Personal Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
        <dl className="space-y-2 text-sm">
          <div><dt className="inline font-medium">Name:</dt> <dd className="inline">{props.applicantName}</dd></div>
          <div><dt className="inline font-medium">Email:</dt> <dd className="inline">{props.applicantEmail}</dd></div>
          {props.applicantPhone && (
            <div><dt className="inline font-medium">Phone:</dt> <dd className="inline">{props.applicantPhone}</dd></div>
          )}
        </dl>
      </div>

      {/* Availability */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Availability</h4>
        <p className="text-sm"><span className="font-medium">Start Date:</span> {new Date(props.startDate).toLocaleDateString()}</p>
        <p className="text-sm mt-2">
          <span className="font-medium">Interview Slots:</span> {props.interviewAvailability.reduce((sum, day) => sum + day.timeSlots.length, 0)} selected
        </p>
      </div>

      {/* References */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">References</h4>
        <p className="text-sm">{props.references.filter(r => r.name && r.email).length} references provided</p>
      </div>

      {/* Resume */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Documents</h4>
        <p className="text-sm"><span className="font-medium">Resume:</span> {props.resumeFile?.name}</p>
        {props.coverLetter && (
          <p className="text-sm mt-1"><span className="font-medium">Cover Letter:</span> Included</p>
        )}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-green-800">
            Your application is ready to submit! You'll receive a confirmation email at <strong>{props.applicantEmail}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
