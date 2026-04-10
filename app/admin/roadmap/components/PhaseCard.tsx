'use client'

import type { RoadmapFeatureResponse, RoadmapFeatureStatus, RoadmapPhaseResponse } from '@/lib/adminApi'
import FeatureRow from './FeatureRow'
import MilestoneTimeline from './MilestoneTimeline'

type Props = {
  phase: RoadmapPhaseResponse
  phaseIndex: number
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
  phaseIndex,
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
  const phaseTone =
    phaseIndex % 4 === 0
      ? 'bg-orange-50'
      : phaseIndex % 4 === 1
        ? 'bg-blue-50'
        : phaseIndex % 4 === 2
          ? 'bg-violet-50'
          : 'bg-emerald-50'

  return (
    <section
      id={`phase-${phase.id}`}
      className={`group rounded-3xl border border-slate-200 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${phaseTone}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Phase {String(phaseIndex + 1).padStart(2, '0')}
          </p>
          <button
            className="mt-1 text-left text-lg font-semibold text-slate-900 transition group-hover:text-slate-700"
            onClick={onToggle}
          >
            {phase.name}
          </button>
          <p className="text-sm text-slate-600">{phase.description || 'No description'}</p>
        </div>
        <div className="w-full max-w-56 rounded-2xl border border-white/80 bg-white/80 p-3 text-right shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Progress</p>
          <p className="text-lg font-semibold text-slate-800">{progress}%</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-slate-700" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {expanded ? (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onAddFeature}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              Add Feature
            </button>
            <button
              onClick={onAddMilestone}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              Add Milestone
            </button>
            <button
              onClick={onEditPhase}
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition hover:border-indigo-300"
            >
              Edit Phase
            </button>
            <button
              onClick={onDeletePhase}
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:border-red-300"
            >
              Delete Phase
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white/80 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
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
