'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { adminApi, type MtnReviewerAccountResponse } from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'

type FilterStatus = 'pending' | 'approved' | 'rejected' | 'all'

export default function MtnReviewerApprovalsPanel() {
  const { env } = useApiEnv()
  const [rows, setRows] = useState<MtnReviewerAccountResponse[]>([])
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('pending')
  const [loading, setLoading] = useState(false)

  const load = async (filter: FilterStatus) => {
    setLoading(true)
    try {
      const data = await adminApi.getMtnReviewers(filter === 'all' ? undefined : filter)
      setRows(data)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load MTN reviewers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(statusFilter)
  }, [statusFilter, env])

  const pendingCount = useMemo(
    () => rows.filter((x) => x.status === 'pending').length,
    [rows],
  )

  const updateStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await adminApi.updateMtnReviewerStatus(id, status)
      toast.success(status === 'approved' ? 'Reviewer approved' : 'Reviewer rejected')
      await load(statusFilter)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update reviewer status')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="reviewer-status-filter">
          Status
        </label>
        <select
          id="reviewer-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
          Pending: {pendingCount}
        </span>
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
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Created</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id}>
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
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => void updateStatus(row.id, 'rejected')}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">No reviewer accounts found.</p>
          ) : null}
        </div>
      )}
    </div>
  )
}
