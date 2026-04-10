'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import { adminApi, type MtnReviewerAccountResponse } from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import { useConfirmDialog } from '@/app/admin/components/useConfirmDialog'

type FilterStatus = 'pending' | 'approved' | 'rejected' | 'all'

export default function MtnReviewerApprovalsPanel() {
  const { env } = useApiEnv()
  const [rows, setRows] = useState<MtnReviewerAccountResponse[]>([])
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('pending')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { confirm, confirmDialog } = useConfirmDialog()

  const load = async () => {
    setLoading(true)
    try {
      const data = await adminApi.getMtnReviewers()
      setRows(data)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load MTN reviewers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [env])

  const counts = useMemo(() => {
    const pending = rows.filter((x) => x.status === 'pending').length
    const approved = rows.filter((x) => x.status === 'approved').length
    const rejected = rows.filter((x) => x.status === 'rejected').length
    const all = rows.length
    return { pending, approved, rejected, all }
  }, [rows])

  const filteredRows = useMemo(() => {
    if (statusFilter === 'all') return rows
    return rows.filter((x) => x.status === statusFilter)
  }, [rows, statusFilter])

  const updateStatus = async (id: number, status: 'approved' | 'rejected') => {
    setSubmitting(true)
    try {
      await adminApi.updateMtnReviewerStatus(id, status)
      toast.success(status === 'approved' ? 'Reviewer approved' : 'Reviewer rejected')
      await load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update reviewer status')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (reviewer: MtnReviewerAccountResponse) => {
    const approved = await confirm({
      title: 'Delete reviewer account',
      description: `Delete reviewer ${reviewer.email}? This action cannot be undone.`,
      confirmLabel: 'Delete',
      tone: 'danger',
    })
    if (!approved) return

    setSubmitting(true)
    try {
      await adminApi.deleteMtnReviewer(reviewer.id)
      setRows((prev) => prev.filter((item) => item.id !== reviewer.id))
      toast.success('Reviewer deleted')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete reviewer')
    } finally {
      setSubmitting(false)
    }
  }

  const filterTabs: Array<{ value: FilterStatus; label: string }> = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="admin-tab-bar" role="tablist" aria-label="Reviewer status filter">
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setStatusFilter(tab.value)}
                className={`admin-tab-bar__tab inline-flex items-center gap-2 ${
                  isActive ? 'admin-tab-bar__tab--active' : ''
                }`}
              >
                {tab.label}
                {tab.value !== 'all' ? (
                  <span
                    className={`inline-flex min-w-[1.7rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      isActive ? 'bg-[#3bb9e4]/20 text-[var(--admin-ui-accent)]' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.value === 'pending'
                      ? counts.pending
                      : tab.value === 'approved'
                        ? counts.approved
                        : counts.rejected}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-[var(--admin-ui-accent)]" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Created</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 text-slate-900">
                    {[row.firstName, row.lastName].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-900">{row.email}</td>
                  <td className="px-4 py-3 capitalize text-slate-700">{row.status}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {row.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void updateStatus(row.id, 'approved')}
                          disabled={submitting}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => void updateStatus(row.id, 'rejected')}
                          disabled={submitting}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(row)}
                          disabled={submitting}
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          aria-label="Delete reviewer"
                          title="Delete reviewer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Reviewed</span>
                        <button
                          type="button"
                          onClick={() => void handleDelete(row)}
                          disabled={submitting}
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          aria-label="Delete reviewer"
                          title="Delete reviewer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRows.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">No reviewer accounts found.</p>
          ) : null}
        </div>
      )}
      {confirmDialog}
    </div>
  )
}
