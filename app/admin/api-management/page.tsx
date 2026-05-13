'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  adminApi,
  type ApiClientCreateResponse,
  type ApiClientResponse,
  type ApiUsageSummary,
  type CompanyLeanResponse,
} from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import AdminHero from '@/app/admin/components/AdminHero'
import CompanyMessagingCreditsPanel from '@/app/admin/components/CompanyMessagingCreditsPanel'
import { useConfirmDialog } from '@/app/admin/components/useConfirmDialog'
import { notifyBackofficeEvent } from '@/lib/notifications/client'
import { LoadingSpinner } from '@/app/components/LoadingSpinner'

const CHANNEL_OPTIONS = ['Sms', 'Email', 'WhatsApp', 'WhatsAppUtility'] as const

export default function ApiManagementPage() {
  const { env } = useApiEnv()
  const [companies, setCompanies] = useState<CompanyLeanResponse[]>([])
  const [companyId, setCompanyId] = useState<number | null>(null)
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [loadingClients, setLoadingClients] = useState(false)
  const [loadingUsage, setLoadingUsage] = useState(false)
  const [savingClient, setSavingClient] = useState(false)
  const [messagingCreditsRefreshNonce, setMessagingCreditsRefreshNonce] = useState(0)
  const [rotatingId, setRotatingId] = useState<number | null>(null)
  const [revokingId, setRevokingId] = useState<number | null>(null)
  const { confirm, confirmDialog } = useConfirmDialog()

  const [apiClients, setApiClients] = useState<ApiClientResponse[]>([])
  const [usageSummary, setUsageSummary] = useState<ApiUsageSummary | null>(null)
  const [lastCreatedKey, setLastCreatedKey] = useState<ApiClientCreateResponse | null>(null)
  const [usageFilterApiClientId, setUsageFilterApiClientId] = useState<number | undefined>(
    undefined,
  )

  const [clientForm, setClientForm] = useState({
    name: '',
    requestsPerMinuteLimit: '',
    allowedChannels: ['Sms'] as string[],
    isTestKey: false,
  })

  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === companyId) ?? null,
    [companies, companyId],
  )

  const loadCompanies = async () => {
    setLoadingCompanies(true)
    try {
      const list = await adminApi.getCompanies()
      setCompanies(list)
      if (list.length > 0) {
        setCompanyId((prev) => prev ?? list[0].id)
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load companies')
    } finally {
      setLoadingCompanies(false)
    }
  }

  const loadApiClients = async (targetCompanyId: number) => {
    setLoadingClients(true)
    try {
      const list = await adminApi.getCompanyApiClients(targetCompanyId)
      setApiClients(list)
      setUsageFilterApiClientId(undefined)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load API clients')
      setApiClients([])
    } finally {
      setLoadingClients(false)
    }
  }

  const loadUsage = async (targetCompanyId: number, targetApiClientId?: number) => {
    setLoadingUsage(true)
    try {
      const summary = await adminApi.getCompanyApiUsage(targetCompanyId, targetApiClientId)
      setUsageSummary(summary)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load usage summary')
      setUsageSummary(null)
    } finally {
      setLoadingUsage(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [env])

  useEffect(() => {
    if (!companyId) return
    setLastCreatedKey(null)
    loadApiClients(companyId)
    loadUsage(companyId)
  }, [companyId, env])

  const toggleChannel = (channel: string) => {
    setClientForm((prev) => {
      const exists = prev.allowedChannels.includes(channel)
      const next = exists
        ? prev.allowedChannels.filter((x) => x !== channel)
        : [...prev.allowedChannels, channel]
      return { ...prev, allowedChannels: next }
    })
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId) return
    if (!clientForm.name.trim()) {
      toast.error('Client name is required')
      return
    }
    if (clientForm.allowedChannels.length === 0) {
      toast.error('Select at least one channel')
      return
    }

    const rpm =
      clientForm.requestsPerMinuteLimit.trim() === ''
        ? undefined
        : Number(clientForm.requestsPerMinuteLimit)
    if (rpm !== undefined && (!Number.isFinite(rpm) || rpm <= 0)) {
      toast.error('Requests per minute must be a positive number')
      return
    }

    setSavingClient(true)
    try {
      const created = await adminApi.createCompanyApiClient(companyId, {
        name: clientForm.name.trim(),
        allowedChannels: clientForm.allowedChannels,
        requestsPerMinuteLimit: rpm,
        isTestKey: clientForm.isTestKey,
      })
      setLastCreatedKey(created)
      toast.success('API client created')
      setClientForm({
        name: '',
        requestsPerMinuteLimit: '',
        allowedChannels: ['Sms'],
        isTestKey: false,
      })
      await loadApiClients(companyId)
      await loadUsage(companyId, usageFilterApiClientId)
      setMessagingCreditsRefreshNonce((n) => n + 1)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create API client')
    } finally {
      setSavingClient(false)
    }
  }

  const handleRotate = async (apiClientId: number) => {
    if (!companyId) return
    const approved = await confirm({
      title: 'Rotate API key',
      description: 'Rotate API key for this client? The old key will stop working.',
      confirmLabel: 'Rotate key',
      tone: 'danger',
    })
    if (!approved) {
      return
    }
    setRotatingId(apiClientId)
    try {
      const rotated = await adminApi.rotateCompanyApiClientKey(companyId, apiClientId)
      setLastCreatedKey(rotated)
      await notifyBackofficeEvent("api_key_rotated", {
        companyId,
        companyName: selectedCompany?.name ?? "Company",
      })
      toast.success('API key rotated')
      await loadApiClients(companyId)
      setMessagingCreditsRefreshNonce((n) => n + 1)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to rotate API key')
    } finally {
      setRotatingId(null)
    }
  }

  const handleRevoke = async (apiClientId: number) => {
    if (!companyId) return
    const approved = await confirm({
      title: 'Revoke API client',
      description: 'Revoke this API client? This cannot be undone from here.',
      confirmLabel: 'Revoke',
      tone: 'danger',
    })
    if (!approved) {
      return
    }
    setRevokingId(apiClientId)
    try {
      await adminApi.revokeCompanyApiClient(companyId, apiClientId)
      await notifyBackofficeEvent("api_key_revoked", {
        companyId,
        companyName: selectedCompany?.name ?? "Company",
      })
      toast.success('API client revoked')
      await loadApiClients(companyId)
      await loadUsage(companyId, usageFilterApiClientId)
      setMessagingCreditsRefreshNonce((n) => n + 1)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to revoke API client')
    } finally {
      setRevokingId(null)
    }
  }

  const handleUsageRefresh = async () => {
    if (!companyId) return
    await loadUsage(companyId, usageFilterApiClientId)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <AdminHero
          eyebrow="Developer platform"
          title="API management"
          description="Manage company API clients, messaging credit balances (campaigns and API), and usage."
          variant="teal"
        />

        <section className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select company</label>
          {loadingCompanies ? (
            <div className="flex items-center justify-center py-6">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-[var(--admin-ui-accent)]" />
            </div>
          ) : (
            <select
              value={companyId ?? ''}
              onChange={(e) => setCompanyId(Number(e.target.value))}
              className="w-full max-w-lg border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name ?? `Company #${company.id}`}
                </option>
              ))}
            </select>
          )}
          {selectedCompany ? (
            <p className="mt-2 text-xs text-gray-500">
              Selected: <span className="font-medium text-gray-700">{selectedCompany.name}</span>
            </p>
          ) : null}
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-900">Create API client</h2>
            <form onSubmit={handleCreateClient} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={clientForm.name}
                  onChange={(e) => setClientForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Partner integration"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requests per minute (optional)
                </label>
                <input
                  type="number"
                  min={1}
                  value={clientForm.requestsPerMinuteLimit}
                  onChange={(e) =>
                    setClientForm((p) => ({ ...p, requestsPerMinuteLimit: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g. 120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key mode</label>
                <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setClientForm((p) => ({ ...p, isTestKey: false }))}
                    className={`px-3 py-2 text-sm ${
                      clientForm.isTestKey
                        ? 'bg-white text-gray-700'
                        : 'bg-[var(--brand-color-1)] text-white'
                    }`}
                  >
                    Live
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientForm((p) => ({ ...p, isTestKey: true }))}
                    className={`px-3 py-2 text-sm border-l border-gray-300 ${
                      clientForm.isTestKey
                        ? 'bg-[var(--brand-color-1)] text-white'
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    Test
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Test keys append <span className="font-mono">[TRIAL]</span> to message content.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed channels
                </label>
                <div className="flex flex-wrap gap-2">
                  {CHANNEL_OPTIONS.map((channel) => {
                    const selected = clientForm.allowedChannels.includes(channel)
                    return (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => toggleChannel(channel)}
                        className={`px-3 py-1.5 rounded-full text-xs border ${
                          selected
                            ? 'bg-[var(--brand-color-1)] text-white border-[var(--brand-color-1)]'
                            : 'bg-white text-gray-700 border-gray-300'
                        }`}
                      >
                        {channel}
                      </button>
                    )
                  })}
                </div>
              </div>
              <button
                type="submit"
                disabled={!companyId || savingClient}
                className="px-4 py-2 rounded-lg bg-[var(--brand-color-1)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {savingClient ? 'Creating...' : 'Create API client'}
              </button>
            </form>

            {lastCreatedKey ? (
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-semibold text-amber-700">
                  Latest key ({lastCreatedKey.isTestKey ? 'TEST' : 'LIVE'})
                </p>
                <p className="mt-1 text-xs text-amber-700 break-all">{lastCreatedKey.apiKey}</p>
              </div>
            ) : null}
          </section>

          <section className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-900">Messaging credits</h2>
            {companyId ? (
              <CompanyMessagingCreditsPanel
                companyId={companyId}
                companyName={selectedCompany?.name ?? `Company #${companyId}`}
                refreshNonce={messagingCreditsRefreshNonce}
                onAllocated={() => loadUsage(companyId, usageFilterApiClientId)}
              />
            ) : null}
          </section>
        </div>

        <section className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-gray-900">API clients</h2>
            <button
              type="button"
              onClick={() => {
                if (!companyId) return
                loadApiClients(companyId)
                setMessagingCreditsRefreshNonce((n) => n + 1)
              }}
              disabled={!companyId || loadingClients}
              className="text-sm text-[var(--admin-ui-accent)] hover:underline disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
          {loadingClients ? (
            <div className="mt-4 flex items-center justify-center py-6">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-[var(--admin-ui-accent)]" />
            </div>
          ) : apiClients.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No API clients found.</p>
          ) : (
            <div className="mt-4 overflow-x-auto border border-gray-200 rounded-lg bg-transparent p-4">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs uppercase text-gray-600">Name</th>
                    <th className="text-left px-3 py-2 text-xs uppercase text-gray-600">Prefix</th>
                    <th className="text-left px-3 py-2 text-xs uppercase text-gray-600">Channels</th>
                    <th className="text-left px-3 py-2 text-xs uppercase text-gray-600">Mode</th>
                    <th className="text-left px-3 py-2 text-xs uppercase text-gray-600">RPM</th>
                    <th className="text-left px-3 py-2 text-xs uppercase text-gray-600">API Key</th>
                    <th className="text-left px-3 py-2 text-xs uppercase text-gray-600">Status</th>
                    <th className="text-right px-3 py-2 text-xs uppercase text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {apiClients.map((client) => (
                    <tr key={client.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-3 py-2">{client.name}</td>
                      <td className="px-3 py-2 font-mono text-xs">{client.keyPrefix}</td>
                      <td className="px-3 py-2">{client.allowedChannels.join(', ') || '-'}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            client.isTestKey
                              ? 'border border-amber-200 bg-amber-50 text-amber-700'
                              : 'border border-[color-mix(in_srgb,var(--admin-ui-accent)_22%,var(--admin-card-border))] bg-[color-mix(in_srgb,var(--admin-ui-accent)_10%,var(--admin-card))] text-[var(--admin-heading)]'
                          }`}
                        >
                          {client.isTestKey ? 'TEST' : 'LIVE'}
                        </span>
                      </td>
                      <td className="px-3 py-2">{client.requestsPerMinuteLimit ?? '-'}</td>
                      <td className="px-3 py-2">
                        {client.apiKey ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs break-all">{client.apiKey}</span>
                            <button
                              type="button"
                              onClick={async () => {
                                await navigator.clipboard.writeText(client.apiKey ?? '')
                                toast.success('API key copied')
                              }}
                              className="text-xs text-[var(--admin-ui-accent)] hover:underline"
                            >
                              Copy
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Unavailable</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            client.isRevoked
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {client.isRevoked ? 'Revoked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleRotate(client.id)}
                          disabled={client.isRevoked || rotatingId === client.id}
                          className="text-xs text-[var(--admin-ui-accent)] hover:underline disabled:opacity-40"
                        >
                          {rotatingId === client.id ? 'Rotating...' : 'Rotate key'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRevoke(client.id)}
                          disabled={client.isRevoked || revokingId === client.id}
                          className="text-xs text-red-600 hover:underline disabled:opacity-40"
                        >
                          {revokingId === client.id ? 'Revoking...' : 'Revoke'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-gray-900">Usage summary</h2>
            <div className="flex items-center gap-2">
              <select
                value={usageFilterApiClientId ?? ''}
                onChange={(e) => {
                  const value = e.target.value
                  setUsageFilterApiClientId(value ? Number(value) : undefined)
                }}
                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              >
                <option value="">All API clients</option>
                {apiClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleUsageRefresh}
                disabled={!companyId || loadingUsage}
                className="inline-flex items-center gap-2 text-sm text-[var(--admin-ui-accent)] hover:underline disabled:opacity-50"
              >
                {loadingUsage ? (
                  <>
                    <LoadingSpinner size="sm" className="border-t-[var(--admin-ui-accent)]" />
                    <span className="sr-only">Loading usage</span>
                  </>
                ) : null}
                <span>{loadingUsage ? 'Refreshing…' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {usageSummary ? (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatCard label="Total attempts" value={String(usageSummary.total)} />
                <StatCard label="Success" value={String(usageSummary.successCount)} />
                <StatCard label="Failure" value={String(usageSummary.failureCount)} />
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-transparent p-4">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs uppercase text-gray-600">Channel</th>
                      <th className="text-left px-3 py-2 text-xs uppercase text-gray-600">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(usageSummary.byChannel).length === 0 ? (
                      <tr>
                        <td className="px-3 py-3 text-gray-500" colSpan={2}>
                          No usage records yet.
                        </td>
                      </tr>
                    ) : (
                      Object.entries(usageSummary.byChannel).map(([channel, count]) => (
                        <tr key={channel} className="border-b border-gray-100 last:border-0">
                          <td className="px-3 py-2">{channel}</td>
                          <td className="px-3 py-2">{count}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : loadingUsage ? (
            <div className="mt-4 flex items-center justify-center py-6">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-[var(--admin-ui-accent)]" />
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">No usage data available.</p>
          )}
        </section>
        {confirmDialog}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}
