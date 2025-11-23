import React, { useState } from "react";
import { Input } from "@/components/ui";

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  offerDate: string;
}

interface EmergencyContactSectionProps {
  candidate: Candidate;
}

export function EmergencyContactSection({ candidate }: EmergencyContactSectionProps) {
  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: "",
      relationship: "Spouse",
      phone: "",
      email: ""
    }
  ]);

  const handleContactChange = (index: number, field: string, value: string) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setContacts(newContacts);
  };

  const handleAddContact = () => {
    setContacts([
      ...contacts,
      {
        id: Math.max(...contacts.map(c => c.id)) + 1,
        name: "",
        relationship: "Family Member",
        phone: "",
        email: ""
      }
    ]);
  };

  const handleRemoveContact = (index: number) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-red-900">Emergency Contact Information</h4>
            <p className="text-xs text-red-700 mt-1">We'll contact these people in case of emergency. Provide at least one contact.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <div key={contact.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Contact {index + 1}
              </h3>
              {contacts.length > 1 && (
                <button
                  onClick={() => handleRemoveContact(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Contact's full name"
                value={contact.name}
                onChange={(e) => handleContactChange(index, "name", e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                <select
                  value={contact.relationship}
                  onChange={(e) => handleContactChange(index, "relationship", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Child">Child</option>
                  <option value="Friend">Friend</option>
                  <option value="Other">Other Family Member</option>
                </select>
              </div>

              <Input
                label="Phone Number"
                type="tel"
                placeholder="(555) 123-4567"
                value={contact.phone}
                onChange={(e) => handleContactChange(index, "phone", e.target.value)}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="contact@example.com"
                value={contact.email}
                onChange={(e) => handleContactChange(index, "email", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleAddContact}
        className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Another Contact
      </button>

      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Additional Information</h3>
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">How to Update</h4>
            <p className="text-xs text-gray-700">
              You can update your emergency contact information at any time through the Employee Portal or by contacting HR.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-900 mb-2">Confidentiality</h4>
            <p className="text-xs text-green-700">
              Your emergency contact information is kept confidential and only accessed in case of emergency.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Acknowledgment</h3>
        <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            className="w-4 h-4 text-blue-600 rounded mt-1"
          />
          <span className="text-sm text-gray-700">
            I confirm that the emergency contact information provided is accurate and that I authorize the district to contact these individuals in case of emergency
          </span>
        </label>
      </div>
    </div>
  );
}
