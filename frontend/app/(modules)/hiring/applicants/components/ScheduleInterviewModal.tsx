import React from 'react';
import { Button, Input, Select } from '@/components/ui';

interface InterviewStageConfig {
  stageNumber: number;
  stageName: string;
  interviewers: Array<{
    name: string;
    email: string;
    role: string;
  }>;
}

interface ScheduleInterviewModalProps {
  applicant: {
    id: string;
    name: string;
    email: string;
    positionTitle: string;
    currentStage: number;
  };
  interviewStages: InterviewStageConfig[];
  onClose: () => void;
  onSchedule: (data: any) => void;
}

export function ScheduleInterviewModal({
  applicant,
  interviewStages,
  onClose,
  onSchedule
}: ScheduleInterviewModalProps) {
  // Ensure currentStage is a number for proper initialization
  const initialCurrentStage = typeof applicant.currentStage === 'number'
    ? applicant.currentStage
    : parseInt(String(applicant.currentStage), 10) || 0;

  const [selectedStage, setSelectedStage] = React.useState<number>(initialCurrentStage + 1);
  const [interviewDate, setInterviewDate] = React.useState('');
  const [interviewTime, setInterviewTime] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [additionalNotes, setAdditionalNotes] = React.useState('');
  const [isGeneratingZoom, setIsGeneratingZoom] = React.useState(false);

  const selectedStageConfig = interviewStages.find(s => s.stageNumber === selectedStage);

  const handleSchedule = async () => {
    setIsGeneratingZoom(true);
    
    // Mock Zoom link generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockZoomLink = `https://zoom.us/j/${Math.floor(Math.random() * 1000000000)}`;
    
    const scheduleData = {
      applicantId: applicant.id,
      applicantName: applicant.name,
      applicantEmail: applicant.email,
      stage: selectedStage,
      stageName: selectedStageConfig?.stageName,
      date: interviewDate,
      time: interviewTime,
      location: location || 'Virtual',
      zoomLink: mockZoomLink,
      interviewers: selectedStageConfig?.interviewers || [],
      notes: additionalNotes
    };

    // Mock sending emails
    console.log('Sending interview invite to candidate:', {
      to: applicant.email,
      subject: `Interview Invitation - ${applicant.positionTitle}`,
      body: `
        Dear ${applicant.name},

        We are pleased to invite you to an interview for the ${applicant.positionTitle} position.

        Interview Details:
        - Stage: ${selectedStageConfig?.stageName}
        - Date: ${new Date(interviewDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        - Time: ${interviewTime}
        - Location: ${location || 'Virtual Meeting'}
        - Join Meeting: ${mockZoomLink}

        ${additionalNotes ? `Additional Information:\n${additionalNotes}` : ''}

        We look forward to speaking with you.

        Best regards,
        School District 308 HR Team
      `
    });

    selectedStageConfig?.interviewers.forEach(interviewer => {
      console.log('Sending interview notification to interviewer:', {
        to: interviewer.email,
        subject: `Interview Scheduled - ${applicant.name} for ${applicant.positionTitle}`,
        body: `
          Hello ${interviewer.name},

          You have been assigned to interview ${applicant.name} for the ${applicant.positionTitle} position.

          Interview Details:
          - Stage: ${selectedStageConfig?.stageName}
          - Candidate: ${applicant.name} (${applicant.email})
          - Date: ${new Date(interviewDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          - Time: ${interviewTime}
          - Location: ${location || 'Virtual Meeting'}
          - Join Meeting: ${mockZoomLink}

          Panel Members:
          ${selectedStageConfig?.interviewers.map(i => `- ${i.name} (${i.role})`).join('\n')}

          ${additionalNotes ? `Notes:\n${additionalNotes}` : ''}

          Please add this to your calendar.

          Best regards,
          HR System
        `
      });
    });

    onSchedule(scheduleData);
    setIsGeneratingZoom(false);
    alert(`Interview scheduled successfully!\nZoom link generated: ${mockZoomLink}\nEmails sent to candidate and ${selectedStageConfig?.interviewers.length || 0} interviewer(s)`);
    onClose();
  };

  const isValid = interviewDate && interviewTime && selectedStageConfig;
  const availableStages = interviewStages.filter(s => s.stageNumber > initialCurrentStage);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Schedule Interview</h2>
            <p className="text-sm text-gray-500 mt-1">{applicant.name} - {applicant.positionTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {availableStages.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                All interview stages have been completed for this applicant. You may now send an offer letter.
              </p>
            </div>
          ) : (
            <>
              <Select
                label="Interview Stage *"
                value={selectedStage.toString()}
                onChange={(e) => setSelectedStage(parseInt(e.target.value))}
              >
                <option value="">Select interview stage</option>
                {availableStages.map(stage => (
                  <option key={stage.stageNumber} value={stage.stageNumber}>
                    Stage {stage.stageNumber}: {stage.stageName}
                  </option>
                ))}
              </Select>

              {selectedStageConfig && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3">Interview Panel</h4>
                  <div className="space-y-2">
                    {selectedStageConfig.interviewers.map((interviewer) => (
                      <div key={interviewer.email} className="flex items-center gap-3 bg-white p-2 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-xs">
                            {interviewer.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{interviewer.name}</div>
                          <div className="text-xs text-gray-500">{interviewer.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-blue-700 mt-3">
                    All panel members will receive a calendar invite and email notification
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Interview Date *"
                  type="date"
                  value={interviewDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInterviewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <Input
                  label="Interview Time *"
                  type="time"
                  value={interviewTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInterviewTime(e.target.value)}
                />
              </div>

              <Input
                label="Location"
                placeholder="e.g., Room 204, Central High School"
                value={location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Any additional information for the candidate or interviewers..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-green-900">Automated Actions</h4>
                    <ul className="text-xs text-green-700 mt-1 space-y-1">
                      <li>• Zoom meeting link will be generated automatically</li>
                      <li>• Candidate will receive interview details via email</li>
                      <li>• Interview panel will receive calendar invites</li>
                      <li>• All participants will be notified</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <Button variant="secondary" onClick={onClose} disabled={isGeneratingZoom}>
            Cancel
          </Button>
          {availableStages.length > 0 && (
            <Button 
              onClick={handleSchedule} 
              disabled={!isValid || isGeneratingZoom}
            >
              {isGeneratingZoom ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Zoom Link...
                </span>
              ) : (
                'Schedule Interview'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
