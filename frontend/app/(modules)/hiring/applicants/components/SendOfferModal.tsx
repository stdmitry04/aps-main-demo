import React from 'react';
import { Button, Input } from '@/components/ui';

interface SendOfferModalProps {
  applicant: {
    id: string;
    name: string;
    email: string;
    positionTitle: string;
    department: string;
    worksite: string;
    salary: string;
    fte: string;
    startDate: string;
  };
  onClose: () => void;
  onSendOffer: (data: any) => void;
}

export function SendOfferModal({ applicant, onClose, onSendOffer }: SendOfferModalProps) {
  const [isSending, setIsSending] = React.useState(false);
  const [offerSent, setOfferSent] = React.useState(false);

  // Editable fields
  const [salary, setSalary] = React.useState('');
  const [startDate, setStartDate] = React.useState(applicant.startDate);

  React.useEffect(() => {
    const salaryMatch = applicant.salary.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/);
    if (salaryMatch) {
      // Use the minimum of the range as default
      setSalary(salaryMatch[1].replace(/,/g, ''));
    } else {
      // If it's already an exact amount, use it
      const exactMatch = applicant.salary.match(/\$?([\d,]+)/);
      if (exactMatch) {
        setSalary(exactMatch[1].replace(/,/g, ''));
      }
    }
  }, [applicant.salary]);

  const formattedSalary = `$${parseInt(salary || '0').toLocaleString()}`;

  const handleSendOffer = async () => {
    if (!salary || !salary || !startDate) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSending(true);
    
    // Mock sending offer
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const offerData = {
      applicantId: applicant.id,
      applicantName: applicant.name,
      applicantEmail: applicant.email,
      positionTitle: applicant.positionTitle,
      department: applicant.department,
      worksite: applicant.worksite,
      salary: formattedSalary,
      fte: applicant.fte,
      startDate: startDate,
      offerDate: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Pending'
    };

    console.log('Sending offer letter to candidate:', {
      to: applicant.email,
      subject: `Job Offer - ${applicant.positionTitle}`,
      htmlContent: 'Offer letter with accept/decline buttons'
    });

    onSendOffer(offerData);
    setIsSending(false);
    setOfferSent(true);
    
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (offerSent) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Offer Letter Sent!</h3>
          <p className="text-gray-600">
            The offer has been sent to {applicant.name} at {applicant.email}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Send Offer Letter</h2>
            <p className="text-sm text-gray-500 mt-1">Configure and preview before sending to {applicant.name}</p>
          </div>
          <button onClick={onClose} disabled={isSending} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Editable Fields Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Configure Offer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Salary"
                  type="number"
                  required
                  value={salary}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSalary(e.target.value)}
                  placeholder="e.g., 62000"
                />
                <p className="text-xs text-gray-600 mt-1">Preview: {formattedSalary}</p>
              </div>
              <div>
                <Input
                  label="Start Date"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Offer Letter Preview */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Offer Letter Preview</h3>
            <div className="border-2 border-gray-300 rounded-lg p-8 bg-white">
              <OfferLetterTemplate
                applicant={applicant}
                salary={formattedSalary}
                startDate={startDate}
              />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-amber-900">What happens next?</h4>
                <ul className="text-xs text-amber-700 mt-1 space-y-1">
                  <li>• Candidate will receive this offer via email</li>
                  <li>• They can accept or decline using the buttons in the email</li>
                  <li>• You'll be notified immediately of their decision</li>
                  <li>• Offer expires automatically after 14 days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <Button variant="secondary" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSendOffer} disabled={isSending}>
            {isSending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending Offer...
              </span>
            ) : (
              'Send Offer Letter'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Offer Letter Template Component
function OfferLetterTemplate({
  applicant,
  salary,
  startDate
}: {
  applicant: SendOfferModalProps['applicant'];
  salary: string;
  startDate: string;
}) {
  const offerDate = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const formattedStartDate = new Date(startDate).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center border-b border-gray-200 pb-6">
        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
          SD
        </div>
        <h1 className="text-2xl font-bold text-gray-900">School District 308</h1>
        <p className="text-sm text-gray-600">Human Resources Department</p>
        <p className="text-sm text-gray-600 mt-1">{offerDate}</p>
      </div>

      {/* Letter Content */}
      <div className="space-y-4 text-gray-800">
        <p className="font-semibold">Dear {applicant.name},</p>
        
        <p>
          We are pleased to offer you the position of <strong>{applicant.positionTitle}</strong> with School District 308. 
          We were impressed by your qualifications and believe you will be an excellent addition to our team.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-6">
          <h3 className="font-semibold text-lg mb-4 text-gray-900">Position Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Position Title</p>
              <p className="font-medium">{applicant.positionTitle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="font-medium">{applicant.department}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Worksite</p>
              <p className="font-medium">{applicant.worksite}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">FTE</p>
              <p className="font-medium">{applicant.fte} (Full-Time)</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Salary</p>
              <p className="font-medium">{salary}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Start Date</p>
              <p className="font-medium">{formattedStartDate}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Benefits Include:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Comprehensive health insurance (medical, dental, vision)</li>
            <li>Retirement plan with employer contribution</li>
            <li>Professional development opportunities</li>
            <li>Paid time off and holidays</li>
            <li>Life insurance and disability coverage</li>
          </ul>
        </div>

        <p>
          This offer is contingent upon successful completion of a background check and verification of your credentials. 
          Please review this offer carefully and respond by clicking one of the buttons below.
        </p>

        <p>
          We are excited about the possibility of you joining our team and look forward to your response.
        </p>

        <p className="pt-4">
          Sincerely,<br />
          <strong>Dr. Jennifer Davis</strong><br />
          Director of Human Resources<br />
          School District 308
        </p>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-200 pt-6 mt-8">
        <p className="text-center text-sm text-gray-600 mb-4">
          Please respond to this offer within 14 days
        </p>
        <div className="flex gap-4 justify-center">
          <button
            className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
            onClick={() => alert('This would accept the offer in the actual email')}
          >
            ✓ Accept Offer
          </button>
          <button
            className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-lg"
            onClick={() => alert('This would decline the offer in the actual email')}
          >
            ✗ Decline Offer
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-4">
          Clicking a button will record your response and notify Human Resources
        </p>
      </div>
    </div>
  );
}
