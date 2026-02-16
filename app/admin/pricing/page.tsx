'use client'

import { useEffect, useState } from 'react'
import {
  adminApi,
  type PricingModelRequest,
  type PricingModelResponse,
} from '@/lib/adminApi'

export default function PricingPage() {
  const [models, setModels] = useState<PricingModelResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState<PricingModelRequest>({
    platform: 'Sms',
    thresholdStart: 0,
    thresholdEnd: 0,
    amountPerMessage: 0,
    duration: 30,
  })

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.getPricingModels()
      setModels(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load pricing models')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const created = await adminApi.createPricingModel(form)
      setModels((prev) => [created, ...prev])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create pricing model')
    }
  }

  const handleToggle = async (model: PricingModelResponse, enable: boolean) => {
    try {
      const updated = enable
        ? await adminApi.enablePricingModel(model.id)
        : await adminApi.disablePricingModel(model.id)
      setModels((prev) => prev.map((m) => (m.id === model.id ? updated : m)))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update pricing model')
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">Pricing Models</h1>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form
          onSubmit={handleCreate}
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-800">Create Pricing Model</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform
              </label>
              <select
                value={form.platform}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    platform: e.target.value as PricingModelRequest['platform'],
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Sms">SMS</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
                <option value="WhatsAppUtility">WhatsApp Utility</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Threshold Start
              </label>
              <input
                type="number"
                value={form.thresholdStart}
                onChange={(e) =>
                  setForm((f) => ({ ...f, thresholdStart: Number(e.target.value) }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Threshold End
              </label>
              <input
                type="number"
                value={form.thresholdEnd}
                onChange={(e) =>
                  setForm((f) => ({ ...f, thresholdEnd: Number(e.target.value) }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount / Message
              </label>
              <input
                type="number"
                step="0.0001"
                value={form.amountPerMessage}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    amountPerMessage: Number(e.target.value),
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (days)
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duration: Number(e.target.value) }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Create
          </button>
        </form>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Platform
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Range
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Amount / Msg
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Duration
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {models.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No pricing models found
                    </td>
                  </tr>
                ) : (
                  models.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-800">{m.platform}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {m.thresholdStart} - {m.thresholdEnd}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {m.amountPerMessage}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {m.duration} days
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {m.isEnabled ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            Enabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <button
                          onClick={() => handleToggle(m, !m.isEnabled)}
                          className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                        >
                          {m.isEnabled ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}


