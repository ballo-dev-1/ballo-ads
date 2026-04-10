'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
import RoadmapFormModals from './components/RoadmapFormModals'

type ModalState =
  | { mode: 'phase'; phaseId?: number }
  | { mode: 'feature'; phaseId: number; parentFeatureId?: number; featureId?: number }
  | { mode: 'milestone'; phaseId?: number; milestoneId?: number }
  | null
type RoadmapViewMode = 'tree' | 'calendar'
type TreeDrawerFeature = { phaseId: number; featureId: number } | null
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const CALENDAR_MONTH_WIDTH = 58

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

function findFeatureById(features: RoadmapFeatureResponse[], featureId: number): RoadmapFeatureResponse | null {
  for (const feature of features) {
    if (feature.id === featureId) return feature
    const nested = findFeatureById(feature.subFeatures, featureId)
    if (nested) return nested
  }
  return null
}

function getYearMonth(value?: string): { year: number; month: number } | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
  }
}

function formatMonthYear(value?: string): string {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}

function formatDateRange(start?: string | null, end?: string | null): string {
  const startLabel = start ? new Date(start).toLocaleDateString() : null
  const endLabel = end ? new Date(end).toLocaleDateString() : null
  if (startLabel && endLabel) return `${startLabel} - ${endLabel}`
  if (startLabel) return `Starts ${startLabel}`
  if (endLabel) return `Ends ${endLabel}`
  return 'No planned dates'
}

