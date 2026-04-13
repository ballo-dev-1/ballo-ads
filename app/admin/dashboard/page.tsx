'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useRef, Suspense } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
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
import { dashboardStatsWarningMessage } from './fetchStatus'
import { getAdminBasePath } from '@/lib/adminNamespace'
import { normalizeDashboardTab, type DashboardTab } from './tabState'

const BiDashboardTabContent = dynamic(() => import('./BiDashboardTabContent'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-[var(--brand-color-3)]" />
    </div>
  ),
})

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

function DashboardOpsMetricsSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-[148px] rounded-[20px] animate-pulse bg-[color-mix(in_srgb,var(--admin-heading)_12%,transparent)] admin-dark:bg-white/10"
        />
      ))}
    </div>
  )
}

function DashboardAnalyticsKpiSkeleton() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[100px] rounded-[20px] animate-pulse bg-gray-200/80 admin-dark:bg-white/10" />
      ))}
    </div>
  )
}

function DashboardTrendsBlockSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2 h-80 animate-pulse rounded-xl bg-gray-200/60 admin-dark:bg-white/10" />
      <div className="space-y-4">
        <div className="h-36 animate-pulse rounded-xl bg-gray-200/60 admin-dark:bg-white/10" />
        <div className="h-36 animate-pulse rounded-xl bg-gray-200/60 admin-dark:bg-white/10" />
      </div>
    </div>
  )
}

