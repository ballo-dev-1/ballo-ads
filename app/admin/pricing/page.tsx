'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  adminApi,
  type EditPricingModelRequest,
  type PricingModelRequest,
  type PricingModelResponse,
} from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import { ChevronDown, ChevronUp, ChevronsUpDown, Filter } from 'lucide-react'
import AdminHero from '@/app/admin/components/AdminHero'
import { useConfirmDialog } from '@/app/admin/components/useConfirmDialog'

type SortKey = 'platform' | 'range' | 'amountPerMessage' | 'duration' | 'status' | 'createdAt'
type SortDir = 'asc' | 'desc'

const initialCreateForm: PricingModelRequest = {
  platform: 'Sms',
  thresholdStart: 0,
  thresholdEnd: 0,
  amountPerMessage: 0,
  duration: 30,
}

export default function PricingPage() {
  const { env } = useApiEnv()
  const [models, setModels] = useState<PricingModelResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState<PricingModelRequest>(initialCreateForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<EditPricingModelRequest>({})
  /** Pending enable/disable: only applied when Save is clicked. null = no change. */
  const [pendingEnable, setPendingEnable] = useState<boolean | null>(null)
  /** Latest duration from create form input (avoids stale state when user types then submits before re-render). */
  const createDurationRef = useRef<number | null>(null)
  /** Table sort and filter */
  const [sortBy, setSortBy] = useState<SortKey>('platform')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [platformFilter, setPlatformFilter] = useState<string>('')
  const [filterEnabled, setFilterEnabled] = useState<boolean>(true)
  const [filterDisabled, setFilterDisabled] = useState<boolean>(false)
  const [filtersPopoverOpen, setFiltersPopoverOpen] = useState(false)
  const filtersPopoverRef = useRef<HTMLDivElement>(null)
  const { confirm, confirmDialog } = useConfirmDialog()

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
  }, [env])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filtersPopoverRef.current && !filtersPopoverRef.current.contains(e.target as Node)) {
        setFiltersPopoverOpen(false)
      }
    }
    if (filtersPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [filtersPopoverOpen])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    try {
      const duration =
        createDurationRef.current !== null && Number.isFinite(createDurationRef.current)
          ? createDurationRef.current
          : form.duration
      const payload: PricingModelRequest = {
        ...form,
        duration,
      }
      createDurationRef.current = null
      const created = await adminApi.createPricingModel(payload)
      setModels((prev) => [created, ...prev])
      setForm(initialCreateForm)
      createDurationRef.current = null
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create pricing model'
      const isRangeExists = /range already exists/i.test(msg)
      setError(
        isRangeExists
          ? 'A pricing model with this platform, duration, and overlapping range already exists. Use a non-overlapping range or a different duration.'
          : msg
      )
    }
  }

  const startEdit = (model: PricingModelResponse) => {
    setEditingId(model.id)
    setEditForm({
      thresholdStart: model.thresholdStart,
      thresholdEnd: model.thresholdEnd,
      amountPerMessage: model.amountPerMessage,
      duration: model.duration,
    })
    setPendingEnable(null)
    setError('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
    setPendingEnable(null)
  }

  const handleDeletePricing = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const approved = await confirm({
      title: 'Delete pricing model',
      description: 'Delete this pricing model? This cannot be undone.',
      confirmLabel: 'Delete',
      tone: 'danger',
    })
    if (!approved) return
    setError('')
    try {
      await adminApi.deletePricingModel(id)
      setModels((prev) => prev.filter((m) => m.id !== id))
      if (editingId === id) {
        setEditingId(null)
        setEditForm({})
        setPendingEnable(null)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete pricing model')
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId == null) return
    const currentModel = models.find((m) => m.id === editingId)
    if (!currentModel) return
    setError('')
    try {
      const updated = await adminApi.updatePricingModel(editingId, editForm)

      let finalModel = updated
      const wantsStatusChange = pendingEnable !== null && pendingEnable !== updated.isEnabled

      if (wantsStatusChange) {
        const approved = await confirm({
          title: pendingEnable ? 'Enable pricing model' : 'Disable pricing model',
          description: `${pendingEnable ? 'Enable' : 'Disable'} this pricing model?`,
          confirmLabel: pendingEnable ? 'Enable' : 'Disable',
          tone: pendingEnable ? 'default' : 'danger',
        })

        if (approved) {
          try {
            finalModel = pendingEnable
              ? await adminApi.enablePricingModel(editingId)
              : await adminApi.disablePricingModel(editingId)
          } catch (toggleError: unknown) {
            setModels((prev) => prev.map((m) => (m.id === editingId ? updated : m)))
            setEditForm({
              thresholdStart: updated.thresholdStart,
              thresholdEnd: updated.thresholdEnd,
              amountPerMessage: updated.amountPerMessage,
              duration: updated.duration,
            })
            setPendingEnable(null)
            const toggleMessage =
              toggleError instanceof Error ? toggleError.message : 'Failed to change pricing status'
            setError(
              `Pricing fields were saved, but status change failed: ${toggleMessage}. You can retry the status toggle.`
            )
            return
          }
        }
      }

      setModels((prev) => prev.map((m) => (m.id === editingId ? finalModel : m)))
      setEditingId(null)
      setEditForm({})
      setPendingEnable(null)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to update pricing model'
      const isOverlap = /overlap|range/i.test(msg)
      setError(
        isOverlap
          ? 'Update failed due to an overlapping pricing range for this platform and duration. Adjust threshold start/end and try again.'
          : msg
      )
    }
  }

  const uniquePlatforms = useMemo(() => {
    const set = new Set(models.map((m) => m.platform))
    return Array.from(set).sort()
  }, [models])

  const filteredAndSortedModels = useMemo(() => {
    let list = models.filter((m) => {
      if (platformFilter && m.platform !== platformFilter) return false
      const noStatusFilter = !filterEnabled && !filterDisabled
      if (noStatusFilter) return true
      if (filterEnabled && m.isEnabled) return true
      if (filterDisabled && !m.isEnabled) return true
      return false
    })
    list = [...list].sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'platform':
          cmp = a.platform.localeCompare(b.platform)
          break
        case 'range':
          cmp = a.thresholdStart !== b.thresholdStart ? a.thresholdStart - b.thresholdStart : a.thresholdEnd - b.thresholdEnd
          break
        case 'amountPerMessage':
          cmp = a.amountPerMessage - b.amountPerMessage
          break
        case 'duration':
          cmp = a.duration - b.duration
          break
        case 'status':
          cmp = (a.isEnabled ? 1 : 0) - (b.isEnabled ? 1 : 0)
          break
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [models, platformFilter, filterEnabled, filterDisabled, sortBy, sortDir])

  const handleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortBy(key)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortBy !== column) return <ChevronsUpDown className="w-4 h-4 inline-block ml-1 opacity-50" aria-hidden />
    return sortDir === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline-block ml-1" aria-hidden />
    ) : (
      <ChevronDown className="w-4 h-4 inline-block ml-1" aria-hidden />
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <AdminHero
          eyebrow="Monetization"
          title="Pricing models"
          description="Configure message pricing thresholds, durations, and status."
          variant="slate"
        />
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
                name="create-duration"
                type="number"
                value={form.duration}
                onChange={(e) => {
                  const n = Number(e.target.value)
                  createDurationRef.current = Number.isFinite(n) ? n : null
                  setForm((f) => ({ ...f, duration: n }))
                }}
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
            <>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-4 px-5 py-4 border-b border-gray-200 bg-gray-50">
                <div className="relative" ref={filtersPopoverRef}>
                  <button
                    type="button"
                    onClick={() => setFiltersPopoverOpen((o) => !o)}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-2)] ${
                      filtersPopoverOpen
                        ? 'bg-[var(--brand-color-2)]/10 text-[var(--brand-color-2)]'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-label="Filters"
                    aria-expanded={filtersPopoverOpen}
                    aria-haspopup="true"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                    {(platformFilter || !filterEnabled || !filterDisabled) && (
                      <span className="flex h-2 w-2 rounded-full bg-[var(--brand-color-2)]" aria-hidden />
                    )}
                  </button>
                  {filtersPopoverOpen && (
                    <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border border-gray-200 bg-white py-3 px-4 shadow-lg">
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="filter-platform" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Platform
                          </label>
                          <select
                            id="filter-platform"
                            value={platformFilter}
                            onChange={(e) => setPlatformFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-2)]"
                          >
                            <option value="">All</option>
                            {uniquePlatforms.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <span className="block text-sm font-medium text-gray-700 mb-2">Status</span>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filterEnabled}
                                onChange={(e) => setFilterEnabled(e.target.checked)}
                                className="rounded border-gray-300 text-[var(--brand-color-2)] focus:ring-[var(--brand-color-2)]"
                              />
                              <span className="text-sm text-gray-700">Enabled</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filterDisabled}
                                onChange={(e) => setFilterDisabled(e.target.checked)}
                                className="rounded border-gray-300 text-[var(--brand-color-2)] focus:ring-[var(--brand-color-2)]"
                              />
                              <span className="text-sm text-gray-700">Disabled</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="h-8 w-px bg-gray-200 shrink-0" aria-hidden />
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Sort</span>
                  <label htmlFor="sort-by" className="sr-only">Sort by</label>
                  <select
                    id="sort-by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortKey)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-2)]"
                  >
                    <option value="platform">Platform</option>
                    <option value="range">Range</option>
                    <option value="amountPerMessage">Amount / Msg</option>
                    <option value="duration">Duration</option>
                    <option value="status">Status</option>
                    <option value="createdAt">Creation date</option>
                  </select>
                  <select
                    aria-label="Sort direction"
                    value={sortDir}
                    onChange={(e) => setSortDir(e.target.value as SortDir)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-2)]"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
                <span className="text-sm text-gray-500 ml-auto shrink-0">
                  Showing {filteredAndSortedModels.length} of {models.length}
                </span>
              </div>
              <div className="overflow-x-auto bg-transparent p-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      <button
                        type="button"
                        onClick={() => handleSort('platform')}
                        className="inline-flex items-center hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-2)] rounded"
                      >
                        Platform
                        <SortIcon column="platform" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      <button
                        type="button"
                        onClick={() => handleSort('range')}
                        className="inline-flex items-center hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-2)] rounded"
                      >
                        Range
                        <SortIcon column="range" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      <button
                        type="button"
                        onClick={() => handleSort('amountPerMessage')}
                        className="inline-flex items-center hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-2)] rounded"
                      >
                        Amount / Msg
                        <SortIcon column="amountPerMessage" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      <button
                        type="button"
                        onClick={() => handleSort('duration')}
                        className="inline-flex items-center hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-2)] rounded"
                      >
                        Duration
                        <SortIcon column="duration" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      <button
                        type="button"
                        onClick={() => handleSort('status')}
                        className="inline-flex items-center hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-2)] rounded"
                      >
                        Status
                        <SortIcon column="status" />
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedModels.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          {models.length === 0 ? 'No pricing models found' : 'No models match the current filters'}
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedModels.map((m) => (
                        <tr
                          key={m.id}
                          onClick={() => startEdit(m)}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
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
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => handleDeletePricing(m.id, e)}
                              className="text-sm text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {editingId != null && (() => {
        const editingModel = models.find((m) => m.id === editingId)
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={handleCancelEdit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-pricing-title"
          >
            <div
              className="w-full max-w-lg rounded-xl bg-white shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 id="edit-pricing-title" className="text-lg font-semibold text-gray-800">
                  Edit Pricing Model
                </h2>
              </div>
              <form
                onSubmit={handleSaveEdit}
                className="p-6 space-y-4"
              >
                <div className='grid grid-cols-2 gap-4 font-semibold text-gray-700 mb-7'>
                  <div>
                    Platform (read-only)
                  </div>
                  <div>
                    {editingModel?.platform ?? '—'}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Threshold Start
                    </label>
                    <input
                      type="number"
                      value={editForm.thresholdStart ?? ''}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          thresholdStart: e.target.value === '' ? undefined : Number(e.target.value),
                        }))
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
                      value={editForm.thresholdEnd ?? ''}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          thresholdEnd: e.target.value === '' ? undefined : Number(e.target.value),
                        }))
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
                      value={editForm.amountPerMessage ?? ''}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          amountPerMessage: e.target.value === '' ? undefined : Number(e.target.value),
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
                      value={editForm.duration ?? ''}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          duration: e.target.value === '' ? undefined : Number(e.target.value),
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                {editingModel && (() => {
                  const effectiveEnabled = pendingEnable !== null ? pendingEnable : editingModel.isEnabled
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                      <label className="block text-sm font-medium text-gray-700 my-1 pl-1">
                        Enabled
                      </label>
                      <div className="flex items-center pl-1">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={effectiveEnabled}
                          aria-label="Status"
                          onClick={() => setPendingEnable(!effectiveEnabled)}
                          className={`relative inline-flex h-6 w-14 shrink-0 cursor-pointer rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-2)] focus:ring-offset-2 ${
                            effectiveEnabled ? 'bg-emerald-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                              effectiveEnabled ? 'translate-x-8' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  )
                })()}
                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      })()}
      {confirmDialog}
    </div>
  )
}


