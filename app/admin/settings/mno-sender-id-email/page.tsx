'use client'

import { useEffect, useMemo, useState } from 'react'
import AdminHero from '@/app/admin/components/AdminHero'
import { useConfirmDialog } from '@/app/admin/components/useConfirmDialog'
import { applyChannelPauseToggle, buildEmergencyControlMatrix } from '@/app/admin/apm/reliabilityViewModel'
import {
  adminApi,
  type DispatchControlResponse,
  type PlatformSettingsResponse,
  type PlatformSettingsUpdateRequest,
} from '@/lib/adminApi'
import { notifyBackofficeEvent } from '@/lib/notifications/client'
import toast from 'react-hot-toast'
import { LoadingCentered } from '@/app/components/LoadingSpinner'

function formatDateTime(value?: string) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString()
}

export default function MnoSenderIdEmailSettingsPage() {
  const [activeTab, setActiveTab] = useState<'dispatch-approvals' | 'mno-sender-id-email'>(
    'dispatch-approvals',
  )
  const [loading, setLoading] = useState(true)

  const [primaryReplyTo, setPrimaryReplyTo] = useState('')
  const [secondaryReplyTo, setSecondaryReplyTo] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [dispatchControls, setDispatchControls] = useState<DispatchControlResponse | null>(null)
  const [dispatchControlsError, setDispatchControlsError] = useState('')
  const [platformSettings, setPlatformSettings] = useState<PlatformSettingsResponse | null>(null)
  const [platformSettingsError, setPlatformSettingsError] = useState('')
  const [updatingGlobalPause, setUpdatingGlobalPause] = useState(false)
  const [updatingChannel, setUpdatingChannel] = useState<string | null>(null)
  const [updatingPlatformSettings, setUpdatingPlatformSettings] = useState(false)
  const { confirm, confirmDialog } = useConfirmDialog()

  const emergencyMatrix = useMemo(
    () => (dispatchControls ? buildEmergencyControlMatrix(dispatchControls) : null),
    [dispatchControls],
  )

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      setDispatchControlsError('')
      setPlatformSettingsError('')
      try {
        const [settings, controls] = await Promise.all([
          adminApi.getPlatformSettings(),
          adminApi.getDispatchControls(),
        ])
        if (cancelled) return
        setPlatformSettings(settings)
        setPrimaryReplyTo(settings.mnoSenderIdRequestReplyToEmailPrimary || '')
        setSecondaryReplyTo(settings.mnoSenderIdRequestReplyToEmailSecondary || '')
        setDispatchControls(controls)
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Failed to load settings'
        setError(message)
        setDispatchControlsError(message)
        setPlatformSettingsError(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const save = async () => {
    const primary = primaryReplyTo.trim()
    const secondary = secondaryReplyTo.trim()
    if (!primary && !secondary) {
      setError('At least one reply-to email is required.')
      return
    }
    const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    if (primary && !isValidEmail(primary)) {
      setError('Primary reply-to email is invalid.')
      return
    }
    if (secondary && !isValidEmail(secondary)) {
      setError('Secondary reply-to email is invalid.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const payload: PlatformSettingsUpdateRequest = {
        mnoSenderIdRequestReplyToEmailPrimary: primary,
        mnoSenderIdRequestReplyToEmailSecondary: secondary,
      }
      const updated = await adminApi.updatePlatformSettings(payload)
      setPlatformSettings(updated)
      setPrimaryReplyTo(updated.mnoSenderIdRequestReplyToEmailPrimary || '')
      setSecondaryReplyTo(updated.mnoSenderIdRequestReplyToEmailSecondary || '')
      setPlatformSettingsError('')
      toast.success('MNO sender-ID reply-to settings updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updatePlatformSettings = async (patch: PlatformSettingsUpdateRequest, humanLabel: string) => {
    if (!platformSettings || updatingPlatformSettings) return
    const next = {
      ...platformSettings,
      ...patch,
    }
    const approved = await confirm({
      title: `Update ${humanLabel}`,
      description: `Set: require campaign approval = ${next.requireCampaignApproval ? 'ON' : 'OFF'}, require sender ID approval = ${next.requireSenderIdApproval ? 'ON' : 'OFF'}.`,
      confirmLabel: 'Save changes',
    })
    if (!approved) return

    setUpdatingPlatformSettings(true)
    try {
      const updated = await adminApi.updatePlatformSettings(patch)
      setPlatformSettings(updated)
      setPrimaryReplyTo(updated.mnoSenderIdRequestReplyToEmailPrimary || '')
      setSecondaryReplyTo(updated.mnoSenderIdRequestReplyToEmailSecondary || '')
      setPlatformSettingsError('')
    } catch (err) {
      setPlatformSettingsError(err instanceof Error ? err.message : `Failed to update ${humanLabel}`)
    } finally {
      setUpdatingPlatformSettings(false)
    }
  }

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
    if (!approved) return

    setUpdatingGlobalPause(true)
    try {
      const updated = await adminApi.setGlobalDispatchPause(
        emergencyMatrix.environment,
        !emergencyMatrix.global.isPaused,
      )
      setDispatchControls(updated)
      setDispatchControlsError('')
      await notifyBackofficeEvent('dispatch_control_changed', {
        channel: 'global',
        status: willPause ? 'paused' : 'resumed',
      })
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
    if (!approved) return

    setUpdatingChannel(channel)
    const previous = dispatchControls
    setDispatchControls(applyChannelPauseToggle(previous, channel, !paused))
    try {
      const updated = await adminApi.setChannelDispatchPause(emergencyMatrix.environment, channel, !paused)
      setDispatchControls(updated)
      setDispatchControlsError('')
      await notifyBackofficeEvent('dispatch_control_changed', {
        channel,
        status: willPause ? 'paused' : 'resumed',
      })
    } catch (err) {
      setDispatchControls(previous)
      setDispatchControlsError(err instanceof Error ? err.message : 'Failed to update channel pause')
    } finally {
      setUpdatingChannel(null)
    }
  }

  return (
    <div className="space-y-4">
      <AdminHero
        title="Settings"
        description="Configure operational defaults for backoffice-managed workflows."
      />

      <div className="admin-tab-bar" role="tablist" aria-label="Settings tabs">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'dispatch-approvals'}
          onClick={() => setActiveTab('dispatch-approvals')}
          className={`admin-tab-bar__tab ${
            activeTab === 'dispatch-approvals' ? 'admin-tab-bar__tab--active' : ''
          }`}
        >
          Dispatch & approvals
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'mno-sender-id-email'}
          onClick={() => setActiveTab('mno-sender-id-email')}
          className={`admin-tab-bar__tab ${
            activeTab === 'mno-sender-id-email' ? 'admin-tab-bar__tab--active' : ''
          }`}
        >
          MNO sender-ID email
        </button>
      </div>

      {activeTab === 'dispatch-approvals' ? (
        <div className="space-y-4">
          <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Emergency dispatch controls</h2>
            {loading ? (
              <LoadingCentered minHeight={120} size="md" label="Loading emergency dispatch controls" />
            ) : dispatchControlsError ? (
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
                    onClick={() => void handleGlobalPauseToggle()}
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
                        onClick={() => void handleChannelPauseToggle(item.channel, item.isPaused)}
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

          <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Campaign & sender ID approvals</h2>
            {loading ? (
              <LoadingCentered minHeight={120} size="md" label="Loading approval settings" />
            ) : platformSettingsError ? (
              <p className="text-sm text-red-600">{platformSettingsError}</p>
            ) : platformSettings ? (
              <div className="space-y-3">
                <label className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Require campaign approval</p>
                    <p className="mt-1 text-xs text-gray-500">
                      When enabled, campaigns must be approved before they can be activated.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformSettings.requireCampaignApproval}
                    onChange={(e) =>
                      void updatePlatformSettings(
                        { requireCampaignApproval: e.target.checked },
                        'campaign approval requirement',
                      )
                    }
                    disabled={updatingPlatformSettings}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[var(--admin-ui-accent)] focus:ring-[var(--admin-ui-accent)] disabled:opacity-60"
                  />
                </label>

                <label className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Require sender ID approval</p>
                    <p className="mt-1 text-xs text-gray-500">
                      When enabled, dispatch will skip network recipients until the sender ID is approved per network.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformSettings.requireSenderIdApproval}
                    onChange={(e) =>
                      void updatePlatformSettings(
                        { requireSenderIdApproval: e.target.checked },
                        'sender ID approval requirement',
                      )
                    }
                    disabled={updatingPlatformSettings}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[var(--admin-ui-accent)] focus:ring-[var(--admin-ui-accent)] disabled:opacity-60"
                  />
                </label>

                {updatingPlatformSettings ? <p className="text-xs text-gray-500">Saving...</p> : null}
              </div>
            ) : (
              <LoadingCentered minHeight={100} size="md" label="Loading platform settings" />
            )}
          </section>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {loading ? (
            <LoadingCentered minHeight={160} size="md" label="Loading MNO sender ID email settings" />
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Configure the default reply-to inboxes used when generated sender-ID approval letters are
                emailed to mobile network operators.
              </p>

              <div className="space-y-1">
                <label htmlFor="mno-reply-to-primary" className="text-sm font-medium text-slate-700">
                  Primary reply-to email
                </label>
                <input
                  id="mno-reply-to-primary"
                  type="email"
                  value={primaryReplyTo}
                  onChange={(e) => {
                    setPrimaryReplyTo(e.target.value)
                    if (error) setError('')
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[var(--admin-ui-accent)]/30 focus:ring-2"
                  placeholder="george.m@balloinnovations.com"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="mno-reply-to-secondary" className="text-sm font-medium text-slate-700">
                  Secondary reply-to email
                </label>
                <input
                  id="mno-reply-to-secondary"
                  type="email"
                  value={secondaryReplyTo}
                  onChange={(e) => {
                    setSecondaryReplyTo(e.target.value)
                    if (error) setError('')
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[var(--admin-ui-accent)]/30 focus:ring-2"
                  placeholder="lombe.lusale@balloinnovations.com"
                />
              </div>

              {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => void save()}
                  disabled={saving}
                  className="rounded-lg border border-[var(--admin-ui-accent)] bg-[var(--admin-ui-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-color-1)] disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save settings'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {confirmDialog}
    </div>
  )
}

