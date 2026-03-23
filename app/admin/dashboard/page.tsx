'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  adminApi,
  type DashboardAnalyticsCampaignPerformanceResponse,
} from '@/lib/adminApi'

interface WaitlistStats {
  total: number
  page: number
  limit: number
  totalPages: number
}

function getRecipientStatusBadge(status: string): {
  label: string
  className: string
} {
  switch (status) {
    case 'Sent':
      return { label: 'Sent', className: 'bg-green-50 border-green-200 text-green-700' }
    case 'Failed':
      return { label: 'Failed', className: 'bg-red-50 border-red-200 text-red-700' }
    case 'Claimed':
      return { label: 'Claimed', className: 'bg-indigo-50 border-indigo-200 text-indigo-700' }
    case 'Pending':
      return { label: 'Pending', className: 'bg-yellow-50 border-yellow-200 text-yellow-700' }
    case 'RetryableFailed':
      return { label: 'Retryable Failed', className: 'bg-orange-50 border-orange-200 text-orange-700' }
    case 'NetworkPendingSenderId':
      return {
        label: 'Pending Sender ID',
        className: 'bg-gray-50 border-gray-200 text-gray-700',
      }
    default:
      return { label: status, className: 'bg-gray-50 border-gray-200 text-gray-700' }
  }
}

export default function Dashboard() {
  const [stats, setStats] = useState<WaitlistStats>({
    total: 0,
    page: 1,
    limit: 100,
    totalPages: 1,
  })
  const [campaignPerformance, setCampaignPerformance] =
    useState<DashboardAnalyticsCampaignPerformanceResponse | null>(null)
  const [campaignError, setCampaignError] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/waitlist?page=1&limit=1')
        const data = await response.json()

        if (response.ok) {
          setStats(data.pagination)
        }

        const perf = await adminApi.getDashboardAnalyticsCampaignPerformance()
        setCampaignPerformance(perf)
      } catch (err) {
        console.error('Error fetching stats:', err)
        setCampaignError(err instanceof Error ? err.message : 'Failed to load campaign performance')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const groupedCampaignRecipients = useMemo(() => {
    if (!campaignPerformance) return []

    const map = new Map<
      number,
      {
        campaignId: number
        campaignName: string
        campaignChannel: string
        recipients: DashboardAnalyticsCampaignPerformanceResponse['campaignRecipientDetails']
      }
    >()

    for (const detail of campaignPerformance.campaignRecipientDetails) {
      const existing = map.get(detail.campaignId)
      if (!existing) {
        map.set(detail.campaignId, {
          campaignId: detail.campaignId,
          campaignName: detail.campaignName,
          campaignChannel: detail.campaignChannel,
          recipients: [detail],
        })
      } else {
        existing.recipients.push(detail)
      }
    }

    return Array.from(map.values())
  }, [campaignPerformance])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className=" border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="relative">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Waitlist Entries</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
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
                    <p className="text-sm font-medium text-gray-600 mb-1">Recent Activity</p>
                    <p className="text-3xl font-bold text-gray-900">-</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Pending Actions</p>
                    <p className="text-3xl font-bold text-gray-900">-</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

               
              </div>
            </div>

            {/* Campaign Recipient Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Campaign Recipient Status
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Recipients and their normalized message status
                  </p>
                </div>

                {campaignPerformance ? (
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">
                      Dispatched
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {campaignPerformance.dispatchedRecipients}/{campaignPerformance.totalRecipients}
                    </p>
                  </div>
                ) : null}
              </div>

              {campaignError ? (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {campaignError}
                </div>
              ) : null}

              {campaignPerformance ? (
                <div className="mt-5 space-y-4">
                  {groupedCampaignRecipients.length === 0 ? (
                    <div className="text-sm text-gray-500">No campaigns found.</div>
                  ) : (
                    groupedCampaignRecipients.map((group) => (
                      <details key={group.campaignId} className="rounded-lg border border-gray-200">
                        <summary className="cursor-pointer px-4 py-3 bg-gray-50 rounded-t-lg flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {group.campaignName}
                            </div>
                            <div className="text-xs text-gray-500">
                              Channel: {group.campaignChannel}
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-gray-700">
                            {group.recipients.length} recipients
                          </div>
                        </summary>

                        <div className="p-4">
                          <div className="overflow-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="text-left py-2 pr-3 text-sm font-semibold text-gray-700">
                                    Recipient
                                  </th>
                                  <th className="text-left py-2 pr-3 text-sm font-semibold text-gray-700">
                                    Channel
                                  </th>
                                  <th className="text-left py-2 pr-3 text-sm font-semibold text-gray-700">
                                    Dispatched
                                  </th>
                                  <th className="text-left py-2 pr-3 text-sm font-semibold text-gray-700">
                                    Status
                                  </th>
                                  <th className="text-left py-2 text-sm font-semibold text-gray-700">
                                    Details
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {group.recipients
                                  .slice()
                                  .sort((a, b) => a.recipient.id - b.recipient.id)
                                  .map((detail) => {
                                    const badge = getRecipientStatusBadge(detail.recipient.status)
                                    return (
                                      <tr key={detail.recipient.id} className="border-b border-gray-100">
                                        <td className="py-2 pr-3 align-top">
                                          <div className="text-sm font-medium text-gray-900">
                                            {detail.recipient.name
                                              ? `${detail.recipient.name} (${detail.recipient.account})`
                                              : detail.recipient.account}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            Attempt {detail.recipient.attemptCount}
                                          </div>
                                        </td>
                                        <td className="py-2 pr-3 align-top text-sm text-gray-700">
                                          {detail.recipient.channel}
                                        </td>
                                        <td className="py-2 pr-3 align-top text-sm text-gray-700">
                                          {detail.recipient.messageDispatched ? 'Yes' : 'No'}
                                        </td>
                                        <td className="py-2 pr-3 align-top">
                                          <span
                                            className={`inline-flex items-center px-2 py-1 rounded-lg border text-xs font-medium ${badge.className}`}
                                          >
                                            {badge.label}
                                          </span>
                                        </td>
                                        <td className="py-2 align-top text-sm text-gray-700">
                                          {detail.recipient.lastErrorCode ? (
                                            <div>
                                              <div className="font-medium text-red-700">
                                                {detail.recipient.lastErrorCode}
                                              </div>
                                              <div className="text-xs text-gray-500">
                                                {detail.recipient.lastErrorMessage ?? '—'}
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="text-xs text-gray-500">—</div>
                                          )}
                                        </td>
                                      </tr>
                                    )
                                  })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </details>
                    ))
                  )}
                </div>
              ) : (
                <div className="mt-5 text-sm text-gray-500">Loading...</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

