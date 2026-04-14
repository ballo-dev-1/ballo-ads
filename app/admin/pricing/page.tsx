'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
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
  editable.thresholdEnd = band.thresholdEnd
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
    if (band.thresholdEnd > 0 && band.thresholdStart > band.thresholdEnd) {
      return `Tier ${i + 1}: threshold start cannot be greater than threshold end.`
    }
    if (band.thresholdEnd <= 0) {
      if (i !== ordered.length - 1) {
        return 'Open-ended band (threshold end <= 0) must be the last band.'
      }
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
    if (prev.thresholdEnd <= 0) {
      return 'Open-ended band must be the final band.'
    }
    if (current.thresholdStart !== prev.thresholdEnd + 1) {
      return `Gap/overlap detected between band ${i} and band ${i + 1}; bands must be contiguous.`
    }
  }

  return null
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
  const [duration, setDuration] = useState(30)
  const [bands, setBands] = useState<EditableBand[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
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
      setBands(data.map(mapBandToEditable))
    } catch (e: unknown) {
      setBands([])
      setError(e instanceof Error ? e.message : 'Failed to load pricing ladder')
    } finally {
      setLoading(false)
    }
  }, [duration])

  useEffect(() => {
    load()
  }, [env, load])

  const orderedBands = useMemo(() => [...bands], [bands])
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

    const openEndedBands = orderedBands.filter((band) => band.thresholdEnd <= 0)
    if (openEndedBands.length > 1) {
      for (const band of openEndedBands) addEndError(band, 'Only one open-ended tier is allowed.')
    }

    for (let i = 0; i < orderedBands.length; i++) {
      const band = orderedBands[i]
      if (!Number.isFinite(band.thresholdStart) || band.thresholdStart < 0) {
        addStartError(band, `Tier ${i + 1}: threshold start must be zero or greater.`)
      }

      if (!Number.isFinite(band.thresholdEnd) || (band.thresholdEnd > 0 && band.thresholdStart > band.thresholdEnd)) {
        addEndError(band, `Tier ${i + 1}: threshold start cannot be greater than threshold end.`)
      }
      if (band.thresholdEnd <= 0 && i !== orderedBands.length - 1) {
        addEndError(band, 'Open-ended tier must be the last tier.')
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
      if (prev.thresholdEnd > 0 && current.thresholdStart !== prev.thresholdEnd + 1) {
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
        return [...prev, newBand]
      }

      if (lastBand.thresholdEnd > 0) {
        newBand.thresholdStart = lastBand.thresholdEnd + 1
        return [...prev, newBand]
      }

      const roundedEnd = Math.ceil(lastBand.thresholdStart / 100) * 100
      newBand.thresholdStart = roundedEnd + 1
      newBand.thresholdEnd = 0

      return prev.map((band) =>
        band === lastBand ? { ...band, thresholdEnd: roundedEnd } : band,
      ).concat(newBand)
    })
  }
  const hoverTooltipClass =
    'pointer-events-none absolute top-full z-20 mt-1 hidden w-52 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium normal-case tracking-normal text-white shadow-lg group-hover:block group-focus-within:hidden left-1/2 -translate-x-1/2'

  const removeBand = (bandToRemove: EditableBand) => {
    setBands((prev) => prev.filter((band) => band.rowId !== bandToRemove.rowId))
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

      const reordered = arrayMove(prev, oldIndex, newIndex)
      const lastIndex = reordered.length - 1
      return reordered.map((band, index) => {
        if (index < lastIndex && band.thresholdEnd <= 0) {
          return { ...band, thresholdEnd: Math.ceil(band.thresholdStart / 100) * 100 }
        }
        return band
      })
    })
  }

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
      setBands(saved.map(mapBandToEditable))
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
                onChange={(e) => setDuration(Number(e.target.value))}
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
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-600">End (∞ = open)</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-600">SMS</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-600">Email</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-600">WhatsApp</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-600">WhatsApp Utility</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-600">Action</th>
                  </tr>
                </thead>
                {bands.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-gray-500">
                        No bands configured for this duration.
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
                              type="number"
                              value={band.thresholdStart}
                              onChange={(e) => updateBand(band, { thresholdStart: Number(e.target.value) })}
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
                                type="number"
                                value={band.thresholdEnd > 0 ? band.thresholdEnd : ''}
                                onChange={(e) =>
                                  updateBand(band, {
                                    thresholdEnd: e.target.value === '' ? 0 : Number(e.target.value),
                                  })
                                }
                                onFocus={() => setFocusedField(`end-${index}`)}
                                onBlur={() => setFocusedField(null)}
                                disabled={band.thresholdEnd <= 0}
                                placeholder={band.thresholdEnd <= 0 ? '∞' : ''}
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
                            {index === bands.length - 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateBand(band, {
                                    thresholdEnd: band.thresholdEnd <= 0 ? Math.max(band.thresholdStart, 1) : 0,
                                  })
                                }
                                className={`inline-flex min-w-[2.2rem] items-center justify-center rounded-md border px-2 py-1 text-sm font-semibold transition ${
                                  band.thresholdEnd <= 0
                                    ? 'border-[var(--admin-ui-accent)]/40 bg-[var(--admin-ui-accent)]/10 text-[var(--admin-ui-accent)]'
                                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                                aria-label={band.thresholdEnd <= 0 ? 'Tier end is open' : 'Set tier end to open'}
                              >
                                ∞
                              </button>
                            )}
                          </div>
                        </td>
                        {platforms.map((platform) => (
                          <td key={platform} className="px-3 py-3">
                            <div className="flex items-center">
                              <div className="group relative flex items-center gap-2">
                                <input
                                  type="number"
                                  step="0.0001"
                                  value={band.rates[platform].amountPerMessage}
                                  onChange={(e) =>
                                    updateRate(band, platform, { amountPerMessage: Number(e.target.value) })
                                  }
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
    </div>
  )
}


