'use client'

import type { RoadmapFeatureResponse, RoadmapFeatureStatus, RoadmapPhaseResponse } from '@/lib/adminApi'
import FeatureRow from './FeatureRow'
import MilestoneTimeline from './MilestoneTimeline'

type Props = {
  phase: RoadmapPhaseResponse
  expanded: boolean
  progress: number
  onToggle: () => void
  onEditPhase: () => void
  onDeletePhase: () => void
  onAddFeature: () => void
  onAddMilestone: () => void
  onEditFeature: (feature: RoadmapFeatureResponse) => void
  onDeleteFeature: (feature: RoadmapFeatureResponse) => void
  onAddSubFeature: (feature: RoadmapFeatureResponse) => void
  onFeatureStatusChange: (feature: RoadmapFeatureResponse, status: RoadmapFeatureStatus) => void
}

export default function PhaseCard({
  phase,
  expanded,
  progress,
  onToggle,
  onEditPhase,
  onDeletePhase,
  onAddFeature,
  onAddMilestone,
  onEditFeature,
  onDeleteFeature,
  onAddSubFeature,
  onFeatureStatusChange,
}: Props) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <button className="text-left text-lg font-semibold text-gray-900" onClick={onToggle}>
            {phase.name}
          </button>
          <p className="text-sm text-gray-500">{phase.description || 'No description'}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Progress: {progress}%</p>
          <div className="h-2 w-48 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full bg-blue-600" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {expanded ? (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={onAddFeature} className="rounded-lg border px-3 py-1.5 text-sm text-gray-700">Add Feature</button>
            <button onClick={onAddMilestone} className="rounded-lg border px-3 py-1.5 text-sm text-gray-700">Add Milestone</button>
            <button onClick={onEditPhase} className="rounded-lg border px-3 py-1.5 text-sm text-indigo-700">Edit Phase</button>
            <button onClick={onDeletePhase} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700">Delete Phase</button>
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-3 py-2">Feature</th>
                  <th className="px-3 py-2">Priority</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Timeline</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {phase.features.map((feature) => (
                  <FeatureRow
                    key={feature.id}
                    feature={feature}
                    onEdit={onEditFeature}
                    onDelete={onDeleteFeature}
                    onAddSubFeature={onAddSubFeature}
                    onStatusChange={onFeatureStatusChange}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <MilestoneTimeline milestones={phase.milestones} />
        </div>
      ) : null}
    </section>
  )
}
