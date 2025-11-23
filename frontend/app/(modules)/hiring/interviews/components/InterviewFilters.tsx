import React from 'react';
import { Input, Select } from '@/components/ui';

interface InterviewFilters {
  searchTerm: string;
  statusFilter: string;
  dateFilter: string;
  districtFilter: string;
  positionFilter: string;
}

interface InterviewFiltersProps {
  filters: InterviewFilters;
  districts: string[];
  positions: string[];
  totalInterviews: number;
  filteredCount: number;
  hasActiveFilters: boolean;
  onFilterChange: (filterName: keyof InterviewFilters, value: string) => void;
  onClearFilters: () => void;
}

export const InterviewFiltersComponent: React.FC<InterviewFiltersProps> = ({
  filters,
  districts,
  positions,
  totalInterviews,
  filteredCount,
  hasActiveFilters,
  onFilterChange,
  onClearFilters,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear All Filters
          </button>
        )}
      </div>

      {/* Filter Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="md:col-span-3 lg:col-span-2">
          <Input
            label=""
            placeholder="Search by candidate name, position, or email..."
            value={filters.searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onFilterChange('searchTerm', e.target.value)
            }
          />
        </div>

        {/* District Filter */}
        <Select
          label=""
          value={filters.districtFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onFilterChange('districtFilter', e.target.value)
          }
        >
          <option value="All">All Districts</option>
          {districts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </Select>

        {/* Position Filter */}
        <Select
          label=""
          value={filters.positionFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onFilterChange('positionFilter', e.target.value)
          }
        >
          <option value="All">All Positions</option>
          {positions.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </Select>

        {/* Status Filter */}
        <Select
          label=""
          value={filters.statusFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onFilterChange('statusFilter', e.target.value)
          }
        >
          <option value="All">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="No Show">No Show</option>
        </Select>

        {/* Date Filter */}
        <Select
          label=""
          value={filters.dateFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onFilterChange('dateFilter', e.target.value)
          }
        >
          <option value="All">All Dates</option>
          <option value="Today">Today</option>
          <option value="This Week">This Week</option>
          <option value="This Month">This Month</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Past">Past Interviews</option>
        </Select>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.searchTerm && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Search: "{filters.searchTerm}"
              <button
                onClick={() => onFilterChange('searchTerm', '')}
                className="hover:text-blue-900"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.districtFilter !== 'All' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              District: {filters.districtFilter}
              <button
                onClick={() => onFilterChange('districtFilter', 'All')}
                className="hover:text-blue-900"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.positionFilter !== 'All' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Position: {filters.positionFilter}
              <button
                onClick={() => onFilterChange('positionFilter', 'All')}
                className="hover:text-blue-900"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.statusFilter !== 'All' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Status: {filters.statusFilter}
              <button
                onClick={() => onFilterChange('statusFilter', 'All')}
                className="hover:text-blue-900"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.dateFilter !== 'All' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Date: {filters.dateFilter}
              <button
                onClick={() => onFilterChange('dateFilter', 'All')}
                className="hover:text-blue-900"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing <strong>{filteredCount}</strong> of <strong>{totalInterviews}</strong> interviews
        </p>
      </div>
    </div>
  );
};
