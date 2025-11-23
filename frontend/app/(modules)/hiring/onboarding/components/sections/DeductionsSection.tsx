import React, { useState } from "react";
import { Input } from "@/components/ui";

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  offerDate: string;
}

interface DeductionsSectionProps {
  candidate: Candidate;
}

export function DeductionsSection({ candidate }: DeductionsSectionProps) {
  const [formData, setFormData] = useState({
    healthInsurance: true,
    healthAmount: "450",
    dentalVision: true,
    dentalVisionAmount: "85",
    retirementPlan: true,
    retirementAmount: "200",
    fsaAmount: "0",
    hsa: false,
    hsaAmount: "0"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const totalDeductions = (
    (formData.healthInsurance ? parseFloat(formData.healthAmount) : 0) +
    (formData.dentalVision ? parseFloat(formData.dentalVisionAmount) : 0) +
    (formData.retirementPlan ? parseFloat(formData.retirementAmount) : 0) +
    parseFloat(formData.fsaAmount) +
    (formData.hsa ? parseFloat(formData.hsaAmount) : 0)
  );

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-700">
          Select which deductions and benefit contributions you'd like to participate in. Deductions are taken from your paycheck.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Health & Wellness Benefits</h3>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer mb-3">
              <input
                type="checkbox"
                name="healthInsurance"
                checked={formData.healthInsurance}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Medical Insurance</div>
                <p className="text-xs text-gray-600">Health coverage for you and eligible dependents</p>
              </div>
            </label>
            {formData.healthInsurance && (
              <div className="ml-7">
                <Input
                  label="Monthly Contribution"
                  type="number"
                  name="healthAmount"
                  value={formData.healthAmount}
                  onChange={handleChange}
                  prefix="$"
                />
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer mb-3">
              <input
                type="checkbox"
                name="dentalVision"
                checked={formData.dentalVision}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Dental & Vision</div>
                <p className="text-xs text-gray-600">Dental and vision care coverage</p>
              </div>
            </label>
            {formData.dentalVision && (
              <div className="ml-7">
                <Input
                  label="Monthly Contribution"
                  type="number"
                  name="dentalVisionAmount"
                  value={formData.dentalVisionAmount}
                  onChange={handleChange}
                  prefix="$"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Retirement & Savings</h3>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer mb-3">
              <input
                type="checkbox"
                name="retirementPlan"
                checked={formData.retirementPlan}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Retirement Plan (403b)</div>
                <p className="text-xs text-gray-600">Tax-deferred retirement savings with employer match</p>
              </div>
            </label>
            {formData.retirementPlan && (
              <div className="ml-7">
                <Input
                  label="Monthly Contribution"
                  type="number"
                  name="retirementAmount"
                  value={formData.retirementAmount}
                  onChange={handleChange}
                  prefix="$"
                />
                <p className="text-xs text-green-600 mt-2">
                  ✓ Employer match available up to 5% of salary
                </p>
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="hsa"
                checked={formData.hsa}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Health Savings Account (HSA)</div>
                <p className="text-xs text-gray-600">Tax-free account for medical expenses (requires HSA-eligible plan)</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Flexible Spending Account (FSA)</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 mb-3">Save pre-tax dollars for qualified medical and dependent care expenses</p>
          <Input
            label="Annual FSA Contribution"
            type="number"
            name="fsaAmount"
            value={formData.fsaAmount}
            onChange={handleChange}
            prefix="$"
            placeholder="0"
          />
          <p className="text-xs text-gray-600 mt-2">
            Maximum annual contribution: $3,200 (2024)
          </p>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Deductions Summary</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Total Monthly Deductions:</span>
              <span className="font-semibold text-gray-900">${totalDeductions.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Annual Deductions:</span>
              <span className="font-semibold text-gray-900">${(totalDeductions * 12).toFixed(2)}</span>
            </div>
          </div>
          <p className="text-xs text-blue-700 mt-3">
            These amounts will be deducted from your paycheck based on your pay schedule
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-xs text-yellow-800">
          ℹ️ You can change benefit elections during open enrollment or if you experience a qualifying life event
        </p>
      </div>
    </div>
  );
}
