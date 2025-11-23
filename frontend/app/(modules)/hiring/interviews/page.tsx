"use client";

import React, {useEffect, useMemo} from 'react';
import { Layout } from '@/components/layout/Layout';
import { InterviewAPI } from '@/app/(modules)/hiring/dto/interview.dto';
import {
  useInterviewStore,
  useInitializeInterviews,
} from '@/app/(modules)/hiring/store/interviewStore';
import {
  InterviewStatistics,
  InterviewFiltersComponent,
  InterviewTable,
  InterviewDetailsModal,
} from './components';

export default function InterviewsPage() {
  // Initialize interviews on mount
  useInitializeInterviews();

  // Get state from Zustand store
  const loading = useInterviewStore(state => state.loading);
  const error = useInterviewStore(state => state.error);
  const interviews = useInterviewStore(state => state.interviews);
  const filters = useInterviewStore(state => state.filters);
  const selectedInterview = useInterviewStore(state => state.selectedInterview);
  const showDetailsModal = useInterviewStore(state => state.showDetailsModal);

  // Compute derived values with useMemo
  const filteredInterviews = useMemo(() => {
    const { searchTerm, statusFilter, dateFilter, districtFilter, positionFilter } = filters;

    return interviews.filter(interview => {
      const matchesSearch =
        interview.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.position_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.candidate_email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || interview.status === statusFilter;
      const matchesDistrict = districtFilter === 'All' || interview.worksite === districtFilter;
      const matchesPosition = positionFilter === 'All' || interview.position_title === positionFilter;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const interviewDate = new Date(interview.scheduled_date);
      interviewDate.setHours(0, 0, 0, 0);

      let matchesDate = true;
      if (dateFilter === 'Today') {
        matchesDate = interviewDate.getTime() === today.getTime();
      } else if (dateFilter === 'This Week') {
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        matchesDate = interviewDate >= today && interviewDate <= weekFromNow;
      } else if (dateFilter === 'This Month') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        matchesDate = interviewDate >= startOfMonth && interviewDate <= endOfMonth;
      } else if (dateFilter === 'Past') {
        matchesDate = interviewDate < today;
      } else if (dateFilter === 'Upcoming') {
        matchesDate = interviewDate >= today;
      }

      return matchesSearch && matchesStatus && matchesDate && matchesDistrict && matchesPosition;
    });
  }, [interviews, filters]);

  const districts = useMemo(() => {
    return Array.from(new Set(interviews.map(i => i.worksite).filter(Boolean))).sort();
  }, [interviews]);

  const positions = useMemo(() => {
    return Array.from(new Set(interviews.map(i => i.position_title).filter(Boolean))).sort();
  }, [interviews]);

  const stats = useMemo(() => {
    const today = new Date();
    return {
      scheduled: interviews.filter(i => i.status === 'Scheduled').length,
      completed: interviews.filter(i => i.status === 'Completed').length,
      upcoming: interviews.filter(i => {
        const interviewDate = new Date(i.scheduled_date);
        return i.status === 'Scheduled' && interviewDate >= today;
      }).length
    };
  }, [interviews]);

  const totalInterviews = interviews.length;

  // Get actions from Zustand store
  const setFilter = useInterviewStore(state => state.setFilter);
  const clearFilters = useInterviewStore(state => state.clearFilters);
  const setSelectedInterview = useInterviewStore(state => state.setSelectedInterview);
  const setShowDetailsModal = useInterviewStore(state => state.setShowDetailsModal);
  const updateInterview = useInterviewStore(state => state.updateInterview);

  const handleViewDetails = (interview: InterviewAPI) => {
    setSelectedInterview(interview);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = async (interviewId: string, newStatus: InterviewAPI['status']) => {
    try {
      await updateInterview(interviewId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update interview status:', error);
    }
  };
  useEffect(() => {
    console.log(filteredInterviews, "INTERVIEWS")
  })

  const hasActiveFilters =
    filters.searchTerm !== '' ||
    filters.statusFilter !== 'All' ||
    filters.dateFilter !== 'All' ||
    filters.districtFilter !== 'All' ||
    filters.positionFilter !== 'All';

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Interviews</h1>
            <p className="text-gray-600 mt-1">Manage and track candidate interviews</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && filteredInterviews.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Statistics */}
          <InterviewStatistics stats={stats} />

          {/* Filters */}
          <InterviewFiltersComponent
            filters={filters}
            districts={districts}
            positions={positions}
            totalInterviews={totalInterviews}
            filteredCount={filteredInterviews.length}
            hasActiveFilters={hasActiveFilters}
            onFilterChange={setFilter}
            onClearFilters={clearFilters}
          />

          {/* Interviews Table */}
          <InterviewTable
            interviews={filteredInterviews}
            onViewDetails={handleViewDetails}
          />
        </div>

        {/* Interview Details Modal */}
        {showDetailsModal && selectedInterview && (
          <InterviewDetailsModal
            interview={selectedInterview}
            onClose={() => setShowDetailsModal(false)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </div>
    </Layout>
  );
}