function TreeFeatureNode({
  feature,
  phaseId,
  expandedFeatures,
  onToggle,
  onOpenFeature,
}: {
  feature: RoadmapFeatureResponse
  phaseId: number
  expandedFeatures: Record<number, boolean>
  onToggle: (featureId: number) => void
  onOpenFeature: (phaseId: number, featureId: number) => void
}) {
  const hasChildren = feature.subFeatures.length > 0
  const isExpanded = hasChildren ? Boolean(expandedFeatures[feature.id]) : false

  return (
    <li className="relative pl-5">
      <span className="absolute left-0 top-3 h-px w-3 bg-slate-300" />
      <div
        className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        role="button"
        tabIndex={0}
        onClick={() => onOpenFeature(phaseId, feature.id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onOpenFeature(phaseId, feature.id)
          }
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium text-slate-800">{feature.name}</p>
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button
                type="button"
                className="relative inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
                onClick={(event) => {
                  event.stopPropagation()
                  onToggle(feature.id)
                }}
                onKeyDown={(event) => event.stopPropagation()}
                aria-label={isExpanded ? 'Collapse feature branch' : 'Expand feature branch'}
              >
                <span className="absolute h-0.5 w-3 rounded bg-current" />
                <span
                  className={`absolute h-3 w-0.5 rounded bg-current transition-opacity duration-200 ${
                    isExpanded ? 'opacity-0' : 'opacity-100'
                  }`}
                />
              </button>
            ) : null}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              {feature.status}
            </span>
          </div>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
            {feature.priority}
          </span>
          <span>{formatDateRange(feature.plannedStartDate, feature.plannedEndDate)}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
          {feature.description || feature.userStory || 'No additional details'}
        </p>
      </div>
      {hasChildren ? (
        <div
          className={`grid transition-all duration-300 ease-out ${
            isExpanded ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <ul className="relative space-y-2 border-l border-dashed border-slate-300 pl-3">
              {feature.subFeatures.map((child) => (
                <TreeFeatureNode
                  key={child.id}
                  feature={child}
                  phaseId={phaseId}
                  expandedFeatures={expandedFeatures}
                  onToggle={onToggle}
                  onOpenFeature={onOpenFeature}
                />
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </li>
  )
}

export default function RoadmapPage() {
  const { env } = useApiEnv()
  const { confirm, confirmDialog } = useConfirmDialog()
  const [overview, setOverview] = useState<RoadmapOverviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({})
  const [expandedFeatures, setExpandedFeatures] = useState<Record<number, boolean>>({})
  const [modal, setModal] = useState<ModalState>(null)
  const [viewMode, setViewMode] = useState<RoadmapViewMode>('table')
  const [treeDrawerFeature, setTreeDrawerFeature] = useState<TreeDrawerFeature>(null)
  const [drawerName, setDrawerName] = useState('')
  const [drawerDescription, setDrawerDescription] = useState('')
  const [drawerUserStory, setDrawerUserStory] = useState('')
  const [drawerPriority, setDrawerPriority] = useState<'Low' | 'Medium' | 'High'>('Medium')
  const [drawerStatus, setDrawerStatus] = useState<RoadmapFeatureStatus>('Pending')
  const [drawerPlannedStartDate, setDrawerPlannedStartDate] = useState('')
  const [drawerPlannedEndDate, setDrawerPlannedEndDate] = useState('')
  const [savingDrawer, setSavingDrawer] = useState(false)
  const calendarScrollRef = useRef<HTMLDivElement | null>(null)
  const hasAutoFocusedCalendarRef = useRef(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.getRoadmap()
      setOverview(data)
      setExpandedPhases((current) =>
        data.phases.reduce<Record<number, boolean>>((acc, phase) => {
          acc[phase.id] = current[phase.id] ?? true
          return acc
        }, {}),
      )
      setExpandedFeatures((current) => {
        const next = { ...current }
        data.phases.forEach((phase) => {
          phase.features.forEach((feature) => {
            next[feature.id] = current[feature.id] ?? true
          })
        })
        return next
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load roadmap')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [env])

  useEffect(() => {
    if (!treeDrawerFeature) return
    const phase = overview?.phases.find((p) => p.id === treeDrawerFeature.phaseId)
    const feature = phase ? findFeatureById(phase.features, treeDrawerFeature.featureId) : null
    if (!feature) return
    setDrawerName(feature.name)
    setDrawerDescription(feature.description ?? '')
    setDrawerUserStory(feature.userStory ?? '')
    setDrawerPriority(feature.priority)
    setDrawerStatus(feature.status)
    setDrawerPlannedStartDate(feature.plannedStartDate ? feature.plannedStartDate.slice(0, 10) : '')
    setDrawerPlannedEndDate(feature.plannedEndDate ? feature.plannedEndDate.slice(0, 10) : '')
  }, [overview, treeDrawerFeature])

  useEffect(() => {
    if (!treeDrawerFeature) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTreeDrawerFeature(null)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [treeDrawerFeature])

  const summary = useMemo(() => {
    if (!overview) return null
    const completion = overview.totalFeatures ? Math.round((overview.doneFeatures / overview.totalFeatures) * 100) : 0
    return {
      ...overview,
      completion,
    }
  }, [overview])

  const calendarRows = useMemo(() => {
    if (!overview) return []
    return overview.phases.flatMap((phase) =>
      flattenFeatures(phase.features).map((feature) => ({
        feature,
        phaseName: phase.name,
      })),
    )
  }, [overview])

  const calendarTimeline = useMemo(() => {
    const yearMonths = calendarRows.flatMap(({ feature }) => {
      const start = getYearMonth(feature.plannedStartDate)
      const end = getYearMonth(feature.plannedEndDate)
      return [start, end].filter((item): item is { year: number; month: number } => item !== null)
    })

    const currentYear = new Date().getFullYear()
    const minYear = yearMonths.length ? Math.min(...yearMonths.map((entry) => entry.year)) : currentYear
    const maxYear = yearMonths.length ? Math.max(...yearMonths.map((entry) => entry.year)) : currentYear
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, index) => minYear + index)
    const columns = years.flatMap((year) => MONTH_LABELS.map((month, monthIndex) => ({ year, month, monthIndex })))

    return { years, columns, minYear, maxYear }
  }, [calendarRows])

  const currentYearScrollTarget = useMemo(() => {
    const totalColumns = calendarTimeline.columns.length
    if (!totalColumns) return 0
    const currentYear = new Date().getFullYear()
    const rawIndex = (currentYear - calendarTimeline.minYear) * 12
    return Math.max(0, Math.min(totalColumns - 1, rawIndex))
  }, [calendarTimeline.columns.length, calendarTimeline.minYear])

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

  const handleToggleTreePhase = (phaseId: number) => {
    setExpandedPhases((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }))
  }

  const handleToggleTreeFeature = (featureId: number) => {
    setExpandedFeatures((prev) => ({ ...prev, [featureId]: !prev[featureId] }))
  }

  const handleOpenFeatureFromTree = (phaseId: number, featureId: number) => {
    setTreeDrawerFeature({ phaseId, featureId })
  }

  const selectedTreeFeature = useMemo(() => {
    if (!treeDrawerFeature || !overview) return null
    const phase = overview.phases.find((p) => p.id === treeDrawerFeature.phaseId)
    if (!phase) return null
    const feature = findFeatureById(phase.features, treeDrawerFeature.featureId)
    return feature ? { phase, feature } : null
  }, [overview, treeDrawerFeature])

  const handleSaveTreeDrawer = async () => {
    if (!treeDrawerFeature) return
    if (!drawerName.trim() || !drawerUserStory.trim()) return
    setSavingDrawer(true)
    try {
      await adminApi.updateRoadmapFeature(treeDrawerFeature.featureId, {
        name: drawerName.trim(),
        userStory: drawerUserStory.trim(),
        description: drawerDescription.trim() || undefined,
        priority: drawerPriority,
        status: drawerStatus,
        plannedStartDate: drawerPlannedStartDate || undefined,
        plannedEndDate: drawerPlannedEndDate || undefined,
      })
      toast.success('Feature updated')
      await load()
      setTreeDrawerFeature(null)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update feature')
    } finally {
      setSavingDrawer(false)
    }
  }

  useEffect(() => {
    if (viewMode !== 'calendar') return
    if (hasAutoFocusedCalendarRef.current) return
    const scroller = calendarScrollRef.current
    if (!scroller || !calendarTimeline.columns.length) return

    const targetPixel = currentYearScrollTarget * CALENDAR_MONTH_WIDTH
    const centeredTarget = Math.max(0, targetPixel - scroller.clientWidth * 0.25)
    const maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth)
    scroller.scrollLeft = Math.min(maxScroll, centeredTarget)
    hasAutoFocusedCalendarRef.current = true
  }, [viewMode, calendarTimeline.columns.length, currentYearScrollTarget])

  useEffect(() => {
    if (viewMode === 'calendar') return
    hasAutoFocusedCalendarRef.current = false
  }, [viewMode])

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading roadmap...</div>
  }

  return (
    <div className="space-y-6 bg-slate-50/70 p-6">
      <AdminHero
        title="Product Roadmap"
        subtitle="Manage implemented and planned features with a clearer, interactive roadmap board."
      />

      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-500"
          onClick={() => setModal({ mode: 'phase' })}
        >
          Add Phase
        </button>
      </div>

      {summary ? (
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total features</p>
            <p className="text-2xl font-semibold">{summary.totalFeatures}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Done</p>
            <p className="text-2xl font-semibold text-green-700">{summary.doneFeatures}</p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-700">In progress</p>
            <p className="text-2xl font-semibold text-blue-700">{summary.inProgressFeatures}</p>
          </div>
          <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-violet-700">Completion</p>
            <p className="text-2xl font-semibold">{summary.completion}%</p>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-slate-800">Roadmap view</p>
          <p className="text-xs text-slate-500">Switch between hierarchy and detailed table management</p>
        </div>
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            onClick={() => setViewMode('tree')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              viewMode === 'tree' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Tree view
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Calendar view
          </button>
        </div>
      </div>

      {viewMode === 'tree' && overview?.phases.length ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Roadmap Tree</h2>
            <p className="text-xs text-slate-500">Inspired by product-design roadmap style hierarchy</p>
          </div>

          <div className="space-y-5">
            {overview.phases.map((phase, index) => (
              <div key={`tree-phase-${phase.id}`} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <p className="text-base font-semibold text-slate-900">{phase.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
                      <p className="text-right text-xs font-semibold text-slate-700">{calcProgress(phase)}%</p>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-slate-700 transition-all duration-300"
                          style={{ width: `${calcProgress(phase)}%` }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100"
                      onClick={() => handleToggleTreePhase(phase.id)}
                      aria-label={expandedPhases[phase.id] ? 'Collapse phase' : 'Expand phase'}
                    >
                      <span className="absolute h-0.5 w-4 rounded bg-current" />
                      <span
                        className={`absolute h-4 w-0.5 rounded bg-current transition-opacity duration-200 ${
                          expandedPhases[phase.id] ? 'opacity-0' : 'opacity-100'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                {phase.features.length ? (
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      expandedPhases[phase.id] ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <ul className="space-y-2 border-l border-dashed border-slate-300 pl-3">
                        {phase.features.map((feature) => (
                          <TreeFeatureNode
                            key={feature.id}
                            feature={feature}
                            phaseId={phase.id}
                            expandedFeatures={expandedFeatures}
                            onToggle={handleToggleTreeFeature}
                            onOpenFeature={handleOpenFeatureFromTree}
                          />
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No features yet in this phase.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {viewMode === 'calendar' ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Roadmap Calendar</h2>
            <p className="text-xs text-slate-500">Gantt-style monthly timeline for all planned features</p>
          </div>
          <div className="flex min-w-0">
            <div className="w-[260px] shrink-0 border-r border-slate-200 bg-white">
              <div className="flex min-h-[4.75rem] flex-col justify-center border-b border-slate-200 bg-slate-50 px-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Feature</span>
              </div>
              {calendarRows.length
                ? calendarRows.map(({ feature, phaseName }) => (
                    <div
                      key={`calendar-feature-label-${feature.id}`}
                      className="flex h-[68px] flex-col justify-center space-y-0.5 border-b border-slate-100 px-3"
                    >
                      <p className="truncate text-sm font-medium text-slate-800">{feature.name}</p>
                      <p className="truncate text-xs text-slate-500">{phaseName}</p>
                    </div>
                  ))
                : null}
            </div>
            <div ref={calendarScrollRef} className="min-w-0 flex-1 overflow-x-auto">
              <div
                className="min-w-max"
                style={{ minWidth: Math.max(720, calendarTimeline.columns.length * 58) }}
              >
                <div
                  className="grid border-b border-slate-200 bg-slate-50"
                  style={{
                    gridTemplateColumns: `repeat(${calendarTimeline.columns.length}, minmax(58px, 1fr))`,
                  }}
                >
                  {calendarTimeline.years.map((year) => (
                    <div
                      key={`calendar-year-${year}`}
                      className="border-l border-slate-200 px-2 py-1 text-center text-xs font-semibold uppercase text-slate-600"
                      style={{ gridColumn: 'span 12' }}
                    >
                      {year}
                    </div>
                  ))}
                </div>
                <div
                  className="grid border-b border-slate-200 bg-slate-50"
                  style={{
                    gridTemplateColumns: `repeat(${calendarTimeline.columns.length}, minmax(58px, 1fr))`,
                  }}
                >
                  {calendarTimeline.columns.map((column) => (
                    <div
                      key={`calendar-month-${column.year}-${column.monthIndex}`}
                      className="border-l border-slate-200 px-2 py-2 text-center text-xs font-semibold uppercase text-slate-500"
                    >
                      {column.month}
                    </div>
                  ))}
                </div>

                {calendarRows.length ? (
                  calendarRows.map(({ feature }) => {
                    const start = getYearMonth(feature.plannedStartDate)
                    const end = getYearMonth(feature.plannedEndDate)
                    const startIndex = start
                      ? (start.year - calendarTimeline.minYear) * 12 + start.month
                      : null
                    const endIndex = end
                      ? (end.year - calendarTimeline.minYear) * 12 + end.month
                      : null
                    const rangeStart = startIndex ?? endIndex
                    const rangeEnd = endIndex ?? startIndex
                    const hasRange = rangeStart !== null && rangeEnd !== null
                    const maxIndex = calendarTimeline.columns.length - 1
                    const clampedStart = hasRange ? Math.max(0, Math.min(maxIndex, Math.min(rangeStart, rangeEnd))) : 0
                    const clampedEnd = hasRange ? Math.max(0, Math.min(maxIndex, Math.max(rangeStart, rangeEnd))) : 0

                    return (
                      <div
                        key={`calendar-row-${feature.id}`}
                        className="relative grid h-[68px] border-b border-slate-100"
                        style={{
                          gridTemplateColumns: `repeat(${calendarTimeline.columns.length}, minmax(58px, 1fr))`,
                        }}
                      >
                        {calendarTimeline.columns.map((column) => (
                          <div
                            key={`calendar-cell-${feature.id}-${column.year}-${column.monthIndex}`}
                            className="h-full border-l border-slate-100"
                          />
                        ))}
                        <div
                          className="pointer-events-none absolute inset-0 grid px-1"
                          style={{
                            gridTemplateColumns: `repeat(${calendarTimeline.columns.length}, minmax(58px, 1fr))`,
                          }}
                        >
                          {hasRange ? (
                            <div
                              className="h-6 self-center rounded-full bg-gradient-to-r from-sky-400 to-cyan-400 shadow-sm transition hover:from-sky-500 hover:to-cyan-500"
                              style={{ gridColumn: `${clampedStart + 1} / ${clampedEnd + 2}` }}
                              title={`${feature.name}: ${formatMonthYear(feature.plannedStartDate)} - ${formatMonthYear(
                                feature.plannedEndDate,
                              )}`}
                            />
                          ) : (
                            <div
                              className="flex items-center px-2 text-[11px] text-slate-400"
                              style={{ gridColumn: `1 / ${calendarTimeline.columns.length + 1}` }}
                            >
                              No dates
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="px-4 py-8 text-sm text-slate-500">No features available for calendar view.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

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

      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          treeDrawerFeature ? 'pointer-events-auto bg-black/30 opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setTreeDrawerFeature(null)}
      />
      <aside
        className={`fixed right-0 top-0 z-[70] h-screen w-full max-w-xl transform border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ${
          treeDrawerFeature ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!treeDrawerFeature}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Feature details</p>
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedTreeFeature?.feature.name || 'Feature'}
              </h3>
            </div>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
              onClick={() => setTreeDrawerFeature(null)}
            >
              Close
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Name</label>
            <input
              value={drawerName}
              onChange={(e) => setDrawerName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Description</label>
            <textarea
              value={drawerDescription}
              onChange={(e) => setDrawerDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={3}
            />
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">User story</label>
            <textarea
              value={drawerUserStory}
              onChange={(e) => setDrawerUserStory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={4}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Priority</label>
                <select
                  value={drawerPriority}
                  onChange={(e) => setDrawerPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Status</label>
                <select
                  value={drawerStatus}
                  onChange={(e) => setDrawerStatus(e.target.value as RoadmapFeatureStatus)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="InProgress">In Progress</option>
                  <option value="PartiallyDone">Partially Done</option>
                  <option value="Done">Done</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Planned start</label>
                <input
                  type="date"
                  value={drawerPlannedStartDate}
                  onChange={(e) => setDrawerPlannedStartDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Planned end</label>
                <input
                  type="date"
                  value={drawerPlannedEndDate}
                  onChange={(e) => setDrawerPlannedEndDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
              onClick={() => setTreeDrawerFeature(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveTreeDrawer}
              disabled={savingDrawer || !drawerName.trim() || !drawerUserStory.trim()}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingDrawer ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
