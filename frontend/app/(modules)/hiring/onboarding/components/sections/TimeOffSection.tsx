import React, { useState } from "react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  offerDate: string;
}

interface TimeOffSectionProps {
  candidate: Candidate;
}

export function TimeOffSection({ candidate }: TimeOffSectionProps) {
  const [formData, setFormData] = useState({
    sickDaysUnderstanding: false,
    vacationDaysUnderstanding: false,
    holidaysUnderstanding: false,
    timeOffContactName: "",
    timeOffContactEmail: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : e.target.value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-700">
          Review your time off policies and benefits. These are set based on your position and employment contract.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Leave Policies</h3>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Sick Leave</h4>
                <p className="text-sm text-gray-600 mt-1">10 days per year for illness or medical appointments</p>
              </div>
              <span className="text-lg font-semibold text-blue-600">10 days</span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Vacation</h4>
                <p className="text-sm text-gray-600 mt-1">Varies by position. Teachers get summer break off.</p>
              </div>
              <span className="text-lg font-semibold text-blue-600">Based on role</span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Holidays</h4>
                <p className="text-sm text-gray-600 mt-1">District observes all federal holidays plus additional school holidays</p>
              </div>
              <span className="text-lg font-semibold text-blue-600">12+ days</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Request Time Off</h3>
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <p className="text-sm text-gray-700 mb-3">
            To request time off, contact your manager or use the Employee Portal
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Time Off Request Contact</label>
              <input
                type="text"
                name="timeOffContactName"
                value={formData.timeOffContactName}
                onChange={handleChange}
                placeholder="Your manager's name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                name="timeOffContactEmail"
                value={formData.timeOffContactEmail}
                onChange={handleChange}
                placeholder="manager@district.edu"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Acknowledgment</h3>
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              name="sickDaysUnderstanding"
              checked={formData.sickDaysUnderstanding}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded mt-1"
            />
            <span className="text-sm text-gray-700">
              I understand my sick leave policy and how to request sick days
            </span>
          </label>

          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              name="vacationDaysUnderstanding"
              checked={formData.vacationDaysUnderstanding}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded mt-1"
            />
            <span className="text-sm text-gray-700">
              I understand my vacation and personal day policy
            </span>
          </label>

          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              name="holidaysUnderstanding"
              checked={formData.holidaysUnderstanding}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded mt-1"
            />
            <span className="text-sm text-gray-700">
              I understand the district's holiday schedule
            </span>
          </label>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-700">
          💡 Your time off balance and accrual details can be viewed in the Employee Portal or by contacting HR
        </p>
      </div>
    </div>
  );
}
