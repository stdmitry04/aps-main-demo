'use client';

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui";
import { Layout } from "@/components/layout"

interface OnboardingData {
  id: string;
  name: string;
  email: string;
  position: string;
  school: string;
  district: string;
  hireDate: string;
  status: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: string;
  citizenship: string;
  paymentMethod: string;
  bankName?: string;
  healthInsurance: boolean;
  dentalVision: boolean;
  retirementPlan: boolean;
  emergencyContact1: string;
  emergencyContact2?: string;
  completedDate: string;
}

// Mock data - replace with API call
const mockData: OnboardingData[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    position: "Special Education Teacher",
    school: "Central High School",
    district: "District 308",
    hireDate: "2025-08-15",
    status: "submitted",
    phone: "(555) 123-4567",
    address: "123 Main St",
    city: "Springfield",
    state: "IL",
    zipCode: "62701",
    dateOfBirth: "1990-05-20",
    citizenship: "US Citizen",
    paymentMethod: "Direct Deposit",
    bankName: "Chase Bank",
    healthInsurance: true,
    dentalVision: true,
    retirementPlan: true,
    emergencyContact1: "John Chen",
    emergencyContact2: "Mary Chen",
    completedDate: "2025-10-20"
  },
  {
    id: "2",
    name: "James Wilson",
    email: "j.wilson@email.com",
    position: "High School Principal",
    school: "Lincoln High School",
    district: "District 308",
    hireDate: "2025-08-10",
    status: "submitted",
    phone: "(555) 234-5678",
    address: "456 Oak Ave",
    city: "Springfield",
    state: "IL",
    zipCode: "62702",
    dateOfBirth: "1985-03-15",
    citizenship: "US Citizen",
    paymentMethod: "Check",
    healthInsurance: true,
    dentalVision: true,
    retirementPlan: false,
    emergencyContact1: "Sarah Wilson",
    completedDate: "2025-10-19"
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@email.com",
    position: "Chemistry Teacher",
    school: "Central High School",
    district: "District 305",
    hireDate: "2025-08-20",
    status: "submitted",
    phone: "(555) 345-6789",
    address: "789 Pine Rd",
    city: "Champaign",
    state: "IL",
    zipCode: "61820",
    dateOfBirth: "1992-07-10",
    citizenship: "US Citizen",
    paymentMethod: "Direct Deposit",
    bankName: "Bank of America",
    healthInsurance: true,
    dentalVision: false,
    retirementPlan: true,
    emergencyContact1: "Carlos Rodriguez",
    completedDate: "2025-10-18"
  },
  {
    id: "4",
    name: "Jessica Brown",
    email: "jessica.b@email.com",
    position: "Reading Specialist",
    school: "Elm Elementary School",
    district: "District 308",
    hireDate: "2025-08-25",
    status: "submitted",
    phone: "(555) 456-7890",
    address: "321 Maple Ln",
    city: "Springfield",
    state: "IL",
    zipCode: "62703",
    dateOfBirth: "1988-11-05",
    citizenship: "US Citizen",
    paymentMethod: "Direct Deposit",
    bankName: "Wells Fargo",
    healthInsurance: false,
    dentalVision: true,
    retirementPlan: true,
    emergencyContact1: "Michael Brown",
    emergencyContact2: "Patricia Brown",
    completedDate: "2025-10-17"
  }
];

export default function ReportsPage() {
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  // Extract unique values
  const schools = ["all", ...new Set(mockData.map(d => d.school))];
  const districts = ["all", ...new Set(mockData.map(d => d.district))];
  const roles = ["all", ...new Set(mockData.map(d => d.position))];

  // Filter data
  const filteredData = useMemo(() => {
    return mockData.filter(item => {
      const matchSchool = selectedSchool === "all" || item.school === selectedSchool;
      const matchDistrict = selectedDistrict === "all" || item.district === selectedDistrict;
      const matchRole = selectedRole === "all" || item.position === selectedRole;
      return matchSchool && matchDistrict && matchRole;
    });
  }, [selectedSchool, selectedDistrict, selectedRole]);

  // Generate CSV
  const generateCSV = () => {
    if (filteredData.length === 0) {
      alert("No data to export");
      return;
    }

    // Define CSV headers
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Position",
      "School",
      "District",
      "Hire Date",
      "Status",
      "Address",
      "City",
      "State",
      "ZIP Code",
      "Date of Birth",
      "Citizenship",
      "Payment Method",
      "Bank Name",
      "Health Insurance",
      "Dental & Vision",
      "Retirement Plan",
      "Emergency Contact 1",
      "Emergency Contact 2",
      "Completed Date"
    ];

    // Convert data to CSV rows
    const rows = filteredData.map(item => [
      item.name,
      item.email,
      item.phone,
      item.position,
      item.school,
      item.district,
      item.hireDate,
      item.status,
      item.address,
      item.city,
      item.state,
      item.zipCode,
      item.dateOfBirth,
      item.citizenship,
      item.paymentMethod,
      item.bankName || "",
      item.healthInsurance ? "Yes" : "No",
      item.dentalVision ? "Yes" : "No",
      item.retirementPlan ? "Yes" : "No",
      item.emergencyContact1,
      item.emergencyContact2 || "",
      item.completedDate
    ]);

    // Create CSV content
    const csvContent = [
      headers.map(h => `"${h}"`).join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const filename = `onboarding-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Onboarding Reports</h1>
          <p className="text-gray-600 mt-2">Export employee onboarding data to CSV</p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {districts.map(district => (
                  <option key={district} value={district}>
                    {district === "all" ? "All Districts" : district}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {schools.map(school => (
                  <option key={school} value={school}>
                    {school === "all" ? "All Schools" : school}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role === "all" ? "All Roles" : role}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-medium">Records Found</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{filteredData.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-medium">Total Records</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{mockData.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-medium">Export Status</p>
            <p className="text-sm font-medium text-green-600 mt-1">Ready to Export</p>
          </div>
        </div>

        {/* Export Button */}
        <div className="mb-8">
          <Button onClick={generateCSV} className="gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download CSV ({filteredData.length} records)
          </Button>
        </div>

        {/* Data Preview */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Data Preview</h2>
            <p className="text-sm text-gray-600 mt-1">Showing {filteredData.length} of {mockData.length} records</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">School</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">District</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">{item.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{item.email}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{item.position}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{item.school}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{item.district}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className="inline-flex px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{item.completedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No records found matching your filters</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> CSV is generated in your browser. No data is sent to any server. 
            The file includes all onboarding data fields.
          </p>
        </div>
      </div>
    </div>
    </Layout>
  );
}
