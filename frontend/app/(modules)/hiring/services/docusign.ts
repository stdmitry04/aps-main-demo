import { api } from '@/lib/api';

export interface DocuSignRecipient {
  email: string;
  name: string;
  recipientId: string;
}

export interface DocuSignField {
  documentId: string;
  fieldType: 'text' | 'signature' | 'date' | 'checkbox' | 'radio';
  name: string;
  value?: string;
  required?: boolean;
  pageNumber: number;
  xPosition: number;
  yPosition: number;
  width?: number;
  height?: number;
  tabLabel?: string;
}

export interface DocuSignEnvelopeData {
  emailSubject: string;
  recipients: DocuSignRecipient[];
  templateId?: string;
  tabs?: {
    textTabs: Array<{
      tabLabel: string;
      value: string;
    }>;
  };
  status?: 'created' | 'sent';
}

export interface DocuSignEnvelopeResponse {
  envelopeId: string;
  status: string;
  signingUrl: string;
  embeddedUrl?: string;
}

/**
 * DocuSign Service
 * Handles creation and management of DocuSign envelopes for offer letters
 */
class DocuSignService {
  /**
   * Create a DocuSign envelope with offer letter
   */
  async createEnvelope(data: DocuSignEnvelopeData): Promise<DocuSignEnvelopeResponse> {
    try {
      const response = await api.post('/hiring/docusign/envelopes/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating DocuSign envelope:', error);
      throw error;
    }
  }

