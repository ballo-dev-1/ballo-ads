'use client'

import { type ReactNode, useEffect, useMemo, useState } from 'react'
import {
  BadgeCheck,
  CheckCircle2,
  Megaphone,
  ShieldCheck,
  SignalHigh,
} from 'lucide-react'
import {
  adminApi,
  type AdsCampaignResponse,
  type CompanyLeanResponse,
  type CompanyReviewStatus,
  type DashboardAnalyticsFunnelResponse,
  type DashboardAnalyticsModerationResponse,
  type DashboardAnalyticsOverviewResponse,
  type DashboardAnalyticsTrendsResponse,
} from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import { buildDashboardKpiCards, summarizeTrendTotals } from '@/app/admin/dashboard/analyticsViewModel'

export type CompanyOverviewSnapshot = {
  isActive: boolean
  reviewStatus: CompanyReviewStatus
  reviewReason?: string | null
  senderStatusLabel: string
  senderIdHint: string
  campaignsTotal: number
  activeCampaignsCount: number
  approvedRate: string
  approvedCampaignsCount: number
}

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string
  value: ReactNode
  hint?: string
  icon: ReactNode
}) {
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
      <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
        {icon}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-800">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </article>
  )
}

function buildOverviewSnapshotFromData(
  company: CompanyLeanResponse,
  campaigns: AdsCampaignResponse[],
): CompanyOverviewSnapshot {
  const reviewStatus: CompanyReviewStatus =
    company.reviewStatus ?? (company.isCompanyVerified ? 'Approved' : 'Pending')
  const approvedCampaignsCount = campaigns.filter((c) => c.isApproved).length
  const activeCampaignsCount = campaigns.filter((c) => c.status.toLowerCase().includes('active')).length
  let senderStatusLabel = 'Pending'
  if (!company.senderId) {
    senderStatusLabel = 'No sender ID'
  } else if (company.isApprovedSenderId) {
    senderStatusLabel = 'Approved'
  }
  const approvedRate =
    campaigns.length === 0 ? '0%' : `${Math.round((approvedCampaignsCount / campaigns.length) * 100)}%`
  return {
    isActive: company.isActive,
    reviewStatus,
    reviewReason: company.reviewReason,
    senderStatusLabel,
    senderIdHint: company.senderId ? company.senderId : 'Not configured',
    campaignsTotal: campaigns.length,
    activeCampaignsCount,
    approvedRate,
    approvedCampaignsCount,
  }
}

type RangePreset = '7d' | '40d' | '90d' | 'lifetime'
type ChannelFilter = 'All' | 'Sms' | 'Email' | 'WhatsApp' | 'WhatsAppUtility'

function toIsoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export default function CompanyAnalyticsPanel({
  companyId,
  overviewSnapshot: overviewSnapshotProp,
}: {
  companyId: number
  overviewSnapshot?: CompanyOverviewSnapshot | null
}) {
  const { env } = useApiEnv()
  const [fetchedOverviewSnapshot, setFetchedOverviewSnapshot] = useState<CompanyOverviewSnapshot | null>(null)
  const [overviewSnapshotLoading, setOverviewSnapshotLoading] = useState(false)
  const [rangePreset, setRangePreset] = useState<RangePreset>('lifetime')
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('All')
  const [overviewCurrent, setOverviewCurrent] = useState<DashboardAnalyticsOverviewResponse | null>(null)
  const [overviewPrevious, setOverviewPrevious] = useState<DashboardAnalyticsOverviewResponse | null>(null)
  const [trends, setTrends] = useState<DashboardAnalyticsTrendsResponse | null>(null)
  const [funnel, setFunnel] = useState<DashboardAnalyticsFunnelResponse | null>(null)
  const [moderation, setModeration] = useState<DashboardAnalyticsModerationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!Number.isFinite(companyId) || companyId <= 0) {
      setLoading(false)
      setError('Invalid company ID')
      return
    }

    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')

      const isLifetime = rangePreset === 'lifetime'
      const rangeDays = rangePreset === '7d' ? 7 : rangePreset === '40d' ? 40 : 90
      const currentTo = new Date().toISOString()
      const currentFrom = isLifetime ? new Date(0).toISOString() : toIsoDaysAgo(rangeDays)
      const previousTo = currentFrom
      const previousFrom = isLifetime ? currentFrom : toIsoDaysAgo(rangeDays * 2)
      const channel = channelFilter === 'All' ? undefined : channelFilter
      const analyticsParams = {
        from: currentFrom,
        to: currentTo,
        companyId,
        channel,
      }
      const previousParams = isLifetime
        ? analyticsParams
        : {
            from: previousFrom,
            to: previousTo,
            companyId,
            channel,
          }

      const settle = async <T,>(p: Promise<T>): Promise<PromiseSettledResult<T>> => {
        try {
          const value = await p
          return { status: 'fulfilled', value }
        } catch (reason) {
          return { status: 'rejected', reason }
        }
      }

      const [trendsRes, funnelRes, moderationRes] = await Promise.allSettled([
        adminApi.getDashboardAnalyticsTrends({ ...analyticsParams, bucket: 'day' }),
        adminApi.getDashboardAnalyticsFunnel(analyticsParams),
        adminApi.getDashboardAnalyticsModeration({
          from: currentFrom,
          to: currentTo,
          companyId,
        }),
      ])

      const comparisonRes = await settle(
        adminApi.getDashboardAnalyticsOverviewComparison({
          from: analyticsParams.from,
          to: analyticsParams.to,
          previousFrom: previousParams.from,
          previousTo: previousParams.to,
          companyId,
          channel,
        }),
      )
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

      const failures = [
        comparisonRes,
        trendsRes,
        funnelRes,
        moderationRes,
      ].filter((result) => result.status === 'rejected').length
      if (failures === 4) {
        setError('Unable to load company analytics right now.')
      } else if (failures > 0) {
        setError('Some analytics sections are unavailable. Partial data is shown.')
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [companyId, env, rangePreset, channelFilter])

  useEffect(() => {
    if (overviewSnapshotProp != null) {
      setFetchedOverviewSnapshot(null)
      setOverviewSnapshotLoading(false)
      return
    }
    if (!Number.isFinite(companyId) || companyId <= 0) {
      setFetchedOverviewSnapshot(null)
      setOverviewSnapshotLoading(false)
      return
    }

    let cancelled = false
    setOverviewSnapshotLoading(true)

    const load = async () => {
      try {
        const [company, campaigns] = await Promise.all([
          adminApi.getCompanyById(companyId),
          adminApi.getCompanyCampaignsAll(companyId),
        ])
        if (cancelled) return
        setFetchedOverviewSnapshot(buildOverviewSnapshotFromData(company, campaigns))
      } catch {
        if (!cancelled) setFetchedOverviewSnapshot(null)
      } finally {
        if (!cancelled) setOverviewSnapshotLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [companyId, env, overviewSnapshotProp])

  const overviewSnapshot = overviewSnapshotProp ?? fetchedOverviewSnapshot

  const kpiCards = useMemo(
    () => buildDashboardKpiCards(overviewCurrent, overviewPrevious),
    [overviewCurrent, overviewPrevious],
  )
  const trendTotals = summarizeTrendTotals(trends?.points ?? [])
  const campaignPerformance = overviewCurrent?.campaignPerformance
  const creditsFinance = overviewCurrent?.creditsFinance
  const audience = overviewCurrent?.audience
  const apiOps = overviewCurrent?.apiOps

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px] rounded-2xl border border-slate-200 bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[var(--admin-ui-accent)]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 px-5 py-4 shadow-sm">
          {error}
        </div>
      ) : null}

      {overviewSnapshotLoading && !overviewSnapshot ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-[var(--admin-ui-accent)]" />
        </div>
      ) : overviewSnapshot ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Lifecycle"
            value={overviewSnapshot.isActive ? 'Active' : 'Deactivated'}
            hint={
              overviewSnapshot.isActive ? 'Operational actions enabled' : 'Operational actions blocked'
            }
            icon={<SignalHigh className="h-4 w-4" />}
          />
          <StatCard
            label="Submission review"
            value={overviewSnapshot.reviewStatus}
            hint={
              overviewSnapshot.reviewStatus === 'Rejected'
                ? (overviewSnapshot.reviewReason ?? 'Reason required')
                : overviewSnapshot.reviewStatus === 'Pending' && overviewSnapshot.reviewReason
                  ? overviewSnapshot.reviewReason
                  : 'Backoffice decision'
            }
            icon={<ShieldCheck className="h-4 w-4" />}
          />
          <StatCard
            label="Sender ID"
            value={overviewSnapshot.senderStatusLabel}
            hint={overviewSnapshot.senderIdHint}
            icon={<BadgeCheck className="h-4 w-4" />}
          />
          <StatCard
            label="Campaigns"
            value={`${overviewSnapshot.campaignsTotal} total`}
            hint={`${overviewSnapshot.activeCampaignsCount} currently active`}
            icon={<Megaphone className="h-4 w-4" />}
          />
          <StatCard
            label="Approval rate"
            value={overviewSnapshot.approvedRate}
            hint={`${overviewSnapshot.approvedCampaignsCount} approved`}
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
        </div>
      ) : null}

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Analytics Overview</h2>
            <p className="text-sm text-gray-500">Company-only metrics for the selected period.</p>
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
              onChange={(event) => setChannelFilter(event.target.value as ChannelFilter)}
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

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs uppercase text-gray-500">Campaigns</p><p className="mt-1 font-semibold text-gray-900">{campaignPerformance?.totalCampaigns ?? 0}</p></div>
            <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs uppercase text-gray-500">Completed</p><p className="mt-1 font-semibold text-gray-900">{campaignPerformance?.completedCampaigns ?? 0}</p></div>
            <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs uppercase text-gray-500">Dispatch rate</p><p className="mt-1 font-semibold text-gray-900">{(campaignPerformance?.dispatchRate ?? 0).toFixed(2)}%</p></div>
            <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs uppercase text-gray-500">Avg completion</p><p className="mt-1 font-semibold text-gray-900">{(campaignPerformance?.averageTimeToCompleteHours ?? 0).toFixed(2)}h</p></div>
          </div>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Credits & Finance</h3>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs uppercase text-gray-500">SMS balance</p><p className="mt-1 font-semibold text-gray-900">{creditsFinance?.balances.sms ?? 0}</p></div>
            <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs uppercase text-gray-500">Email balance</p><p className="mt-1 font-semibold text-gray-900">{creditsFinance?.balances.email ?? 0}</p></div>
            <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs uppercase text-gray-500">Revenue</p><p className="mt-1 font-semibold text-gray-900">ZMW {(creditsFinance?.totalRevenue ?? 0).toFixed(2)}</p></div>
            <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs uppercase text-gray-500">Payment success</p><p className="mt-1 font-semibold text-gray-900">{(creditsFinance?.paymentSuccessRate ?? 0).toFixed(2)}%</p></div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Trend Snapshot</h2>
          <p className="mt-1 text-sm text-gray-500">Aggregated totals for selected period.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs uppercase text-gray-500">Campaigns</p><p className="mt-1 text-lg font-semibold text-gray-900">{trendTotals.campaigns}</p></div>
            <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs uppercase text-gray-500">Approved</p><p className="mt-1 text-lg font-semibold text-gray-900">{trendTotals.approvedCampaigns}</p></div>
            <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs uppercase text-gray-500">Active</p><p className="mt-1 text-lg font-semibold text-gray-900">{trendTotals.activeCampaigns}</p></div>
            <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs uppercase text-gray-500">Orders</p><p className="mt-1 text-lg font-semibold text-gray-900">{trendTotals.purchaseOrders}</p></div>
            <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs uppercase text-gray-500">Transactions</p><p className="mt-1 text-lg font-semibold text-gray-900">{trendTotals.transactions}</p></div>
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
            <p className="mt-3 text-sm font-medium text-[var(--admin-ui-accent)]">Completion rate: {(funnel?.completionRate ?? 0).toFixed(2)}%</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Moderation Velocity</h3>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <p className="flex items-center justify-between"><span>Pending approvals</span><strong>{moderation?.pendingApprovals ?? 0}</strong></p>
              <p className="flex items-center justify-between"><span>Approved</span><strong>{moderation?.approvedCount ?? 0}</strong></p>
              <p className="flex items-center justify-between"><span>Rejected</span><strong>{moderation?.rejectedCount ?? 0}</strong></p>
            </div>
            <p className="mt-3 text-sm font-medium text-emerald-700">Approval rate: {(moderation?.approvalRate ?? 0).toFixed(2)}%</p>
            <p className="text-sm text-gray-600">Median review time: {(moderation?.medianReviewHours ?? 0).toFixed(2)}h</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Audience</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs uppercase text-gray-500">Total subscribers</p><p className="mt-1 font-semibold text-gray-900">{audience?.totalSubscribers ?? 0}</p></div>
              <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs uppercase text-gray-500">New subscribers</p><p className="mt-1 font-semibold text-gray-900">{audience?.newSubscribers ?? 0}</p></div>
              <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs uppercase text-gray-500">Opt-in SMS</p><p className="mt-1 font-semibold text-gray-900">{audience?.optInSms ?? 0}</p></div>
              <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs uppercase text-gray-500">Opt-in WhatsApp</p><p className="mt-1 font-semibold text-gray-900">{audience?.optInWhatsApp ?? 0}</p></div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs uppercase text-gray-500">API usage</p><p className="mt-1 font-semibold text-gray-900">{apiOps?.apiUsage.total ?? 0}</p></div>
              <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs uppercase text-gray-500">Success rate</p><p className="mt-1 font-semibold text-gray-900">{(apiOps?.apiUsage.successRate ?? 0).toFixed(2)}%</p></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

