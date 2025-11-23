"use client";

import React, { useState } from "react";
import { NewPositionModal } from "@/app/(modules)/hiring/positions/components";
import { TemplateSelectionModal } from "./useTemplateModal";
import { Button } from "@/components/ui/";
import { Select } from "@/components/ui/";
import { Position, JobTemplate } from "@/types";
import { MetricCard } from "./MetricCard";
import { PositionCard } from "./PositionCard";
import { PositionFormData } from "@/types/";
import { usePositions, useJobTemplates } from "@/app/(modules)/hiring/hooks";
import { useWorkLocations } from "../../hooks/useLocations";

interface PositionsViewProps {
  onViewApplicants: (position: Position) => void;
}

export function PositionsView({ onViewApplicants }: PositionsViewProps) {
  const [selectedSchool, setSelectedSchool] = React.useState('all');

  const { positions, createPosition, updatePosition, loading, error, fetchPositions, fetchPositionById } = usePositions();
  const { activeLocations, loading: locationsLoading } = useWorkLocations();
  const { templates, loading: templatesLoading } = useJobTemplates();

  // ----- MODAL STATE -----
  const [templateModalOpen, setTemplateModalOpen] = useState<boolean>(false);
  const [positionModalOpen, setPositionModalOpen] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<JobTemplate | null>(null);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  // ----- HANDLERS -----
  
  const handleNewPosition = (): void => {
    setTemplateModalOpen(true);
  }

  const handleTemplateSelect = (template: JobTemplate | null): void => {
    setSelectedTemplate(template);
    setPositionModalOpen(true);
  }

  const handleClosePositionModal = (): void => {
    setPositionModalOpen(false);
    setSelectedTemplate(null);
    setEditingPosition(null);
  }

  const handleEditPosition = async (position: Position): Promise<void> => {
    try {
      if (position.id) {
        // Fetch full position details for editing
        const fullPositionData = await fetchPositionById(position.id);
        setEditingPosition({ ...position, ...fullPositionData } as any);
        setPositionModalOpen(true);
      }
    } catch (error) {
      console.error("Failed to fetch position details:", error);
      alert('Failed to load position details for editing.');
    }
  }

  const handleSubmit = async (positionData: PositionFormData): Promise<void> => {
    try {
      if (editingPosition && editingPosition.id) {
        await updatePosition(editingPosition.id, positionData);
      } else {
        await createPosition(positionData);
      }
      setPositionModalOpen(false);
      setSelectedTemplate(null);
      setEditingPosition(null);
      await fetchPositions();
    } catch (error) {
      console.error("Failed to save position:", error);
      alert(editingPosition ? 'Failed to update position.' : 'Failed to create position.');
    }
  }

  // ----------------------------

  const filteredPositions = selectedSchool === 'all'
    ? (positions || [])
    : (positions || []).filter(p => p.worksite === selectedSchool);

  return (
    <>
      <div className="grid grid-cols-4 gap-6 mb-8">
        <MetricCard label="Open Positions" value={filteredPositions.filter(p => p.status === 'Open').length} />
        <MetricCard label="Avg. Time to Fill" value="21 days" />
        <MetricCard
          label="Active Applicants"
          value={filteredPositions.reduce((sum, pos) => sum + pos.applicantCount, 0)}
          subtitle="Across all positions"
        />
        <MetricCard label="Interviews Scheduled" value={filteredPositions.reduce((sum, pos) => sum + pos.interviewCount, 0)} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Open Positions</h2>
        <div className="flex gap-3">
          <Select 
            className="w-48" 
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            disabled={locationsLoading}
          >
            <option value="all">All Schools</option>
            {activeLocations.map((location) => (
              <option key={location.id} value={location.name}>
                {location.name}
              </option>
            ))}
          </Select>
          <Button onClick={handleNewPosition}>
            + New Position
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-500">Loading positions...</p>
          </div>
        ) : filteredPositions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2 text-gray-500">No positions found</p>
            <p className="text-sm text-gray-400">Create a new position to get started</p>
          </div>
        ) : (
          filteredPositions.map((position: Position) => (
            <PositionCard
              key={position.reqId}
              position={position}
              onViewApplicants={() => onViewApplicants(position)}
              onEdit={handleEditPosition}
            />
          ))
        )}
      </div>

      {/* Template Selection Modal */}
      <TemplateSelectionModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSelectTemplate={handleTemplateSelect}
        templates={templates}
        loading={templatesLoading}
      />

      {/* Position Creation/Edit Modal */}
      <NewPositionModal
        open={positionModalOpen}
        onClose={handleClosePositionModal}
        onSubmit={handleSubmit}
        availableLocations={activeLocations}
        initialTemplate={selectedTemplate}
        editingPosition={editingPosition}
      />
    </>
  );
}