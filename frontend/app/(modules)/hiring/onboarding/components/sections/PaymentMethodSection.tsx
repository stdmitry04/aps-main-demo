import React, { useState } from "react";
import { Input } from "@/components/ui";

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  offerDate: string;
}

interface PaymentMethodSectionProps {
  candidate: Candidate;
}

export function PaymentMethodSection({ candidate }: PaymentMethodSectionProps) {
  const [paymentMethod, setPaymentMethod] = useState<"paper_check" | "direct_deposit">("paper_check");
  const [formData, setFormData] = useState({
    bankName: "",
    accountType: "Checking",
    accountNumber: "",
    routingNumber: "",
    nameOnAccount: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          Choose how you'd like to receive your paycheck. You can start with paper check and switch to direct deposit later.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment Method</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50" 
            onClick={() => setPaymentMethod("paper_check")}>
            <input
              type="radio"
              checked={paymentMethod === "paper_check"}
              onChange={() => setPaymentMethod("paper_check")}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <div className="font-medium text-gray-900">Paper Check</div>
              <div className="text-xs text-gray-600">Receive physical checks by mail</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
            onClick={() => setPaymentMethod("direct_deposit")}>
            <input
              type="radio"
              checked={paymentMethod === "direct_deposit"}
              onChange={() => setPaymentMethod("direct_deposit")}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <div className="font-medium text-gray-900">Direct Deposit</div>
              <div className="text-xs text-gray-600">Automatic transfer to your bank account</div>
            </div>
          </label>
        </div>
      </div>

      {paymentMethod === "direct_deposit" && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Bank Account Information</h3>
          <div className="space-y-4">
            <Input
              label="Bank Name"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="e.g., Chase Bank"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Checking">Checking</option>
                <option value="Savings">Savings</option>
              </select>
            </div>

            <Input
              label="Account Number"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="1234567890"
              type="password"
            />

            <Input
              label="Routing Number"
              name="routingNumber"
              value={formData.routingNumber}
              onChange={handleChange}
              placeholder="021000021"
            />

            <Input
              label="Name on Account"
              name="nameOnAccount"
              value={formData.nameOnAccount}
              onChange={handleChange}
              placeholder={candidate.name}
            />

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-xs text-yellow-800">
                ⚠️ Your bank account information is encrypted and stored securely. Only payroll administrators can access it.
              </p>
            </div>
          </div>
        </div>
      )}

      {paymentMethod === "paper_check" && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Paper Check Setup</h3>
          <p className="text-sm text-gray-700 mb-3">You're all set! Checks will be mailed to your address on file.</p>
          <p className="text-xs text-gray-600">
            You can update your payment method to direct deposit at any time through the employee portal.
          </p>
        </div>
      )}

      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Base Pay</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-900">Annual Salary from Offer Letter:</span>
            <span className="text-lg font-semibold text-blue-900">$58,000 - $92,000</span>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            Your exact salary will be confirmed on your first day
          </p>
        </div>
      </div>
    </div>
  );
}
