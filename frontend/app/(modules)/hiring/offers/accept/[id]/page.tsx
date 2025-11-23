"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import api from '@/lib/api';

export default function AcceptOfferPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = params.id as string;

  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchOffer();
  }, [offerId]);

  const fetchOffer = async () => {
    try {
      setLoading(true);
      // Use public endpoint - candidates don't need to be logged in
      const response = await api.get(`/hiring/offers/${offerId}/public-detail/`);
      setOffer(response.data);
    } catch (err: any) {
      setError('Failed to load offer. The offer may not exist or the link may be invalid.');
      console.error('Error fetching offer:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadOfferDocument = async () => {
    try {
      // Download DOCX from server-side API route (no auth required - uses public endpoint)
      const response = await fetch(`/api/offers/${offerId}/download`);

      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Offer_${offer?.candidateName?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading document:', err);
      throw err;
    }
  };

  const handleAccept = async () => {
    if (!offer) return;

    try {
      setAccepting(true);

      // Download DOCX from server-side API
      await downloadOfferDocument();

      // Update offer status to accepted
      await api.post(`/hiring/offers/${offerId}/accept/`);

      setSuccess(true);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to accept offer. Please try again.');
      console.error('Error accepting offer:', err);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading offer...</p>
        </div>
      </div>
    );
  }

  if (error && !offer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Offer Accepted!</h2>
          <p className="text-gray-600">
            Your offer letter has been downloaded. We're excited to have you join our team!
          </p>
        </div>
      </div>
    );
  }

  if (!offer) return null;

  // Use filledText from API (camelCase due to API interceptor transformation)
  const previewText = offer.filledText || 'No offer content available';

  console.log('📄 Offer data:', offer);
  console.log('📝 Preview text:', previewText);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
            <h1 className="text-2xl font-bold">Job Offer</h1>
            <p className="text-blue-100 mt-1">Review and accept your employment offer</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Status Badge */}
            <div className="mb-6">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                offer.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                offer.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                Status: {offer.status}
              </span>
            </div>

            {/* Offer Preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Offer Letter</h3>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm leading-relaxed">
                  {previewText}
                </pre>
              </div>
            </div>

            {/* Action Buttons */}
            {offer.status === 'Pending' && (
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                >
                  {accepting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Accepting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Accept Offer
                    </span>
                  )}
                </Button>

                <Button
                  onClick={() => router.push(`/hiring/offers/reject/${offerId}`)}
                  variant="secondary"
                  className="px-8 py-3"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Decline Offer
                  </span>
                </Button>
              </div>
            )}

            {offer.status !== 'Pending' && (
              <div className="text-center py-4">
                <p className="text-gray-600">
                  This offer has already been {offer.status.toLowerCase()}.
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
