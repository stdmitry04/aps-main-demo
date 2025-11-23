import React, { useState } from "react";
import { Input } from "@/components/ui";

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  offerDate: string;
}

interface TaxWithholdingsSectionProps {
  candidate: Candidate;
}

export function TaxWithholdingsSection({ candidate }: TaxWithholdingsSectionProps) {
  const [formData, setFormData] = useState({
    w4Version: "2020",
    filingStatus: "Single or Married Filing Separately",
    claimedDependents: "0",
    otherIncome: "0",
    deductions: "0",
    extraWithholding: "0",
    ilTaxStatus: "Withhold",
    ilAllowances: "0",
    ilExtraWithholding: "0"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          ℹ️ Complete both Federal W-4 and Illinois W-4 forms to set up correct tax withholding
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Federal W-4 Form</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">W-4 Version</label>
            <select
              name="w4Version"
              value={formData.w4Version}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="2020">2020 or later (Form W-4)</option>
              <option value="2019">2019 or earlier (Form W-4)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filing Status (Step 1)</label>
            <select
              name="filingStatus"
              value={formData.filingStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Single or Married Filing Separately">Single or Married Filing Separately</option>
              <option value="Married Filing Jointly">Married Filing Jointly</option>
              <option value="Head of Household">Head of Household</option>
              <option value="Qualifying Widow(er)">Qualifying Widow(er)</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Claimed Dependents (Step 3)"
              type="number"
              name="claimedDependents"
              value={formData.claimedDependents}
              onChange={handleChange}
              min="0"
            />
            <Input
              label="Other Income (Step 4a)"
              type="number"
              name="otherIncome"
              value={formData.otherIncome}
              onChange={handleChange}
              min="0"
              placeholder="$0"
            />
            <Input
              label="Deductions (Step 4b)"
              type="number"
              name="deductions"
              value={formData.deductions}
              onChange={handleChange}
              min="0"
              placeholder="$0"
            />
          </div>

          <Input
            label="Extra Withholding (Step 4c)"
            type="number"
            name="extraWithholding"
            value={formData.extraWithholding}
            onChange={handleChange}
            min="0"
            placeholder="$0 per pay period"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Illinois State W-4</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">IL Tax Status</label>
            <select
              name="ilTaxStatus"
              value={formData.ilTaxStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Withhold">Withhold Taxes</option>
              <option value="Exempt">Exempt from Withholding</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="IL Withholding Allowances"
              type="number"
              name="ilAllowances"
              value={formData.ilAllowances}
              onChange={handleChange}
              min="0"
            />
            <Input
              label="IL Extra Withholding"
              type="number"
              name="ilExtraWithholding"
              value={formData.ilExtraWithholding}
              onChange={handleChange}
              min="0"
              placeholder="$0 per month"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Tax Withholding Summary</h4>
        <ul className="text-xs text-gray-700 space-y-1">
          <li>• Federal withholding based on {formData.filingStatus}</li>
          <li>• {formData.claimedDependents} claimed dependent(s)</li>
          <li>• Illinois status: {formData.ilTaxStatus === "Withhold" ? "Withholding taxes" : "Exempt"}</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-xs text-yellow-800">
          💡 Employees can update their withholdings anytime by providing a new W-4 form
        </p>
      </div>
    </div>
  );
}
