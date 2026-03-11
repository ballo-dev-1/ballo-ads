'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  adminApi,
  type ApiCreditBalanceResponse,
  type ApiClientCreateResponse,
  type ApiClientResponse,
  type ApiUsageSummary,
  type CompanyLeanResponse,
} from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'

const CHANNEL_OPTIONS = ['Sms', 'Email', 'WhatsApp', 'WhatsAppUtility'] as const

export default function ApiManagementPage() {
  const { env } = useApiEnv()
  const [companies, setCompanies] = useState<CompanyLeanResponse[]>([])
  const [companyId, setCompanyId] = useState<number | null>(null)
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [loadingClients, setLoadingClients] = useState(false)
  const [loadingUsage, setLoadingUsage] = useState(false)
  const [loadingCreditBalance, setLoadingCreditBalance] = useState(false)
  const [savingClient, setSavingClient] = useState(false)
  const [allocating, setAllocating] = useState(false)
  const [rotatingId, setRotatingId] = useState<number | null>(null)
  const [revokingId, setRevokingId] = useState<number | null>(null)

  const [apiClients, setApiClients] = useState<ApiClientResponse[]>([])
  const [usageSummary, setUsageSummary] = useState<ApiUsageSummary | null>(null)
  const [creditBalance, setCreditBalance] = useState<ApiCreditBalanceResponse | null>(null)
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

  const [allocationForm, setAllocationForm] = useState({
    smsCount: '0',
    emailCount: '0',
    whatsAppCount: '0',
    whatsAppUtilityCount: '0',
    notes: '',
    durationDays: '30',
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

  const loadCreditBalance = async (targetCompanyId: number) => {
    setLoadingCreditBalance(true)
    try {
      const balance = await adminApi.getCompanyApiCreditBalance(targetCompanyId)
      setCreditBalance(balance)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load API credit balance')
      setCreditBalance(null)
    } finally {
      setLoadingCreditBalance(false)
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
    loadCreditBalance(companyId)
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
      await loadCreditBalance(companyId)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create API client')
    } finally {
      setSavingClient(false)
    }
  }

  const handleRotate = async (apiClientId: number) => {
    if (!companyId) return
    if (!window.confirm('Rotate API key for this client? The old key will stop working.')) {
      return
    }
    setRotatingId(apiClientId)
    try {
      const rotated = await adminApi.rotateCompanyApiClientKey(companyId, apiClientId)
      setLastCreatedKey(rotated)
      toast.success('API key rotated')
      await loadApiClients(companyId)
      await loadCreditBalance(companyId)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to rotate API key')
    } finally {
      setRotatingId(null)
    }
  }

  const handleRevoke = async (apiClientId: number) => {
    if (!companyId) return
    if (!window.confirm('Revoke this API client? This cannot be undone from here.')) {
      return
    }
    setRevokingId(apiClientId)
    try {
      await adminApi.revokeCompanyApiClient(companyId, apiClientId)
      toast.success('API client revoked')
      await loadApiClients(companyId)
      await loadUsage(companyId, usageFilterApiClientId)
      await loadCreditBalance(companyId)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to revoke API client')
    } finally {
      setRevokingId(null)
    }
  }

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId) return

    const smsCount = Number(allocationForm.smsCount || '0')
    const emailCount = Number(allocationForm.emailCount || '0')
    const whatsAppCount = Number(allocationForm.whatsAppCount || '0')
    const whatsAppUtilityCount = Number(allocationForm.whatsAppUtilityCount || '0')
    const durationDays =
      allocationForm.durationDays.trim() === ''
        ? undefined
        : Number(allocationForm.durationDays)

    const values = [smsCount, emailCount, whatsAppCount, whatsAppUtilityCount]
    if (values.some((x) => !Number.isFinite(x) || x < 0)) {
      toast.error('Counts must be zero or positive numbers')
      return
    }
    if (smsCount + emailCount + whatsAppCount + whatsAppUtilityCount <= 0) {
      toast.error('Allocate at least one message credit')
      return
    }
    if (durationDays !== undefined && (!Number.isFinite(durationDays) || durationDays <= 0)) {
      toast.error('Duration days must be a positive number')
      return
    }

    setAllocating(true)
    try {
      await adminApi.allocateCompanyApiCredits(companyId, {
        smsCount,
        emailCount,
        whatsAppCount,
        whatsAppUtilityCount,
        notes: allocationForm.notes.trim() || undefined,
        durationDays,
      })
      toast.success('Credits allocated successfully')
      setAllocationForm({
        smsCount: '0',
        emailCount: '0',
        whatsAppCount: '0',
        whatsAppUtilityCount: '0',
        notes: '',
        durationDays: '30',
      })
      await loadUsage(companyId, usageFilterApiClientId)
      await loadCreditBalance(companyId)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to allocate credits')
    } finally {
      setAllocating(false)
    }
  }

  const handleUsageRefresh = async () => {
    if (!companyId) return
    await loadUsage(companyId, usageFilterApiClientId)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <header className="rounded-xl p-5 bg-[whitesmoke] border border-gray-200/80">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">API Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage company API clients, manual message allocations, and usage.
          </p>
        </header>

        <section className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select company</label>
          {loadingCompanies ? (
            <p className="text-sm text-gray-500">Loading companies...</p>
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
                        : 'bg-[#0e0e39] text-white'
                    }`}
                  >
                    Live
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientForm((p) => ({ ...p, isTestKey: true }))}
                    className={`px-3 py-2 text-sm border-l border-gray-300 ${
                      clientForm.isTestKey
                        ? 'bg-[#0e0e39] text-white'
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
                            ? 'bg-[#0e0e39] text-white border-[#0e0e39]'
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
                className="px-4 py-2 rounded-lg bg-[#0e0e39] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
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
            <h2 className="text-lg font-semibold text-gray-900">Allocate API credits</h2>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <StatCard
                label="SMS balance"
                value={loadingCreditBalance ? '...' : String(creditBalance?.smsCount ?? 0)}
              />
              <StatCard
                label="Email balance"
                value={loadingCreditBalance ? '...' : String(creditBalance?.emailCount ?? 0)}
              />
              <StatCard
                label="WhatsApp balance"
                value={loadingCreditBalance ? '...' : String(creditBalance?.whatsAppCount ?? 0)}
              />
              <StatCard
                label="WA Utility balance"
                value={loadingCreditBalance ? '...' : String(creditBalance?.whatsAppUtilityCount ?? 0)}
              />
            </div>
            <form onSubmit={handleAllocate} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="SMS">
                  <input
                    type="number"
                    min={0}
                    value={allocationForm.smsCount}
                    onChange={(e) =>
                      setAllocationForm((p) => ({ ...p, smsCount: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="number"
                    min={0}
                    value={allocationForm.emailCount}
                    onChange={(e) =>
                      setAllocationForm((p) => ({ ...p, emailCount: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </Field>
                <Field label="WhatsApp">
                  <input
                    type="number"
                    min={0}
                    value={allocationForm.whatsAppCount}
                    onChange={(e) =>
                      setAllocationForm((p) => ({ ...p, whatsAppCount: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </Field>
                <Field label="WhatsApp Utility">
                  <input
                    type="number"
                    min={0}
                    value={allocationForm.whatsAppUtilityCount}
                    onChange={(e) =>
                      setAllocationForm((p) => ({ ...p, whatsAppUtilityCount: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </Field>
              </div>

              <Field label="Duration days (optional)">
                <input
                  type="number"
                  min={1}
                  value={allocationForm.durationDays}
                  onChange={(e) =>
                    setAllocationForm((p) => ({ ...p, durationDays: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </Field>

              <Field label="Notes (optional)">
                <input
                  type="text"
                  value={allocationForm.notes}
                  onChange={(e) => setAllocationForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Invoice reference"
                />
              </Field>

              <button
                type="submit"
                disabled={!companyId || allocating}
                className="px-4 py-2 rounded-lg bg-[#0e0e39] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {allocating ? 'Allocating...' : 'Allocate credits'}
              </button>
            </form>
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
                loadCreditBalance(companyId)
              }}
              disabled={!companyId || loadingClients}
              className="text-sm text-[var(--brand-color-2)] hover:underline disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
          {loadingClients ? (
            <p className="mt-4 text-sm text-gray-500">Loading API clients...</p>
          ) : apiClients.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No API clients found.</p>
          ) : (
            <div className="mt-4 overflow-x-auto border border-gray-200 rounded-lg">
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
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${
                            client.isTestKey
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
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
                              className="text-xs text-[var(--brand-color-2)] hover:underline"
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
                          className="text-xs text-[var(--brand-color-2)] hover:underline disabled:opacity-40"
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
                className="text-sm text-[var(--brand-color-2)] hover:underline disabled:opacity-50"
              >
                {loadingUsage ? 'Loading...' : 'Refresh'}
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
              <div className="border border-gray-200 rounded-lg overflow-hidden">
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
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              {loadingUsage ? 'Loading usage...' : 'No usage data available.'}
            </p>
          )}
        </section>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
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
