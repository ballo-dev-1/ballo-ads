'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Trash2, GripVertical } from 'lucide-react'
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  adminApi,
  type PricingLadderBandRequest,
  type PricingLadderBandResponse,
  type PricingLadderRateRequest,
  type PricingPlatform,
} from '@/lib/adminApi'
import { usePathname, useRouter } from 'next/navigation'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import AdminHero from '@/app/admin/components/AdminHero'

const platforms: PricingPlatform[] = ['Sms', 'Email', 'WhatsApp', 'WhatsAppUtility']
const durationOptions = [
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
  { value: 0, label: 'No expiry' },
] as const

type EditableBand = {
  rowId: string
  thresholdStart: number
  thresholdEnd: number
  displayOrder: number
  isEnabled: boolean
  rates: Record<PricingPlatform, { amountPerMessage: number; isEnabled: boolean }>
}

const createRowId = () => `tier-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const createEmptyBand = (displayOrder: number, rowId = createRowId()): EditableBand => ({
  rowId,
  thresholdStart: 0,
  thresholdEnd: 0,
  displayOrder,
  isEnabled: true,
  rates: {
    Sms: { amountPerMessage: 0, isEnabled: true },
    Email: { amountPerMessage: 0, isEnabled: true },
    WhatsApp: { amountPerMessage: 0, isEnabled: true },
    WhatsAppUtility: { amountPerMessage: 0, isEnabled: true },
  },
})

function mapBandToEditable(band: PricingLadderBandResponse): EditableBand {
  const editable = createEmptyBand(band.displayOrder, `tier-${band.id}-${band.displayOrder}`)
  editable.thresholdStart = band.thresholdStart
  editable.thresholdEnd = band.thresholdEnd <= 0 ? Math.ceil(band.thresholdStart / 100) * 100 : band.thresholdEnd
  editable.displayOrder = band.displayOrder
  editable.isEnabled = band.isEnabled
  for (const rate of band.rates) {
    editable.rates[rate.platform] = {
      amountPerMessage: rate.amountPerMessage,
      isEnabled: rate.isEnabled,
    }
  }
  return editable
}

function buildSavePayload(duration: number, bands: EditableBand[]): { duration: number; bands: PricingLadderBandRequest[] } {
  return {
    duration,
    bands: bands
      .sort((a, b) => a.thresholdStart - b.thresholdStart)
      .map((band, index) => ({
        thresholdStart: band.thresholdStart,
        thresholdEnd: band.thresholdEnd,
        displayOrder: index + 1,
        isEnabled: true,
        rates: platforms.map((platform): PricingLadderRateRequest => ({
          platform,
          amountPerMessage: band.rates[platform].amountPerMessage,
          isEnabled: true,
        })),
      })),
  }
}

function validateBands(duration: number, bands: EditableBand[]): string | null {
  const validDurations: number[] = durationOptions.map((option) => option.value)
  if (!validDurations.includes(duration)) {
    return 'Duration must be 30, 60, 90, or no expiry.'
  }
  if (bands.length === 0) {
    return 'At least one pricing band is required.'
  }

  const ordered = [...bands]

  for (let i = 0; i < ordered.length; i++) {
    const band = ordered[i]
    if (!Number.isFinite(band.thresholdStart) || band.thresholdStart < 0) {
      return `Tier ${i + 1}: threshold start must be zero or greater.`
    }
    if (!Number.isFinite(band.thresholdEnd)) {
      return `Tier ${i + 1}: threshold end must be a valid number.`
    }
    if (band.thresholdEnd <= 0) {
      return `Tier ${i + 1}: threshold end must be greater than zero.`
    }
    if (band.thresholdStart > band.thresholdEnd) {
      return `Tier ${i + 1}: threshold start cannot be greater than threshold end.`
    }

    for (const platform of platforms) {
      const amount = band.rates[platform]?.amountPerMessage
      if (!Number.isFinite(amount) || amount <= 0) {
        return `Tier ${i + 1}: ${platform} amount must be greater than zero.`
      }
    }
  }

  for (let i = 1; i < ordered.length; i++) {
    const prev = ordered[i - 1]
    const current = ordered[i]
    if (current.thresholdStart !== prev.thresholdEnd + 1) {
      return `Gap/overlap detected between band ${i} and band ${i + 1}; bands must be contiguous.`
    }
  }

  return null
}

function parseMaybeNumber(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeBandForCompare(band: EditableBand) {
  const normalizedRates = platforms.map((platform) => ({
    platform,
    amountPerMessage: Number.isFinite(band.rates[platform].amountPerMessage)
      ? band.rates[platform].amountPerMessage
      : 'NaN',
  }))
  return {
    thresholdStart: Number.isFinite(band.thresholdStart) ? band.thresholdStart : 'NaN',
    thresholdEnd: Number.isFinite(band.thresholdEnd) ? band.thresholdEnd : 'NaN',
    rates: normalizedRates,
  }
}

function createBandsSnapshot(bands: EditableBand[]): string {
  return JSON.stringify(bands.map(normalizeBandForCompare))
}

function SortableRow({
  rowId,
  className,
  children,
}: {
  rowId: string
  className: string
  children: (dragHandle: { attributes: unknown; listeners: unknown }) => ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rowId })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${className} ${isDragging ? 'bg-slate-50' : ''}`.trim()}
    >
      {children({
        attributes,
        listeners: listeners ?? {},
      })}
    </tr>
  )
}

