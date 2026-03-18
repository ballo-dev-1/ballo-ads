'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  adminApi,
  type DashboardAnalyticsFunnelResponse,
  type DashboardAnalyticsModerationResponse,
  type DashboardAnalyticsOverviewResponse,
  type DashboardAnalyticsTrendsResponse,
} from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import { buildDashboardKpiCards, summarizeTrendTotals } from '@/app/admin/dashboard/analyticsViewModel'
import { getAdminBasePath } from '@/lib/adminNamespace'
import AdminHero from '@/app/admin/components/AdminHero'

type RangePreset = '7d' | '40d' | '90d' | 'lifetime'
type ChannelFilter = 'All' | 'Sms' | 'Email' | 'WhatsApp' | 'WhatsAppUtility'

function toIsoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export default function CompanyAnalyticsPage() {
  const params = useParams()
  const pathname = usePathname()
  const { env } = useApiEnv()
  const basePath = getAdminBasePath(pathname)
  const idParam = params.id
  const numericId = idParam != null ? Number(idParam) : NaN
  const invalidId = typeof idParam !== 'string' || idParam === '' || Number.isNaN(numericId)

  const [rangePreset, setRangePreset] = useState<RangePreset>('lifetime')
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('All')
  const [companyName, setCompanyName] = useState<string>('')
  const [overviewCurrent, setOverviewCurrent] = useState<DashboardAnalyticsOverviewResponse | null>(null)
  const [overviewPrevious, setOverviewPrevious] = useState<DashboardAnalyticsOverviewResponse | null>(null)
  const [trends, setTrends] = useState<DashboardAnalyticsTrendsResponse | null>(null)
  const [funnel, setFunnel] = useState<DashboardAnalyticsFunnelResponse | null>(null)
  const [moderation, setModeration] = useState<DashboardAnalyticsModerationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (invalidId) {
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
        companyId: numericId,
        channel,
      }
      const previousParams = isLifetime
        ? analyticsParams
        : {
            from: previousFrom,
            to: previousTo,
            companyId: numericId,
            channel,
          }

      const [
        companyRes,
        overviewCurrentRes,
        overviewPreviousRes,
        trendsRes,
        funnelRes,
        moderationRes,
      ] = await Promise.allSettled([
        adminApi.getCompanyById(numericId),
        adminApi.getDashboardAnalyticsOverview(analyticsParams),
        adminApi.getDashboardAnalyticsOverview(previousParams),
        adminApi.getDashboardAnalyticsTrends({ ...analyticsParams, bucket: 'day' }),
        adminApi.getDashboardAnalyticsFunnel(analyticsParams),
        adminApi.getDashboardAnalyticsModeration({ from: currentFrom, to: currentTo, companyId: numericId }),
      ])

      if (cancelled) return

      if (companyRes.status === 'fulfilled') {
        setCompanyName(companyRes.value.name ?? `Company ${numericId}`)
      } else {
        setCompanyName(`Company ${numericId}`)
      }

      setOverviewCurrent(overviewCurrentRes.status === 'fulfilled' ? overviewCurrentRes.value : null)
      setOverviewPrevious(overviewPreviousRes.status === 'fulfilled' ? overviewPreviousRes.value : null)
      setTrends(trendsRes.status === 'fulfilled' ? trendsRes.value : null)
      setFunnel(funnelRes.status === 'fulfilled' ? funnelRes.value : null)
      setModeration(moderationRes.status === 'fulfilled' ? moderationRes.value : null)

      const failures = [
        overviewCurrentRes,
        overviewPreviousRes,
        trendsRes,
        funnelRes,
        moderationRes,
      ].filter((result) => result.status === 'rejected').length
      if (failures === 5) {
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
  }, [invalidId, numericId, env, rangePreset, channelFilter])

  const kpiCards = useMemo(
    () => buildDashboardKpiCards(overviewCurrent, overviewPrevious),
    [overviewCurrent, overviewPrevious],
  )
  const trendTotals = summarizeTrendTotals(trends?.points ?? [])
  const campaignPerformance = overviewCurrent?.campaignPerformance
  const creditsFinance = overviewCurrent?.creditsFinance
  const audience = overviewCurrent?.audience
  const apiOps = overviewCurrent?.apiOps

  const breadcrumb = (
    <div className="mb-6 flex flex-wrap items-center gap-1 text-xs text-white/80">
      <Link href={`${basePath}/companies`} className="hover:text-white hover:underline">
        Companies
      </Link>
      <span>/</span>
      <Link href={`${basePath}/companies/${numericId}`} className="hover:text-white hover:underline">
        {companyName || `Company ${numericId}`}
      </Link>
      <span>/</span>
      <span>Analytics</span>
    </div>
  )

  if (invalidId) {
    return (
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mx-auto w-full max-w-6xl space-y-5">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm">
            Invalid company ID
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto w-full max-w-[1280px] space-y-6">
          <AdminHero
            topSlot={breadcrumb}
            eyebrow="Company analytics"
            title={`${companyName || `Company ${numericId}`} analytics`}
            description="Company-scoped campaign, revenue, and moderation analytics."
            variant="blue"
            actions={
              <Link
                href={`${basePath}/companies/${numericId}`}
                className="rounded-full bg-[#0f1222] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-black"
              >
                Back to company
              </Link>
            }
          />

          {error ? (
            <div className="rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 px-5 py-4 shadow-sm">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="flex items-center justify-center min-h-[320px] rounded-2xl border border-slate-200 bg-white">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[var(--brand-color-2)]" />
            </div>
          ) : (
            <>
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
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs uppercase text-gray-500">Campaigns</p>
                      <p className="mt-1 font-semibold text-gray-900">{campaignPerformance?.totalCampaigns ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs uppercase text-gray-500">Completed</p>
                      <p className="mt-1 font-semibold text-gray-900">{campaignPerformance?.completedCampaigns ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs uppercase text-gray-500">Dispatch rate</p>
                      <p className="mt-1 font-semibold text-gray-900">{(campaignPerformance?.dispatchRate ?? 0).toFixed(2)}%</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs uppercase text-gray-500">Avg completion</p>
                      <p className="mt-1 font-semibold text-gray-900">{(campaignPerformance?.averageTimeToCompleteHours ?? 0).toFixed(2)}h</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900">Credits & Finance</h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs uppercase text-gray-500">SMS balance</p>
                      <p className="mt-1 font-semibold text-gray-900">{creditsFinance?.balances.sms ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs uppercase text-gray-500">Email balance</p>
                      <p className="mt-1 font-semibold text-gray-900">{creditsFinance?.balances.email ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs uppercase text-gray-500">Revenue</p>
                      <p className="mt-1 font-semibold text-gray-900">ZMW {(creditsFinance?.totalRevenue ?? 0).toFixed(2)}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs uppercase text-gray-500">Payment success</p>
                      <p className="mt-1 font-semibold text-gray-900">{(creditsFinance?.paymentSuccessRate ?? 0).toFixed(2)}%</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900">Audience</h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs uppercase text-gray-500">Total subscribers</p>
                      <p className="mt-1 font-semibold text-gray-900">{audience?.totalSubscribers ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs uppercase text-gray-500">New subscribers</p>
                      <p className="mt-1 font-semibold text-gray-900">{audience?.newSubscribers ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs uppercase text-gray-500">Opt-in SMS</p>
                      <p className="mt-1 font-semibold text-gray-900">{audience?.optInSms ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs uppercase text-gray-500">Opt-in WhatsApp</p>
                      <p className="mt-1 font-semibold text-gray-900">{audience?.optInWhatsApp ?? 0}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900">API Ops</h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs uppercase text-gray-500">API usage</p>
                      <p className="mt-1 font-semibold text-gray-900">{apiOps?.apiUsage.total ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs uppercase text-gray-500">Success rate</p>
                      <p className="mt-1 font-semibold text-gray-900">{(apiOps?.apiUsage.successRate ?? 0).toFixed(2)}%</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs uppercase text-gray-500">Pending recipients</p>
                      <p className="mt-1 font-semibold text-gray-900">{apiOps?.channelOperations.pendingRecipients ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs uppercase text-gray-500">Failed API (24h)</p>
                      <p className="mt-1 font-semibold text-gray-900">{apiOps?.channelOperations.failedApiUsagesLast24Hours ?? 0}</p>
                    </div>
                  </div>
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
                        {(trends?.points ?? []).slice(-10).map((point) => (
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
