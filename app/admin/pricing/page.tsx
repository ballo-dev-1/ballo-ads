'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
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

type EditableBand = {
  thresholdStart: number
  thresholdEnd: number
  displayOrder: number
  isEnabled: boolean
  rates: Record<PricingPlatform, { amountPerMessage: number; isEnabled: boolean }>
}

const createEmptyBand = (displayOrder: number): EditableBand => ({
  thresholdStart: displayOrder === 1 ? 50 : 0,
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
        isEnabled: band.isEnabled,
        rates: platforms.map((platform): PricingLadderRateRequest => ({
          platform,
          amountPerMessage: band.rates[platform].amountPerMessage,
          isEnabled: band.rates[platform].isEnabled,
        })),
      })),
  }
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

  const addBand = () => {
    setBands((prev) => [...prev, createEmptyBand(prev.length + 1)])
  }

  const removeBand = (index: number) => {
    setBands((prev) => prev.filter((_, i) => i !== index))
  }

  const updateBand = (index: number, patch: Partial<EditableBand>) => {
    setBands((prev) =>
      prev.map((band, i) => (i === index ? { ...band, ...patch } : band)),
    )
  }

  const updateRate = (
    index: number,
    platform: PricingPlatform,
    patch: Partial<{ amountPerMessage: number; isEnabled: boolean }>,
  ) => {
    setBands((prev) =>
      prev.map((band, i) =>
        i === index
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
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <AdminHero
          eyebrow="Monetization"
          title="Pricing ladder"
          description="Manage unified pricing intervals with mandatory platform rates."
          variant="slate"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (days)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-200"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={addBand}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Add band
            </button>
            <button
              type="button"
              onClick={saveLadder}
              disabled={saving || loading}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save ladder'}
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-500">
              Loading pricing ladder...
            </div>
          ) : (
            <div className="overflow-x-auto p-4">
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">Band</th>
                    <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">Start</th>
                    <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">End (0=open)</th>
                    <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">Band enabled</th>
                    <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">SMS</th>
                    <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">WhatsApp</th>
                    <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">WhatsApp Utility</th>
                    <th className="text-right py-3 px-3 text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBands.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-gray-500">
                        No bands configured for this duration.
                      </td>
                    </tr>
                  ) : (
                    sortedBands.map((band, index) => (
                      <tr key={`${band.displayOrder}-${index}`} className="border-b border-gray-100">
                        <td className="py-3 px-3 text-sm text-gray-700">{index + 1}</td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            value={band.thresholdStart}
                            onChange={(e) => updateBand(index, { thresholdStart: Number(e.target.value) })}
                            className="w-28 border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            value={band.thresholdEnd}
                            onChange={(e) => updateBand(index, { thresholdEnd: Number(e.target.value) })}
                            className="w-28 border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={band.isEnabled}
                            onChange={(e) => updateBand(index, { isEnabled: e.target.checked })}
                            className="h-4 w-4"
                          />
                        </td>
                        {platforms.map((platform) => (
                          <td key={platform} className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="0.0001"
                                value={band.rates[platform].amountPerMessage}
                                onChange={(e) =>
                                  updateRate(index, platform, { amountPerMessage: Number(e.target.value) })
                                }
                                className="w-28 border border-gray-300 rounded px-2 py-1 text-sm"
                              />
                              <input
                                type="checkbox"
                                checked={band.rates[platform].isEnabled}
                                onChange={(e) =>
                                  updateRate(index, platform, { isEnabled: e.target.checked })
                                }
                                className="h-4 w-4"
                                title={`${platform} enabled`}
                              />
                            </div>
                          </td>
                        ))}
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeBand(index)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Remove
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


