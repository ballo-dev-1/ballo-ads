'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  adminApi,
  type ApmAlertsResponse,
  type ApmChannelHealthResponse,
  type ApmLinksResponse,
  type ApmOverviewResponse,
  type ApmSeverity,
  type DispatchControlResponse,
} from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AlertCircle, AlertTriangle, CheckCircle2, Clock3, Database, Globe, ShieldCheck, X } from 'lucide-react'
import {
  applyChannelPauseToggle,
  buildEmergencyControlMatrix,
  summarizeReliabilityAlerts,
} from './reliabilityViewModel'
import { useConfirmDialog } from '@/app/admin/components/useConfirmDialog'
import { getAdminBasePath } from '@/lib/adminNamespace'

function severityBadge(severity: ApmSeverity) {
  const base =
    'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide shadow-sm ring-1 ring-inset'
  if (severity === 'critical') {
    return `${base} border-red-200/90 bg-red-50 text-red-700 ring-red-200/70`
  }
  if (severity === 'warning') {
    return `${base} border-amber-200/90 bg-amber-50 text-amber-700 ring-amber-200/70`
  }
  return `${base} border-emerald-200/90 bg-emerald-50 text-emerald-700 ring-emerald-200/70`
}

function severityIcon(severity: ApmSeverity) {
  if (severity === 'critical') return <AlertCircle className="h-3.5 w-3.5" />
  if (severity === 'warning') return <AlertTriangle className="h-3.5 w-3.5" />
  return <CheckCircle2 className="h-3.5 w-3.5" />
}

function SeverityBadge({
  severity,
  text,
  className = '',
}: {
  severity: ApmSeverity
  text: string
  className?: string
}) {
  return (
    <span className={`${severityBadge(severity)} ${className}`.trim()}>
      {severityIcon(severity)}
      <span className="ml-1.5">{text}</span>
    </span>
  )
}

function severityText(severity: ApmSeverity) {
  if (severity === 'critical') return 'Critical'
  if (severity === 'warning') return 'Warning'
  return 'Healthy'
}

function maxSeverity(a: ApmSeverity, b: ApmSeverity): ApmSeverity {
  const rank: Record<ApmSeverity, number> = {
    ok: 0,
    warning: 1,
    critical: 2,
  }
  return rank[a] >= rank[b] ? a : b
}

function formatDateTime(value?: string) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString()
}

const BRAND_COLORS = {
  primary: '#0e0e39',
  secondary: '#1d5a9a',
  accent: '#4b8ed0',
  soft: '#dbeafe',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
}

function severityChartColor(severity: ApmSeverity) {
  if (severity === 'critical') return BRAND_COLORS.danger
  if (severity === 'warning') return BRAND_COLORS.warning
  return BRAND_COLORS.success
}

type OverviewCardKey = 'environment' | 'verification' | 'dbProbe' | 'scheduler'

