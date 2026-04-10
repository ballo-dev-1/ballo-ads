'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import AdminHero from '@/app/admin/components/AdminHero'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import { useConfirmDialog } from '@/app/admin/components/useConfirmDialog'
import {
  adminApi,
  type RoadmapFeatureResponse,
  type RoadmapFeatureStatus,
  type RoadmapOverviewResponse,
  type RoadmapPhaseResponse,
} from '@/lib/adminApi'
import PhaseCard from './components/PhaseCard'
import RoadmapFormModals from './components/RoadmapFormModals'

type ModalState =
  | { mode: 'phase'; phaseId?: number }
  | { mode: 'feature'; phaseId: number; parentFeatureId?: number; featureId?: number }
  | { mode: 'milestone'; phaseId?: number; milestoneId?: number }
  | null

function flattenFeatures(features: RoadmapFeatureResponse[]): RoadmapFeatureResponse[] {
  return features.flatMap((feature) => [feature, ...flattenFeatures(feature.subFeatures)])
}

function calcProgress(phase: RoadmapPhaseResponse): number {
  const all = flattenFeatures(phase.features)
  if (!all.length) return 0
  const score = all.reduce((total, feature) => {
    if (feature.status === 'Done') return total + 100
    if (feature.status === 'PartiallyDone') return total + 50
    if (feature.status === 'InProgress') return total + 25
    return total
  }, 0)
  return Math.round(score / all.length)
}

export default function RoadmapPage() {
  const { env } = useApiEnv()
  const { confirm, confirmDialog } = useConfirmDialog()
  const [overview, setOverview] = useState<RoadmapOverviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [modal, setModal] = useState<ModalState>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.getRoadmap()
      setOverview(data)
      setExpanded((current) =>
        data.phases.reduce<Record<number, boolean>>((acc, phase) => {
          acc[phase.id] = current[phase.id] ?? true
          return acc
        }, {}),
      )
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load roadmap')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [env])

  const summary = useMemo(() => {
    if (!overview) return null
    const completion = overview.totalFeatures ? Math.round((overview.doneFeatures / overview.totalFeatures) * 100) : 0
    return {
      ...overview,
      completion,
    }
  }, [overview])

  const handleSeed = async () => {
    try {
      await adminApi.seedRoadmap()
      toast.success('Roadmap seeded')
      await load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to seed roadmap')
    }
  }

  const handleDeletePhase = async (phase: RoadmapPhaseResponse) => {
    const approved = await confirm({
      title: 'Delete phase',
      description: `Delete "${phase.name}" and all related features?`,
      confirmLabel: 'Delete',
      tone: 'danger',
    })
    if (!approved) return
    try {
      await adminApi.deleteRoadmapPhase(phase.id)
      toast.success('Phase deleted')
      await load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete phase')
    }
  }

  const handleDeleteFeature = async (feature: RoadmapFeatureResponse) => {
    const approved = await confirm({
      title: 'Delete feature',
      description: `Delete "${feature.name}" and all sub-features?`,
      confirmLabel: 'Delete',
      tone: 'danger',
    })
    if (!approved) return
    try {
      await adminApi.deleteRoadmapFeature(feature.id)
      toast.success('Feature deleted')
      await load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete feature')
    }
  }

  const handleFeatureStatusChange = async (
    feature: RoadmapFeatureResponse,
    status: RoadmapFeatureStatus,
  ) => {
    try {
      await adminApi.updateRoadmapFeatureStatus(feature.id, status)
      await load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update feature status')
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading roadmap...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <AdminHero
        title="Product Roadmap"
        subtitle="Manage implemented and planned features with milestones and timelines."
      />

      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white"
          onClick={() => setModal({ mode: 'phase' })}
        >
          Add Phase
        </button>
        <button
          className="rounded-lg border px-3 py-2 text-sm text-gray-700"
          onClick={handleSeed}
        >
          Seed Baseline Data
        </button>
      </div>

      {summary ? (
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-gray-500">Total features</p>
            <p className="text-2xl font-semibold">{summary.totalFeatures}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-gray-500">Done</p>
            <p className="text-2xl font-semibold text-green-700">{summary.doneFeatures}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-gray-500">In progress</p>
            <p className="text-2xl font-semibold text-blue-700">{summary.inProgressFeatures}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-gray-500">Completion</p>
            <p className="text-2xl font-semibold">{summary.completion}%</p>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="space-y-4">
        {overview?.phases.map((phase) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            expanded={Boolean(expanded[phase.id])}
            progress={calcProgress(phase)}
            onToggle={() => setExpanded((prev) => ({ ...prev, [phase.id]: !prev[phase.id] }))}
            onEditPhase={() => setModal({ mode: 'phase', phaseId: phase.id })}
            onDeletePhase={() => handleDeletePhase(phase)}
            onAddFeature={() => setModal({ mode: 'feature', phaseId: phase.id })}
            onAddMilestone={() => setModal({ mode: 'milestone', phaseId: phase.id })}
            onEditFeature={(feature) => setModal({ mode: 'feature', phaseId: phase.id, featureId: feature.id })}
            onDeleteFeature={handleDeleteFeature}
            onAddSubFeature={(feature) =>
              setModal({ mode: 'feature', phaseId: phase.id, parentFeatureId: feature.id })
            }
            onFeatureStatusChange={handleFeatureStatusChange}
          />
        ))}
      </div>

      <RoadmapFormModals
        mode={modal?.mode ?? null}
        title={
          modal?.mode === 'phase'
            ? modal.phaseId
              ? 'Edit phase'
              : 'Create phase'
            : modal?.mode === 'feature'
              ? modal.featureId
                ? 'Edit feature'
                : modal.parentFeatureId
                  ? 'Create sub-feature'
                  : 'Create feature'
              : 'Create milestone'
        }
        featureParentId={modal?.mode === 'feature' ? modal.parentFeatureId : undefined}
        onClose={() => setModal(null)}
        onSubmitPhase={async (payload) => {
          if (modal?.mode === 'phase' && modal.phaseId) {
            await adminApi.updateRoadmapPhase(modal.phaseId, payload)
            toast.success('Phase updated')
          } else {
            const displayOrder = (overview?.phases.length ?? 0) + 1
            await adminApi.createRoadmapPhase({ ...payload, displayOrder, status: 'Pending' })
            toast.success('Phase created')
          }
          await load()
        }}
        onSubmitFeature={async (payload) => {
          if (modal?.mode === 'feature' && modal.featureId) {
            await adminApi.updateRoadmapFeature(modal.featureId, payload)
            toast.success('Feature updated')
          } else if (modal?.mode === 'feature') {
            await adminApi.createRoadmapFeature(modal.phaseId, {
              ...payload,
              displayOrder: 9999,
              status: payload.status ?? 'Pending',
              priority: payload.priority ?? 'Medium',
            })
            toast.success('Feature created')
          }
          await load()
        }}
        onSubmitMilestone={async (payload) => {
          if (modal?.mode === 'milestone' && modal.milestoneId) {
            await adminApi.updateRoadmapMilestone(modal.milestoneId, payload)
            toast.success('Milestone updated')
          } else {
            await adminApi.createRoadmapMilestone({
              ...payload,
              phaseId: modal?.mode === 'milestone' ? modal.phaseId : undefined,
              status: payload.status ?? 'Pending',
            })
            toast.success('Milestone created')
          }
          await load()
        }}
      />

      {confirmDialog}
    </div>
  )
}
