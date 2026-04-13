'use client'

import { useEffect, useMemo, useState } from 'react'
import { CircleHelp } from 'lucide-react'
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
import {
  adminApi,
  type CompanyLeanResponse,
  type DashboardAnalyticsOverviewResponse,
  type DashboardAnalyticsDrilldownResponse,
  type DashboardAnalyticsForecastResponse,
  type DashboardAnalyticsAnomaliesResponse,
  type DashboardAnalyticsRetentionResponse,
} from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import { LoadingCentered } from '@/app/components/LoadingSpinner'
import { biStatsWarningMessage } from '../bi-dashboard/biFetchStatus'
import {
  buildBiKpiCards,
  mapForecastSeriesForChart,
  summarizeAnomalySeverity,
  toDrilldownCsv,
  type BiKpiSnapshot,
} from '../bi-dashboard/biViewModel'

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

const LIQUID_TICK = { fill: '#808191', fontSize: 12 }
const LIQUID_AXIS = { axisLine: false as const, tickLine: false as const }
const CHART_GRID_STROKE = '#e8e8ee'
const CHART_GRID_DASH = '6 6'

const KPI_GRADIENTS = [
  'bg-[linear-gradient(145deg,var(--brand-color-2)_0%,var(--brand-color-1)_100%)]',
  'bg-[linear-gradient(145deg,color-mix(in_srgb,var(--brand-color-3)_65%,var(--brand-color-1)_35%)_0%,var(--brand-color-1)_100%)]',
  'bg-[linear-gradient(160deg,var(--brand-color-3)_0%,var(--brand-color-1)_100%)]',
  'bg-[linear-gradient(145deg,var(--brand-color-2)_0%,color-mix(in_srgb,var(--brand-color-3)_45%,var(--brand-color-1)_55%)_100%)]',
  'bg-[linear-gradient(145deg,var(--brand-color-3)_0%,var(--brand-color-2)_52%,var(--brand-color-1)_100%)]',
] as const

const BI_KPI_TOOLTIPS: Record<string, string> = {
  revenue: 'Total revenue generated in the selected period.',
  dispatchRate: 'Percentage of outbound sends that were dispatched successfully.',
  conversionRate: 'Share of sent campaigns that reached completion in the selected period.',
  retentionRate: 'Percentage of active subscribers out of total subscribers for the selected audience.',
  failureRate: 'Percentage of API operations that failed in the selected period.',
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <span
      className="group relative inline-flex h-4 w-4 items-center justify-center text-white/75 transition-colors hover:text-white"
      aria-label={text}
    >
      <CircleHelp className="h-3.5 w-3.5" />
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 hidden w-44 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium normal-case tracking-normal text-white shadow-lg group-hover:block group-focus-visible:block">
        {text}
      </span>
    </span>
  )
}

function LabelWithInfo({ label, tooltip }: { label: string; tooltip?: string }) {
  return (
    <span className="inline-flex items-center gap-1 align-middle">
      <span>{label}</span>
      {tooltip ? <InfoTooltip text={tooltip} /> : null}
    </span>
  )
}

function BiKpiCardsSkeleton() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-[136px] rounded-[20px] animate-pulse bg-[linear-gradient(145deg,color-mix(in_srgb,var(--brand-color-2)_20%,#ffffff)_0%,color-mix(in_srgb,var(--brand-color-3)_18%,#ffffff)_100%)]"
        />
      ))}
    </div>
  )
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

