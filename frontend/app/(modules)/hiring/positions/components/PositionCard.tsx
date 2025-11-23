import React from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Position } from "@/types/hiring";

interface PositionCardProps {
  position: Position;
  onViewApplicants: () => void;
  onEdit?: (position: Position) => void;
}

export function PositionCard({ position, onViewApplicants, onEdit }: PositionCardProps) {
  const getStatusVariant = (status: Position['status']) => {
    switch (status) {
      case 'Open': return 'green';
      case 'Draft': return 'gray';
      case 'Closed': return 'red';
      default: return 'gray';
    }
  };

  // Calculate days open from postingStartDate
  const daysOpen = position.postingStartDate
    ? Math.ceil((Date.now() - new Date(position.postingStartDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{position.title}</h3>
          <p className="text-sm text-gray-600">{position.worksite} • {position.department}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(position.status)}>
            {position.status}
          </Badge>
          {onEdit && (
            <button
              onClick={() => onEdit(position)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Edit position"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Req ID:</span>
          <span className="ml-2 font-medium">{position.reqId}</span>
        </div>
        <div>
          <span className="text-gray-500">FTE:</span>
          <span className="ml-2 font-medium">{position.fte}</span>
        </div>
        <div>
          <span className="text-gray-500">Salary Range:</span>
          <span className="ml-2 font-medium">{position.salaryRange}</span>
        </div>
        <div>
          <span className="text-gray-500">Start Date:</span>
          <span className="ml-2 font-medium">{position.startDate}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-gray-500">Applications:</span>
            <span className="ml-2 font-semibold text-gray-900">{position.applicantCount}</span>
          </div>
          <div>
            <span className="text-gray-500">Interviews:</span>
            <span className="ml-2 font-semibold text-gray-900">{position.interviewCount}</span>
          </div>
          <div>
            <span className="text-gray-500">Days Open:</span>
            <span className="ml-2 font-semibold text-gray-900">{daysOpen}</span>
          </div>
        </div>
        <Button variant="secondary" onClick={onViewApplicants}>
          View Applicants
        </Button>
      </div>
    </div>
  );
}
