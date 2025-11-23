"use client";

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button, Input, Select } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useOffers, type Offer } from '../hooks/useOffers';

// NewOfferModal still uses old format (which is camelCase, consistent with new Offer)
interface NewOfferFormData {
  candidateName: string;
  candidateEmail: string;
  position: string;
  department: string;
  worksite: string;
  salary: string;
  fte: string;
  startDate: string;
  offerDate: string;
  expirationDate: string;
  employeeCategory: string;
  benefits: string[];
}

// Removed mock data - now using backend API

export default function OffersPage() {
  // offers from useOffers is already in camelCase (transformed by API interceptor)
  const { offers: offersList, loading, error } = useOffers();

  // Extract unique districts and positions from actual offers
  const districts = React.useMemo(() =>
    offersList.length > 0 ? Array.from(new Set(offersList.map(o => o.worksite))).sort() : [],
    [offersList]
  );
  const positions = React.useMemo(() =>
    // REFACTORED: position_title -> positionTitle
    offersList.length > 0 ? Array.from(new Set(offersList.map(o => o.positionTitle))).sort() : [],
    [offersList]
  );
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [districtFilter, setDistrictFilter] = React.useState('All');
  const [positionFilter, setPositionFilter] = React.useState('All');
  const [dateFilter, setDateFilter] = React.useState('All');
  const [selectedOffer, setSelectedOffer] = React.useState<Offer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [showNewOfferModal, setShowNewOfferModal] = React.useState(false);

  const filteredOffers = offersList.filter(offer => {
    const matchesSearch =
      // REFACTORED: position_title -> positionTitle, candidate_email -> candidateEmail
      offer.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.positionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.worksite.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || offer.status === statusFilter;
    const matchesDistrict = districtFilter === 'All' || offer.worksite === districtFilter;
    // REFACTORED: position_title -> positionTitle
    const matchesPosition = positionFilter === 'All' || offer.positionTitle === positionFilter;

    // Date filtering based on offer date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // REFACTORED: offer_date -> offerDate
    const offerDate = new Date(offer.offerDate);
    offerDate.setHours(0, 0, 0, 0);

    let matchesDate = true;
    if (dateFilter === 'This Week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = offerDate >= weekAgo;
    } else if (dateFilter === 'This Month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      matchesDate = offerDate >= startOfMonth;
    } else if (dateFilter === 'Last 30 Days') {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      matchesDate = offerDate >= thirtyDaysAgo;
    } else if (dateFilter === 'Expiring Soon') {
      // REFACTORED: expiration_date -> expirationDate
      const expirationDate = new Date(offer.expirationDate);
      expirationDate.setHours(0, 0, 0, 0);
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      matchesDate = offer.status === 'Pending' && expirationDate >= today && expirationDate <= threeDaysFromNow;
    }

    return matchesSearch && matchesStatus && matchesDate && matchesDistrict && matchesPosition;
  });

  const getStatusColor = (status: Offer['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Accepted': return 'bg-green-100 text-green-800';
      case 'Declined': return 'bg-red-100 text-red-800';
      case 'Expired': return 'bg-gray-100 text-gray-800';
      case 'Withdrawn': return 'bg-orange-100 text-orange-800';
    }
  };

  // REFACTORED: expiration_date -> expirationDate
  const getDaysUntilExpiration = (expirationDate: string) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewDetails = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowDetailsModal(true);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setDistrictFilter('All');
    setPositionFilter('All');
    setDateFilter('All');
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'All' || districtFilter !== 'All' ||
                          positionFilter !== 'All' || dateFilter !== 'All';

  const stats = {
    pending: offersList.filter(o => o.status === 'Pending').length,
    accepted: offersList.filter(o => o.status === 'Accepted').length,
    declined: offersList.filter(o => o.status === 'Declined').length,
    totalOffers: offersList.length
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Offers</h1>
              <p className="text-gray-600 mt-1">Manage and track job offers to candidates</p>
            </div>
            <Button onClick={() => setShowNewOfferModal(true)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Offer
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Offers</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Accepted</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.accepted}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Declined</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stats.declined}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Offers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOffers}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear All Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="md:col-span-3 lg:col-span-2">
                <Input
                  label=""
                  placeholder="Search by candidate, position, worksite, or email..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select
                label=""
                value={districtFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDistrictFilter(e.target.value)}
              >
                <option value="All">All Districts</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </Select>

              <Select
                label=""
                value={positionFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPositionFilter(e.target.value)}
              >
                <option value="All">All Positions</option>
                {positions.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </Select>

              <Select
                label=""
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Declined">Declined</option>
                <option value="Expired">Expired</option>
                <option value="Withdrawn">Withdrawn</option>
              </Select>

              <Select
                label=""
                value={dateFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDateFilter(e.target.value)}
              >
                <option value="All">All Dates</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Expiring Soon">Expiring Soon (3 days)</option>
              </Select>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    Search: "{searchTerm}"
                    <button onClick={() => setSearchTerm('')} className="hover:text-blue-900">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {districtFilter !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    District: {districtFilter}
                    <button onClick={() => setDistrictFilter('All')} className="hover:text-blue-900">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {positionFilter !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    Position: {positionFilter}
                    <button onClick={() => setPositionFilter('All')} className="hover:text-blue-900">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {statusFilter !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    Status: {statusFilter}
                    <button onClick={() => setStatusFilter('All')} className="hover:text-blue-900">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {dateFilter !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    Date: {dateFilter}
                    <button onClick={() => setDateFilter('All')} className="hover:text-blue-900">
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
                Showing <strong>{filteredOffers.length}</strong> of <strong>{offersList.length}</strong> offers
              </p>
            </div>
          </div>

          {/* Offers List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      District
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Offer Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOffers.map((offer) => {
                    // REFACTORED: expiration_date -> expirationDate
                    const daysUntilExpiration = getDaysUntilExpiration(offer.expirationDate);
                    const isExpiringSoon = daysUntilExpiration <= 3 && daysUntilExpiration >= 0 && offer.status === 'Pending';
                    const formattedSalary = `$${Number(offer.salary).toLocaleString()}`;

                    return (
                      <tr key={offer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {offer.candidateName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{offer.candidateName}</div>
                              {/* REFACTORED: candidate_email -> candidateEmail */}
                              <div className="text-sm text-gray-500">{offer.candidateEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {/* REFACTORED: position_title -> positionTitle */}
                          <div className="text-sm font-medium text-gray-900">{offer.positionTitle}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{offer.worksite}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formattedSalary}</div>
                          <div className="text-xs text-gray-500">FTE: {offer.fte}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {/* REFACTORED: offer_date -> offerDate */}
                            {new Date(offer.offerDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {/* REFACTORED: expiration_date -> expirationDate */}
                            {new Date(offer.expirationDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          {isExpiringSoon && (
                            <div className="text-xs text-orange-600 font-medium">
                              Expires in {daysUntilExpiration} day{daysUntilExpiration !== 1 ? 's' : ''}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full",
                            getStatusColor(offer.status)
                          )}>
                            {offer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleViewDetails(offer)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredOffers.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No offers found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>

        {/* Offer Details Modal */}
        {showDetailsModal && selectedOffer && (
          <OfferDetailsModal
            offer={selectedOffer}
            onClose={() => setShowDetailsModal(false)}
          />
        )}

        {/* New Offer Modal */}
        {showNewOfferModal && (
          <NewOfferModal
            onClose={() => setShowNewOfferModal(false)}
            onSave={(newOffer) => {
              // Offer is created via API, will auto-refresh
              setShowNewOfferModal(false);
            }}
            districts={districts}
          />
        )}
      </div>
    </Layout>
  );
}

// Hardcoded template with {{field}} placeholders
const OFFER_TEMPLATE = `{{districtName}}
{{districtAddress}}

{{offerDate}}

Dear {{candidateName}},

We are pleased to offer you the position of {{positionTitle}} with {{districtName}}. We were impressed by your qualifications and believe you will be an excellent addition to our team.

POSITION DETAILS:
- Position Title: {{positionTitle}}
- Department: {{department}}
- Worksite: {{worksite}}
- FTE (Full-Time Equivalent): {{fte}}
- Salary: {{salary}}
- Start Date: {{startDate}}

BENEFITS PACKAGE:
{{benefits}}

This offer is contingent upon successful completion of a background check and verification of your credentials. This offer will expire on {{expirationDate}}.

We are excited about the possibility of you joining our team and look forward to your response.

Sincerely,

{{hrDirectorName}}
{{hrDirectorTitle}}
{{districtName}}
`;

// Extract {{field}} placeholders from template
function extractTemplateFields(template: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const fields = new Set<string>();
  let match;
  while ((match = regex.exec(template)) !== null) {
    fields.add(match[1]);
  }
  return Array.from(fields);
}

// New Offer Modal Component
interface NewOfferModalProps {
  onClose: () => void;
  onSave: (offer: any) => void;
  districts: string[];
}

function NewOfferModal({ onClose, onSave, districts }: NewOfferModalProps) {
  const templateFields = React.useMemo(() => extractTemplateFields(OFFER_TEMPLATE), []);

  // Initialize form data with empty values for all template fields
  const [formData, setFormData] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    templateFields.forEach(field => {
      // Set default values for certain fields
      if (field === 'offerDate') initial[field] = new Date().toISOString().split('T')[0];
      else if (field === 'fte') initial[field] = '1.0';
      else if (field === 'districtName') initial[field] = 'School District 308';
      else if (field === 'districtAddress') initial[field] = '856 West Dundee Avenue, Oswego, IL 60543';
      else if (field === 'hrDirectorName') initial[field] = 'Dr. Jennifer Davis';
      else if (field === 'hrDirectorTitle') initial[field] = 'Director of Human Resources';
      else if (field === 'benefits') initial[field] = 'Health Insurance\nDental & Vision\nRetirement Plan\nProfessional Development';
      else initial[field] = '';
    });
    return initial;
  });

  const handleSubmit = async () => {
    // Check required fields
    const requiredFields = ['candidateName', 'candidateEmail', 'positionTitle', 'department',
                           'worksite', 'salary', 'fte', 'startDate', 'expirationDate'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // This payload is intentionally snake_case for the API
    // The formData is camelCase, which matches our new Offer interface
    const offerPayload = {
      application: null, // Will need to be set based on applicant selection
      salary: parseFloat(formData.salary),
      fte: parseFloat(formData.fte),
      start_date: formData.startDate,
      benefits: formData.benefits.split('\n').filter(b => b.trim()),
      offer_date: formData.offerDate,
      expiration_date: formData.expirationDate,
      template_text: OFFER_TEMPLATE,
      template_data: formData
    };

    // Note: This needs to be connected to useOffers.createOffer()
    console.log('Creating offer with payload:', offerPayload);
    onSave(offerPayload);
  };

  // Helper to format field labels
  const formatFieldLabel = (field: string): string => {
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  // Helper to determine field type
  const getFieldType = (field: string): string => {
    if (field.includes('Date')) return 'date';
    if (field === 'candidateEmail') return 'email';
    if (field === 'salary') return 'number';
    if (field === 'benefits') return 'textarea';
    return 'text';
  };

  const isFieldRequired = (field: string): boolean => {
    return ['candidateName', 'candidateEmail', 'positionTitle', 'department',
            'worksite', 'salary', 'fte', 'startDate', 'expirationDate'].includes(field);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create New Offer</h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the template fields</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {templateFields.map((field) => {
              const fieldType = getFieldType(field);
              const label = formatFieldLabel(field);
              const required = isFieldRequired(field);

              if (fieldType === 'textarea') {
                return (
                  <div key={field} className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label} {required && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      value={formData[field] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                  </div>
                );
              }

              if (field === 'worksite') {
                return (
                  <div key={field}>
                    <Select
                      label={label}
                      required={required}
                      value={formData[field] || ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setFormData(prev => ({ ...prev, [field]: e.target.value }))
                      }
                    >
                      <option value="">Select a worksite</option>
                      {districts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </Select>
                  </div>
                );
              }

              if (field === 'fte') {
                return (
                  <div key={field}>
                    <Select
                      label={label}
                      required={required}
                      value={formData[field] || '1.0'}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setFormData(prev => ({ ...prev, [field]: e.target.value }))
                      }
                    >
                      <option value="1.0">1.0 (Full-Time)</option>
                      <option value="0.8">0.8</option>
                      <option value="0.6">0.6</option>
                      <option value="0.5">0.5 (Half-Time)</option>
                      <option value="0.4">0.4</option>
                    </Select>
                  </div>
                );
              }

              return (
                <div key={field}>
                  <Input
                    label={label}
                    type={fieldType}
                    required={required}
                    value={formData[field] || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData(prev => ({ ...prev, [field]: e.target.value }))
                    }
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                </div>
              );
            })}
          </div>

          {/* Preview Section */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Template Preview</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-xs text-gray-700 font-mono">
                {OFFER_TEMPLATE.replace(/\{\{(\w+)\}\}/g, (match, field) => {
                  const value = formData[field];
                  return value || match;
                })}
              </pre>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Create Offer
          </Button>
        </div>
      </div>
    </div>
  );
}

// Offer Details Modal Component
interface OfferDetailsModalProps {
  offer: Offer;
  onClose: () => void;
}

function OfferDetailsModal({ offer, onClose }: OfferDetailsModalProps) {
  const daysUntilExpiration = React.useMemo(() => {
    const today = new Date();
    // REFACTORED: expiration_date -> expirationDate
    const expDate = new Date(offer.expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [offer.expirationDate]); // REFACTORED: expiration_date -> expirationDate

  const formattedSalary = `$${Number(offer.salary).toLocaleString()}`;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Offer Details</h2>
            <p className="text-sm text-gray-500 mt-1">{offer.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className={cn(
            "rounded-lg p-4 border",
            offer.status === 'Pending' && "bg-yellow-50 border-yellow-200",
            offer.status === 'Accepted' && "bg-green-50 border-green-200",
            offer.status === 'Declined' && "bg-red-50 border-red-200",
            offer.status === 'Expired' && "bg-gray-50 border-gray-200"
          )}>
            <div className="flex items-center gap-3">
              <span className={cn(
                "px-4 py-2 text-sm font-semibold rounded-full",
                offer.status === 'Pending' && "bg-yellow-100 text-yellow-800",
                offer.status === 'Accepted' && "bg-green-100 text-green-800",
                offer.status === 'Declined' && "bg-red-100 text-red-800",
                offer.status === 'Expired' && "bg-gray-100 text-gray-800"
              )}>
                {offer.status}
              </span>
              {offer.status === 'Pending' && daysUntilExpiration >= 0 && (
                <span className="text-sm text-gray-700">
                  Expires in <strong>{daysUntilExpiration}</strong> day{daysUntilExpiration !== 1 ? 's' : ''}
                </span>
              )}
              {/* REFACTORED: accepted_date -> acceptedDate */}
              {offer.status === 'Accepted' && offer.acceptedDate && (
                <span className="text-sm text-gray-700">
                  {/* REFACTORED: accepted_date -> acceptedDate */}
                  Accepted on {new Date(offer.acceptedDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Candidate Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-medium text-gray-900">{offer.candidateName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                {/* REFACTORED: candidate_email -> candidateEmail */}
                <p className="text-sm font-medium text-gray-900">{offer.candidateEmail}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Position Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Position Title</p>
                {/* REFACTORED: position_title -> positionTitle */}
                <p className="text-sm font-medium text-gray-900">{offer.positionTitle}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="text-sm font-medium text-gray-900">{offer.department}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Worksite</p>
                <p className="text-sm font-medium text-gray-900">{offer.worksite}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Employee Category</p>
                {/* REFACTORED: employee_category -> employeeCategory */}
                <p className="text-sm font-medium text-gray-900">{offer.employeeCategory}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Compensation & Schedule</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Salary Range</p>
                <p className="text-sm font-medium text-gray-900">{offer.salary}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">FTE (Full-Time Equivalent)</p>
                <p className="text-sm font-medium text-gray-900">{offer.fte}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Start Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {/* REFACTORED: start_date -> startDate */}
                  {new Date(offer.startDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Benefits Package</h3>
            <div className="flex flex-wrap gap-2">
              {offer.benefits.map((benefit, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Offer Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Offer Sent</p>
                  <p className="text-xs text-gray-500">
                    {/* REFACTORED: offer_date -> offerDate */}
                    {new Date(offer.offerDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                  daysUntilExpiration >= 0 && offer.status === 'Pending'
                    ? "bg-yellow-100"
                    : "bg-gray-100"
                )}>
                  <svg className={cn(
                    "w-4 h-4",
                    daysUntilExpiration >= 0 && offer.status === 'Pending'
                      ? "text-yellow-600"
                      : "text-gray-600"
                  )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Offer Expires</p>
                  <p className="text-xs text-gray-500">
                    {/* REFACTORED: expiration_date -> expirationDate */}
                    {new Date(offer.expirationDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* REFACTORED: declined_reason -> declinedReason */}
          {offer.status === 'Declined' && offer.declinedReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-900 mb-2">Decline Reason</h3>
              {/* REFACTORED: declined_reason -> declinedReason */}
              <p className="text-sm text-red-800">{offer.declinedReason}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-between bg-gray-50">
          <div className="flex gap-2">
            {offer.status === 'Pending' && (
              <>
                <Button variant="secondary">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Resend Offer
                </Button>
                <Button variant="secondary">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </Button>
              </>
            )}
          </div>
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}