export default function BiDashboardTabContent() {
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
  const [sectionErrors, setSectionErrors] = useState({
    retention: false,
    forecast: false,
    anomalies: false,
    drilldown: false,
  })

  useEffect(() => {
    const fetchBiData = async () => {
      setLoading(true)
      setWarning('')
      setSectionErrors({
        retention: false,
        forecast: false,
        anomalies: false,
        drilldown: false,
      })
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
        setSectionErrors({
          retention: retentionRes.status === 'rejected',
          forecast: forecastRes.status === 'rejected',
          anomalies: anomaliesRes.status === 'rejected',
          drilldown: drilldownRes.status === 'rejected',
        })

        // Overview cards are the critical BI baseline; optional sections can degrade independently.
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
  const hasForecastData = forecastSeries.length > 0
  const hasAnomalyData = (anomalies?.alerts?.length ?? 0) > 0
  const hasRetentionData = retentionRows.length > 0
  const hasDrilldownData = (drilldown?.rows?.length ?? 0) > 0

  return (
    <div className="space-y-6">
      {warning ? (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {warning}
        </div>
      ) : null}
      <section className="admin-liquid-card p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-[var(--admin-heading)] sm:text-xl">
              Executive BI Dashboard
            </h1>
            <p className="text-sm text-[var(--admin-muted)]">Forecasting, retention, anomalies, and drill-down intelligence.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select className="admin-liquid-transition rounded-full border border-[color:var(--admin-card-border)] bg-white px-4 py-2 text-[0.8125rem] text-[var(--admin-heading)] shadow-sm" value={rangePreset} onChange={(event) => setRangePreset(event.target.value as RangePreset)}>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="180d">Last 180 days</option>
            </select>
            <select className="admin-liquid-transition rounded-full border border-[color:var(--admin-card-border)] bg-white px-4 py-2 text-[0.8125rem] text-[var(--admin-heading)] shadow-sm" value={companyId} onChange={(event) => setCompanyId(event.target.value === 'all' ? 'all' : Number(event.target.value))}>
              <option value="all">All companies</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name ?? `Company #${company.id}`}
                </option>
              ))}
            </select>
            <select className="admin-liquid-transition rounded-full border border-[color:var(--admin-card-border)] bg-white px-4 py-2 text-[0.8125rem] text-[var(--admin-heading)] shadow-sm" value={channelFilter} onChange={(event) => setChannelFilter(event.target.value as 'All' | 'Sms' | 'Email' | 'WhatsApp' | 'WhatsAppUtility')}>
              <option value="All">All channels</option>
              <option value="Sms">SMS</option>
              <option value="Email">Email</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="WhatsAppUtility">WhatsApp Utility</option>
            </select>
          </div>
        </div>
        {loading ? (
          <BiKpiCardsSkeleton />
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {kpiCards.map((card, i) => {
              const isPositive = card.delta >= 0
              const deltaClass = isPositive ? 'text-emerald-100' : 'text-rose-100'
              const valueText = card.unit === 'currency'
                ? `ZMW ${card.value.toFixed(2)}`
                : `${card.value.toFixed(2)}%`
              const g = KPI_GRADIENTS[i % KPI_GRADIENTS.length]
              return (
                <div
                  key={card.key}
                  className={`admin-dashboard-metric-card rounded-2xl p-4 text-white shadow-md shadow-black/10 ${g}`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/90">
                    <LabelWithInfo label={card.label} tooltip={BI_KPI_TOOLTIPS[card.key]} />
                  </p>
                  <p className="mt-2 text-2xl font-bold tabular-nums">{valueText}</p>
                  <p className={`mt-1 text-[0.8125rem] font-semibold ${deltaClass}`}>
                    {isPositive ? '+' : ''}
                    {card.delta.toFixed(2)}
                    {card.unit === 'currency' ? '' : 'pp'} vs previous
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {loading ? (
        <div className="admin-liquid-card p-12">
          <LoadingCentered minHeight="40vh" label="Loading BI analytics" />
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2 admin-liquid-card p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--admin-heading)]">Forecast</h2>
                  <p className="text-sm text-[var(--admin-muted)]">Projected trend with confidence range.</p>
                </div>
                <select
                  className="admin-liquid-transition rounded-full border border-[color:var(--admin-card-border)] bg-white px-4 py-2 text-[0.8125rem] text-[var(--admin-heading)] shadow-sm"
                  value={bucket}
                  onChange={(event) => setBucket(event.target.value as 'day' | 'week')}
                >
                  <option value="day">Daily bucket</option>
                  <option value="week">Weekly bucket</option>
                </select>
              </div>
              <div className="mt-4 h-72">
                {hasForecastData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastSeries} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                      <defs>
                        <linearGradient id="biBand" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4299e1" stopOpacity={0.28} />
                          <stop offset="100%" stopColor="#4299e1" stopOpacity={0.04} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke={CHART_GRID_STROKE} vertical={false} strokeDasharray={CHART_GRID_DASH} />
                      <XAxis
                        dataKey="bucketStart"
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        {...LIQUID_AXIS}
                        tick={LIQUID_TICK}
                      />
                      <YAxis {...LIQUID_AXIS} tick={LIQUID_TICK} width={40} />
                      <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
                      <Area type="monotone" dataKey="upper" stroke="#93c5fd" strokeWidth={1} fill="url(#biBand)" />
                      <Area type="monotone" dataKey="lower" stroke="#93c5fd" strokeWidth={1} fill="#ffffff" fillOpacity={0.95} />
                      <Line type="basis" dataKey="predicted" stroke="#4299e1" strokeWidth={2.5} dot={false} />
                      <Line type="basis" dataKey="actual" stroke="#48bb78" strokeWidth={2.25} strokeOpacity={0.95} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[color:var(--admin-card-border)] bg-[color:var(--admin-bg-canvas)] text-sm text-[var(--admin-muted)]">
                    {sectionErrors.forecast
                      ? 'Forecast is currently unavailable.'
                      : 'No forecast data for current filters.'}
                  </div>
                )}
              </div>
            </div>
            <div className="admin-liquid-card p-5 md:p-6">
              <h2 className="text-lg font-semibold text-[var(--admin-heading)]">Anomaly Alerts</h2>
              <p className="text-sm text-[var(--admin-muted)]">Severity overview and latest incidents.</p>
              {hasAnomalyData ? (
                <>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-xl bg-rose-50 p-3">Critical: {severitySummary.critical}</div>
                    <div className="rounded-xl bg-orange-50 p-3">High: {severitySummary.high}</div>
                    <div className="rounded-xl bg-amber-50 p-3">Medium: {severitySummary.medium}</div>
                    <div className="rounded-xl bg-slate-100 p-3">Low: {severitySummary.low}</div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    {(anomalies?.alerts ?? []).slice(0, 6).map((alert) => (
                      <div key={alert.alertId} className="rounded-xl border border-[color:var(--admin-card-border)] bg-[color:var(--admin-bg-canvas)] px-3 py-2">
                        <p className="font-medium text-[var(--admin-heading)]">{alert.metric}</p>
                        <p className="text-xs text-[var(--admin-muted)]">
                          {alert.severity.toUpperCase()} | expected {alert.expectedValue.toFixed(2)} | actual {alert.actualValue.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-4 flex min-h-40 items-center justify-center rounded-xl border border-dashed border-[color:var(--admin-card-border)] bg-[color:var(--admin-bg-canvas)] text-sm text-[var(--admin-muted)]">
                  {sectionErrors.anomalies
                    ? 'Anomaly alerts are currently unavailable.'
                    : 'No anomaly alerts for current filters.'}
                </div>
              )}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2 admin-liquid-card p-5 md:p-6">
              <h2 className="text-lg font-semibold text-[var(--admin-heading)]">Cohort Retention</h2>
              <p className="text-sm text-[var(--admin-muted)]">Retention rates by cohort month.</p>
              <div className="mt-4 h-72">
                {hasRetentionData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={retentionRows.map((cohort) => ({
                        cohort: cohort.cohortMonth,
                        m0: cohort.retentionPoints.find((point) => point.monthIndex === 0)?.retentionRate ?? 0,
                        m1: cohort.retentionPoints.find((point) => point.monthIndex === 1)?.retentionRate ?? 0,
                        m3: cohort.retentionPoints.find((point) => point.monthIndex === 3)?.retentionRate ?? 0,
                      }))}
                      margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                    >
                      <CartesianGrid stroke={CHART_GRID_STROKE} vertical={false} strokeDasharray={CHART_GRID_DASH} />
                      <XAxis dataKey="cohort" {...LIQUID_AXIS} tick={LIQUID_TICK} />
                      <YAxis {...LIQUID_AXIS} tick={LIQUID_TICK} width={40} />
                      <Tooltip />
                      <Line type="basis" dataKey="m0" stroke="#a0aec0" strokeWidth={2} name="M0" dot={false} />
                      <Line type="basis" dataKey="m1" stroke="#4299e1" strokeWidth={2.5} name="M1" dot={false} />
                      <Line type="basis" dataKey="m3" stroke="#48bb78" strokeWidth={2.25} name="M3" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[color:var(--admin-card-border)] bg-[color:var(--admin-bg-canvas)] text-sm text-[var(--admin-muted)]">
                    {sectionErrors.retention
                      ? 'Retention chart is currently unavailable.'
                      : 'No retention cohorts for current filters.'}
                  </div>
                )}
              </div>
            </div>
            <div className="admin-liquid-card p-5 md:p-6">
              <h2 className="text-lg font-semibold text-[var(--admin-heading)]">Retention Table</h2>
              {hasRetentionData ? (
                <div className="mt-3 space-y-2 text-sm">
                  {retentionRows.map((cohort) => (
                    <div key={cohort.cohortMonth} className="rounded-xl border border-[color:var(--admin-card-border)] bg-[color:var(--admin-bg-canvas)] px-3 py-2">
                      <p className="font-medium text-[var(--admin-heading)]">{cohort.cohortMonth}</p>
                      <p className="text-xs text-[var(--admin-muted)]">
                        Size: {cohort.cohortSize} | M1: {(cohort.retentionPoints.find((point) => point.monthIndex === 1)?.retentionRate ?? 0).toFixed(2)}%
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 flex min-h-40 items-center justify-center rounded-xl border border-dashed border-[color:var(--admin-card-border)] bg-[color:var(--admin-bg-canvas)] text-sm text-[var(--admin-muted)]">
                  {sectionErrors.retention
                    ? 'Retention table is currently unavailable.'
                    : 'No retention rows for current filters.'}
                </div>
              )}
            </div>
          </section>

          <section className="admin-liquid-card p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[var(--admin-heading)]">Drill-down</h2>
                <p className="text-sm text-[var(--admin-muted)]">Company/channel level performance rows.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="admin-liquid-transition rounded-full border border-[color:var(--admin-card-border)] bg-white px-4 py-2 text-[0.8125rem] text-[var(--admin-heading)] shadow-sm"
                  value={bucket}
                  onChange={(event) => setBucket(event.target.value as 'day' | 'week')}
                >
                  <option value="day">Daily bucket</option>
                  <option value="week">Weekly bucket</option>
                </select>
                <button
                  type="button"
                  onClick={() => triggerCsvDownload("bi-drilldown.csv", toDrilldownCsv(drilldown?.rows ?? []))}
                  className="admin-btn-primary"
                >
                  Export CSV
                </button>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              {hasDrilldownData ? (
                <table className="admin-liquid-table min-w-[860px] w-full">
                  <thead>
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
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
                      <tr key={`${row.bucketStart}-${row.companyId ?? 'all'}-${row.channel ?? 'all'}`} className="text-[0.8125rem] text-[var(--admin-heading)]">
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
              ) : (
                <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-[color:var(--admin-card-border)] bg-[color:var(--admin-bg-canvas)] text-sm text-[var(--admin-muted)]">
                  {sectionErrors.drilldown
                    ? 'Drill-down is currently unavailable.'
                    : 'No drill-down rows for current filters.'}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
