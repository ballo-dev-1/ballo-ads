'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
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
  thresholdStart: number
  thresholdEnd: number
  displayOrder: number
  isEnabled: boolean
  rates: Record<PricingPlatform, { amountPerMessage: number; isEnabled: boolean }>
}

const createEmptyBand = (displayOrder: number): EditableBand => ({
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
  const editable = createEmptyBand(band.displayOrder)
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

  const ordered = [...bands].sort((a, b) => a.thresholdStart - b.thresholdStart)

  let openEndedCount = 0
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
      openEndedCount++
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

  if (openEndedCount !== 1) {
    return 'Exactly one open-ended band (threshold end <= 0) is required.'
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

export default function PricingPage() {
  const { env } = useApiEnv()
  const [duration, setDuration] = useState(30)
  const [bands, setBands] = useState<EditableBand[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

  const sortedBands = useMemo(
    () => [...bands].sort((a, b) => a.thresholdStart - b.thresholdStart),
    [bands],
  )
  const validationError = useMemo(() => validateBands(duration, bands), [duration, bands])
  const fieldValidation = useMemo(() => {
    const validDurations: number[] = durationOptions.map((option) => option.value)
    const durationInvalid = !validDurations.includes(duration)
    const startInvalid = new Set<EditableBand>()
    const endInvalid = new Set<EditableBand>()
    const rateInvalid = new Map<EditableBand, Set<PricingPlatform>>()

    const openEndedBands = sortedBands.filter((band) => band.thresholdEnd <= 0)
    if (openEndedBands.length === 0 && sortedBands.length > 0) {
      endInvalid.add(sortedBands[sortedBands.length - 1])
    } else if (openEndedBands.length > 1) {
      for (const band of openEndedBands) endInvalid.add(band)
    }

    for (let i = 0; i < sortedBands.length; i++) {
      const band = sortedBands[i]
      if (!Number.isFinite(band.thresholdStart) || band.thresholdStart < 0) {
        startInvalid.add(band)
      }

      if (!Number.isFinite(band.thresholdEnd) || (band.thresholdEnd > 0 && band.thresholdStart > band.thresholdEnd)) {
        endInvalid.add(band)
      }
      if (band.thresholdEnd <= 0 && i !== sortedBands.length - 1) {
        endInvalid.add(band)
      }

      for (const platform of platforms) {
        const amount = band.rates[platform]?.amountPerMessage
        if (!Number.isFinite(amount) || amount <= 0) {
          const invalidPlatforms = rateInvalid.get(band) ?? new Set<PricingPlatform>()
          invalidPlatforms.add(platform)
          rateInvalid.set(band, invalidPlatforms)
        }
      }
    }

    for (let i = 1; i < sortedBands.length; i++) {
      const prev = sortedBands[i - 1]
      const current = sortedBands[i]
      if (prev.thresholdEnd > 0 && current.thresholdStart !== prev.thresholdEnd + 1) {
        endInvalid.add(prev)
        startInvalid.add(current)
      }
    }

    return { durationInvalid, startInvalid, endInvalid, rateInvalid }
  }, [duration, sortedBands])

  const addBand = () => {
    setBands((prev) => [...prev, createEmptyBand(prev.length + 1)])
  }

  const removeBand = (bandToRemove: EditableBand) => {
    setBands((prev) => prev.filter((band) => band !== bandToRemove))
  }

  const updateBand = (bandToUpdate: EditableBand, patch: Partial<EditableBand>) => {
    setBands((prev) =>
      prev.map((band) => (band === bandToUpdate ? { ...band, ...patch } : band)),
    )
  }

  const updateRate = (
    bandToUpdate: EditableBand,
    platform: PricingPlatform,
    patch: Partial<{ amountPerMessage: number; isEnabled: boolean }>,
  ) => {
    setBands((prev) =>
      prev.map((band) =>
        band === bandToUpdate
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
            <div className="flex items-center justify-center h-48 text-gray-500">
              Loading pricing ladder...
            </div>
          ) : (
            <div className="overflow-x-auto p-4">
              <table className="w-full min-w-[1200px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
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
                <tbody>
                  {sortedBands.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        No bands configured for this duration.
                      </td>
                    </tr>
                  ) : (
                    sortedBands.map((band, index) => (
                      <tr key={`${band.displayOrder}-${index}-${band.thresholdStart}-${band.thresholdEnd}`} className="border-b border-gray-100 transition-colors hover:bg-gray-50/70">
                        <td className="px-3 py-3 text-sm font-medium text-gray-700">{index + 1}</td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            value={band.thresholdStart}
                            onChange={(e) => updateBand(band, { thresholdStart: Number(e.target.value) })}
                            className={`w-28 rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 ${
                              fieldValidation.startInvalid.has(band)
                                ? 'border-red-400 ring-red-200 focus:ring-red-300'
                                : 'border-gray-300 ring-[var(--admin-ui-accent)]/30'
                            }`}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={band.thresholdEnd > 0 ? band.thresholdEnd : ''}
                              onChange={(e) =>
                                updateBand(band, {
                                  thresholdEnd: e.target.value === '' ? 0 : Number(e.target.value),
                                })
                              }
                              disabled={band.thresholdEnd <= 0}
                              placeholder={band.thresholdEnd <= 0 ? '∞' : ''}
                              className={`w-28 rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                                fieldValidation.endInvalid.has(band)
                                  ? 'border-red-400 ring-red-200 focus:ring-red-300'
                                  : 'border-gray-300 ring-[var(--admin-ui-accent)]/30'
                              }`}
                            />
                            {index === sortedBands.length - 1 && (
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
                                title={band.thresholdEnd <= 0 ? 'Open ended (infinity)' : 'Set as open ended'}
                              >
                                ∞
                              </button>
                            )}
                          </div>
                        </td>
                        {platforms.map((platform) => (
                          <td key={platform} className="px-3 py-3">
                            <div className="flex items-center">
                              <input
                                type="number"
                                step="0.0001"
                                value={band.rates[platform].amountPerMessage}
                                onChange={(e) =>
                                  updateRate(band, platform, { amountPerMessage: Number(e.target.value) })
                                }
                                className={`w-28 rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 ${
                                  fieldValidation.rateInvalid.get(band)?.has(platform)
                                    ? 'border-red-400 ring-red-200 focus:ring-red-300'
                                    : 'border-gray-300 ring-[var(--admin-ui-accent)]/30'
                                }`}
                              />
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


