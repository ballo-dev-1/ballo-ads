'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminApi, type ApmChannelHealthResponse, type ApmLinksResponse, type ApmOverviewResponse } from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'

function statusBadge(ok: boolean) {
  return ok
    ? 'bg-green-100 text-green-700 border border-green-200'
    : 'bg-red-100 text-red-700 border border-red-200'
}

function formatDateTime(value?: string) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString()
}

export default function ApmPage() {
  const { env } = useApiEnv()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [overview, setOverview] = useState<ApmOverviewResponse | null>(null)
  const [channels, setChannels] = useState<ApmChannelHealthResponse | null>(null)
  const [links, setLinks] = useState<ApmLinksResponse | null>(null)
  const [overviewError, setOverviewError] = useState('')
  const [channelsError, setChannelsError] = useState('')
  const [linksError, setLinksError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    setOverviewError('')
    setChannelsError('')
    setLinksError('')

    const [overviewRes, channelsRes, linksRes] = await Promise.allSettled([
      adminApi.getApmOverview(),
      adminApi.getApmChannels(),
      adminApi.getApmLinks(),
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

    if (failureCount === 3) {
      setError('Unable to load APM data. You may not have access (401/403) or the service is unavailable.')
    } else if (failureCount > 0) {
      setError('Some APM sections are unavailable right now. Partial data is shown below.')
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [env, load])

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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <header className="rounded-xl p-5 bg-[whitesmoke] border border-gray-200/80 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">APM Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Backend health, channel flow, and observability links across staging and production.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[var(--brand-color-2)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </header>

        {error && (
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 px-5 py-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[220px]">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[var(--brand-color-2)]" />
          </div>
        ) : (
          <>
            <section className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
              {overviewError ? (
                <p className="text-sm text-red-600">{overviewError}</p>
              ) : overview ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Current environment</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">{overview.currentEnvironment}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Verification mode</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">{overview.providerVerificationMode}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500">DB probe</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">
                        {overview.localMetrics.database.canConnect ? 'Connected' : 'Unavailable'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {overview.localMetrics.database.connectivityLatencyMs}ms connect / {overview.localMetrics.database.sampleQueryLatencyMs}ms query
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Scheduler</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">{overview.localMetrics.scheduler.storageType}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        recurring {overview.localMetrics.scheduler.recurringJobsCount}, enqueued {overview.localMetrics.scheduler.enqueuedCount}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Operational KPIs</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 text-sm">
                      <div className="rounded-md border border-gray-200 p-3">Active campaigns: {overview.localMetrics.operationalKpis.activeCampaigns}</div>
                      <div className="rounded-md border border-gray-200 p-3">Pending campaigns: {overview.localMetrics.operationalKpis.pendingCampaigns}</div>
                      <div className="rounded-md border border-gray-200 p-3">Completed (24h): {overview.localMetrics.operationalKpis.completedCampaignsLast24Hours}</div>
                      <div className="rounded-md border border-gray-200 p-3">Active purchase orders: {overview.localMetrics.operationalKpis.activePurchaseOrders}</div>
                      <div className="rounded-md border border-gray-200 p-3">Failed purchase orders (24h): {overview.localMetrics.operationalKpis.failedPurchaseOrdersLast24Hours}</div>
                      <div className="rounded-md border border-gray-200 p-3">API failures (24h): {overview.localMetrics.operationalKpis.apiUsageFailuresLast24Hours}</div>
                      <div className="rounded-md border border-gray-200 p-3">SMS balance: {overview.localMetrics.operationalKpis.smsBalance}</div>
                      <div className="rounded-md border border-gray-200 p-3">Email balance: {overview.localMetrics.operationalKpis.emailBalance}</div>
                      <div className="rounded-md border border-gray-200 p-3">WhatsApp balance: {overview.localMetrics.operationalKpis.whatsAppBalance}</div>
                      <div className="rounded-md border border-gray-200 p-3">WhatsApp utility balance: {overview.localMetrics.operationalKpis.whatsAppUtilityBalance}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Third-party readiness</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                      {readinessItems.map((item) => (
                        <div key={item.key} className="rounded-md border border-gray-200 p-3">
                          <p className="text-sm font-medium text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.provider}</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs mt-2 ${statusBadge(item.isConfigured)}`}>
                            {item.isConfigured ? 'Configured' : 'Not configured'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">No overview data available.</p>
              )}
            </section>

            <section className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Environment probes</h2>
              {overviewError ? (
                <p className="text-sm text-red-600">{overviewError}</p>
              ) : overview && overview.environmentProbes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {overview.environmentProbes.map((probe) => (
                    <div key={probe.environment} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 capitalize">{probe.environment}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${statusBadge(probe.isReachable)}`}>
                          {probe.isReachable ? 'Reachable' : 'Unreachable'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 break-all">{probe.baseUrl}</p>
                      <p className="text-sm text-gray-700 mt-2">Status: {probe.statusCode ?? 'N/A'}</p>
                      <p className="text-sm text-gray-700">Latency: {probe.latencyMs}ms</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No environment probe data available.</p>
              )}
            </section>

            <section className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Channel health</h2>
              {channelsError ? (
                <p className="text-sm text-red-600">{channelsError}</p>
              ) : channels && channels.channels.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Channel</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Pending recipients</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Dispatched (24h)</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Failed API usages (24h)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channels.channels.map((item) => (
                        <tr key={item.channel} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium text-gray-900">{item.channel}</td>
                          <td className="py-3 px-4 text-gray-700">{item.pendingRecipients}</td>
                          <td className="py-3 px-4 text-gray-700">{item.dispatchedLast24Hours}</td>
                          <td className="py-3 px-4 text-gray-700">{item.failedApiUsagesLast24Hours}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No channel metrics available.</p>
              )}
              <p className="text-xs text-gray-500">Generated at: {formatDateTime(channels?.generatedAt)}</p>
            </section>

            <section className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Observability links</h2>
              {linksError ? (
                <p className="text-sm text-red-600">{linksError}</p>
              ) : links ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {[links.production, links.staging].map((group) => (
                    <div key={group.environment} className="rounded-lg border border-gray-200 p-4">
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
      </div>
    </div>
  )
}
