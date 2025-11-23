import React, { useState } from "react";
import { Input } from "@/components/ui";

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  offerDate: string;
}

interface PersonalInformationSectionProps {
  candidate: Candidate;
}

export function PersonalInformationSection({ candidate }: PersonalInformationSectionProps) {
  const [formData, setFormData] = useState({
    firstName: candidate.name.split(" ")[0],
    lastName: candidate.name.split(" ")[1] || "",
    email: candidate.email,
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    dateOfBirth: "",
    socialSecurityNumber: "",
    citizenship: "US Citizen"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First name"
          />
          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last name"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address"
          />
          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Address</h3>
        <div className="space-y-4">
          <Input
            label="Street Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="123 Main Street"
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
            />
            <Input
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="IL"
            />
            <Input
              label="ZIP Code"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="60601"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Government Information</h3>
        <div className="space-y-4">
          <Input
            label="Date of Birth"
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
          />
          <Input
            label="Social Security Number"
            type="password"
            name="socialSecurityNumber"
            value={formData.socialSecurityNumber}
            onChange={handleChange}
            placeholder="XXX-XX-XXXX"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Citizenship Status</label>
            <select
              name="citizenship"
              value={formData.citizenship}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>US Citizen</option>
              <option>Permanent Resident</option>
              <option>Work Visa</option>
              <option>Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          ✓ All personal information fields have been pre-populated from your application
        </p>
      </div>
    </div>
  );
}
