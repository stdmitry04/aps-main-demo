'use client';

import React from 'react';
import { PublicPosition, JobApplication } from '@/types';
import { PositionListing, ApplicationModal, PositionDetailsModal } from './components';
import { Input, Select } from '@/components/ui';
import { useCareersStore } from './useCareersStore';
import { useCareersPositions } from './hooks/useCareersPositions';

export default function CareersPage() {
  // Use the custom hook instead of manual fetch
  const { 
    positions, 
    loading, 
    error, 
    fetchPositions,
    submitApplication 
  } = useCareersPositions();

  // Get state and actions from store
  const {
    searchTerm,
    departmentFilter,
    worksiteFilter,
    selectedPosition,
    showApplicationModal,
    showDetailsModal,
    showSuccessMessage,
    setSearchTerm,
    setDepartmentFilter,
    setWorksiteFilter,
    clearFilters,
    openDetailsModal,
    closeDetailsModal,
    openApplicationModal,
    closeApplicationModal,
    showSuccess,
    hasActiveFilters,
  } = useCareersStore();

  // Computed values
  const departments = React.useMemo(
    () => Array.from(new Set(positions.map(p => p.department).filter(Boolean))).sort(),
    [positions]
  );

  const worksites = React.useMemo(
    () => Array.from(new Set(positions.map(p => p.worksite).filter(Boolean))).sort(),
    [positions]
  );

  const filteredPositions = React.useMemo(() => {
    return positions.filter(position => {
      const matchesSearch =
        position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        position.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        position.worksite.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (position.description && position.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDepartment = departmentFilter === 'all' || position.department === departmentFilter;
      const matchesWorksite = worksiteFilter === 'all' || position.worksite === worksiteFilter;
      const isOpen = position.status === 'Open' && new Date(position.postingEndDate) >= new Date();

      return matchesSearch && matchesDepartment && matchesWorksite && isOpen;
    });
  }, [positions, searchTerm, departmentFilter, worksiteFilter]);

  const handleSubmitApplication = async (application: JobApplication) => {
    try {
      await submitApplication(application);
      closeApplicationModal();
      showSuccess();
    } catch (err) {
      console.error('Error submitting application:', err);
      alert(err instanceof Error ? err.message : 'Failed to submit application. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              SD
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Join Our Team</h1>
              <p className="text-gray-600 mt-1">School District 308 Career Opportunities</p>
            </div>
          </div>

          <p className="text-gray-700 max-w-3xl">
            We're committed to hiring passionate educators who will make a difference in our students' lives.
            Explore our current openings and become part of our dedicated team.
          </p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-green-900 font-semibold">Application Submitted Successfully!</h3>
                <p className="text-green-800 text-sm mt-1">
                  Thank you for your interest in joining School District 308. We've received your application and will review it shortly.
                  You'll receive a confirmation email within the next few minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading open positions...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{error}</h3>
            <button
              onClick={fetchPositions}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Content - Only show if not loading and no error */}
        {!loading && !error && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Search & Filters</h3>
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Input
                    label=""
                    placeholder="Search positions..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select
                  label=""
                  value={departmentFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDepartmentFilter(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </Select>

                <Select
                  label=""
                  value={worksiteFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setWorksiteFilter(e.target.value)}
                >
                  <option value="all">All Worksites</option>
                  {worksites.map(site => (
                    <option key={site} value={site}>{site}</option>
                  ))}
                </Select>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing <strong>{filteredPositions.length}</strong> of <strong>{positions.length}</strong> open positions
                </p>
              </div>
            </div>

            {/* Position Listings */}
            {filteredPositions.length > 0 ? (
              <div className="space-y-6">
                {filteredPositions.map(position => (
                  <PositionListing
                    key={position.reqId}
                    position={position}
                    onApply={openApplicationModal}
                    onViewDetails={openDetailsModal}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {positions.length === 0 ? 'No Open Positions' : 'No Matching Positions'}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {positions.length === 0 
                    ? 'There are currently no open positions. Please check back later.' 
                    : 'Try adjusting your search or filters to find what you\'re looking for.'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedPosition && (
        <PositionDetailsModal
          position={selectedPosition}
          onClose={closeDetailsModal}
          onApply={openApplicationModal}
        />
      )}

      {/* Application Modal */}
      {showApplicationModal && selectedPosition && (
        <ApplicationModal
          position={selectedPosition}
          onClose={closeApplicationModal}
          onSubmit={handleSubmitApplication}
        />
      )}
    </div>
  );
}