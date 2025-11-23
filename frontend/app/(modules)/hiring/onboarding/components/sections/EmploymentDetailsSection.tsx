import React, { useState } from "react";
import { Input } from "@/components/ui";

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  offerDate: string;
}

interface EmploymentDetailsSectionProps {
  candidate: Candidate;
}

export function EmploymentDetailsSection({ candidate }: EmploymentDetailsSectionProps) {
  const [formData, setFormData] = useState({
    status: "Active",
    hireDate: "2025-08-15",
    paySchedule: "Twice a month",
    workLocation: "Central High School",
    manager: "Dr. Sarah Johnson",
    department: "Science",
    jobTitle: candidate.position,
    employeeId: "",
    billingRate: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> These fields are pulled from the offer letter and are not editable by the employee. Only admins can modify.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Employment Status</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <Input
            label="Hire Date"
            type="date"
            name="hireDate"
            value={formData.hireDate}
            onChange={handleChange}
            disabled
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Position Information</h3>
        <div className="space-y-4">
          <Input
            label="Job Title"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            disabled
          />
          <Input
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            disabled
          />
          <Input
            label="Work Location"
            name="workLocation"
            value={formData.workLocation}
            onChange={handleChange}
            disabled
          />
          <Input
            label="Manager"
            name="manager"
            value={formData.manager}
            onChange={handleChange}
            disabled
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Payroll Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pay Schedule</label>
            <select
              name="paySchedule"
              value={formData.paySchedule}
              onChange={handleChange}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
            >
              <option>Twice a month</option>
              <option>Weekly</option>
              <option>Bi-weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <Input
            label="Employee ID"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            placeholder="Will be auto-generated"
          />
          <Input
            label="Billing Rate (per hour)"
            type="number"
            name="billingRate"
            value={formData.billingRate}
            onChange={handleChange}
            placeholder="$0.00"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          ✓ Employment details are auto-populated from your offer letter
        </p>
      </div>
    </div>
  );
}
