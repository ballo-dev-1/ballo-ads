'use client'

import { useCallback, useEffect, useState } from 'react'
import { adminApi, type MtnWhitelistedSenderIdResponse } from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import toast from 'react-hot-toast'
import { Pencil, Trash2 } from 'lucide-react'
import { useConfirmDialog } from '@/app/admin/components/useConfirmDialog'

export default function MtnWhitelistedSenderIdsPanel() {
  const { env } = useApiEnv()
  const [list, setList] = useState<MtnWhitelistedSenderIdResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newSenderId, setNewSenderId] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const { confirm, confirmDialog } = useConfirmDialog()

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.getMtnWhitelistedSenderIds()
      setList(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load whitelisted sender IDs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [env, load])

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const senderId = newSenderId.trim()
    if (!senderId) return

    setError('')
    setSubmitting(true)
    try {
      const created = await adminApi.addMtnWhitelistedSenderId({ senderId })
      setList((prev) => [created, ...prev])
      setNewSenderId('')
      toast.success('Sender ID added')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to add sender ID')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (row: MtnWhitelistedSenderIdResponse) => {
    setEditingId(row.id)
    setEditValue(row.senderId)
    setError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId == null) return

    const senderId = editValue.trim()
    if (!senderId) return

    setSubmitting(true)
    try {
      const updated = await adminApi.updateMtnWhitelistedSenderId(editingId, {
        senderId,
      })
      setList((prev) => prev.map((item) => (item.id === editingId ? updated : item)))
      setEditingId(null)
      setEditValue('')
      toast.success('Sender ID updated')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update sender ID')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    const approved = await confirm({
      title: 'Remove sender ID',
      description: 'Remove this whitelisted sender ID?',
      confirmLabel: 'Remove',
      tone: 'danger',
    })
    if (!approved) return

    setSubmitting(true)
    try {
      await adminApi.removeMtnWhitelistedSenderId(id)
      setList((prev) => prev.filter((item) => item.id !== id))
      if (editingId === id) cancelEdit()
      toast.success('Sender ID removed')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to remove sender ID')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form
        onSubmit={handleAdd}
        className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-800">Add Whitelisted Sender ID</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px]">
            <label htmlFor="new-sender-id" className="block text-sm font-medium text-gray-700 mb-1">
              Sender ID
            </label>
            <input
              id="new-sender-id"
              type="text"
              value={newSenderId}
              onChange={(e) => setNewSenderId(e.target.value)}
              placeholder="e.g. MyBrand"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-ui-accent)]"
              disabled={submitting}
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !newSenderId.trim()}
            className="inline-flex items-center px-4 py-2 bg-[var(--brand-color-1)] text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none"
          >
            Add
          </button>
        </div>
      </form>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[var(--admin-ui-accent)]" />
          </div>
        ) : (
          <div className="overflow-x-auto bg-transparent p-4">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase">Sender ID</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase">Created</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-12 text-center text-gray-500 text-sm">
                      No whitelisted sender IDs yet. Add one above.
                    </td>
                  </tr>
                ) : (
                  list.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="px-5 py-3">
                        {editingId === row.id ? (
                          <form onSubmit={handleSaveEdit} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-ui-accent)] w-40"
                              autoFocus
                              disabled={submitting}
                            />
                            <button
                              type="submit"
                              disabled={submitting || !editValue.trim()}
                              className="text-sm text-[var(--admin-ui-accent)] hover:underline disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button type="button" onClick={cancelEdit} className="text-sm text-gray-500 hover:underline">
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <span className="font-mono text-sm">{row.senderId}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">{formatDate(row.createdAt)}</td>
                      <td className="px-5 py-3">
                        {editingId === row.id ? null : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(row)}
                              disabled={submitting}
                              className="p-1.5 rounded text-gray-600 hover:bg-gray-200 hover:text-gray-800 disabled:opacity-50"
                              aria-label="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(row.id)}
                              disabled={submitting}
                              className="p-1.5 rounded text-red-600 hover:bg-red-50 disabled:opacity-50"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

