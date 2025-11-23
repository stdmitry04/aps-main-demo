import React from 'react';
import { Reference } from '@/types';
import { Input, Button } from '@/components/ui';

interface ReferencesSectionProps {
  references: Reference[];
  onChange: (references: Reference[]) => void;
  errors: Record<number, Record<string, string>>;
}

export function ReferencesSection({ 
  references, 
  onChange, 
  errors 
}: ReferencesSectionProps) {
  const handleReferenceChange = (index: number, field: keyof Reference, value: string) => {
    const updated = [...references];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addReference = () => {
    if (references.length < 5) {
      onChange([...references, { name: '', email: '', phone: '', relationship: '' }]);
    }
  };

  const removeReference = (index: number) => {
    if (references.length > 3) {
      onChange(references.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Professional References
        </h3>
        <p className="text-sm text-gray-600">
          Please provide at least 3 professional references. References should be individuals who can speak to your professional qualifications and work performance.
        </p>
      </div>

      <div className="space-y-4">
        {references.map((reference, index) => (
          <div 
            key={index}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-900">
                Reference {index + 1}
                {index < 3 && <span className="text-red-500 ml-1">*</span>}
              </h4>
              {index >= 3 && (
                <button
                  type="button"
                  onClick={() => removeReference(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                value={reference.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleReferenceChange(index, 'name', e.target.value)
                }
                placeholder="e.g., Dr. Jane Smith"
                error={errors[index]?.name}
              />

              <Input
                label="Relationship/Title *"
                value={reference.relationship}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleReferenceChange(index, 'relationship', e.target.value)
                }
                placeholder="e.g., Principal, Former Supervisor"
                error={errors[index]?.relationship}
              />

              <Input
                label="Email Address *"
                type="email"
                value={reference.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleReferenceChange(index, 'email', e.target.value)
                }
                placeholder="reference@email.com"
                error={errors[index]?.email}
              />

              <Input
                label="Phone Number (Optional)"
                type="tel"
                value={reference.phone || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleReferenceChange(index, 'phone', e.target.value)
                }
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        ))}
      </div>

      {references.length < 5 && (
        <Button
          type="button"
          variant="secondary"
          onClick={addReference}
          className="w-full"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Another Reference
        </Button>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Reference Guidelines:</p>
            <ul className="list-disc list-inside space-y-1 text-yellow-700">
              <li>References should not be family members</li>
              <li>At least one reference should be a current or former supervisor</li>
              <li>We will contact references only for selected candidates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