export default function PricingPage() {
  const { env } = useApiEnv()
  const router = useRouter()
  const pathname = usePathname()
  const [duration, setDuration] = useState(30)
  const [bands, setBands] = useState<EditableBand[]>([])
  const [lastSyncedSnapshot, setLastSyncedSnapshot] = useState('[]')
  const [importSources, setImportSources] = useState<Array<{ value: number; label: string }>>([])
  const [selectedImportDuration, setSelectedImportDuration] = useState<number | ''>('')
  const [importing, setImporting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [endInputDrafts, setEndInputDrafts] = useState<Record<string, string>>({})
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false)
  const [pendingAction, setPendingAction] = useState<
    | { type: 'durationSwitch'; nextDuration: number }
    | { type: 'importFromDuration'; sourceDuration: number }
    | { type: 'routeLeave'; href: string }
    | null
  >(null)
  const bypassGuardRef = useRef(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const data = await adminApi.getPricingLadder(duration)
      const mappedBands = data.map(mapBandToEditable)
      setBands(mappedBands)
      setLastSyncedSnapshot(createBandsSnapshot(mappedBands))

      const sourceResults = await Promise.all(
        durationOptions
          .filter((option) => option.value !== duration)
          .map(async (option) => {
            try {
              const sourceData = await adminApi.getPricingLadder(option.value)
              if (sourceData.length === 0) return null
              return { value: option.value, label: option.label }
            } catch {
              return null
            }
          }),
      )
      const sourceOptions = sourceResults.filter(
        (option): option is NonNullable<(typeof sourceResults)[number]> => option !== null,
      )
      setImportSources(sourceOptions)
      setSelectedImportDuration((prev) =>
        prev !== '' && sourceOptions.some((option) => option.value === prev)
          ? prev
          : (sourceOptions[0]?.value ?? ''),
      )
    } catch (e: unknown) {
      setBands([])
      setLastSyncedSnapshot('[]')
      setImportSources([])
      setSelectedImportDuration('')
      setError(e instanceof Error ? e.message : 'Failed to load pricing ladder')
    } finally {
      setLoading(false)
    }
  }, [duration])

  useEffect(() => {
    load()
  }, [env, load])

  const orderedBands = useMemo(() => [...bands], [bands])
  const hasUnsavedChanges = useMemo(
    () => createBandsSnapshot(bands) !== lastSyncedSnapshot,
    [bands, lastSyncedSnapshot],
  )
  const validationError = useMemo(() => validateBands(duration, bands), [duration, bands])
  const fieldValidation = useMemo(() => {
    const validDurations: number[] = durationOptions.map((option) => option.value)
    const durationInvalid = !validDurations.includes(duration)
    const startInvalid = new Set<EditableBand>()
    const endInvalid = new Set<EditableBand>()
    const rateInvalid = new Map<EditableBand, Set<PricingPlatform>>()
    const startError = new Map<EditableBand, string>()
    const endError = new Map<EditableBand, string>()
    const rateError = new Map<EditableBand, Map<PricingPlatform, string>>()

    const addStartError = (band: EditableBand, message: string) => {
      startInvalid.add(band)
      if (!startError.has(band)) startError.set(band, message)
    }
    const addEndError = (band: EditableBand, message: string) => {
      endInvalid.add(band)
      if (!endError.has(band)) endError.set(band, message)
    }
    const addRateError = (band: EditableBand, platform: PricingPlatform, message: string) => {
      const invalidPlatforms = rateInvalid.get(band) ?? new Set<PricingPlatform>()
      invalidPlatforms.add(platform)
      rateInvalid.set(band, invalidPlatforms)

      const errorByPlatform = rateError.get(band) ?? new Map<PricingPlatform, string>()
      if (!errorByPlatform.has(platform)) errorByPlatform.set(platform, message)
      rateError.set(band, errorByPlatform)
    }

    for (let i = 0; i < orderedBands.length; i++) {
      const band = orderedBands[i]
      if (!Number.isFinite(band.thresholdStart) || band.thresholdStart < 0) {
        addStartError(band, `Tier ${i + 1}: threshold start must be zero or greater.`)
      }

      if (!Number.isFinite(band.thresholdEnd) || band.thresholdEnd <= 0) {
        addEndError(band, `Tier ${i + 1}: threshold end must be greater than zero.`)
      } else if (band.thresholdStart > band.thresholdEnd) {
        addEndError(band, `Tier ${i + 1}: threshold start cannot be greater than threshold end.`)
      }

      for (const platform of platforms) {
        const amount = band.rates[platform]?.amountPerMessage
        if (!Number.isFinite(amount) || amount <= 0) {
          addRateError(band, platform, `Tier ${i + 1}: ${platform} amount must be greater than zero.`)
        }
      }
    }

    for (let i = 1; i < orderedBands.length; i++) {
      const prev = orderedBands[i - 1]
      const current = orderedBands[i]
      if (current.thresholdStart !== prev.thresholdEnd + 1) {
        addEndError(prev, `Gap/overlap between tier ${i} and tier ${i + 1}; tiers must be contiguous.`)
        addStartError(current, `Gap/overlap between tier ${i} and tier ${i + 1}; tiers must be contiguous.`)
      }
    }

    return { durationInvalid, startInvalid, endInvalid, rateInvalid, startError, endError, rateError }
  }, [duration, orderedBands])

  const addBand = () => {
    setBands((prev) => {
      const newBand = createEmptyBand(prev.length + 1)
      const ordered = [...prev].sort((a, b) => a.thresholdStart - b.thresholdStart)
      const lastBand = ordered[ordered.length - 1]

      if (!lastBand) {
        newBand.thresholdEnd = Math.ceil(newBand.thresholdStart / 100) * 100
        return [...prev, newBand]
      }

      for (const platform of platforms) {
        newBand.rates[platform].amountPerMessage = lastBand.rates[platform].amountPerMessage
      }

      newBand.thresholdStart = lastBand.thresholdEnd + 1
      newBand.thresholdEnd = Math.ceil(newBand.thresholdStart / 100) * 100
      return [...prev, newBand]
    })
  }
  const hoverTooltipClass =
    'pointer-events-none absolute top-full z-20 mt-1 hidden w-52 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium normal-case tracking-normal text-white shadow-lg group-hover:block group-focus-within:hidden left-1/2 -translate-x-1/2'

  const removeBand = (bandToRemove: EditableBand) => {
    setBands((prev) => prev.filter((band) => band.rowId !== bandToRemove.rowId))
    setEndInputDrafts((prev) => {
      const next = { ...prev }
      delete next[bandToRemove.rowId]
      return next
    })
  }

  const updateBand = (bandToUpdate: EditableBand, patch: Partial<EditableBand>) => {
    setBands((prev) =>
      prev.map((band) => (band.rowId === bandToUpdate.rowId ? { ...band, ...patch } : band)),
    )
  }

  const updateRate = (
    bandToUpdate: EditableBand,
    platform: PricingPlatform,
    patch: Partial<{ amountPerMessage: number; isEnabled: boolean }>,
  ) => {
    setBands((prev) =>
      prev.map((band) =>
        band.rowId === bandToUpdate.rowId
          ? {
              ...band,
              rates: {
                ...band.rates,
                [platform]: {
                  ...band.rates[platform],
                  ...patch,
                },
              },
            }
          : band,
      ),
    )
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setBands((prev) => {
      const oldIndex = prev.findIndex((band) => band.rowId === String(active.id))
      const newIndex = prev.findIndex((band) => band.rowId === String(over.id))
      if (oldIndex < 0 || newIndex < 0) return prev

      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  const runImportFromDuration = async (sourceDuration: number) => {
    setImporting(true)
    setError('')
    setSuccess('')
    try {
      const sourceData = await adminApi.getPricingLadder(sourceDuration)
      if (sourceData.length === 0) {
        setError('Selected duration has no tiers to import.')
        return
      }

      const imported = sourceData.map((band, index) => ({
        ...mapBandToEditable(band),
        rowId: createRowId(),
        displayOrder: index + 1,
      }))

      setBands(imported)
      setEndInputDrafts({})
      const sourceLabel =
        durationOptions.find((option) => option.value === sourceDuration)?.label ??
        String(sourceDuration)
      setSuccess(`Imported ${imported.length} tier(s) from ${sourceLabel}.`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to import tiers')
    } finally {
      setImporting(false)
    }
  }

  const requestGuardedAction = (
    action:
      | { type: 'durationSwitch'; nextDuration: number }
      | { type: 'importFromDuration'; sourceDuration: number }
      | { type: 'routeLeave'; href: string },
  ) => {
    if (bypassGuardRef.current || !hasUnsavedChanges) {
      if (action.type === 'durationSwitch') {
        setDuration(action.nextDuration)
      } else if (action.type === 'importFromDuration') {
        void runImportFromDuration(action.sourceDuration)
      } else {
        if (action.href.startsWith('/')) {
          router.push(action.href)
        } else {
          window.location.href = action.href
        }
      }
      return
    }

    setPendingAction(action)
    setShowUnsavedPrompt(true)
  }

  const continuePendingAction = () => {
    if (!pendingAction) return

    bypassGuardRef.current = true
    const action = pendingAction
    setPendingAction(null)
    setShowUnsavedPrompt(false)
    setError('')
    setSuccess('')

    if (action.type === 'durationSwitch') {
      setDuration(action.nextDuration)
    } else if (action.type === 'importFromDuration') {
      void runImportFromDuration(action.sourceDuration).finally(() => {
        bypassGuardRef.current = false
      })
      return
    } else if (action.href.startsWith('/')) {
      router.push(action.href)
    } else {
      window.location.href = action.href
    }

    window.setTimeout(() => {
      bypassGuardRef.current = false
    }, 0)
  }

  const cancelPendingAction = () => {
    setPendingAction(null)
    setShowUnsavedPrompt(false)
  }

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges || bypassGuardRef.current) return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [hasUnsavedChanges])

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!hasUnsavedChanges || bypassGuardRef.current) return
      const target = event.target as HTMLElement | null
      if (!target) return
      const anchor = target.closest('a[href]') as HTMLAnchorElement | null
      if (!anchor) return
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const hrefAttr = anchor.getAttribute('href')
      if (!hrefAttr || hrefAttr.startsWith('#')) return

      const url = new URL(anchor.href, window.location.origin)
      if (url.origin !== window.location.origin) return
      const nextHref = `${url.pathname}${url.search}${url.hash}`
      const currentHref = `${pathname}${window.location.search}${window.location.hash}`
      if (nextHref === currentHref) return

      event.preventDefault()
      requestGuardedAction({ type: 'routeLeave', href: nextHref })
    }

    document.addEventListener('click', onDocumentClick, true)
    return () => document.removeEventListener('click', onDocumentClick, true)
  }, [hasUnsavedChanges, pathname])

  const saveLadder = async () => {
    if (validationError) {
      setError(validationError)
      setSuccess('')
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const payload = buildSavePayload(duration, bands)
      const saved = await adminApi.replacePricingLadder(payload)
      const mappedBands = saved.map(mapBandToEditable)
      setBands(mappedBands)
      setLastSyncedSnapshot(createBandsSnapshot(mappedBands))
      setSuccess('Pricing ladder saved successfully.')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save pricing ladder')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 space-y-6 overflow-auto p-6">
        <AdminHero
          eyebrow="Monetization"
          title="Pricing"
          description="Manage unified pricing intervals with mandatory platform rates."
          variant="slate"
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-green-200 bg-green-50/90 px-4 py-3 text-green-700">
            {success}
          </div>
        )}

        <div className="space-y-4 rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Duration (days)
              </label>
              <select
                value={duration}
                onChange={(e) => {
                  const nextDuration = Number(e.target.value)
                  if (nextDuration === duration) return
                  requestGuardedAction({ type: 'durationSwitch', nextDuration })
                }}
                className={`w-40 rounded-lg border bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:ring-2 ${
                  fieldValidation.durationInvalid
                    ? 'border-red-400 ring-red-200 focus:ring-red-300'
                    : 'border-gray-300 ring-[var(--admin-ui-accent)]/30'
                }`}
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={addBand}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Add tier
            </button>
            <button
              type="button"
              onClick={saveLadder}
              disabled={saving || loading || !!validationError}
              className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Pricing'}
            </button>
          </div>
          <p className="text-xs text-gray-500">Tip: tiers are displayed in ascending threshold order.</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-[var(--admin-ui-accent)]" />
            </div>
          ) : (
            <div className="overflow-x-auto p-4">
              <table className="w-full min-w-[1200px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <th className="w-10 px-3 py-3" aria-label="Reorder" />
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-600">Tier</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-600">Start</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-600">End</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-600">SMS (ZMW)</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-600">Email (ZMW)</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-600">WhatsApp (ZMW)</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-600">WhatsApp Utility (ZMW)</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-600">Action</th>
                  </tr>
                </thead>
                {bands.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-gray-500">
                        <div className="mx-auto max-w-xl">
                          <p>No bands configured for this duration.</p>
                          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-left">
                            <p className="mb-2 text-xs font-medium text-blue-900">Import tiers from another duration</p>
                            {importSources.length > 0 ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <select
                                  value={selectedImportDuration}
                                  onChange={(e) => setSelectedImportDuration(Number(e.target.value))}
                                  className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-[var(--admin-ui-accent)]/20 focus:ring-2"
                                >
                                  {importSources.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (selectedImportDuration === '') return
                                    requestGuardedAction({
                                      type: 'importFromDuration',
                                      sourceDuration: selectedImportDuration,
                                    })
                                  }}
                                  disabled={importing || selectedImportDuration === ''}
                                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                                >
                                  {importing ? 'Importing...' : 'Import tiers'}
                                </button>
                              </div>
                            ) : (
                              <p className="text-xs text-blue-900/80">No populated durations available to import from.</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={bands.map((band) => band.rowId)} strategy={verticalListSortingStrategy}>
                      <tbody>
                        {bands.map((band, index) => (
                          <SortableRow
                            key={band.rowId}
                            rowId={band.rowId}
                            className="border-b border-gray-100 transition-colors hover:bg-gray-50/70"
                          >
                            {({ attributes, listeners }) => (
                              <>
                                <td className="px-2 py-3 align-middle">
                                  <button
                                    type="button"
                                    className="inline-flex cursor-grab items-center justify-center rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                    aria-label="Drag to reorder tier"
                                    title="Drag to reorder tier"
                                    {...(attributes as object)}
                                    {...(listeners as object)}
                                  >
                                    <GripVertical className="h-4 w-4" />
                                  </button>
                                </td>
                        <td className="px-3 py-3 text-sm font-medium text-gray-700">{index + 1}</td>
                        <td className="px-3 py-3">
                          <div className="group relative flex items-center gap-2">
                            <input
                              type="text"
                              value={band.thresholdStart}
                              onChange={(e) => {
                                const parsed = parseMaybeNumber(e.target.value)
                                if (parsed === null) return
                                updateBand(band, { thresholdStart: parsed })
                              }}
                              onFocus={() => setFocusedField(`start-${index}`)}
                              onBlur={() => setFocusedField(null)}
                              className={`w-28 rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 ${
                                fieldValidation.startInvalid.has(band)
                                  ? 'border-red-400 ring-red-200 focus:ring-red-300'
                                  : 'border-gray-300 ring-[var(--admin-ui-accent)]/30'
                              }`}
                            />
                            {fieldValidation.startInvalid.has(band) &&
                            fieldValidation.startError.get(band) &&
                            focusedField !== `start-${index}` ? (
                              <span className={hoverTooltipClass}>{fieldValidation.startError.get(band)}</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="group relative flex items-center gap-2">
                              <input
                                type="text"
                                value={endInputDrafts[band.rowId] ?? String(band.thresholdEnd)}
                                onChange={(e) => {
                                  const nextValue = e.target.value
                                  setEndInputDrafts((prev) => ({ ...prev, [band.rowId]: nextValue }))

                                  if (nextValue.trim() === '') {
                                    updateBand(band, { thresholdEnd: Number.NaN })
                                    return
                                  }

                                  const parsed = parseMaybeNumber(nextValue)
                                  if (parsed === null) {
                                    updateBand(band, { thresholdEnd: Number.NaN })
                                    return
                                  }

                                  updateBand(band, { thresholdEnd: parsed })
                                  setEndInputDrafts((prev) => {
                                    const next = { ...prev }
                                    delete next[band.rowId]
                                    return next
                                  })
                                }}
                                onFocus={() => setFocusedField(`end-${index}`)}
                                onBlur={() => setFocusedField(null)}
                                placeholder="End threshold"
                                className={`w-28 rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                                  fieldValidation.endInvalid.has(band)
                                    ? 'border-red-400 ring-red-200 focus:ring-red-300'
                                    : 'border-gray-300 ring-[var(--admin-ui-accent)]/30'
                                }`}
                              />
                              {fieldValidation.endInvalid.has(band) &&
                              fieldValidation.endError.get(band) &&
                              focusedField !== `end-${index}` ? (
                                <span className={hoverTooltipClass}>{fieldValidation.endError.get(band)}</span>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        {platforms.map((platform) => (
                          <td key={platform} className="px-3 py-3">
                            <div className="flex items-center">
                              <div className="group relative flex items-center gap-2">
                                <input
                                  type="text"
                                  value={band.rates[platform].amountPerMessage}
                                  onChange={(e) => {
                                    const parsed = parseMaybeNumber(e.target.value)
                                    if (parsed === null) return
                                    updateRate(band, platform, { amountPerMessage: parsed })
                                  }}
                                  onFocus={() => setFocusedField(`rate-${index}-${platform}`)}
                                  onBlur={() => setFocusedField(null)}
                                  className={`w-28 rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 ${
                                    fieldValidation.rateInvalid.get(band)?.has(platform)
                                      ? 'border-red-400 ring-red-200 focus:ring-red-300'
                                      : 'border-gray-300 ring-[var(--admin-ui-accent)]/30'
                                  }`}
                                />
                                {fieldValidation.rateInvalid.get(band)?.has(platform) &&
                                fieldValidation.rateError.get(band)?.get(platform) &&
                                focusedField !== `rate-${index}-${platform}` ? (
                                  <span className={hoverTooltipClass}>
                                    {fieldValidation.rateError.get(band)?.get(platform)}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </td>
                        ))}
                        <td className="px-3 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeBand(band)}
                            aria-label="Delete tier"
                            title="Delete tier"
                            className="inline-flex items-center justify-center rounded-md p-1.5 text-red-600 transition hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                              </>
                            )}
                          </SortableRow>
                        ))}
                      </tbody>
                    </SortableContext>
                  </DndContext>
                )}
              </table>
            </div>
          )}
        </div>
      </div>
      {showUnsavedPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <h2 className="text-base font-semibold text-slate-900">Leave without saving?</h2>
            <p className="mt-2 text-sm text-slate-600">
              You have unsaved pricing changes. If you proceed, your edits will be lost.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelPendingAction}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Stay on page
              </button>
              <button
                type="button"
                onClick={continuePendingAction}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Proceed and leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


