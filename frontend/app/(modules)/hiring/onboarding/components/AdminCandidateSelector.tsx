import React, { useState } from "react";
import { Button } from "@/components/ui";

interface OnboardingCandidate {
    id: string;
    name: string;
    email: string;
    position: string;
    offerDate: string;
    status: "not_started" | "in_progress" | "completed" | "submitted";
    completedSections: number; // 0-8
    lastUpdated: string | null;
}

interface AdminCandidateSelectorProps {
    onSelectCandidate: (candidate: OnboardingCandidate) => void;
}

const mockCandidates: OnboardingCandidate[] = [
    {
        id: "1",
        name: "Sarah Chen",
        email: "sarah.chen@email.com",
        position: "Special Education Teacher",
        offerDate: "2025-10-10",
        status: "in_progress",
        completedSections: 3,
        lastUpdated: "2025-10-20"
    },
    {
        id: "2",
        name: "James Wilson",
        email: "j.wilson@email.com",
        position: "High School Principal",
        offerDate: "2025-10-08",
        status: "submitted",
        completedSections: 8,
        lastUpdated: "2025-10-19"
    },
    {
        id: "3",
        name: "Emily Rodriguez",
        email: "emily.rodriguez@email.com",
        position: "High School Chemistry Teacher",
        offerDate: "2025-10-05",
        status: "not_started",
        completedSections: 0,
        lastUpdated: null
    },
    {
        id: "4",
        name: "Jessica Brown",
        email: "jessica.b@email.com",
        position: "Elementary Reading Specialist",
        offerDate: "2025-10-09",
        status: "completed",
        completedSections: 8,
        lastUpdated: "2025-10-18"
    }
];

const getStatusColor = (status: string) => {
    switch (status) {
        case "submitted":
            return "bg-green-100 text-green-800 border-green-200";
        case "completed":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "in_progress":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "not_started":
            return "bg-gray-100 text-gray-800 border-gray-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case "submitted":
            return "Submitted ✓";
        case "completed":
            return "Completed";
        case "in_progress":
            return "In Progress";
        case "not_started":
            return "Not Started";
        default:
            return status;
    }
};

export function AdminCandidateSelector({ onSelectCandidate }: AdminCandidateSelectorProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const filteredCandidates = mockCandidates.filter(candidate => {
        const matchesSearch =
            candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.position.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterStatus === "all" || candidate.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Onboarding Dashboard</h1>
                    <p className="text-gray-600 mt-2">Manage and review employee onboarding forms</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-600 font-medium">Total Candidates</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{mockCandidates.length}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-600 font-medium">Submitted</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                            {mockCandidates.filter(c => c.status === "submitted").length}
                        </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-600 font-medium">In Progress</p>
                        <p className="text-2xl font-bold text-yellow-600 mt-1">
                            {mockCandidates.filter(c => c.status === "in_progress").length}
                        </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-600 font-medium">Not Started</p>
                        <p className="text-2xl font-bold text-gray-600 mt-1">
                            {mockCandidates.filter(c => c.status === "not_started").length}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 space-y-4">
                    <input
                        type="text"
                        placeholder="Search by name, email, or position..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterStatus("all")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === "all"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterStatus("submitted")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === "submitted"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Submitted
                        </button>
                        <button
                            onClick={() => setFilterStatus("in_progress")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === "in_progress"
                                    ? "bg-yellow-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            In Progress
                        </button>
                        <button
                            onClick={() => setFilterStatus("not_started")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === "not_started"
                                    ? "bg-gray-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Not Started
                        </button>
                    </div>
                </div>

                {/* Candidates Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Candidate</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Position</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Progress</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Last Updated</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredCandidates.map((candidate) => (
                                <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold">
                                                    {candidate.name.split(" ").map(n => n[0]).join("")}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                                                <p className="text-xs text-gray-500">{candidate.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-900">{candidate.position}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-600 transition-all"
                                                    style={{ width: `${(candidate.completedSections / 8) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-gray-600">
                                                {candidate.completedSections}/8
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                                                candidate.status
                                            )}`}
                                        >
                                            {getStatusLabel(candidate.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600">
                                            {candidate.lastUpdated
                                                ? new Date(candidate.lastUpdated).toISOString().split('T')[0]
                                                : "Never"}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button
                                            onClick={() => onSelectCandidate(candidate)}
                                            size="sm"
                                        >
                                            Review
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredCandidates.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No candidates found matching your filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export type { OnboardingCandidate };
