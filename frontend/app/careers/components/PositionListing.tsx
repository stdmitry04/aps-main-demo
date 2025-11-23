import React from 'react';
import { PublicPosition } from '@/types';
import { Button } from '@/components/ui';

interface PositionListingProps {
  position: PublicPosition;
  onApply: (position: PublicPosition) => void;
  onViewDetails: (position: PublicPosition) => void;
}

export const PositionListing = React.memo(({ position, onApply, onViewDetails }: PositionListingProps) => {
  const isOpen = position.status === 'Open';
  const isExpired = new Date(position.postingEndDate) < new Date();

  return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {position.title}
            </h3>
            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {position.worksite}
            </span>
              <span className="text-gray-400">•</span>
              <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
                {position.department}
            </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {isOpen && !isExpired ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
              Open
            </span>
            ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
              Closed
            </span>
            )}
            <span className="text-sm text-gray-500">
            {position.reqId}
          </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-gray-500">Salary Range:</span>
            <span className="ml-2 font-medium text-gray-900">{position.salaryRange}</span>
          </div>
          <div>
            <span className="text-gray-500">FTE:</span>
            <span className="ml-2 font-medium text-gray-900">{position.fte}</span>
          </div>
          <div>
            <span className="text-gray-500">Start Date:</span>
            <span className="ml-2 font-medium text-gray-900">
            {new Date(position.startDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          </div>
          <div>
            <span className="text-gray-500">Application Deadline:</span>
            <span className="ml-2 font-medium text-gray-900">
            {new Date(position.postingEndDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
          <p className="text-sm text-gray-700 line-clamp-3">{position.description}</p>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Requirements</h4>
          <p className="text-sm text-gray-700 line-clamp-2 whitespace-pre-line">
            {position.requirements}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
              onClick={() => onApply(position)}
              disabled={!isOpen || isExpired}
              className="flex-1"
          >
            {isOpen && !isExpired ? 'Apply Now' : 'Application Closed'}
          </Button>
          <Button variant="secondary" onClick={() => onViewDetails(position)}>
            View Details
          </Button>
        </div>
      </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if the position itself changes
  // This prevents re-renders when parent state changes (like search/filters)
  return prevProps.position.reqId === nextProps.position.reqId &&
      prevProps.position.status === nextProps.position.status;
});

PositionListing.displayName = 'PositionListing';