function Dashboard() {
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
  const [dashboardWarning, setDashboardWarning] = useState('')
  const [dashboardFailureDetails, setDashboardFailureDetails] = useState<
    Array<{ key: string; status?: number; message: string }>
  >([])
  const [opsReady, setOpsReady] = useState(false)
  const [analyticsReady, setAnalyticsReady] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const hasLoadedOnceRef = useRef(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const basePath = getAdminBasePath(pathname)
  const [activeTab, setActiveTab] = useState<DashboardTab>('operations')

  useEffect(() => {
    setActiveTab(normalizeDashboardTab(searchParams?.get('tab')))
  }, [searchParams])

  useEffect(() => {
    hasLoadedOnceRef.current = false
  }, [env])

  useEffect(() => {
    let cancelled = false
    const settle = async <T,>(p: Promise<T>): Promise<PromiseSettledResult<T>> => {
      try {
        const value = await p
        return { status: 'fulfilled', value }
      } catch (reason) {
        return { status: 'rejected', reason }
      }
    }

    const fetchAll = async () => {
      const isRefresh = hasLoadedOnceRef.current
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setOpsReady(false)
        setAnalyticsReady(false)
      }
      setDashboardWarning('')
      setDashboardFailureDetails([])
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
        const previousParams = isLifetime
          ? analyticsParams
          : {
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
        if (cancelled) return

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

        setOpsReady(true)

        const comparisonRes = await settle(
          adminApi.getDashboardAnalyticsOverviewComparison({
            from: analyticsParams.from,
            to: analyticsParams.to,
            previousFrom: previousParams.from,
            previousTo: previousParams.to,
            channel: analyticsParams.channel,
          }),
        )

        const [trendsRes, funnelRes, moderationRes] = await Promise.allSettled([
          adminApi.getDashboardAnalyticsTrends({ ...analyticsParams, bucket: 'day' }),
          adminApi.getDashboardAnalyticsFunnel(analyticsParams),
          adminApi.getDashboardAnalyticsModeration(analyticsParams),
        ])
        if (cancelled) return

        if (comparisonRes.status === 'fulfilled') {
          setOverviewCurrent(comparisonRes.value.current)
          setOverviewPrevious(comparisonRes.value.previous)
        } else {
          setOverviewCurrent(null)
          setOverviewPrevious(null)
        }

        setTrends(trendsRes.status === 'fulfilled' ? trendsRes.value : null)
        setFunnel(funnelRes.status === 'fulfilled' ? funnelRes.value : null)
        setModeration(moderationRes.status === 'fulfilled' ? moderationRes.value : null)

        const failureFor = (key: string, reason: unknown): { key: string; status?: number; message: string } => {
          const r = reason as { message?: unknown; status?: unknown } | null | undefined
          const status = typeof r?.status === 'number' ? r.status : undefined
          const message = typeof r?.message === 'string' ? r.message : 'Request failed'
          return { key, status, message }
        }

        const failures = [
          waitlistRes.status === 'rejected'
            ? failureFor('queue volume (waitlist)', waitlistRes.reason)
            : null,
          ordersRes.status === 'rejected'
            ? failureFor('order intake (purchase orders)', ordersRes.reason)
            : null,
          alertsRes.status === 'rejected'
            ? failureFor('reliability alerts (apm alerts)', alertsRes.reason)
            : null,
          dispatchRes.status === 'rejected'
            ? failureFor('dispatch controls', dispatchRes.reason)
            : null,
          comparisonRes.status === 'rejected'
            ? failureFor('analytics/overview (comparison)', comparisonRes.reason)
            : null,
          trendsRes.status === 'rejected' ? failureFor('analytics/trends', trendsRes.reason) : null,
          funnelRes.status === 'rejected' ? failureFor('analytics/funnel', funnelRes.reason) : null,
          moderationRes.status === 'rejected' ? failureFor('analytics/moderation', moderationRes.reason) : null,
        ].filter((x): x is { key: string; status?: number; message: string } => x !== null)

        setDashboardFailureDetails(failures)
        if (failures.length > 0) {
          failures.forEach((f) => console.warn(`[dashboard] ${f.key} failed`, f))
        }

        setDashboardWarning(
          dashboardStatsWarningMessage([
            waitlistRes,
            ordersRes,
            alertsRes,
            dispatchRes,
            comparisonRes,
            trendsRes,
            funnelRes,
            moderationRes,
          ]),
        )
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setDashboardWarning('Unable to load dashboard stats right now.')
        const r = err as { message?: unknown; status?: unknown } | null | undefined
        const status = typeof r?.status === 'number' ? r.status : undefined
        const message = typeof r?.message === 'string' ? r.message : 'Request failed'
        setDashboardFailureDetails([{ key: 'dashboard', status, message }])
      } finally {
        if (!cancelled) {
          setAnalyticsReady(true)
          setRefreshing(false)
          hasLoadedOnceRef.current = true
        }
      }
    }

    void fetchAll()
    return () => {
      cancelled = true
    }
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
      className: 'bg-[var(--admin-ui-accent)]',
    },
  ]
  const tallestIncidentBar = Math.max(...incidentBars.map((bar) => bar.value), 1)
  const kpiCards = buildDashboardKpiCards(overviewCurrent, overviewPrevious)
  const trendTotals = summarizeTrendTotals(trends?.points ?? [])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-auto">
        <div className="space-y-6">
            {refreshing ? (
              <div className="rounded-lg border border-sky-200/90 bg-sky-50/90 px-4 py-2 text-sm text-sky-900 admin-dark:border-sky-500/40 admin-dark:bg-sky-950/40 admin-dark:text-sky-100">
                Updating dashboard…
              </div>
            ) : null}
            {dashboardWarning ? (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-yellow-800 shadow-sm">
                {dashboardWarning}
                {dashboardFailureDetails.length > 0 ? (
                  <div className="mt-2 text-xs leading-relaxed text-yellow-900/90">
                    <div className="font-semibold">Failures</div>
                    <div className="mt-1">
                      {dashboardFailureDetails.map((f) => (
                        <div key={f.key}>
                          {f.key}
                          {typeof f.status === 'number' ? ` (status ${f.status})` : null}: {f.message}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="admin-tab-bar" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'operations'}
                onClick={() => setActiveTab('operations')}
                className={`admin-tab-bar__tab ${activeTab === 'operations' ? 'admin-tab-bar__tab--active' : ''}`}
              >
                Operations Stats
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'bi'}
                onClick={() => setActiveTab('bi')}
                className={`admin-tab-bar__tab ${activeTab === 'bi' ? 'admin-tab-bar__tab--active' : ''}`}
              >
                BI Stats
              </button>
            </div>

            {activeTab === 'operations' ? (
              <>
            <section className="admin-liquid-card relative overflow-hidden px-6 py-7 md:px-8 md:py-8">
              <div className="pointer-events-none absolute -right-8 -top-24 h-56 w-56 rounded-full bg-[var(--brand-color-3)]/16 blur-3xl admin-dark:bg-[var(--brand-color-2)]/14" />
              <div className="relative">
                <h1 className="text-lg font-semibold text-[var(--admin-heading)] admin-dark:text-white sm:text-xl">Operations overview</h1>
                <p className="mt-1 text-sm text-[var(--admin-muted)] admin-dark:text-slate-400">Order flow, queue activity, and reliability at a glance.</p>
                {!opsReady ? (
                  <DashboardOpsMetricsSkeleton />
                ) : (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="admin-dashboard-metric-card relative overflow-hidden rounded-[20px] bg-[linear-gradient(145deg,var(--brand-color-2)_0%,color-mix(in_srgb,var(--brand-color-3)_40%,var(--brand-color-1)_60%)_55%,var(--brand-color-1)_100%)] p-4 text-white shadow-lg shadow-black/20">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/85">Queue volume</p>
                    <p className="mt-2 text-3xl font-bold tabular-nums">{formatCompact(waitlistStats.total)}</p>
                    <p className="mt-1 text-sm text-white/80">Waitlist entries</p>
                    <svg className="mt-3 h-8 w-full opacity-40" viewBox="0 0 120 32" preserveAspectRatio="none" aria-hidden>
                      <path d="M0 24 L20 8 L40 20 L60 4 L80 18 L100 10 L120 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="admin-dashboard-metric-card relative overflow-hidden rounded-[20px] bg-[linear-gradient(145deg,var(--brand-color-3)_0%,var(--brand-color-2)_55%,var(--brand-color-1)_100%)] p-4 text-white shadow-lg shadow-black/20">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/85">Order intake</p>
                    <p className="mt-2 text-3xl font-bold tabular-nums">{formatCompact(totalOrders)}</p>
                    <p className="mt-1 text-sm text-white/80">Recent purchase orders</p>
                    <svg className="mt-3 h-8 w-full opacity-40" viewBox="0 0 120 32" preserveAspectRatio="none" aria-hidden>
                      <path d="M0 20 L24 12 L48 22 L72 6 L96 16 L120 8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="admin-dashboard-metric-card relative overflow-hidden rounded-[20px] bg-[linear-gradient(155deg,color-mix(in_srgb,var(--brand-color-2)_90%,var(--brand-color-3)_10%)_0%,var(--brand-color-1)_100%)] p-4 text-white shadow-lg shadow-black/25">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/90">Activation</p>
                    <p className="mt-2 text-3xl font-bold tabular-nums">{formatCompact(activeCount)}</p>
                    <p className="mt-1 text-sm text-white/85">{orderActivationRate}% of recent orders</p>
                    <svg className="mt-3 h-8 w-full opacity-40" viewBox="0 0 120 32" preserveAspectRatio="none" aria-hidden>
                      <path d="M0 28 L30 14 L55 22 L80 8 L105 18 L120 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="admin-dashboard-metric-card relative overflow-hidden rounded-[20px] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--brand-color-3)_65%,var(--brand-color-1)_35%)_0%,var(--brand-color-1)_100%)] p-4 text-white shadow-lg shadow-black/25">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/90">Pending review</p>
                    <p className="mt-2 text-3xl font-bold tabular-nums">{formatCompact(pendingCount)}</p>
                    <p className="mt-1 text-sm text-white/85">{pendingRate}% awaiting action</p>
                    <svg className="mt-3 h-8 w-full opacity-40" viewBox="0 0 120 32" preserveAspectRatio="none" aria-hidden>
                      <path d="M0 10 L25 22 L50 8 L75 20 L100 6 L120 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="admin-dashboard-metric-card relative overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,var(--brand-color-2)_0%,var(--brand-color-1)_100%)] p-4 text-white shadow-lg shadow-black/20 sm:col-span-2 lg:col-span-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/85">Reliability</p>
                    <p className="mt-2 text-3xl font-bold tabular-nums">{formatCompact(reliabilitySummary.activeAlertsCount)}</p>
                    <p className="mt-1 text-sm text-white/80">Open alerts</p>
                    <svg className="mt-3 h-8 w-full opacity-40" viewBox="0 0 120 32" preserveAspectRatio="none" aria-hidden>
                      <path d="M0 16 L22 24 L44 8 L66 20 L88 6 L110 14 L120 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
                )}
              </div>
            </section>

            <section
              className={`admin-liquid-card p-5 md:p-6 ${refreshing && analyticsReady ? 'opacity-80 transition-opacity' : ''}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--admin-heading)] admin-dark:text-white">Executive analytics</h2>
                  <p className="text-sm text-[var(--admin-muted)] admin-dark:text-slate-400">Period deltas for campaign, growth, and revenue indicators.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={rangePreset}
                    onChange={(event) => setRangePreset(event.target.value as RangePreset)}
                    className="admin-liquid-transition rounded-full border-0 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] admin-dark:bg-[#1e2135] admin-dark:text-slate-200"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="40d">Last 40 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                  <select
                    value={channelFilter}
                    onChange={(event) => setChannelFilter(event.target.value as 'All' | 'Sms' | 'Email' | 'WhatsApp' | 'WhatsAppUtility')}
                    className="admin-liquid-transition rounded-full border-0 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] admin-dark:bg-[#1e2135] admin-dark:text-slate-200"
                  >
                    <option value="All">All channels</option>
                    <option value="Sms">SMS</option>
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="WhatsAppUtility">WhatsApp Utility</option>
                  </select>
                </div>
              </div>

              {!analyticsReady ? (
                <DashboardAnalyticsKpiSkeleton />
              ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
                {kpiCards.map((card, i) => {
                  const isPositive = card.delta >= 0
                  const deltaClass = isPositive ? 'text-emerald-100' : 'text-rose-100'
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

                  const gradients = [
                    'bg-[linear-gradient(145deg,var(--brand-color-2)_0%,var(--brand-color-1)_100%)]',
                    'bg-[linear-gradient(145deg,var(--brand-color-3)_0%,var(--brand-color-1)_100%)]',
                    'bg-[linear-gradient(160deg,color-mix(in_srgb,var(--brand-color-3)_50%,var(--brand-color-1)_50%)_0%,var(--brand-color-1)_100%)]',
                    'bg-[linear-gradient(145deg,var(--brand-color-2)_0%,color-mix(in_srgb,var(--brand-color-3)_35%,var(--brand-color-1)_65%)_100%)]',
                    'bg-[linear-gradient(145deg,#047857_0%,#064e3b_100%)]',
                    'bg-[linear-gradient(145deg,#b45309_0%,#7c2d12_100%)]',
                  ] as const
                  const g = gradients[i % gradients.length]

                  return (
                    <div
                      key={card.key}
                      className={`admin-dashboard-metric-card rounded-[20px] p-4 text-white shadow-lg ${g} shadow-black/10`}
                    >
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/85">{card.label}</p>
                      <p className="mt-2 text-2xl font-bold tabular-nums">{valueText}</p>
                      <p className={`mt-1 text-sm font-semibold ${deltaClass}`}>
                        {isPositive ? '+' : '-'}
                        {deltaText} vs prev.
                      </p>
                    </div>
                  )
                })}
              </div>
              )}
              <p className="mt-3 text-xs text-gray-500 admin-dark:text-slate-500">
                Applied filters:{" "}
                {overviewCurrent?.appliedFilters?.from
                  ? `${new Date(overviewCurrent.appliedFilters.from).toLocaleDateString()} - ${new Date(
                      overviewCurrent.appliedFilters.to,
                    ).toLocaleDateString()}`
                  : "all time"}
                {" • "}
                Channel: {overviewCurrent?.appliedFilters?.channel ?? "All"}
              </p>
            </section>

            {!analyticsReady ? (
              <div className="admin-liquid-card p-6">
                <h2 className="text-lg font-semibold text-[var(--admin-heading)] admin-dark:text-white">Trend snapshot</h2>
                <p className="mt-1 text-sm text-[var(--admin-muted)] admin-dark:text-slate-400">Loading period aggregates…</p>
                <div className="mt-4">
                  <DashboardTrendsBlockSkeleton />
                </div>
              </div>
            ) : (
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 admin-liquid-card p-6">
                <h2 className="text-lg font-semibold text-[var(--admin-heading)] admin-dark:text-white">Trend snapshot</h2>
                <p className="mt-1 text-sm text-[var(--admin-muted)] admin-dark:text-slate-400">Aggregated totals for selected period.</p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <div className="rounded-xl bg-[color:var(--admin-bg-canvas)] p-3 admin-dark:bg-white/5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-muted)] admin-dark:text-slate-400">Campaigns</p>
                    <p className="mt-1 text-base font-semibold text-[var(--admin-heading)] admin-dark:text-white">{trendTotals.campaigns}</p>
                  </div>
                  <div className="rounded-xl bg-[color:var(--admin-bg-canvas)] p-3 admin-dark:bg-white/5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-muted)] admin-dark:text-slate-400">Approved</p>
                    <p className="mt-1 text-base font-semibold text-[var(--admin-heading)] admin-dark:text-white">{trendTotals.approvedCampaigns}</p>
                  </div>
                  <div className="rounded-xl bg-[color:var(--admin-bg-canvas)] p-3 admin-dark:bg-white/5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-muted)] admin-dark:text-slate-400">Active</p>
                    <p className="mt-1 text-base font-semibold text-[var(--admin-heading)] admin-dark:text-white">{trendTotals.activeCampaigns}</p>
                  </div>
                  <div className="rounded-xl bg-[color:var(--admin-bg-canvas)] p-3 admin-dark:bg-white/5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-muted)] admin-dark:text-slate-400">Orders</p>
                    <p className="mt-1 text-base font-semibold text-[var(--admin-heading)] admin-dark:text-white">{trendTotals.purchaseOrders}</p>
                  </div>
                  <div className="rounded-xl bg-[color:var(--admin-bg-canvas)] p-3 admin-dark:bg-white/5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-muted)] admin-dark:text-slate-400">Transactions</p>
                    <p className="mt-1 text-base font-semibold text-[var(--admin-heading)] admin-dark:text-white">{trendTotals.transactions}</p>
                  </div>
                </div>
                <div className="mt-5 overflow-x-auto rounded-xl border border-[color:var(--admin-card-border)] bg-[color:var(--admin-bg-canvas)] p-4 admin-dark:border-white/10 admin-dark:bg-white/[0.04]">
                  <table className="admin-table-plain w-full min-w-[560px]">
                    <thead className="bg-transparent">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs uppercase tracking-wide text-gray-500">Bucket</th>
                        <th className="px-4 py-2 text-left text-xs uppercase text-gray-500">Campaigns</th>
                        <th className="px-4 py-2 text-left text-xs uppercase text-gray-500">Approved</th>
                        <th className="px-4 py-2 text-left text-xs uppercase text-gray-500">Orders</th>
                        <th className="px-4 py-2 text-left text-xs uppercase text-gray-500">Transactions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(trends?.points ?? []).slice(-7).map((point) => (
                        <tr key={point.bucketStart}>
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
                <div className="admin-liquid-card p-5">
                  <h3 className="text-lg font-semibold text-gray-900">Campaign Funnel</h3>
                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                    <p className="flex items-center justify-between"><span>Created</span><strong>{funnel?.created ?? 0}</strong></p>
                    <p className="flex items-center justify-between"><span>Approved</span><strong>{funnel?.approved ?? 0}</strong></p>
                    <p className="flex items-center justify-between"><span>Activated</span><strong>{funnel?.activated ?? 0}</strong></p>
                    <p className="flex items-center justify-between"><span>Completed</span><strong>{funnel?.completed ?? 0}</strong></p>
                  </div>
                  <p className="mt-3 text-sm font-medium text-[var(--admin-ui-accent)]">
                    Completion rate: {(funnel?.completionRate ?? 0).toFixed(2)}%
                  </p>
                </div>
                <div className="admin-liquid-card p-5">
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
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="admin-liquid-card p-6">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--admin-heading)]">Order Health</h2>
                    <p className="mt-1 text-sm text-[var(--admin-muted)]">Activation ratio in the latest order set.</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div
                    className="grid h-32 w-32 place-items-center rounded-full"
                    style={{
                      background: `conic-gradient(var(--admin-ui-accent) ${orderActivationRate}%, color-mix(in srgb, var(--admin-ui-accent) 14%, var(--admin-card)) ${orderActivationRate}% 100%)`,
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

              <div className="admin-liquid-card p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-[var(--admin-heading)]">Incident Updates</h2>
                  <p className="mt-1 text-sm text-[var(--admin-muted)]">Current reliability signal by severity.</p>
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

              <div className="admin-liquid-card p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-[var(--admin-heading)]">Reliability Pulse</h2>
                  <p className="mt-1 text-sm text-[var(--admin-muted)]">Latest incident and control state.</p>
                </div>
                <div className="rounded-2xl bg-[linear-gradient(145deg,color-mix(in_srgb,var(--brand-color-5)_40%,#ffffff)_0%,var(--admin-card)_100%)] p-4">
                  <svg viewBox="0 0 320 120" className="h-24 w-full">
                    <path d="M5 83 C40 18, 80 110, 120 58 C155 16, 190 96, 225 44 C250 14, 286 72, 315 30" fill="none" stroke="color-mix(in srgb, var(--admin-ui-accent) 16%, var(--admin-card-border))" strokeWidth="10" strokeLinecap="round" />
                    <path d="M5 83 C40 18, 80 110, 120 58 C155 16, 190 96, 225 44 C250 14, 286 72, 315 30" fill="none" stroke="var(--admin-ui-accent)" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-white/90 p-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Latest severity</p>
                      <p className={`mt-1 text-lg font-semibold capitalize ${latestSeverityClass}`}>{reliabilitySummary.latestIncidentSeverity}</p>
                    </div>
                    <div className="rounded-xl bg-white/90 p-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Paused channels</p>
                      <p className="mt-1 text-lg font-semibold text-[var(--admin-ui-accent)]">{reliabilitySummary.pausedChannelsCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 admin-liquid-card p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-[var(--admin-heading)]">Quick Actions</h2>
                  <p className="text-sm text-[var(--admin-muted)]">Fast routes for daily admin workflows</p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <button
                    onClick={() => router.push(`${basePath}/waitlist`)}
                    className="group admin-liquid-transition rounded-2xl border border-[color:var(--admin-card-border)] bg-white p-4 text-left shadow-sm hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <p className="font-semibold text-[var(--admin-heading)]">View Waitlist</p>
                    <p className="mt-1 text-sm text-[var(--admin-muted)]">Manage all waitlist entries</p>
                    <p className="mt-3 text-xs font-medium text-[var(--admin-ui-accent)] group-hover:underline">Open module</p>
                  </button>
                  <button
                    onClick={() => router.push(`${basePath}/purchase-orders`)}
                    className="group admin-liquid-transition rounded-2xl border border-[color:var(--admin-card-border)] bg-white p-4 text-left shadow-sm hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <p className="font-semibold text-[var(--admin-heading)]">Purchase Orders</p>
                    <p className="mt-1 text-sm text-[var(--admin-muted)]">View and manage all orders</p>
                    <p className="mt-3 text-xs font-medium text-[var(--admin-ui-accent)] group-hover:underline">Open module</p>
                  </button>
                  <button
                    onClick={() => router.push(`${basePath}/transactions`)}
                    className="group admin-liquid-transition rounded-[var(--radius-liquid)] border-0 bg-[color:var(--admin-bg-canvas)]/80 p-4 text-left shadow-[0_12px_32px_-16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-14px_rgba(16,185,129,0.2)]"
                  >
                    <p className="font-semibold text-gray-900">Transactions</p>
                    <p className="mt-1 text-sm text-gray-500">View payment transactions</p>
                    <p className="mt-3 text-xs font-medium text-emerald-600 group-hover:underline">Open module</p>
                  </button>
                </div>
                <div className="mt-5 rounded-[var(--radius-liquid)] bg-[var(--brand-color-3)]/10 px-4 py-3">
                  <Link href={apmRoute} className="inline-flex items-center gap-2 text-sm font-medium text-[var(--admin-ui-accent)] hover:underline">
                    Open reliability incident response dashboard
                  </Link>
                </div>
              </div>

              <div className="admin-liquid-card p-6">
                <h2 className="text-lg font-semibold text-[var(--admin-heading)]">Channel Health</h2>
                <p className="mt-1 text-sm text-[var(--admin-muted)]">Dispatch control status by channel.</p>
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
            <div className="admin-liquid-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-[color:var(--admin-card-border)] px-6 py-4">
                <h2 className="text-lg font-semibold text-[var(--admin-heading)]">Recent Purchase Orders</h2>
                <Link
                  href={`${basePath}/purchase-orders`}
                  className="text-[0.8125rem] font-medium text-[var(--admin-ui-accent)] hover:opacity-90 hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="overflow-x-auto bg-transparent p-4">
                <table className="admin-liquid-table w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-transparent">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">ID</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">Company</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">SMS / Email / WhatsApp</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">Status</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">Billed Account</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">Created</th>
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
                        <tr key={po.id ?? po.createdAt}>
                          <td className="py-3 px-5 font-medium text-gray-900">{po.id ?? '--'}</td>
                          <td className="py-3 px-5">
                            {po.company ? (
                              <Link
                                href={`${basePath}/companies/${po.company.id}`}
                                className="font-medium text-[var(--admin-ui-accent)] hover:opacity-90 hover:underline"
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
              </>
            ) : (
              <BiDashboardTabContent />
            )}
        </div>
      </div>
    </div>
  )
}

function DashboardSuspenseFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-[var(--brand-color-3)]" />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSuspenseFallback />}>
      <Dashboard />
    </Suspense>
  )
}