export default function ApmPage() {
  const pathname = usePathname()
  const { env } = useApiEnv()
  const basePath = getAdminBasePath(pathname)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [overview, setOverview] = useState<ApmOverviewResponse | null>(null)
  const [channels, setChannels] = useState<ApmChannelHealthResponse | null>(null)
  const [links, setLinks] = useState<ApmLinksResponse | null>(null)
  const [dispatchControls, setDispatchControls] = useState<DispatchControlResponse | null>(null)
  const [alerts, setAlerts] = useState<ApmAlertsResponse | null>(null)
  const [overviewError, setOverviewError] = useState('')
  const [channelsError, setChannelsError] = useState('')
  const [linksError, setLinksError] = useState('')
  const [dispatchControlsError, setDispatchControlsError] = useState('')
  const [alertsError, setAlertsError] = useState('')
  const [lastRefreshAt, setLastRefreshAt] = useState<Date | null>(null)
  const [updatingGlobalPause, setUpdatingGlobalPause] = useState(false)
  const [updatingChannel, setUpdatingChannel] = useState<string | null>(null)
  const [selectedOverviewCard, setSelectedOverviewCard] = useState<OverviewCardKey | null>(null)
  const { confirm, confirmDialog } = useConfirmDialog()

  const closeOverviewPopup = useCallback(() => {
    setSelectedOverviewCard(null)
  }, [])

  const openOverviewPopup = useCallback((card: OverviewCardKey) => {
    setSelectedOverviewCard(card)
  }, [])

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent === true
    if (!silent) setLoading(true)
    if (silent) setRefreshing(true)
    setError('')
    setOverviewError('')
    setChannelsError('')
    setLinksError('')
    setDispatchControlsError('')
    setAlertsError('')

    const [overviewRes, channelsRes, linksRes, dispatchControlsRes, alertsRes] = await Promise.allSettled([
      adminApi.getApmOverview(),
      adminApi.getApmChannels(),
      adminApi.getApmLinks(),
      adminApi.getDispatchControls(),
      adminApi.getApmAlerts(),
    ])

    let failureCount = 0

    if (overviewRes.status === 'fulfilled') {
      setOverview(overviewRes.value)
    } else {
      failureCount += 1
      setOverview(null)
      setOverviewError(overviewRes.reason instanceof Error ? overviewRes.reason.message : 'Failed to load overview')
    }

    if (channelsRes.status === 'fulfilled') {
      setChannels(channelsRes.value)
    } else {
      failureCount += 1
      setChannels(null)
      setChannelsError(channelsRes.reason instanceof Error ? channelsRes.reason.message : 'Failed to load channel health')
    }

    if (linksRes.status === 'fulfilled') {
      setLinks(linksRes.value)
    } else {
      failureCount += 1
      setLinks(null)
      setLinksError(linksRes.reason instanceof Error ? linksRes.reason.message : 'Failed to load observability links')
    }

    if (dispatchControlsRes.status === 'fulfilled') {
      setDispatchControls(dispatchControlsRes.value)
    } else {
      failureCount += 1
      setDispatchControls(null)
      setDispatchControlsError(
        dispatchControlsRes.reason instanceof Error
          ? dispatchControlsRes.reason.message
          : 'Failed to load emergency controls',
      )
    }

    if (alertsRes.status === 'fulfilled') {
      setAlerts(alertsRes.value)
    } else {
      failureCount += 1
      setAlerts(null)
      setAlertsError(
        alertsRes.reason instanceof Error ? alertsRes.reason.message : 'Failed to load reliability alerts',
      )
    }

    if (failureCount === 5) {
      setError('Unable to load APM data. You may not have access (401/403) or the service is unavailable.')
    } else if (failureCount > 0) {
      setError('Some APM sections are unavailable right now. Partial data is shown below.')
    }

    setLastRefreshAt(new Date())
    if (!silent) setLoading(false)
    if (silent) setRefreshing(false)
  }, [])

  useEffect(() => {
    load()
  }, [env, load])

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      void load({ silent: true })
    }, 30000)

    return () => window.clearInterval(id)
  }, [env, load])

  useEffect(() => {
    if (!selectedOverviewCard) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeOverviewPopup()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeOverviewPopup, selectedOverviewCard])

  const readinessItems = useMemo(() => {
    if (!overview) return []
    const readiness = overview.localMetrics.thirdPartyReadiness
    return [
      { key: 'sms', label: 'SMS', ...readiness.sms },
      { key: 'whatsapp', label: 'WhatsApp', ...readiness.whatsApp },
      { key: 'email', label: 'Email', ...readiness.email },
      { key: 'payments', label: 'Payments', ...readiness.payments },
    ]
  }, [overview])

  const incidentSeverity = useMemo<ApmSeverity>(() => {
    if (!overview && !channels) return 'warning'
    let severity: ApmSeverity = 'ok'
    if (overview) severity = maxSeverity(severity, overview.severity)
    if (channels) severity = maxSeverity(severity, channels.severity)
    if (error) severity = maxSeverity(severity, 'warning')
    return severity
  }, [channels, error, overview])

  const incidentMessage = useMemo(() => {
    if (incidentSeverity === 'critical') {
      return 'Critical incident detected. One or more systems may be unavailable.'
    }
    if (incidentSeverity === 'warning') {
      return 'Warning: some metrics indicate degraded performance or partial availability.'
    }
    return 'All monitored systems are healthy.'
  }, [incidentSeverity])

  const operationalKpiData = useMemo(() => {
    if (!overview) return []
    const kpis = overview.localMetrics.operationalKpis
    return [
      { name: 'Active campaigns', value: kpis.activeCampaigns },
      { name: 'Pending campaigns', value: kpis.pendingCampaigns },
      { name: 'Completed 24h', value: kpis.completedCampaignsLast24Hours },
      { name: 'Active POs', value: kpis.activePurchaseOrders },
      { name: 'Failed POs 24h', value: kpis.failedPurchaseOrdersLast24Hours },
      { name: 'API failures 24h', value: kpis.apiUsageFailuresLast24Hours },
    ]
  }, [overview])

  const balanceData = useMemo(() => {
    if (!overview) return []
    const kpis = overview.localMetrics.operationalKpis
    return [
      { name: 'SMS', value: kpis.smsBalance, fill: BRAND_COLORS.primary },
      { name: 'Email', value: kpis.emailBalance, fill: BRAND_COLORS.secondary },
      { name: 'WhatsApp', value: kpis.whatsAppBalance, fill: BRAND_COLORS.accent },
      { name: 'WA Utility', value: kpis.whatsAppUtilityBalance, fill: '#7c3aed' },
    ]
  }, [overview])

  const readinessChartData = useMemo(
    () =>
      readinessItems.map((item) => ({
        name: item.label,
        configured: item.isConfigured ? 100 : 0,
        severity: item.severity,
      })),
    [readinessItems],
  )

  const probeLatencyData = useMemo(
    () =>
      overview?.environmentProbes.map((probe) => ({
        name: probe.environment,
        latency: probe.latencyMs,
        severity: probe.severity,
      })) ?? [],
    [overview],
  )

  const channelDispatchData = useMemo(
    () =>
      channels?.channels.map((item) => ({
        name: item.channel,
        dispatched: item.dispatchedLast24Hours,
        pending: item.pendingRecipients,
      })) ?? [],
    [channels],
  )

  const channelFailureData = useMemo(
    () =>
      channels?.channels.map((item) => ({
        name: item.channel,
        failures: item.failedApiUsagesLast24Hours,
      })) ?? [],
    [channels],
  )

  const emergencyMatrix = useMemo(
    () => (dispatchControls ? buildEmergencyControlMatrix(dispatchControls) : null),
    [dispatchControls],
  )

  const reliabilitySummary = useMemo(
    () => (alerts ? summarizeReliabilityAlerts(alerts) : null),
    [alerts],
  )

  const handleGlobalPauseToggle = async () => {
    if (!emergencyMatrix || updatingGlobalPause) return
    const willPause = !emergencyMatrix.global.isPaused
    const approved = await confirm({
      title: willPause ? 'Pause global dispatch' : 'Resume global dispatch',
      description: willPause
        ? 'Pause all outbound messaging globally for this environment?'
        : 'Resume all outbound messaging globally for this environment?',
      confirmLabel: willPause ? 'Pause globally' : 'Resume globally',
      tone: willPause ? 'danger' : 'default',
    })
    if (!approved) {
      return
    }
    setUpdatingGlobalPause(true)
    try {
      const updated = await adminApi.setGlobalDispatchPause(
        emergencyMatrix.environment,
        !emergencyMatrix.global.isPaused,
      )
      setDispatchControls(updated)
      setDispatchControlsError('')
    } catch (err) {
      setDispatchControlsError(err instanceof Error ? err.message : 'Failed to update global pause')
    } finally {
      setUpdatingGlobalPause(false)
    }
  }

  const handleChannelPauseToggle = async (channel: string, paused: boolean) => {
    if (!dispatchControls || !emergencyMatrix || updatingChannel) return
    const willPause = !paused
    const approved = await confirm({
      title: willPause ? 'Pause channel dispatch' : 'Resume channel dispatch',
      description: willPause
        ? `Pause outbound messaging for ${channel}?`
        : `Resume outbound messaging for ${channel}?`,
      confirmLabel: willPause ? 'Pause channel' : 'Resume channel',
      tone: willPause ? 'danger' : 'default',
    })
    if (!approved) {
      return
    }
    setUpdatingChannel(channel)
    const previous = dispatchControls
    setDispatchControls(applyChannelPauseToggle(previous, channel, !paused))
    try {
      const updated = await adminApi.setChannelDispatchPause(
        emergencyMatrix.environment,
        channel,
        !paused,
      )
      setDispatchControls(updated)
      setDispatchControlsError('')
    } catch (err) {
      setDispatchControls(previous)
      setDispatchControlsError(err instanceof Error ? err.message : 'Failed to update channel pause')
    } finally {
      setUpdatingChannel(null)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <header className="relative overflow-hidden rounded-[30px] border border-[#7e75f8] bg-[linear-gradient(130deg,#675de4_0%,#5c61df_42%,#6a6ee9_75%,#6762db_100%)] px-8 py-7 text-white shadow-[0_18px_45px_rgba(84,72,190,0.30)]">
          <div className="pointer-events-none absolute -top-10 right-32 h-36 w-36 rounded-[2.2rem] border border-white/10 bg-white/5 blur-[1px]" />
          <div className="pointer-events-none absolute top-8 right-10 h-32 w-32 rounded-[2.1rem] border border-white/10 bg-white/5 blur-[1px]" />
          <div className="pointer-events-none absolute bottom-6 right-40 h-24 w-24 rounded-[1.8rem] border border-white/10 bg-white/5 blur-[1px]" />
          <div className="pointer-events-none absolute right-20 top-20 h-1 w-24 rounded-full bg-white/70 blur-[1px]" />
          <div className="pointer-events-none absolute right-8 top-8 h-20 w-20 rounded-full bg-white/10 blur-xl" />
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.26em] text-white/80">APM overview</p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight md:text-5xl">
                Monitor system health and service reliability
              </h1>
              <p className="mt-3 text-sm text-white/90 md:text-base">
                {incidentMessage}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/85">
                <SeverityBadge severity={incidentSeverity} text={severityText(incidentSeverity)} className="bg-white/95" />
                <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5">
                  Last refresh: {lastRefreshAt ? lastRefreshAt.toLocaleTimeString() : '—'}
                </span>
                <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5">
                  Auto refresh: 30s
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => load()}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 self-start rounded-full bg-[#0f1222] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 md:self-auto"
            >
              {loading || refreshing ? 'Refreshing...' : 'Refresh now'}
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 px-5 py-4">
            {error}
          </div>
        )}

        {loading && !overview && !channels && !links ? (
          <div className="flex items-center justify-center min-h-[220px]">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[var(--brand-color-2)]" />
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-gray-200/80 bg-white shadow-sm p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
                {overview && (
                  <SeverityBadge severity={overview.severity} text={severityText(overview.severity)} />
                )}
              </div>
              {overviewError ? (
                <p className="text-sm text-red-600">{overviewError}</p>
              ) : overview ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <button
                      type="button"
                      onClick={() => openOverviewPopup('environment')}
                      className="relative w-full cursor-pointer overflow-hidden rounded-[28px] border border-[#dbe4fb] bg-[linear-gradient(140deg,#f2f6ff_0%,#ffffff_45%,#deebff_100%)] p-6 min-h-[220px] text-left shadow-[0_16px_40px_rgba(14,14,57,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(14,14,57,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24539a]/50 focus-visible:ring-offset-2"
                      aria-label="Open current environment details"
                    >
                      <div className="absolute -top-8 -left-8 h-24 w-24 rounded-full bg-[#dbe8ff] blur-2xl opacity-80" />
                      <div className="absolute right-5 top-5 rounded-2xl border border-white/60 bg-white/55 p-2.5 backdrop-blur">
                        <Globe className="h-5 w-5 text-[#24539a]" />
                      </div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">Current environment</p>
                      <p className="mt-14 text-4xl font-semibold leading-none text-[#131a2c]">{overview.currentEnvironment}</p>
                      <p className="mt-3 text-sm text-gray-600">Active target for API and monitoring endpoints</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => openOverviewPopup('verification')}
                      className="relative w-full cursor-pointer overflow-hidden rounded-[28px] border border-[#dbe4fb] bg-[linear-gradient(145deg,#eef7ff_0%,#ffffff_42%,#d7f1ff_100%)] p-6 min-h-[220px] text-left shadow-[0_16px_40px_rgba(14,14,57,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(14,14,57,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24539a]/50 focus-visible:ring-offset-2"
                      aria-label="Open verification mode details"
                    >
                      <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-[#cdf0ff] blur-2xl opacity-80" />
                      <div className="absolute right-5 top-5 rounded-2xl border border-white/60 bg-white/55 p-2.5 backdrop-blur">
                        <ShieldCheck className="h-5 w-5 text-[#1d5a9a]" />
                      </div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">Verification mode</p>
                      <p className="mt-14 text-4xl font-semibold leading-none text-[#131a2c]">{overview.providerVerificationMode}</p>
                      <p className="mt-3 text-sm text-gray-600">Provider validation strategy in this environment</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => openOverviewPopup('dbProbe')}
                      className="relative w-full cursor-pointer overflow-hidden rounded-[28px] border border-[#dbe4fb] bg-[linear-gradient(145deg,#f3f7ff_0%,#ffffff_40%,#dbe7ff_100%)] p-6 min-h-[220px] text-left shadow-[0_16px_40px_rgba(14,14,57,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(14,14,57,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24539a]/50 focus-visible:ring-offset-2"
                      aria-label="Open database probe details"
                    >
                      <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-[#dfe8ff] blur-2xl opacity-80" />
                      <div className="absolute right-5 top-5 z-10 rounded-2xl border border-white/60 bg-white/55 p-2.5 backdrop-blur">
                        <Database className="h-5 w-5 text-[#295ea8]" />
                      </div>
                      <div className="flex items-center gap-2 pr-20">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500 flex-1">DB probe</p>
                      </div>
                      <p className="mt-11 text-4xl font-semibold leading-none text-[#131a2c]">
                        {overview.localMetrics.database.canConnect ? 'Connected' : 'Unavailable'}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-[#e8f0ff] px-2 py-1 text-[#1d4f91] font-medium">
                          Connect {overview.localMetrics.database.connectivityLatencyMs}ms
                        </span>
                        <span className="rounded-full bg-[#e8f0ff] px-2 py-1 text-[#1d4f91] font-medium">
                          Query {overview.localMetrics.database.sampleQueryLatencyMs}ms
                        </span>
                      </div>
                      <SeverityBadge
                        severity={overview.localMetrics.database.severity}
                        text={severityText(overview.localMetrics.database.severity)}
                        className="absolute right-5 bottom-5 z-20"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => openOverviewPopup('scheduler')}
                      className="relative w-full cursor-pointer overflow-hidden rounded-[28px] border border-[#dbe4fb] bg-[linear-gradient(140deg,#f0f6ff_0%,#ffffff_42%,#d9e7ff_100%)] p-6 min-h-[220px] text-left shadow-[0_16px_40px_rgba(14,14,57,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(14,14,57,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24539a]/50 focus-visible:ring-offset-2"
                      aria-label="Open scheduler details"
                    >
                      <div className="absolute -top-10 right-2 h-24 w-24 rounded-full bg-[#d5e6ff] blur-2xl opacity-85" />
                      <div className="absolute right-5 top-5 z-10 rounded-2xl border border-white/60 bg-white/55 p-2.5 backdrop-blur">
                        <Clock3 className="h-5 w-5 text-[#2f63ad]" />
                      </div>
                      <div className="flex items-center gap-2 pr-20">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500 flex-1">Scheduler</p>
                      </div>
                      <p className="mt-11 text-4xl font-semibold leading-none text-[#131a2c]">{overview.localMetrics.scheduler.storageType}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-[#e8f0ff] px-2 py-1 text-[#1d4f91] font-medium">
                          Recurring {overview.localMetrics.scheduler.recurringJobsCount}
                        </span>
                        <span className="rounded-full bg-[#e8f0ff] px-2 py-1 text-[#1d4f91] font-medium">
                          Enqueued {overview.localMetrics.scheduler.enqueuedCount}
                        </span>
                      </div>
                      <SeverityBadge
                        severity={overview.localMetrics.scheduler.severity}
                        text={severityText(overview.localMetrics.scheduler.severity)}
                        className="absolute right-5 bottom-5 z-20"
                      />
                    </button>
                  </div>

                  <div className="rounded-md border border-gray-200 p-3 text-sm text-gray-700">
                    Instance: <span className="font-medium">{overview.heartbeat.instanceId}</span> · Started: {formatDateTime(overview.heartbeat.startedAt)} · Last seen: {formatDateTime(overview.heartbeat.lastSeenAt)}
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-gray-200 p-4 xl:col-span-2">
                      <h3 className="text-sm font-semibold text-gray-800 mb-3">Operational KPI chart</h3>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={operationalKpiData} margin={{ top: 6, right: 12, left: 0, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={52} tick={{ fill: '#475569', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="value" fill={BRAND_COLORS.secondary} radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <h3 className="text-sm font-semibold text-gray-800 mb-3">Balance breakdown</h3>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={balanceData} dataKey="value" nameKey="name" cx="50%" cy="48%" outerRadius={95} innerRadius={58}>
                              {balanceData.map((entry) => (
                                <Cell key={entry.name} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Third-party readiness</h3>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={readinessChartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 11 }} />
                            <Tooltip formatter={(value) => [`${value}%`, 'Configured']} />
                            <Bar dataKey="configured" radius={[6, 6, 0, 0]}>
                              {readinessChartData.map((item) => (
                                <Cell key={item.name} fill={severityChartColor(item.severity)} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {readinessItems.map((item) => (
                          <div key={item.key} className="rounded-md border border-gray-200 p-3">
                            <p className="text-sm font-medium text-gray-900">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.provider}</p>
                            <SeverityBadge
                              severity={item.severity}
                              text={item.isConfigured ? `Configured (${severityText(item.severity)})` : `Not configured (${severityText(item.severity)})`}
                              className="mt-2"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">No overview data available.</p>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200/80 bg-white shadow-sm p-5 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Environment probes</h2>
              {overviewError ? (
                <p className="text-sm text-red-600">{overviewError}</p>
              ) : overview && overview.environmentProbes.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-gray-200 p-4 xl:col-span-2">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Probe latency by environment</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={probeLatencyData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} />
                          <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                          <Tooltip formatter={(value) => [`${value} ms`, 'Latency']} />
                          <Bar dataKey="latency" radius={[6, 6, 0, 0]}>
                            {probeLatencyData.map((item) => (
                              <Cell key={item.name} fill={severityChartColor(item.severity)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {overview.environmentProbes.map((probe) => (
                      <div key={probe.environment} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900 capitalize">{probe.environment}</p>
                          <SeverityBadge
                            severity={probe.severity}
                            text={probe.isReachable ? `Reachable (${severityText(probe.severity)})` : `Unreachable (${severityText(probe.severity)})`}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 break-all">{probe.baseUrl}</p>
                        <p className="text-sm text-gray-700 mt-2">Status: {probe.statusCode ?? 'N/A'}</p>
                        <p className="text-sm text-gray-700">Latency: {probe.latencyMs}ms</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No environment probe data available.</p>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200/80 bg-white shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Channel health</h2>
                {channels && (
                  <SeverityBadge severity={channels.severity} text={severityText(channels.severity)} />
                )}
              </div>
              {channelsError ? (
                <p className="text-sm text-red-600">{channelsError}</p>
              ) : channels && channels.channels.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <h3 className="text-sm font-semibold text-gray-800 mb-3">Dispatch vs pending recipients</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={channelDispatchData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="dispatched" fill={BRAND_COLORS.secondary} radius={[6, 6, 0, 0]} />
                            <Bar dataKey="pending" fill={BRAND_COLORS.soft} radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <h3 className="text-sm font-semibold text-gray-800 mb-3">API failures trend by channel (24h)</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={channelFailureData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="failures"
                              stroke={BRAND_COLORS.primary}
                              strokeWidth={3}
                              dot={{ r: 4, fill: BRAND_COLORS.primary }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-200 bg-transparent p-4">
                    <table className="w-full min-w-[760px]">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Channel</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Pending recipients</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Dispatched (24h)</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Failed API usages (24h)</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Severity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {channels.channels.map((item) => (
                          <tr key={item.channel} className="border-b border-gray-100 last:border-b-0">
                            <td className="py-3 px-4 font-medium text-gray-900">{item.channel}</td>
                            <td className="py-3 px-4 text-gray-700">{item.pendingRecipients}</td>
                            <td className="py-3 px-4 text-gray-700">{item.dispatchedLast24Hours}</td>
                            <td className="py-3 px-4 text-gray-700">{item.failedApiUsagesLast24Hours}</td>
                            <td className="py-3 px-4">
                              <SeverityBadge severity={item.severity} text={severityText(item.severity)} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No channel metrics available.</p>
              )}
              <p className="text-xs text-gray-500">Generated at: {formatDateTime(channels?.generatedAt)}</p>
            </section>

            <section className="rounded-2xl border border-gray-200/80 bg-white shadow-sm p-5 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Emergency dispatch controls</h2>
              {dispatchControlsError ? (
                <p className="text-sm text-red-600">{dispatchControlsError}</p>
              ) : emergencyMatrix ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-gray-200 p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Global outbound messaging</p>
                      <p className="text-xs text-gray-500">
                        Environment: {emergencyMatrix.environment} | Updated:{' '}
                        {formatDateTime(emergencyMatrix.global.updatedAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGlobalPauseToggle}
                      disabled={updatingGlobalPause}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                        emergencyMatrix.global.isPaused
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      } disabled:opacity-60`}
                    >
                      {updatingGlobalPause
                        ? 'Updating...'
                        : emergencyMatrix.global.isPaused
                          ? 'Paused (resume)'
                          : 'Running (pause)'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                    {emergencyMatrix.channels.map((item) => (
                      <div key={item.channel} className="rounded-lg border border-gray-200 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">{item.channel}</p>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              item.isPaused ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {item.isPaused ? 'Paused' : 'Running'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleChannelPauseToggle(item.channel, item.isPaused)}
                          disabled={Boolean(updatingChannel)}
                          className="mt-3 text-xs px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-60"
                        >
                          {updatingChannel === item.channel
                            ? 'Updating...'
                            : item.isPaused
                              ? 'Resume channel'
                              : 'Pause channel'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No emergency controls available.</p>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200/80 bg-white shadow-sm p-5 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Abnormal spike alerts</h2>
              {alertsError ? (
                <p className="text-sm text-red-600">{alertsError}</p>
              ) : alerts && reliabilitySummary ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div className="rounded-lg border border-gray-200 px-3 py-2">Open: {reliabilitySummary.openCount}</div>
                    <div className="rounded-lg border border-gray-200 px-3 py-2">Critical: {alerts.counters.critical}</div>
                    <div className="rounded-lg border border-gray-200 px-3 py-2">High: {alerts.counters.high}</div>
                    <div className="rounded-lg border border-gray-200 px-3 py-2">Medium: {alerts.counters.medium}</div>
                    <div className="rounded-lg border border-gray-200 px-3 py-2">
                      Headline: {reliabilitySummary.headlineSeverity}
                    </div>
                  </div>

                  {reliabilitySummary.topAlerts.length > 0 ? (
                    <div className="space-y-2">
                      {reliabilitySummary.topAlerts.map((alert) => (
                        <div key={alert.alertKey} className="rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                            <span className="text-xs uppercase tracking-wide text-gray-500">{alert.severity}</span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{alert.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {alert.environment ?? 'unknown'} {alert.channel ? `| ${alert.channel}` : ''} |{' '}
                            {formatDateTime(alert.observedAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No active reliability alerts.</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No reliability alerts available.</p>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200/80 bg-white shadow-sm p-5 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Observability links</h2>
              {linksError ? (
                <p className="text-sm text-red-600">{linksError}</p>
              ) : links ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {[links.production, links.staging].map((group) => (
                    <div
                      key={group.environment}
                      className="rounded-xl border border-[#d1d9ef] bg-gradient-to-br from-[#f8faff] to-white p-4"
                    >
                      <h3 className="text-sm font-semibold text-gray-900 capitalize">{group.environment}</h3>
                      <div className="mt-3 space-y-2 text-sm">
                        <a className="block text-[var(--brand-color-2)] hover:underline break-all" href={group.apiBaseUrl} target="_blank" rel="noreferrer">
                          API Base: {group.apiBaseUrl}
                        </a>
                        <a className="block text-[var(--brand-color-2)] hover:underline break-all" href={group.hangfireDashboardUrl} target="_blank" rel="noreferrer">
                          Hangfire: {group.hangfireDashboardUrl}
                        </a>
                        <a className="block text-[var(--brand-color-2)] hover:underline break-all" href={group.seqUrl} target="_blank" rel="noreferrer">
                          Seq: {group.seqUrl}
                        </a>
                        {group.grafanaUrl ? (
                          <a className="block text-[var(--brand-color-2)] hover:underline break-all" href={group.grafanaUrl} target="_blank" rel="noreferrer">
                            Grafana: {group.grafanaUrl}
                          </a>
                        ) : (
                          <p className="text-gray-500">Grafana: not configured</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No observability links available.</p>
              )}
            </section>
          </>
        )}
        {selectedOverviewCard && overview ? (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onClick={closeOverviewPopup}
            role="dialog"
            aria-modal="true"
            aria-labelledby="overview-card-dialog-title"
          >
            <div
              className={`flex w-full max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-2xl ${
                selectedOverviewCard === 'scheduler' ? 'max-w-4xl' : 'max-w-2xl'
              }`}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 id="overview-card-dialog-title" className="text-base font-semibold text-slate-900">
                    {selectedOverviewCard === 'environment' && 'Current environment details'}
                    {selectedOverviewCard === 'verification' && 'Verification mode details'}
                    {selectedOverviewCard === 'dbProbe' && 'DB probe details'}
                    {selectedOverviewCard === 'scheduler' && 'Scheduler details'}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">APM overview quick details and actions.</p>
                </div>
                <button
                  type="button"
                  onClick={closeOverviewPopup}
                  className="inline-flex rounded-lg border border-slate-200 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                  aria-label="Close overview details popup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
                {selectedOverviewCard === 'environment' && (
                  <>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Current environment</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-900">{overview.currentEnvironment}</p>
                      <p className="mt-2 text-sm text-slate-700">
                        Route namespace: <span className="font-medium">{basePath}</span> | API env: <span className="font-medium">{env}</span>
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <a
                        href="/admin"
                        className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 transition-colors hover:bg-slate-50"
                      >
                        Production backoffice
                        <p className="mt-1 text-xs text-slate-500">Open /admin</p>
                      </a>
                      <a
                        href="https://dev-ballo-ads.web.app/"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 transition-colors hover:bg-slate-50"
                      >
                        Staging frontend
                        <p className="mt-1 text-xs text-slate-500">Open dev-ballo-ads.web.app</p>
                      </a>
                      <a
                        href={`${basePath}/apm`}
                        className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 transition-colors hover:bg-slate-50"
                      >
                        Current APM route
                        <p className="mt-1 text-xs text-slate-500">Open {basePath}/apm</p>
                      </a>
                      <a
                        href={basePath === '/admin' ? '/staging-admin/apm' : '/admin/apm'}
                        className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 transition-colors hover:bg-slate-50"
                      >
                        Alternate APM route
                        <p className="mt-1 text-xs text-slate-500">
                          Open {basePath === '/admin' ? '/staging-admin/apm' : '/admin/apm'}
                        </p>
                      </a>
                    </div>
                  </>
                )}

                {selectedOverviewCard === 'verification' && (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Verification mode</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-900">{overview.providerVerificationMode}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700">
                      <p className="font-medium text-slate-900">Operational impact</p>
                      <p className="mt-1">
                        {overview.providerVerificationMode.toLowerCase() === 'internal-only'
                          ? 'Provider validation is restricted to internal traffic and controlled checks.'
                          : `Provider validation uses "${overview.providerVerificationMode}" for this environment.`}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Use this signal together with readiness and channel health when investigating dispatch anomalies.
                      </p>
                    </div>
                  </div>
                )}

                {selectedOverviewCard === 'dbProbe' && (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">DB connectivity</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-900">
                        {overview.localMetrics.database.canConnect ? 'Connected' : 'Unavailable'}
                      </p>
                      <div className="mt-2">
                        <SeverityBadge
                          severity={overview.localMetrics.database.severity}
                          text={severityText(overview.localMetrics.database.severity)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="rounded-lg border border-slate-200 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Connect latency</p>
                        <p className="mt-1 text-xl font-semibold text-slate-900">
                          {overview.localMetrics.database.connectivityLatencyMs} ms
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Sample query latency</p>
                        <p className="mt-1 text-xl font-semibold text-slate-900">
                          {overview.localMetrics.database.sampleQueryLatencyMs} ms
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedOverviewCard === 'scheduler' && (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Scheduler storage</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-900">{overview.localMetrics.scheduler.storageType}</p>
                      <div className="mt-2">
                        <SeverityBadge
                          severity={overview.localMetrics.scheduler.severity}
                          text={severityText(overview.localMetrics.scheduler.severity)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                        <p className="text-slate-500">Recurring</p>
                        <p className="font-semibold text-slate-900">{overview.localMetrics.scheduler.recurringJobsCount}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                        <p className="text-slate-500">Enqueued</p>
                        <p className="font-semibold text-slate-900">{overview.localMetrics.scheduler.enqueuedCount}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                        <p className="text-slate-500">Processing</p>
                        <p className="font-semibold text-slate-900">{overview.localMetrics.scheduler.processingCount}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                        <p className="text-slate-500">Failed</p>
                        <p className="font-semibold text-slate-900">{overview.localMetrics.scheduler.failedCount}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                        <p className="text-slate-500">Scheduled</p>
                        <p className="font-semibold text-slate-900">{overview.localMetrics.scheduler.scheduledCount}</p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white/80 p-4">
                      <p className="text-sm font-semibold text-slate-900">Recurring jobs</p>
                      <p className="mt-2 text-xs text-slate-500">
                        Job controls are not available in this environment.
                        View the Hangfire dashboard for individual job management.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end border-t border-slate-100 px-5 py-4">
                <button
                  type="button"
                  onClick={closeOverviewPopup}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}
        {confirmDialog}
      </div>
    </div>
  )
}
