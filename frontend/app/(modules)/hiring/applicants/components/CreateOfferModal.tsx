import React from 'react';
import { Button, Input, Select } from '@/components/ui';
import { useOffers } from '../../hooks/useOffers';
import api from '@/lib/api';

interface CreateOfferModalProps {
    applicant: {
        id: string;
        name: string;
        email: string;
        positionTitle: string;
        department: string;
        worksite: string;
        salary: string;
        fte: string;
        startDate: string;
    };
    onClose: () => void;
    onOfferCreated: (data: any) => void;
}

interface OfferTemplate {
    id: string;
    name: string;
    templateText: string;
    extractedFields: string[];
}

export function CreateOfferModal({ applicant, onClose, onOfferCreated }: CreateOfferModalProps) {
    const [step, setStep] = React.useState<1 | 2>(1);
    const [isSaving, setIsSaving] = React.useState(false);
    const [offerSaved, setOfferSaved] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [template, setTemplate] = React.useState<OfferTemplate | null>(null);
    const [formData, setFormData] = React.useState<Record<string, string>>({});
    const { createOffer } = useOffers();

    // Fetch active template on mount
    React.useEffect(() => {
        fetchActiveTemplate();
    }, []);

    const fetchActiveTemplate = async () => {
        try {
            setLoading(true);
            console.log('📄 Fetching active offer template...');
            const response = await api.get('/hiring/offer-templates/active/');
            console.log('✅ Template response:', response.data);
            console.log('📋 Extracted fields:', response.data?.extractedFields);
            setTemplate(response.data);
        } catch (error) {
            console.error('❌ Error fetching template:', error);
            alert('Failed to load offer template. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Initialize form data from template fields
    React.useEffect(() => {
        if (template && template.extractedFields) {
            const initial: Record<string, string> = {};

            // Always set required fields (even if not in template)
            initial['fte'] = applicant.fte || '1.0';
            initial['startDate'] = applicant.startDate || '';

            // Extract salary from range if available
            const salaryMatch = applicant.salary.match(/\$?([\d,]+)/);
            initial['salary'] = salaryMatch ? salaryMatch[1].replace(/,/g, '') : '';

            // Set default offer and expiration dates
            initial['offerDate'] = new Date().toISOString().split('T')[0];
            const expDate = new Date();
            expDate.setDate(expDate.getDate() + 14);
            initial['expirationDate'] = expDate.toISOString().split('T')[0];

            template.extractedFields.forEach(field => {
                // Set default values for known fields
                if (field === 'candidateName') initial[field] = applicant.name;
                else if (field === 'candidateEmail') initial[field] = applicant.email;
                else if (field === 'positionTitle') initial[field] = applicant.positionTitle;
                else if (field === 'department') initial[field] = applicant.department;
                else if (field === 'worksite') initial[field] = applicant.worksite;
                else if (field === 'fte') initial[field] = applicant.fte || '1.0';
                else if (field === 'startDate') initial[field] = applicant.startDate;
                else if (field === 'offerDate') initial[field] = new Date().toISOString().split('T')[0];
                else if (field === 'expirationDate') {
                    const expDate = new Date();
                    expDate.setDate(expDate.getDate() + 14);
                    initial[field] = expDate.toISOString().split('T')[0];
                }
                else if (field === 'districtName') initial[field] = 'School Demo District';
                else if (field === 'districtAddress') initial[field] = '856 West Dundee Avenue, Oswego, IL 60543';
                else if (field === 'hrDirectorName') initial[field] = 'Dr. Jennifer Davis';
                else if (field === 'hrDirectorTitle') initial[field] = 'Director of Human Resources';
                else if (field === 'benefits') initial[field] = 'Health Insurance\nDental & Vision\nRetirement Plan\nProfessional Development';
                else if (field === 'salary') {
                    // Extract salary from range
                    const salaryMatch = applicant.salary.match(/\$?([\d,]+)/);
                    initial[field] = salaryMatch ? salaryMatch[1].replace(/,/g, '') : '';
                }
                else initial[field] = '';
            });

            console.log('📝 Initialized form data:', initial);
            setFormData(initial);
        }
    }, [template, applicant]);

    const handleNext = () => {
        // Only validate fields that need to be manually filled
        // candidateName, candidateEmail, positionTitle, department, worksite are auto-filled
        const requiredFields = ['salary', 'startDate', 'expirationDate'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return;
        }
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSendOffer = async () => {
        setIsSaving(true);

        try {
            // Create offer with template
            console.log('📋 Form data:', formData);

            const salaryValue = parseFloat(formData.salary);
            const fteValue = parseFloat(formData.fte);

            if (isNaN(salaryValue)) {
                alert('Please enter a valid salary');
                return;
            }

            if (isNaN(fteValue) || fteValue <= 0) {
                alert('Please enter a valid FTE (Full-Time Equivalent) value between 0.1 and 1.0');
                return;
            }

            const offerPayload = {
                application: applicant.id,
                salary: salaryValue,
                fte: fteValue,
                startDate: formData.startDate,
                benefits: formData.benefits.split('\n').filter(b => b.trim()),
                offer_date: formData.offerDate,
                expiration_date: formData.expirationDate,
                template_text: template?.templateText || '',
                template_data: formData
            };

            console.log('📤 Sending offer payload:', offerPayload);

            const createdOffer = await createOffer(offerPayload);

            console.log('Offer created:', createdOffer);
            onOfferCreated(createdOffer);

            setOfferSaved(true);

            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error: any) {
            console.error('Error creating offer:', error);
            const errorMsg = error.response?.data?.detail
                || error.response?.data?.message
                || JSON.stringify(error.response?.data)
                || 'Failed to create offer. Please try again.';
            alert(`Error: ${errorMsg}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Helper functions
    const formatFieldLabel = (field: string): string => {
        return field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    };

    const getFieldType = (field: string): string => {
        if (field.includes('Date')) return 'date';
        if (field === 'candidateEmail') return 'email';
        if (field === 'salary') return 'number';
        if (field === 'benefits') return 'textarea';
        return 'text';
    };

    const isFieldRequired = (field: string): boolean => {
        // Only salary, startDate, expirationDate need to be manually filled
        // Other fields are auto-populated from applicant data
        return ['salary', 'startDate', 'expirationDate'].includes(field);
    };

    const getPreviewText = (): string => {
        if (!template) return '';
        let preview = template.templateText;
        Object.entries(formData).forEach(([key, value]) => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            preview = preview.replace(regex, value);
        });
        return preview;
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading template...</p>
                </div>
            </div>
        );
    }

    if (!template) {
        return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl p-8 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Template Found</h3>
                    <p className="text-gray-600 mb-4">No active offer template is available. Please contact an administrator.</p>
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        );
    }

    if (offerSaved) {
        return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Offer Created & Sent!</h3>
                    <p className="text-gray-600">
                        The offer has been created and sent to {applicant.name} at {applicant.email}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {step === 1 ? 'Create Offer' : 'Review & Send Offer'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {step === 1 ? `Configure offer details for ${applicant.name}` : 'Preview and send the offer letter'}
                        </p>
                    </div>
                    <button onClick={onClose} disabled={isSaving} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Step Indicator */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 1 ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                                {step === 1 ? '1' : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>}
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-900">Offer Details</span>
                        </div>
                        <div className="w-16 h-1 mx-4 bg-gray-300 rounded"></div>
                        <div className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                2
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-600">Review & Send</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : !template || !template.extractedFields ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <p className="text-gray-500 mb-4">No offer template found</p>
                            <button
                                onClick={fetchActiveTemplate}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Retry
                            </button>
                        </div>
                    ) : step === 1 ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                {template.extractedFields.map((field) => {
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
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Preview</h3>
                                <div className="bg-white p-6 rounded border border-gray-300 max-h-[500px] overflow-y-auto">
                                    <OfferLetterPreview formData={formData} />
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex gap-2">
                                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h4 className="text-sm font-medium text-blue-900">What happens next?</h4>
                                        <ul className="text-xs text-blue-700 mt-1 space-y-1">
                                            <li>• Candidate will receive this offer via email with accept/reject buttons</li>
                                            <li>• They can accept to download the offer document and update status</li>
                                            <li>• They can decline to provide feedback and update status</li>
                                            <li>• You'll receive a copy of the email at starodu5@gmail.com</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between bg-gray-50">
                    {step === 1 ? (
                        <>
                            <Button variant="secondary" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button onClick={handleNext}>
                                Next: Review
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="secondary" onClick={handleBack} disabled={isSaving}>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back
                            </Button>
                            <Button onClick={handleSendOffer} disabled={isSaving}>
                                {isSaving ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                                        </svg>
                                        Send Offer
                                    </span>
                                )}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Styled Offer Letter Preview Component
function OfferLetterPreview({ formData }: { formData: Record<string, string> }) {
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const formatSalary = (salary: string) => {
        if (!salary) return '';
        const num = parseFloat(salary);
        return isNaN(num) ? salary : `$${num.toLocaleString()}`;
    };

    const benefitsList = formData.benefits?.split('\n').filter(b => b.trim()) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center border-b border-gray-200 pb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                    SD
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{formData.districtName || 'School Demo District'}</h1>
                <p className="text-sm text-gray-600">Human Resources Department</p>
                <p className="text-sm text-gray-600 mt-1">{formatDate(formData.offerDate)}</p>
            </div>

            {/* Letter Content */}
            <div className="space-y-4 text-gray-800">
                <p className="font-semibold">Dear {formData.candidateName || '[Candidate Name]'},</p>

                <p>
                    We are pleased to offer you the position of <strong>{formData.positionTitle || '[Position]'}</strong> with {formData.districtName || 'School Demo District'}.
                    We were impressed by your qualifications and believe you will be an excellent addition to our team.
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-6">
                    <h3 className="font-semibold text-lg mb-4 text-gray-900">Position Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Position Title</p>
                            <p className="font-medium">{formData.positionTitle || '[Position]'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Department</p>
                            <p className="font-medium">{formData.department || '[Department]'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Worksite</p>
                            <p className="font-medium">{formData.worksite || '[Worksite]'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">FTE</p>
                            <p className="font-medium">{formData.fte || '1.0'} (Full-Time)</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Salary</p>
                            <p className="font-medium">{formatSalary(formData.salary)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Start Date</p>
                            <p className="font-medium">{formatDate(formData.startDate)}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold mb-2">Benefits Include:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        {benefitsList.length > 0 ? (
                            benefitsList.map((benefit, idx) => (
                                <li key={idx}>{benefit}</li>
                            ))
                        ) : (
                            <>
                                <li>Comprehensive health insurance (medical, dental, vision)</li>
                                <li>Retirement plan with employer contribution</li>
                                <li>Professional development opportunities</li>
                                <li>Paid time off and holidays</li>
                                <li>Life insurance and disability coverage</li>
                            </>
                        )}
                    </ul>
                </div>

                <p>
                    This offer is contingent upon successful completion of a background check and verification of your credentials.
                    Please review this offer carefully and respond by clicking one of the buttons below.
                </p>

                <p>
                    We are excited about the possibility of you joining our team and look forward to your response.
                </p>

                <p className="pt-4">
                    Sincerely,<br />
                    <strong>{formData.hrDirectorName || 'Dr. Jennifer Davis'}</strong><br />
                    {formData.hrDirectorTitle || 'Director of Human Resources'}<br />
                    {formData.districtName || 'School Demo District'}
                </p>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-6 mt-8">
                <p className="text-center text-sm text-gray-600 mb-4">
                    Please respond to this offer by {formatDate(formData.expirationDate)}
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                        className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg cursor-default"
                        disabled
                    >
                        ✓ Accept Offer
                    </button>
                    <button
                        className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-lg cursor-default"
                        disabled
                    >
                        ✗ Decline Offer
                    </button>
                </div>
                <p className="text-center text-xs text-gray-500 mt-4">
                    Clicking a button will record your response and notify Human Resources
                </p>
            </div>
        </div>
    );
}
