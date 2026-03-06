'use client'

import { useCallback, useEffect, useState } from 'react'
import { adminApi, type PurchaseOrderResponse } from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import toast from 'react-hot-toast'
import Link from 'next/link'

const STATUS_OPTIONS = ['Pending', 'Active', 'Failed', 'Depleted', 'Expired'] as const

export default function PurchaseOrdersPage() {
  const { env } = useApiEnv()
  const [orders, setOrders] = useState<PurchaseOrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20
  const [modalOrder, setModalOrder] = useState<PurchaseOrderResponse | null>(null)
  const [statusValue, setStatusValue] = useState('')
  const [statusSaving, setStatusSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.getAllPurchaseOrders({
        pageNumber: page,
        pageSize,
      })
      setOrders(Array.isArray(data) ? data : [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load purchase orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [env, load])

  const openModal = (po: PurchaseOrderResponse) => {
    setModalOrder(po)
    setStatusValue(po.purchaseOrderStatus ?? 'Pending')
  }

  const closeModal = () => {
    if (!statusSaving) {
      setModalOrder(null)
      setStatusValue('')
    }
  }

  const handleUpdateStatus = async () => {
    if (!modalOrder?.id || !statusValue.trim()) return
    setStatusSaving(true)
    try {
      await adminApi.updatePurchaseOrderStatus(modalOrder.id, statusValue.trim())
      toast.success('Status updated')
      closeModal()
      load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update status')
    } finally {
      setStatusSaving(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <header className="rounded-xl p-5 bg-[whitesmoke] border border-gray-200/80 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Purchase orders</h1>
          <p className="text-sm text-gray-500 mt-1">View and update purchase order status</p>
        </header>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50/90 border border-red-200 text-red-700 px-5 py-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[var(--brand-color-2)]" />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">ID</th>
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">Company</th>
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">SMS / Email / WhatsApp</th>
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">Billed account</th>
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">Dates</th>
                    <th className="w-32 py-3 px-5 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-500">
                        No purchase orders found.
                      </td>
                    </tr>
                  ) : (
                    orders.map((po) => (
                      <tr key={po.id ?? po.createdAt} className="border-b border-gray-100">
                        <td className="py-3 px-5 text-gray-900">{po.id ?? '—'}</td>
                        <td className="py-3 px-5">
                          {po.company ? (
                            <Link
                              href={`/admin/companies/${po.company.id}`}
                              className="text-[var(--brand-color-2)] hover:underline"
                            >
                              {po.company.name ?? `Company #${po.company.id}`}
                            </Link>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3 px-5 text-sm text-gray-600">
                          {po.smsCount ?? 0} / {po.emailCount ?? 0} / {po.whatsAppCount ?? 0}
                        </td>
                        <td className="py-3 px-5">
                          <span className="text-gray-700">{po.purchaseOrderStatus ?? '—'}</span>
                        </td>
                        <td className="py-3 px-5 text-sm text-gray-600">{po.billedAccount ?? '—'}</td>
                        <td className="py-3 px-5 text-sm text-gray-600">
                          {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : '—'}
                          {po.expirationAt && (
                            <> · Expires {new Date(po.expirationAt).toLocaleDateString()}</>
                          )}
                        </td>
                        <td className="py-3 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => openModal(po)}
                            className="text-sm text-[var(--brand-color-2)] hover:underline"
                          >
                            Update status
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="text-sm text-gray-600 hover:underline disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page}</span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={orders.length < pageSize}
                className="text-sm text-gray-600 hover:underline disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Update status modal */}
        {modalOrder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="update-status-title"
          >
            <div
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="update-status-title" className="text-lg font-semibold text-gray-900 mb-1">
                Update purchase order status
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Order #{modalOrder.id}
                {modalOrder.company?.name && ` · ${modalOrder.company.name}`}
              </p>
              <div className="mb-4">
                <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status-select"
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[var(--brand-color-2)] focus:border-transparent"
                  disabled={statusSaving}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={statusSaving}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={statusSaving}
                  className="px-4 py-2 rounded-lg bg-[#0e0e39] text-white hover:opacity-90 disabled:opacity-50"
                >
                  {statusSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
