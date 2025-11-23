import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { InterviewAPI } from '@/app/(modules)/hiring/dto/interview.dto';

interface InterviewDetailsModalProps {
  interview: InterviewAPI;
  onClose: () => void;
  onUpdateStatus: (interviewId: string, status: InterviewAPI['status']) => void;
}

export const InterviewDetailsModal: React.FC<InterviewDetailsModalProps> = ({
  interview,
  onClose,
  onUpdateStatus,
}) => {
  const [status, setStatus] = useState(interview.status);
  const [notes, setNotes] = useState(interview.notes || '');

  const handleSave = () => {
    onUpdateStatus(interview.id, status);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Interview Details</h2>
            <p className="text-sm text-gray-500 mt-1">{interview.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Candidate Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Candidate Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-medium text-gray-900">{interview.candidate_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{interview.candidate_email}</p>
              </div>
            </div>
          </div>

          {/* Interview Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Interview Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Position</p>
                <p className="text-sm font-medium text-gray-900">{interview.position_title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">District</p>
                <p className="text-sm font-medium text-gray-900">{interview.worksite}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Interview Stage</p>
                <p className="text-sm font-medium text-gray-900">
                  Stage {interview.stage_number}: {interview.stage_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-medium text-gray-900">{interview.location}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(interview.scheduled_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm font-medium text-gray-900">{interview.scheduled_time}</p>
              </div>
            </div>
          </div>

          {/* Interview Panel */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Interview Panel</h3>
            <div className="space-y-2">
              {interview.interviewers.map((interviewer) => (
                <div
                  key={interviewer.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-xs">
                      {interviewer.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{interviewer.name}</p>
                    <p className="text-xs text-gray-500">{interviewer.email}</p>
                    <p className="text-xs text-gray-400">{interviewer.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Interview Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InterviewAPI['status'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No Show">No Show</option>
            </select>
          </div>

          {/* Feedback */}
          {interview.feedback && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Feedback</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">{interview.feedback}</p>
                {interview.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={cn(
                          'w-5 h-5',
                          i < interview.rating! ? 'text-yellow-400' : 'text-gray-300'
                        )}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add interview notes..."
            />
          </div>

          {/* Zoom Link */}
          {interview.zoom_link && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Zoom Link</p>
              <a
                href={interview.zoom_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {interview.zoom_link}
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};
