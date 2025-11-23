import React, { useState } from "react";
import { Input } from "@/components/ui";

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  offerDate: string;
}

interface I9FormSectionProps {
  candidate: Candidate;
}

export function I9FormSection({ candidate }: I9FormSectionProps) {
  const [formData, setFormData] = useState({
    citizenshipStatus: "US Citizen",
    uscisNumber: "",
    passportNumber: "",
    passportCountry: "",
    listADocument: "",
    listBDocument: "",
    listBDocNumber: "",
    listCDocument: "",
    listCDocNumber: "",
    verificationDate: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-red-900">Required for Employment in Illinois</h4>
            <p className="text-xs text-red-700 mt-1">Form I-9 Employment Eligibility Verification must be completed before day one of employment</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Citizenship Status</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            name="citizenshipStatus"
            value={formData.citizenshipStatus}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="US Citizen">US Citizen</option>
            <option value="Permanent Resident">Permanent Resident</option>
            <option value="Work Visa">Work Visa</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {formData.citizenshipStatus === "Permanent Resident" && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Permanent Resident Information</h3>
          <Input
            label="USCIS/A-Number"
            name="uscisNumber"
            value={formData.uscisNumber}
            onChange={handleChange}
            placeholder="A-12345678"
          />
        </div>
      )}

      {formData.citizenshipStatus === "Work Visa" && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Visa Information</h3>
          <Input
            label="Passport Number"
            name="passportNumber"
            value={formData.passportNumber}
            onChange={handleChange}
            placeholder="Passport number"
          />
          <Input
            label="Passport Country"
            name="passportCountry"
            value={formData.passportCountry}
            onChange={handleChange}
            placeholder="Country of issuance"
          />
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Documentation (List A OR Lists B & C)</h3>
        <p className="text-xs text-gray-600 mb-4">Select which documents the employee will provide</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">List A Document (Identity + Employment)</label>
            <select
              name="listADocument"
              value={formData.listADocument}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select document...</option>
              <option value="US Passport">US Passport</option>
              <option value="Permanent Resident Card">Permanent Resident Card</option>
              <option value="Employment Authorization Document">Employment Authorization Document</option>
            </select>
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="text-xs text-gray-600 mb-4 font-medium">OR provide one from each list below:</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">List B (Identity)</label>
                <select
                  name="listBDocument"
                  value={formData.listBDocument}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select document...</option>
                  <option value="Driver's License">Driver's License</option>
                  <option value="State ID">State ID</option>
                  <option value="School ID">School ID</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">List C (Employment)</label>
                <select
                  name="listCDocument"
                  value={formData.listCDocument}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select document...</option>
                  <option value="Social Security Card">Social Security Card</option>
                  <option value="Birth Certificate">Birth Certificate</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Input
          label="Verification Date"
          type="date"
          name="verificationDate"
          value={formData.verificationDate}
          onChange={handleChange}
        />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-700">
          📄 For detailed instructions, see the Form I-9 instructions document
        </p>
      </div>
    </div>
  );
}
