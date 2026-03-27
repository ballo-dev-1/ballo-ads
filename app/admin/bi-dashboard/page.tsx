'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { adminApi, type CompanyLeanResponse, type DashboardAnalyticsOverviewResponse, type DashboardAnalyticsDrilldownResponse, type DashboardAnalyticsForecastResponse, type DashboardAnalyticsAnomaliesResponse, type DashboardAnalyticsRetentionResponse } from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import { biStatsWarningMessage } from './biFetchStatus'
import { buildBiKpiCards, mapForecastSeriesForChart, summarizeAnomalySeverity, toDrilldownCsv, type BiKpiSnapshot } from './biViewModel'

type RangePreset = '30d' | '90d' | '180d'

function toIsoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function triggerCsvDownload(fileName: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

function mapOverviewToSnapshot(data: DashboardAnalyticsOverviewResponse | null): BiKpiSnapshot {
  if (!data) {
    return { revenue: 0, dispatchRate: 0, conversionRate: 0, retentionRate: 0, failureRate: 0 }
  }
  const api = data.apiOps.apiUsage
  return {
    revenue: data.totalRevenue,
    dispatchRate: data.campaignPerformance.dispatchRate,
    conversionRate: data.campaignPerformance.completionRate,
    retentionRate: data.audience.totalSubscribers > 0
      ? (data.audience.activeSubscribers / data.audience.totalSubscribers) * 100
      : 0,
    failureRate: api.total > 0 ? (api.failureCount / api.total) * 100 : 0,
  }
}

export default function BiDashboardPage() {
  const { env } = useApiEnv()
  const [rangePreset, setRangePreset] = useState<RangePreset>('90d')
  const [companyId, setCompanyId] = useState<number | 'all'>('all')
  const [channelFilter, setChannelFilter] = useState<'All' | 'Sms' | 'Email' | 'WhatsApp' | 'WhatsAppUtility'>('All')
  const [bucket, setBucket] = useState<'day' | 'week'>('week')
  const [companies, setCompanies] = useState<CompanyLeanResponse[]>([])
  const [overviewCurrent, setOverviewCurrent] = useState<DashboardAnalyticsOverviewResponse | null>(null)
  const [overviewPrevious, setOverviewPrevious] = useState<DashboardAnalyticsOverviewResponse | null>(null)
  const [retention, setRetention] = useState<DashboardAnalyticsRetentionResponse | null>(null)
  const [forecast, setForecast] = useState<DashboardAnalyticsForecastResponse | null>(null)
  const [anomalies, setAnomalies] = useState<DashboardAnalyticsAnomaliesResponse | null>(null)
  const [drilldown, setDrilldown] = useState<DashboardAnalyticsDrilldownResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [warning, setWarning] = useState('')

  useEffect(() => {
    const fetchBiData = async () => {
      setLoading(true)
      setWarning('')
      try {
        const days = rangePreset === '30d' ? 30 : rangePreset === '90d' ? 90 : 180
        const currentFrom = toIsoDaysAgo(days)
        const currentTo = new Date().toISOString()
        const previousTo = currentFrom
        const previousFrom = toIsoDaysAgo(days * 2)
        const companyFilter = companyId === 'all' ? undefined : companyId
        const channel = channelFilter === 'All' ? undefined : channelFilter
        const baseParams = { from: currentFrom, to: currentTo, companyId: companyFilter, channel }

        const [companiesRes, retentionRes, forecastRes, anomaliesRes, drilldownRes] =
          await Promise.allSettled([
            adminApi.getCompanies(),
            adminApi.getDashboardAnalyticsRetention(baseParams),
            adminApi.getDashboardAnalyticsForecast({ ...baseParams, bucket }),
            adminApi.getDashboardAnalyticsAnomalies(baseParams),
            adminApi.getDashboardAnalyticsDrilldown({ ...baseParams, bucket }),
          ])

        const settle = async <T,>(p: Promise<T>): Promise<PromiseSettledResult<T>> => {
          try {
            const value = await p
            return { status: 'fulfilled', value }
          } catch (reason) {
            return { status: 'rejected', reason }
          }
        }

        const overviewCurrentRes = await settle(adminApi.getDashboardAnalyticsOverview(baseParams))
        const overviewPreviousRes = await settle(
          adminApi.getDashboardAnalyticsOverview({ from: previousFrom, to: previousTo, companyId: companyFilter, channel }),
        )

        setCompanies(companiesRes.status === 'fulfilled' ? companiesRes.value : [])
        setOverviewCurrent(overviewCurrentRes.status === 'fulfilled' ? overviewCurrentRes.value : null)
        setOverviewPrevious(overviewPreviousRes.status === 'fulfilled' ? overviewPreviousRes.value : null)
        setRetention(retentionRes.status === 'fulfilled' ? retentionRes.value : null)
        setForecast(forecastRes.status === 'fulfilled' ? forecastRes.value : null)
        setAnomalies(anomaliesRes.status === 'fulfilled' ? anomaliesRes.value : null)
        setDrilldown(drilldownRes.status === 'fulfilled' ? drilldownRes.value : null)

        setWarning(
          biStatsWarningMessage([
            overviewCurrentRes,
            overviewPreviousRes,
            retentionRes,
            forecastRes,
            anomaliesRes,
            drilldownRes,
          ]),
        )
      } finally {
        setLoading(false)
      }
    }

    fetchBiData()
  }, [env, rangePreset, companyId, channelFilter, bucket])

  const kpiCards = useMemo(
    () => buildBiKpiCards(mapOverviewToSnapshot(overviewCurrent), mapOverviewToSnapshot(overviewPrevious)),
    [overviewCurrent, overviewPrevious],
  )
  const forecastSeries = useMemo(
    () => mapForecastSeriesForChart(forecast?.points ?? []),
    [forecast],
  )
  const severitySummary = useMemo(
    () => summarizeAnomalySeverity(anomalies?.alerts ?? []),
    [anomalies],
  )
  const retentionRows = useMemo(
    () => (retention?.cohorts ?? []).slice(0, 6),
    [retention],
  )

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="space-y-6">
        {warning ? (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            {warning}
          </div>
        ) : null}
        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Executive BI Dashboard</h1>
              <p className="text-sm text-gray-600">Forecasting, retention, anomalies, and drill-down intelligence.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select className="rounded-xl border border-gray-300 px-3 py-2 text-sm" value={rangePreset} onChange={(event) => setRangePreset(event.target.value as RangePreset)}>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="180d">Last 180 days</option>
              </select>
              <select className="rounded-xl border border-gray-300 px-3 py-2 text-sm" value={companyId} onChange={(event) => setCompanyId(event.target.value === 'all' ? 'all' : Number(event.target.value))}>
                <option value="all">All companies</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name ?? `Company #${company.id}`}
                  </option>
                ))}
              </select>
              <select className="rounded-xl border border-gray-300 px-3 py-2 text-sm" value={channelFilter} onChange={(event) => setChannelFilter(event.target.value as 'All' | 'Sms' | 'Email' | 'WhatsApp' | 'WhatsAppUtility')}>
                <option value="All">All channels</option>
                <option value="Sms">SMS</option>
                <option value="Email">Email</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="WhatsAppUtility">WhatsApp Utility</option>
              </select>
              <select className="rounded-xl border border-gray-300 px-3 py-2 text-sm" value={bucket} onChange={(event) => setBucket(event.target.value as 'day' | 'week')}>
                <option value="day">Daily bucket</option>
                <option value="week">Weekly bucket</option>
              </select>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {kpiCards.map((card) => {
              const isPositive = card.delta >= 0
              const deltaClass = isPositive ? 'text-emerald-700' : 'text-rose-700'
              const valueText = card.unit === 'currency'
                ? `ZMW ${card.value.toFixed(2)}`
                : `${card.value.toFixed(2)}%`
              return (
                <div key={card.key} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">{card.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{valueText}</p>
                  <p className={`text-sm ${deltaClass}`}>
                    {isPositive ? '+' : ''}
                    {card.delta.toFixed(2)}
                    {card.unit === 'currency' ? '' : 'pp'} vs previous period
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {loading ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center text-gray-500">Loading BI analytics...</div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Forecast</h2>
                <p className="text-sm text-gray-500">Projected trend with confidence range.</p>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bucketStart" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                      <YAxis />
                      <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
                      <Area dataKey="upper" stroke="#c7d2fe" fill="#e0e7ff" />
                      <Area dataKey="lower" stroke="#c7d2fe" fill="#ffffff" />
                      <Line type="monotone" dataKey="predicted" stroke="#4f46e5" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="actual" stroke="#0f172a" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Anomaly Alerts</h2>
                <p className="text-sm text-gray-500">Severity overview and latest incidents.</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-rose-50 p-3">Critical: {severitySummary.critical}</div>
                  <div className="rounded-xl bg-orange-50 p-3">High: {severitySummary.high}</div>
                  <div className="rounded-xl bg-amber-50 p-3">Medium: {severitySummary.medium}</div>
                  <div className="rounded-xl bg-slate-100 p-3">Low: {severitySummary.low}</div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  {(anomalies?.alerts ?? []).slice(0, 6).map((alert) => (
                    <div key={alert.alertId} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                      <p className="font-medium text-gray-800">{alert.metric}</p>
                      <p className="text-xs text-gray-600">
                        {alert.severity.toUpperCase()} | expected {alert.expectedValue.toFixed(2)} | actual {alert.actualValue.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Cohort Retention</h2>
                <p className="text-sm text-gray-500">Retention rates by cohort month.</p>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={retentionRows.map((cohort) => ({
                      cohort: cohort.cohortMonth,
                      m0: cohort.retentionPoints.find((point) => point.monthIndex === 0)?.retentionRate ?? 0,
                      m1: cohort.retentionPoints.find((point) => point.monthIndex === 1)?.retentionRate ?? 0,
                      m3: cohort.retentionPoints.find((point) => point.monthIndex === 3)?.retentionRate ?? 0,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="cohort" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="m0" stroke="#111827" name="M0" />
                      <Line type="monotone" dataKey="m1" stroke="#4f46e5" name="M1" />
                      <Line type="monotone" dataKey="m3" stroke="#0ea5e9" name="M3" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Retention Table</h2>
                <div className="mt-3 space-y-2 text-sm">
                  {retentionRows.map((cohort) => (
                    <div key={cohort.cohortMonth} className="rounded-xl bg-gray-50 px-3 py-2">
                      <p className="font-medium text-gray-800">{cohort.cohortMonth}</p>
                      <p className="text-xs text-gray-600">
                        Size: {cohort.cohortSize} | M1: {(cohort.retentionPoints.find((point) => point.monthIndex === 1)?.retentionRate ?? 0).toFixed(2)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Drill-down</h2>
                  <p className="text-sm text-gray-500">Company/channel level performance rows.</p>
                </div>
                <button
                  type="button"
                  onClick={() => triggerCsvDownload("bi-drilldown.csv", toDrilldownCsv(drilldown?.rows ?? []))}
                  className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700"
                >
                  Export CSV
                </button>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-[860px] w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                      <th className="px-3 py-2">Bucket</th>
                      <th className="px-3 py-2">Company</th>
                      <th className="px-3 py-2">Channel</th>
                      <th className="px-3 py-2">Revenue</th>
                      <th className="px-3 py-2">Messages</th>
                      <th className="px-3 py-2">Conversions</th>
                      <th className="px-3 py-2">Conv Rate</th>
                      <th className="px-3 py-2">Failure Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(drilldown?.rows ?? []).map((row) => (
                      <tr key={`${row.bucketStart}-${row.companyId ?? 'all'}-${row.channel ?? 'all'}`} className="border-b border-gray-100 text-sm text-gray-700">
                        <td className="px-3 py-2">{new Date(row.bucketStart).toLocaleDateString()}</td>
                        <td className="px-3 py-2">{row.companyName ?? `Company #${row.companyId ?? '-'}`}</td>
                        <td className="px-3 py-2">{row.channel ?? 'All'}</td>
                        <td className="px-3 py-2">ZMW {row.revenue.toFixed(2)}</td>
                        <td className="px-3 py-2">{row.messagesSent}</td>
                        <td className="px-3 py-2">{row.conversions}</td>
                        <td className="px-3 py-2">{row.conversionRate.toFixed(2)}%</td>
                        <td className="px-3 py-2">{row.failureRate.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
