'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  adminApi,
  type ApmAlertsResponse,
  type DashboardAnalyticsFunnelResponse,
  type DashboardAnalyticsModerationResponse,
  type DashboardAnalyticsOverviewResponse,
  type DashboardAnalyticsTrendsResponse,
  type DispatchControlResponse,
  type PurchaseOrderResponse,
} from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import Link from 'next/link'
import {
  buildDashboardReliabilitySummary,
  dashboardApmRouteForPathname,
} from './reliabilitySummary'
import { buildDashboardKpiCards, summarizeTrendTotals } from './analyticsViewModel'

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

const SEVERITY_ACCENT: Record<string, string> = {
  critical: 'text-rose-600',
  high: 'text-orange-600',
  medium: 'text-amber-600',
  warning: 'text-yellow-600',
  ok: 'text-emerald-600',
}

function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

function toIsoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

type RangePreset = '7d' | '40d' | '90d' | 'lifetime'

export default function Dashboard() {
  const { env } = useApiEnv()
  const [rangePreset, setRangePreset] = useState<RangePreset>('lifetime')
  const [channelFilter, setChannelFilter] = useState<'All' | 'Sms' | 'Email' | 'WhatsApp' | 'WhatsAppUtility'>('All')
  const [waitlistStats, setWaitlistStats] = useState<WaitlistStats>({
    total: 0,
    page: 1,
    limit: 100,
    totalPages: 1,
  })
  const [recentOrders, setRecentOrders] = useState<PurchaseOrderResponse[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [alerts, setAlerts] = useState<ApmAlertsResponse | null>(null)
  const [dispatchControls, setDispatchControls] = useState<DispatchControlResponse | null>(null)
  const [overviewCurrent, setOverviewCurrent] = useState<DashboardAnalyticsOverviewResponse | null>(null)
  const [overviewPrevious, setOverviewPrevious] = useState<DashboardAnalyticsOverviewResponse | null>(null)
  const [trends, setTrends] = useState<DashboardAnalyticsTrendsResponse | null>(null)
  const [funnel, setFunnel] = useState<DashboardAnalyticsFunnelResponse | null>(null)
  const [moderation, setModeration] = useState<DashboardAnalyticsModerationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const basePath = pathname?.startsWith('/dev-admin') ? '/dev-admin' : '/admin'

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const isLifetime = rangePreset === 'lifetime'
        const rangeDays = rangePreset === '7d' ? 7 : rangePreset === '40d' ? 40 : 90
        const currentTo = new Date().toISOString()
        const currentFrom = isLifetime ? new Date(0).toISOString() : toIsoDaysAgo(rangeDays)
        const previousTo = currentFrom
        const previousFrom = isLifetime ? currentFrom : toIsoDaysAgo(rangeDays * 2)
        const analyticsParams = {
          from: currentFrom,
          to: currentTo,
          channel: channelFilter === 'All' ? undefined : channelFilter,
        }
        const previousParams = isLifetime ? analyticsParams : {
          from: previousFrom,
          to: previousTo,
          channel: channelFilter === 'All' ? undefined : channelFilter,
        }

        const [waitlistRes, ordersRes, alertsRes, dispatchRes] = await Promise.allSettled([
          fetch('/api/waitlist?page=1&limit=1').then((r) => r.json()),
          adminApi.getAllPurchaseOrders({ pageNumber: 1, pageSize: 10 }),
          adminApi.getApmAlerts(),
          adminApi.getDispatchControls(),
        ])
        const [overviewCurrentRes, overviewPreviousRes, trendsRes, funnelRes, moderationRes] = await Promise.allSettled([
          adminApi.getDashboardAnalyticsOverview(analyticsParams),
          adminApi.getDashboardAnalyticsOverview(previousParams),
          adminApi.getDashboardAnalyticsTrends({ ...analyticsParams, bucket: 'day' }),
          adminApi.getDashboardAnalyticsFunnel(analyticsParams),
          adminApi.getDashboardAnalyticsModeration(analyticsParams),
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

        if (alertsRes.status === 'fulfilled') {
          setAlerts(alertsRes.value)
        } else {
          setAlerts(null)
        }

        if (dispatchRes.status === 'fulfilled') {
          setDispatchControls(dispatchRes.value)
        } else {
          setDispatchControls(null)
        }

        setOverviewCurrent(overviewCurrentRes.status === 'fulfilled' ? overviewCurrentRes.value : null)
        setOverviewPrevious(overviewPreviousRes.status === 'fulfilled' ? overviewPreviousRes.value : null)
        setTrends(trendsRes.status === 'fulfilled' ? trendsRes.value : null)
        setFunnel(funnelRes.status === 'fulfilled' ? funnelRes.value : null)
        setModeration(moderationRes.status === 'fulfilled' ? moderationRes.value : null)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [env, rangePreset, channelFilter])

  const reliabilitySummary = buildDashboardReliabilitySummary(alerts, dispatchControls)
  const apmRoute = dashboardApmRouteForPathname(pathname ?? '/admin/dashboard')
  const totalOrders = recentOrders.length
  const orderActivationRate = totalOrders > 0 ? Math.round((activeCount / totalOrders) * 100) : 0
  const pendingRate = totalOrders > 0 ? Math.round((pendingCount / totalOrders) * 100) : 0
  const pausedChannels = dispatchControls?.channels.filter((channel) => channel.isPaused) ?? []
  const activeChannels = dispatchControls?.channels.filter((channel) => !channel.isPaused) ?? []
  const latestSeverityClass = SEVERITY_ACCENT[reliabilitySummary.latestIncidentSeverity] ?? 'text-gray-700'
  const incidentBars = [
    { label: 'Critical', value: alerts?.counters.critical ?? 0, className: 'bg-rose-500' },
    { label: 'High', value: alerts?.counters.high ?? 0, className: 'bg-orange-500' },
    { label: 'Medium', value: alerts?.counters.medium ?? 0, className: 'bg-amber-500' },
    {
      label: 'Paused',
      value: reliabilitySummary.pausedChannelsCount,
      className: 'bg-violet-500',
    },
  ]
  const tallestIncidentBar = Math.max(...incidentBars.map((bar) => bar.value), 1)
  const kpiCards = buildDashboardKpiCards(overviewCurrent, overviewPrevious)
  const trendTotals = summarizeTrendTotals(trends?.points ?? [])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[var(--brand-color-2)]" />
          </div>
        ) : (
          <div className="space-y-6">
            <section className="relative overflow-hidden rounded-[28px] border border-[#d8e0ff] bg-[linear-gradient(135deg,#edf2ff_0%,#e8f0ff_45%,#eff5ff_100%)] px-6 py-7 shadow-[0_20px_45px_rgba(65,96,197,0.12)] md:px-8 md:py-8">
              <div className="pointer-events-none absolute -top-24 right-[12%] h-48 w-48 rounded-full bg-[radial-gradient(circle,_rgba(102,133,255,0.32)_0%,_rgba(102,133,255,0)_70%)]" />
              <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(113,226,255,0.24)_0%,_rgba(113,226,255,0)_72%)]" />
              <div className="relative">
                <h1 className="text-3xl font-semibold text-gray-900 md:text-4xl">Operations Distribution</h1>
                <p className="mt-1 text-sm text-gray-600 md:text-base">Live overview of order flow, queue activity, and reliability posture.</p>
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="rounded-2xl border border-white/70 bg-white/80 p-4 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Queue volume</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{formatCompact(waitlistStats.total)}</p>
                    <p className="mt-1 text-sm text-gray-600">Waitlist Entries</p>
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-white/80 p-4 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Order intake</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{formatCompact(totalOrders)}</p>
                    <p className="mt-1 text-sm text-gray-600">Recent Purchase Orders</p>
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-white/80 p-4 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Activation</p>
                    <p className="mt-2 text-3xl font-bold text-emerald-700">{formatCompact(activeCount)}</p>
                    <p className="mt-1 text-sm text-gray-600">{orderActivationRate}% of recent orders</p>
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-white/80 p-4 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Pending review</p>
                    <p className="mt-2 text-3xl font-bold text-amber-700">{formatCompact(pendingCount)}</p>
                    <p className="mt-1 text-sm text-gray-600">{pendingRate}% awaiting action</p>
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-white/80 p-4 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Reliability</p>
                    <p className="mt-2 text-3xl font-bold text-violet-700">{formatCompact(reliabilitySummary.activeAlertsCount)}</p>
                    <p className="mt-1 text-sm text-gray-600">Open alerts</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Executive Analytics</h2>
                  <p className="text-sm text-gray-500">Period deltas for campaign, growth, and revenue indicators.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={rangePreset}
                    onChange={(event) => setRangePreset(event.target.value as RangePreset)}
                    className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="40d">Last 40 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                  <select
                    value={channelFilter}
                    onChange={(event) => setChannelFilter(event.target.value as 'All' | 'Sms' | 'Email' | 'WhatsApp' | 'WhatsAppUtility')}
                    className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
                  >
                    <option value="All">All channels</option>
                    <option value="Sms">SMS</option>
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="WhatsAppUtility">WhatsApp Utility</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {kpiCards.map((card) => {
                  const isPositive = card.delta >= 0
                  const deltaClass = isPositive ? 'text-emerald-700' : 'text-rose-700'
                  const valueText =
                    card.unit === 'currency'
                      ? `ZMW ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(card.value)}`
                      : card.unit === 'percent'
                        ? `${card.value.toFixed(2)}%`
                        : formatCompact(card.value)
                  const deltaText =
                    card.unit === 'currency'
                      ? `ZMW ${Math.abs(card.delta).toFixed(2)}`
                      : card.unit === 'percent'
                        ? `${Math.abs(card.delta).toFixed(2)}pp`
                        : Math.abs(card.delta).toString()

                  return (
                    <div key={card.key} className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{card.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-gray-900">{valueText}</p>
                      <p className={`mt-1 text-sm font-medium ${deltaClass}`}>
                        {isPositive ? '+' : '-'}
                        {deltaText} vs previous period
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">Trend Snapshot</h2>
                <p className="mt-1 text-sm text-gray-500">Aggregated totals for selected period.</p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs uppercase text-gray-500">Campaigns</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{trendTotals.campaigns}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs uppercase text-gray-500">Approved</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{trendTotals.approvedCampaigns}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs uppercase text-gray-500">Active</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{trendTotals.activeCampaigns}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs uppercase text-gray-500">Orders</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{trendTotals.purchaseOrders}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs uppercase text-gray-500">Transactions</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{trendTotals.transactions}</p>
                  </div>
                </div>
                <div className="mt-5 overflow-x-auto rounded-2xl border border-gray-100 bg-transparent p-4">
                  <table className="w-full min-w-[560px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs uppercase text-gray-500">Bucket</th>
                        <th className="px-4 py-2 text-left text-xs uppercase text-gray-500">Campaigns</th>
                        <th className="px-4 py-2 text-left text-xs uppercase text-gray-500">Approved</th>
                        <th className="px-4 py-2 text-left text-xs uppercase text-gray-500">Orders</th>
                        <th className="px-4 py-2 text-left text-xs uppercase text-gray-500">Transactions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(trends?.points ?? []).slice(-7).map((point) => (
                        <tr key={point.bucketStart} className="border-t border-gray-100">
                          <td className="px-4 py-2 text-sm text-gray-700">{new Date(point.bucketStart).toLocaleDateString()}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{point.campaigns}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{point.approvedCampaigns}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{point.purchaseOrders}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{point.transactions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900">Campaign Funnel</h3>
                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                    <p className="flex items-center justify-between"><span>Created</span><strong>{funnel?.created ?? 0}</strong></p>
                    <p className="flex items-center justify-between"><span>Approved</span><strong>{funnel?.approved ?? 0}</strong></p>
                    <p className="flex items-center justify-between"><span>Activated</span><strong>{funnel?.activated ?? 0}</strong></p>
                    <p className="flex items-center justify-between"><span>Completed</span><strong>{funnel?.completed ?? 0}</strong></p>
                  </div>
                  <p className="mt-3 text-sm font-medium text-indigo-700">
                    Completion rate: {(funnel?.completionRate ?? 0).toFixed(2)}%
                  </p>
                </div>
                <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900">Moderation Velocity</h3>
                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                    <p className="flex items-center justify-between"><span>Pending approvals</span><strong>{moderation?.pendingApprovals ?? 0}</strong></p>
                    <p className="flex items-center justify-between"><span>Approved</span><strong>{moderation?.approvedCount ?? 0}</strong></p>
                    <p className="flex items-center justify-between"><span>Rejected</span><strong>{moderation?.rejectedCount ?? 0}</strong></p>
                  </div>
                  <p className="mt-3 text-sm font-medium text-emerald-700">
                    Approval rate: {(moderation?.approvalRate ?? 0).toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-600">
                    Median review time: {(moderation?.medianReviewHours ?? 0).toFixed(2)}h
                  </p>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Order Health</h2>
                    <p className="mt-1 text-sm text-gray-500">Activation ratio in the latest order set.</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div
                    className="grid h-32 w-32 place-items-center rounded-full"
                    style={{
                      background: `conic-gradient(#4f46e5 ${orderActivationRate}%, #dbe4ff ${orderActivationRate}% 100%)`,
                    }}
                  >
                    <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center shadow-inner">
                      <p className="text-2xl font-bold text-gray-900">{orderActivationRate}%</p>
                      <p className="text-[11px] text-gray-500">active</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <p className="flex items-center justify-between gap-10 rounded-xl bg-gray-50 px-3 py-2 text-gray-700">
                      <span>Active orders</span>
                      <strong className="text-emerald-700">{activeCount}</strong>
                    </p>
                    <p className="flex items-center justify-between gap-10 rounded-xl bg-gray-50 px-3 py-2 text-gray-700">
                      <span>Pending orders</span>
                      <strong className="text-amber-700">{pendingCount}</strong>
                    </p>
                    <p className="flex items-center justify-between gap-10 rounded-xl bg-gray-50 px-3 py-2 text-gray-700">
                      <span>Recent orders</span>
                      <strong className="text-gray-900">{totalOrders}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-2xl font-semibold text-gray-900">Incident Updates</h2>
                  <p className="mt-1 text-sm text-gray-500">Current reliability signal by severity.</p>
                </div>
                <div className="flex h-36 items-end gap-3">
                  {incidentBars.map((bar) => {
                    const heightPercent = Math.max(10, Math.round((bar.value / tallestIncidentBar) * 100))
                    return (
                      <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
                        <div className="flex h-full w-full items-end rounded-xl bg-gray-100 p-1">
                          <div className={`w-full rounded-lg ${bar.className}`} style={{ height: `${heightPercent}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-500">{bar.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold text-gray-900">Reliability Pulse</h2>
                  <p className="mt-1 text-sm text-gray-500">Latest incident and control state.</p>
                </div>
                <div className="rounded-2xl bg-[linear-gradient(145deg,#f6f8ff_0%,#fdfdff_100%)] p-4">
                  <svg viewBox="0 0 320 120" className="h-24 w-full">
                    <path d="M5 83 C40 18, 80 110, 120 58 C155 16, 190 96, 225 44 C250 14, 286 72, 315 30" fill="none" stroke="#c8d6ff" strokeWidth="10" strokeLinecap="round" />
                    <path d="M5 83 C40 18, 80 110, 120 58 C155 16, 190 96, 225 44 C250 14, 286 72, 315 30" fill="none" stroke="#5b63e9" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-white/90 p-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Latest severity</p>
                      <p className={`mt-1 text-lg font-semibold capitalize ${latestSeverityClass}`}>{reliabilitySummary.latestIncidentSeverity}</p>
                    </div>
                    <div className="rounded-xl bg-white/90 p-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Paused channels</p>
                      <p className="mt-1 text-lg font-semibold text-violet-700">{reliabilitySummary.pausedChannelsCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
                  <p className="text-sm text-gray-500">Fast routes for daily admin workflows</p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <button
                    onClick={() => router.push(`${basePath}/waitlist`)}
                    className="group rounded-2xl border border-gray-200 bg-gray-50/60 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <p className="font-semibold text-gray-900">View Waitlist</p>
                    <p className="mt-1 text-sm text-gray-500">Manage all waitlist entries</p>
                    <p className="mt-3 text-xs font-medium text-blue-600 group-hover:underline">Open module</p>
                  </button>
                  <button
                    onClick={() => router.push(`${basePath}/purchase-orders`)}
                    className="group rounded-2xl border border-gray-200 bg-gray-50/60 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50/40"
                  >
                    <p className="font-semibold text-gray-900">Purchase Orders</p>
                    <p className="mt-1 text-sm text-gray-500">View and manage all orders</p>
                    <p className="mt-3 text-xs font-medium text-indigo-600 group-hover:underline">Open module</p>
                  </button>
                  <button
                    onClick={() => router.push(`${basePath}/transactions`)}
                    className="group rounded-2xl border border-gray-200 bg-gray-50/60 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/40"
                  >
                    <p className="font-semibold text-gray-900">Transactions</p>
                    <p className="mt-1 text-sm text-gray-500">View payment transactions</p>
                    <p className="mt-3 text-xs font-medium text-emerald-600 group-hover:underline">Open module</p>
                  </button>
                </div>
                <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3">
                  <Link href={apmRoute} className="inline-flex items-center gap-2 text-sm font-medium text-violet-700 hover:underline">
                    Open reliability incident response dashboard
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">Channel Health</h2>
                <p className="mt-1 text-sm text-gray-500">Dispatch control status by channel.</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 px-3 py-2 text-sm">
                    <span className="text-emerald-800">Active channels</span>
                    <strong className="text-emerald-700">{activeChannels.length}</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-amber-50/70 px-3 py-2 text-sm">
                    <span className="text-amber-800">Paused channels</span>
                    <strong className="text-amber-700">{pausedChannels.length}</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-sm">
                    <span className="text-slate-700">Global state</span>
                    <strong className={dispatchControls?.isGloballyPaused ? 'text-rose-600' : 'text-emerald-600'}>
                      {dispatchControls?.isGloballyPaused ? 'Paused' : 'Operational'}
                    </strong>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(dispatchControls?.channels ?? []).slice(0, 6).map((channel) => (
                    <span
                      key={channel.channel}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        channel.isPaused ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {channel.channel}
                    </span>
                  ))}
                  {dispatchControls && dispatchControls.channels.length === 0 ? (
                    <span className="text-sm text-gray-500">No channel controls configured.</span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Recent Purchase Orders */}
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-800">Recent Purchase Orders</h2>
                <Link
                  href={`${basePath}/purchase-orders`}
                  className="text-sm text-[var(--brand-color-2)] hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="overflow-x-auto bg-transparent p-4">
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
                                href={`${basePath}/companies/${po.company.id}`}
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
