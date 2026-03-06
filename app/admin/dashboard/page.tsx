'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi, type PurchaseOrderResponse } from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import Link from 'next/link'

interface WaitlistStats {
  total: number
  page: number
  limit: number
  totalPages: number
}

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Failed: 'bg-red-100 text-red-700',
  Depleted: 'bg-gray-100 text-gray-600',
  Expired: 'bg-orange-100 text-orange-700',
}

export default function Dashboard() {
  const { env } = useApiEnv()
  const [waitlistStats, setWaitlistStats] = useState<WaitlistStats>({
    total: 0,
    page: 1,
    limit: 100,
    totalPages: 1,
  })
  const [recentOrders, setRecentOrders] = useState<PurchaseOrderResponse[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [waitlistRes, ordersRes] = await Promise.allSettled([
          fetch('/api/waitlist?page=1&limit=1').then((r) => r.json()),
          adminApi.getAllPurchaseOrders({ pageNumber: 1, pageSize: 10 }),
        ])

        if (waitlistRes.status === 'fulfilled' && waitlistRes.value?.pagination) {
          setWaitlistStats(waitlistRes.value.pagination)
        }

        if (ordersRes.status === 'fulfilled') {
          const orders = Array.isArray(ordersRes.value) ? ordersRes.value : []
          setRecentOrders(orders)
          setPendingCount(orders.filter((o) => o.purchaseOrderStatus === 'Pending').length)
          setActiveCount(orders.filter((o) => o.purchaseOrderStatus === 'Active').length)
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [env])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <header className="rounded-xl p-5 bg-[whitesmoke] border border-gray-200/80 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        </header>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[var(--brand-color-2)]" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Waitlist Entries</p>
                    <p className="text-3xl font-bold text-gray-900">{waitlistStats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Recent Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{recentOrders.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Active Orders</p>
                    <p className="text-3xl font-bold text-green-600">{activeCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Pending Orders</p>
                    <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/admin/waitlist')}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">View Waitlist</p>
                    <p className="text-sm text-gray-500">Manage all waitlist entries</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/admin/purchase-orders')}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Purchase Orders</p>
                    <p className="text-sm text-gray-500">View and manage all orders</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/admin/transactions')}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Transactions</p>
                    <p className="text-sm text-gray-500">View payment transactions</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Purchase Orders */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Recent Purchase Orders</h2>
                <Link
                  href="/admin/purchase-orders"
                  className="text-sm text-[var(--brand-color-2)] hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">ID</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">Company</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">SMS / Email / WhatsApp</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">Billed Account</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-500">
                          No purchase orders found.
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((po) => (
                        <tr key={po.id ?? po.createdAt} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="py-3 px-5 font-medium text-gray-900">{po.id ?? '--'}</td>
                          <td className="py-3 px-5">
                            {po.company ? (
                              <Link
                                href={`/admin/companies/${po.company.id}`}
                                className="text-[var(--brand-color-2)] hover:underline"
                              >
                                {po.company.name ?? `Company #${po.company.id}`}
                              </Link>
                            ) : (
                              '--'
                            )}
                          </td>
                          <td className="py-3 px-5 text-sm text-gray-600">
                            {po.smsCount ?? 0} / {po.emailCount ?? 0} / {po.whatsAppCount ?? 0}
                          </td>
                          <td className="py-3 px-5">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                STATUS_COLORS[po.purchaseOrderStatus ?? ''] ?? 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {po.purchaseOrderStatus ?? '--'}
                            </span>
                          </td>
                          <td className="py-3 px-5 text-sm text-gray-600">{po.billedAccount ?? '--'}</td>
                          <td className="py-3 px-5 text-sm text-gray-600">
                            {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : '--'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
