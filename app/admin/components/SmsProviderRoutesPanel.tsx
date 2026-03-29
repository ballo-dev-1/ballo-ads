'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, Trash2 } from 'lucide-react'
import { adminApi, type SmsProviderRouteRequest, type SmsProviderRouteResponse } from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import { useConfirmDialog } from '@/app/admin/components/useConfirmDialog'

type ProviderKey = 'mtn_smpp' | 'tumani'
type PredicateType = 'mtn_prefix' | 'default'

export default function SmsProviderRoutesPanel() {
  const { env } = useApiEnv()
  const { confirm, confirmDialog } = useConfirmDialog()

  const [list, setList] = useState<SmsProviderRouteResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [providerKey, setProviderKey] = useState<ProviderKey>('tumani')
  const [predicateType, setPredicateType] = useState<PredicateType>('mtn_prefix')
  const [predicateValue, setPredicateValue] = useState('26076,26096,26056')
  const [priority, setPriority] = useState(10)
  const [isActive, setIsActive] = useState(true)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editProviderKey, setEditProviderKey] = useState<ProviderKey>('mtn_smpp')
  const [editPredicateType, setEditPredicateType] = useState<PredicateType>('mtn_prefix')
  const [editPredicateValue, setEditPredicateValue] = useState('')
  const [editPriority, setEditPriority] = useState(10)
  const [editIsActive, setEditIsActive] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.getSmsProviderRoutes()
      setList(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load SMS provider routes')
      setList([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [env, load])

  const normalizePayload = (p: {
    providerKey: ProviderKey
    predicateType: PredicateType
    predicateValue: string
    priority: number
    isActive: boolean
  }): SmsProviderRouteRequest => {
    return {
      providerKey: p.providerKey,
      predicateType: p.predicateType,
      predicateValue: p.predicateType === 'mtn_prefix' ? p.predicateValue.trim() : null,
      priority: p.priority,
      isActive: p.isActive,
    }
  }

  const resetAddForm = () => {
    setProviderKey('tumani')
    setPredicateType('mtn_prefix')
    setPredicateValue('26076,26096,26056')
    setPriority(10)
    setIsActive(true)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (predicateType === 'mtn_prefix' && !predicateValue.trim()) {
      toast.error('Prefixes are required for mtn_prefix')
      return
    }

    setError('')
    try {
      const payload = normalizePayload({ providerKey, predicateType, predicateValue, priority, isActive })
      const created = await adminApi.addSmsProviderRoute(payload)
      setList((prev) => [created, ...prev].sort((a, b) => a.priority - b.priority))
      toast.success('Route added')
      resetAddForm()
    } catch (ex: unknown) {
      toast.error(ex instanceof Error ? ex.message : 'Failed to add route')
    }
  }

  const startEdit = (row: SmsProviderRouteResponse) => {
    setEditingId(row.id)
    setEditProviderKey(row.providerKey as ProviderKey)
    setEditPredicateType(row.predicateType as PredicateType)
    setEditPredicateValue(row.predicateValue ?? '')
    setEditPriority(row.priority)
    setEditIsActive(row.isActive)
    setError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId == null) return
    if (editPredicateType === 'mtn_prefix' && !editPredicateValue.trim()) {
      toast.error('Prefixes are required for mtn_prefix')
      return
    }

    try {
      const payload = normalizePayload({
        providerKey: editProviderKey,
        predicateType: editPredicateType,
        predicateValue: editPredicateValue,
        priority: editPriority,
        isActive: editIsActive,
      })
      const updated = await adminApi.updateSmsProviderRoute(editingId, payload)
      setList((prev) => prev.map((item) => (item.id === editingId ? updated : item)).sort((a, b) => a.priority - b.priority))
      toast.success('Route updated')
      cancelEdit()
    } catch (ex: unknown) {
      toast.error(ex instanceof Error ? ex.message : 'Failed to update route')
    }
  }

  const handleDelete = async (id: number) => {
    const approved = await confirm({
      title: 'Delete SMS route',
      description: 'Delete this SMS provider routing rule?',
      confirmLabel: 'Delete',
      tone: 'danger',
    })
    if (!approved) return

    try {
      await adminApi.removeSmsProviderRoute(id)
      setList((prev) => prev.filter((item) => item.id !== id))
      if (editingId === id) cancelEdit()
      toast.success('Route deleted')
    } catch (ex: unknown) {
      toast.error(ex instanceof Error ? ex.message : 'Failed to delete route')
    }
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
            <select
              value={providerKey}
              onChange={(e) => setProviderKey(e.target.value as ProviderKey)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-ui-accent)]"
            >
              <option value="tumani">Tumani</option>
              <option value="mtn_smpp">MTN SMPP</option>
            </select>
          </div>

          <div className="min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Predicate</label>
            <select
              value={predicateType}
              onChange={(e) => setPredicateType(e.target.value as PredicateType)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-ui-accent)]"
            >
              <option value="mtn_prefix">mtn_prefix</option>
              <option value="default">default</option>
            </select>
          </div>

          {predicateType === 'mtn_prefix' ? (
            <div className="min-w-[260px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">MTN Prefixes</label>
              <input
                value={predicateValue}
                onChange={(e) => setPredicateValue(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-ui-accent)]"
                placeholder="e.g. 26076,26096,26056"
              />
            </div>
          ) : (
            <div className="min-w-[260px] text-sm text-gray-600 pb-2">
              Default matches all numbers.
            </div>
          )}

          <div className="min-w-[140px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-ui-accent)]"
            />
          </div>

          <div className="min-w-[140px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 bg-[var(--brand-color-1)] text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none"
          >
            Add route
          </button>
        </div>
      </form>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mt-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[var(--admin-ui-accent)]" />
          </div>
        ) : (
          <div className="overflow-x-auto bg-transparent p-4">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase">Provider</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase">Predicate</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase">Priority</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase">Active</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-gray-500 text-sm">
                      No routes configured.
                    </td>
                  </tr>
                ) : (
                  list.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="px-5 py-3">
                        {editingId === row.id ? (
                          <select
                            value={editProviderKey}
                            onChange={(e) => setEditProviderKey(e.target.value as ProviderKey)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                          >
                            <option value="tumani">Tumani</option>
                            <option value="mtn_smpp">MTN SMPP</option>
                          </select>
                        ) : (
                          <span className="font-mono text-sm">{row.providerKey}</span>
                        )}
                      </td>

                      <td className="px-5 py-3">
                        {editingId === row.id ? (
                          <div className="space-y-2">
                            <select
                              value={editPredicateType}
                              onChange={(e) => {
                                const next = e.target.value as PredicateType
                                setEditPredicateType(next)
                                if (next === 'default') setEditPredicateValue('')
                              }}
                              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-full"
                            >
                              <option value="mtn_prefix">mtn_prefix</option>
                              <option value="default">default</option>
                            </select>
                            {editPredicateType === 'mtn_prefix' ? (
                              <input
                                value={editPredicateValue}
                                onChange={(e) => setEditPredicateValue(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-full"
                                placeholder="26076,26096,26056"
                              />
                            ) : (
                              <div className="text-sm text-gray-600">default matches all</div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm">
                            <span className="font-mono">{row.predicateType}</span>
                            {row.predicateType === 'mtn_prefix' && row.predicateValue ? (
                              <div className="text-gray-600 text-xs mt-1">{row.predicateValue}</div>
                            ) : null}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3">
                        {editingId === row.id ? (
                          <input
                            type="number"
                            value={editPriority}
                            onChange={(e) => setEditPriority(Number(e.target.value))}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-24"
                          />
                        ) : (
                          <span className="font-mono text-sm">{row.priority}</span>
                        )}
                      </td>

                      <td className="px-5 py-3">
                        {editingId === row.id ? (
                          <input
                            type="checkbox"
                            checked={editIsActive}
                            onChange={(e) => setEditIsActive(e.target.checked)}
                            className="h-4 w-4"
                          />
                        ) : (
                          <span className="text-sm">{row.isActive ? 'Yes' : 'No'}</span>
                        )}
                      </td>

                      <td className="px-5 py-3">
                        {editingId !== row.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(row)}
                              disabled={loading}
                              className="p-1.5 rounded text-gray-600 hover:bg-gray-200 hover:text-gray-800 disabled:opacity-50"
                              aria-label="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(row.id)}
                              disabled={loading}
                              className="p-1.5 rounded text-red-600 hover:bg-red-50 disabled:opacity-50"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleSaveEdit} className="flex items-center gap-2">
                            <button
                              type="submit"
                              className="text-sm text-[var(--admin-ui-accent)] hover:underline disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="text-sm text-gray-500 hover:underline"
                            >
                              Cancel
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmDialog}
    </>
  )
}

