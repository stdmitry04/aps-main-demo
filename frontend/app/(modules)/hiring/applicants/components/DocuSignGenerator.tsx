import React from 'react';
import { docusignService } from '../../services/docusign';
import { Button } from '@/components/ui';

interface DocuSignGeneratorProps {
  offerData: {
    districtName?: string;
    candidateName: string;
    candidateEmail: string;
    positionTitle: string;
    department: string;
    worksite: string;
    salary: string;
    fte: string;
    startDate: string;
    offerDate: string;
    expirationDate: string;
    benefits: string[];
    hrDirectorName?: string;
    hrDirectorTitle?: string;
  };
  onEnvelopeCreated?: (envelopeId: string, signingUrl: string) => void;
  onError?: (error: Error) => void;
}

/**
 * DocuSign Generator Component
 * Generates a DocuSign envelope with offer letter and returns the signing URL
 */
export function DocuSignGenerator({
  offerData,
  onEnvelopeCreated,
  onError
}: DocuSignGeneratorProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [envelopeId, setEnvelopeId] = React.useState<string | null>(null);
  const [signingUrl, setSigningUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const generateDocuSign = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await docusignService.createOfferLetterEnvelope(offerData);

      setEnvelopeId(response.envelopeId);
      setSigningUrl(response.signingUrl);

      if (onEnvelopeCreated) {
        onEnvelopeCreated(response.envelopeId, response.signingUrl);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate DocuSign envelope';
      setError(errorMessage);

      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (signingUrl && envelopeId) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-green-900 mb-2">DocuSign Envelope Created</h4>
            <p className="text-xs text-green-700 mb-3">
              The offer letter has been prepared and is ready for signing.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => window.open(signingUrl, '_blank')}
              >
                Open Signing Link
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(signingUrl);
                  alert('Signing URL copied to clipboard!');
                }}
              >
                Copy Link
              </Button>
            </div>
            <p className="text-xs text-green-600 mt-2">
              Envelope ID: {envelopeId}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-900 mb-1">Error Creating DocuSign</h4>
            <p className="text-xs text-red-700 mb-3">{error}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={generateDocuSign}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Generate DocuSign Offer Letter</h4>
          <p className="text-xs text-blue-700 mb-3">
            Create a legally binding offer letter that the candidate can sign electronically via DocuSign.
          </p>
          <Button
            onClick={generateDocuSign}
            disabled={isGenerating}
            size="sm"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </span>
            ) : (
              'Generate DocuSign Document'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to use DocuSign generation
 */
export function useDocuSignGenerator() {
  const [envelopeId, setEnvelopeId] = React.useState<string | null>(null);
  const [signingUrl, setSigningUrl] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const generateEnvelope = React.useCallback(async (offerData: DocuSignGeneratorProps['offerData']) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await docusignService.createOfferLetterEnvelope(offerData);
      setEnvelopeId(response.envelopeId);
      setSigningUrl(response.signingUrl);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate DocuSign envelope';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = React.useCallback(() => {
    setEnvelopeId(null);
    setSigningUrl(null);
    setError(null);
  }, []);

  return {
    envelopeId,
    signingUrl,
    isGenerating,
    error,
    generateEnvelope,
    reset
  };
}