  /**
   * Get envelope status
   */
  async getEnvelopeStatus(envelopeId: string): Promise<any> {
    try {
      const response = await api.get(`/hiring/docusign/envelopes/${envelopeId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching envelope status:', error);
      throw error;
    }
  }

  /**
   * Get signing URL for recipient
   */
  async getSigningUrl(envelopeId: string, recipientEmail: string): Promise<string> {
    try {
      const response = await api.post(`/hiring/docusign/envelopes/${envelopeId}/signing-url/`, {
        recipientEmail
      });
      return response.data.signingUrl;
    } catch (error) {
      console.error('Error getting signing URL:', error);
      throw error;
    }
  }

  /**
   * Create offer letter envelope with all necessary fields using DocuSign template
   */
  async createOfferLetterEnvelope(offerData: {
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
  }): Promise<DocuSignEnvelopeResponse> {
    // Prepare benefits (fill up to 4 slots, empty string for unused)
    const benefitValues = [
      offerData.benefits[0] || '',
      offerData.benefits[1] || '',
      offerData.benefits[2] || '',
      offerData.benefits[3] || ''
    ];

    const envelopeData: DocuSignEnvelopeData = {
      emailSubject: `Job Offer - ${offerData.positionTitle} at ${offerData.districtName || 'School District'}`,
      recipients: [
        {
          email: offerData.candidateEmail,
          name: offerData.candidateName,
          recipientId: '1'
        }
      ],
      templateId: 'USE_TEMPLATE_FROM_ENV', // Backend will use DOCUSIGN_TEMPLATE_ID from env
      tabs: {
        textTabs: [
          { tabLabel: 'districtName', value: offerData.districtName || 'School Demo District' },
          { tabLabel: 'candidateName', value: offerData.candidateName },
          { tabLabel: 'candidateEmail', value: offerData.candidateEmail },
          { tabLabel: 'positionTitle', value: offerData.positionTitle },
          { tabLabel: 'department', value: offerData.department },
          { tabLabel: 'worksite', value: offerData.worksite },
          { tabLabel: 'salary', value: offerData.salary.replace(/[$,]/g, '') }, // Remove currency symbols
          { tabLabel: 'fte', value: offerData.fte },
          { tabLabel: 'startDate', value: this.formatDate(offerData.startDate) },
          { tabLabel: 'offerDate', value: this.formatDate(offerData.offerDate) },
          { tabLabel: 'expirationDate', value: this.formatDate(offerData.expirationDate) },
          { tabLabel: 'benefit1', value: benefitValues[0] },
          { tabLabel: 'benefit2', value: benefitValues[1] },
          { tabLabel: 'benefit3', value: benefitValues[2] },
          { tabLabel: 'benefit4', value: benefitValues[3] },
          { tabLabel: 'hrDirectorName', value: offerData.hrDirectorName || 'Dr. Jennifer Davis' },
          { tabLabel: 'hrDirectorTitle', value: offerData.hrDirectorTitle || 'Director of Human Resources' }
        ]
      },
      status: 'sent'
    };

    return this.createEnvelope(envelopeData);
  }

  /**
   * Format date for DocuSign (MM/DD/YYYY)
   * Input: YYYY-MM-DD string from date input
   * Output: MM/DD/YYYY string
   */
  private formatDate(dateString: string): string {
    if (!dateString) return '';

    // Handle YYYY-MM-DD format
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${month}/${day}/${year}`;
    }

    // Fallback: try parsing as date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return as-is if invalid
    }

    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Generate HTML content for offer letter
   * @deprecated - Now using DocuSign templates instead
   */
  private generateOfferLetterHTML(offerData: {
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
  }): string {
    const offerDate = new Date(offerData.offerDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const formattedStartDate = new Date(offerData.startDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      width: 80px;
      height: 80px;
      background: #2563eb;
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
      border-radius: 8px;
      margin-bottom: 15px;
    }
    h1 {
      color: #1e293b;
      margin: 10px 0;
      font-size: 28px;
    }
    .position-details {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 25px;
      margin: 30px 0;
    }
    .position-details h3 {
      margin-top: 0;
      color: #1e293b;
      font-size: 20px;
    }
    .detail-row {
      display: flex;
      margin-bottom: 15px;
    }
    .detail-label {
      font-weight: 600;
      color: #64748b;
      min-width: 150px;
    }
    .detail-value {
      color: #1e293b;
      font-weight: 500;
    }
    .benefits {
      margin: 20px 0;
    }
    .benefits ul {
      list-style-type: disc;
      margin-left: 20px;
    }
    .benefits li {
      margin-bottom: 8px;
    }
    .signature-section {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 1px solid #e2e8f0;
    }
    .signature-line {
      margin-top: 40px;
      padding-top: 10px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">SD</div>
    <h1>School Demo District</h1>
    <p style="color: #64748b; margin: 5px 0;">Human Resources Department</p>
    <p style="color: #64748b; margin: 5px 0;">${offerDate}</p>
  </div>

  <p><strong>Dear ${offerData.candidateName},</strong></p>

  <p>
    We are pleased to offer you the position of <strong>${offerData.positionTitle}</strong>
    with School Demo District. We were impressed by your qualifications and believe you will
    be an excellent addition to our team.
  </p>

  <div class="position-details">
    <h3>Position Details</h3>
    <div class="detail-row">
      <span class="detail-label">Position Title:</span>
      <span class="detail-value">${offerData.positionTitle}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Department:</span>
      <span class="detail-value">${offerData.department}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Worksite:</span>
      <span class="detail-value">${offerData.worksite}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">FTE:</span>
      <span class="detail-value">${offerData.fte}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Annual Salary:</span>
      <span class="detail-value">${offerData.salary}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Start Date:</span>
      <span class="detail-value">${formattedStartDate}</span>
    </div>
  </div>

  <div class="benefits">
    <h4>Benefits Package:</h4>
    <ul>
      ${offerData.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
    </ul>
  </div>

  <p>
    This offer is contingent upon successful completion of a background check and
    verification of your credentials. Please review this offer carefully and sign below
    to indicate your acceptance.
  </p>

  <p>
    We are excited about the possibility of you joining our team and look forward to
    your response.
  </p>

  <p style="margin-top: 30px;">
    Sincerely,<br />
    <strong>Dr. Jennifer Davis</strong><br />
    Director of Human Resources<br />
    School Demo District
  </p>

  <div class="signature-section">
    <p><strong>Candidate Acceptance:</strong></p>
    <p>
      By signing below, I accept the terms and conditions of this employment offer as outlined above.
    </p>
    <div class="signature-line">
      <!-- DocuSign Signature Field -->
      <div style="margin-bottom: 30px;">
        <div style="border-bottom: 2px solid #000; width: 300px; display: inline-block;"></div>
        <p style="margin: 5px 0; font-size: 12px;">Signature</p>
      </div>
      <div>
        <div style="border-bottom: 2px solid #000; width: 200px; display: inline-block;"></div>
        <p style="margin: 5px 0; font-size: 12px;">Date</p>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>
      School Demo District | Human Resources Department<br />
      This is a legally binding employment offer. Please retain a copy for your records.
    </p>
  </div>
</body>
</html>
    `.trim();
  }
}

export const docusignService = new DocuSignService();
