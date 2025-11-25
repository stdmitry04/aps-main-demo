export interface Offer {
  id: string;
  applicationId: string;
  salary: number;
  fte: number;
  startDate: string;
  benefits: string[];
  offerDate: string;
  expirationDate: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Expired' | 'Withdrawn';
  acceptedDate?: string;
  declinedReason?: string;
  // Read-only fields from serializer
  candidateName: string;
  candidateEmail: string;
  positionTitle: string;
  positionReqId: string;
  department: string;
  worksite: string;
  employeeCategory: string;
}

export interface CreateOfferData {
  application: string;
  salary: number;
  fte: number;
  startDate: string;
  benefits?: string[];
  offer_date: string;
  expiration_date: string;
  template_text?: string;
  template_data?: Record<string, string>;
}

export interface NewOfferFormData {
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

export interface OfferTemplate {
  id: string;
  name: string;
  templateText: string;
  extractedFields: string[];
}
