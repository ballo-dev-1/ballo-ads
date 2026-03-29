'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  CircleDashed,
  CircleX,
  RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  adminApi,
  type AdsCampaignResponse,
  type CampaignLogResponse,
} from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import {
  classNames,
  formatDateRange,
  getCampaignStatusClasses,
  getRecipientStatusClasses,
} from '@/app/admin/utils/campaignDisplay'
import AdminHero from '@/app/admin/components/AdminHero'
import { useConfirmDialog } from '@/app/admin/components/useConfirmDialog'
import { getAdminBasePath } from '@/lib/adminNamespace'
import { notifyBackofficeEvent } from '@/lib/notifications/client'
import type { NotificationEventType } from '@/lib/notifications/catalog'

type CampaignDetailsResponse = AdsCampaignResponse & {
  attachments?: string[]
  whatsAppTemplatePayload?: string
}

export default function CampaignDetailsPage() {
  const params = useParams()
  const pathname = usePathname()
  const { env } = useApiEnv()
  const basePath = getAdminBasePath(pathname)
  const companyId = Number(params.id)
  const campaignId = Number(params.campaignId)

  const [campaign, setCampaign] = useState<CampaignDetailsResponse | null>(null)
  const [logs, setLogs] = useState<CampaignLogResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'recipients' | 'actions' | 'logs'>('overview')
  const { confirm, confirmDialog } = useConfirmDialog()

  const loadCampaign = async () => {
    if (Number.isNaN(companyId) || Number.isNaN(campaignId)) {
      setError('Invalid campaign route')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const [campaignData, logsData] = await Promise.all([
        adminApi.getCampaignById(companyId, campaignId),
        adminApi.getCampaignLogs(companyId, campaignId),
      ])
      setCampaign(campaignData)
      setLogs(logsData)
      if (!campaignData.isApproved) {
        await notifyBackofficeEvent("campaign_approval_request", {
          companyId,
          campaignId,
          campaignName: campaignData.name,
        })
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load campaign')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCampaign()
  }, [companyId, campaignId, env])

  const runAction = async (
    fn: () => Promise<AdsCampaignResponse>,
    success: string,
    onSuccess?: () => Promise<void>,
  ) => {
    setActionLoading(true)
    try {
      const updated = await fn()
      setCampaign((previous) => (previous ? { ...previous, ...updated } : updated))
      toast.success(success)
      if (onSuccess) await onSuccess()
      const logsData = await adminApi.getCampaignLogs(companyId, campaignId)
      setLogs(logsData)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Campaign action failed')
    } finally {
      setActionLoading(false)
    }
  }

  const runConfirmedAction = async (
    message: string,
    fn: () => Promise<AdsCampaignResponse>,
    success: string,
    event?: {
      type: NotificationEventType
      payload?: Record<string, string | number | boolean | null | undefined>
    },
    options?: { title?: string; confirmLabel?: string; tone?: 'default' | 'danger' },
  ) => {
    const approved = await confirm({
      title: options?.title,
      description: message,
      confirmLabel: options?.confirmLabel,
      tone: options?.tone,
    })
    if (!approved) return
    await runAction(fn, success, async () => {
      if (!event) return
      await notifyBackofficeEvent(event.type, {
        companyId,
        campaignId,
        campaignName: campaign?.name ?? `Campaign ${campaignId}`,
        ...event.payload,
      })
    })
  }

  const handleRetargetPendingRecipients = async () => {
    const pendingCount = campaign?.networkDispatchSummary?.pendingSenderIdCount ?? 0
    const approved = await confirm({
      title: 'Retarget pending recipients',
      description: `Queue a new delivery attempt for ${pendingCount} recipient(s) pending sender ID approval (networks that are now approved).`,
      confirmLabel: 'Retarget',
    })
    if (!approved) return

    setActionLoading(true)
    try {
      const result = await adminApi.retargetCampaign(companyId, campaignId)
      toast.success(
        result.retargetedCount > 0
          ? `Retarget queued for ${result.retargetedCount} recipient(s)${
              result.stillPendingCount > 0
                ? ` (${result.stillPendingCount} still pending)`
                : ''
            }.`
          : `No recipients could be retargeted (${result.stillPendingCount} still pending).`,
      )
      await loadCampaign()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to retarget pending recipients')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mx-auto flex min-h-[320px] w-full max-w-[1280px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[var(--admin-ui-accent)]" />
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mx-auto w-full max-w-[1280px] rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm">
          {error || 'Campaign not found'}
        </div>
      </div>
    )
  }

  const normalizedStatus = campaign.status.toLowerCase()
  const actionDisabled = actionLoading
  const canApprove = !campaign.isApproved
  const canReject = campaign.isApproved
  const canActivate = !normalizedStatus.includes('active') && campaign.isApproved
  const pendingSenderIdCount = campaign.networkDispatchSummary?.pendingSenderIdCount ?? 0
  const canRetarget = pendingSenderIdCount > 0
  const canCancel = !normalizedStatus.includes('cancel')
  const recipients = campaign.recipients ?? []
  const sentRecipientsCount = recipients.filter((recipient) => recipient.status.toLowerCase() === 'sent').length
  const failedRecipientsCount = recipients.filter((recipient) =>
    recipient.status.toLowerCase().includes('failed'),
  ).length

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="mx-auto w-full max-w-[1280px] space-y-6 pb-6">
        <AdminHero
          topSlot={
            <div className="mb-6 flex flex-wrap items-center gap-1 text-xs text-[var(--admin-muted)] [&_svg]:shrink-0 [&_svg]:opacity-70">
              <Link
                href={`${basePath}/campaigns`}
                className="transition-colors hover:text-[var(--admin-heading)] hover:underline"
              >
                Campaigns
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link
                href={`${basePath}/companies/${companyId}`}
                className="transition-colors hover:text-[var(--admin-heading)] hover:underline"
              >
                Company {companyId}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-medium text-[var(--admin-heading)]">Campaign {campaign.id}</span>
            </div>
          }
          eyebrow="Campaign details"
          title={campaign.name}
          description={`Campaign ID: ${campaign.id} · Company ID: ${campaign.companyId}`}
          variant="teal"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`${basePath}/companies/${companyId}`}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--admin-card-border)] bg-[color:var(--admin-card)] px-3 py-1.5 text-xs font-semibold text-[var(--admin-heading)] shadow-sm transition hover:bg-[color:var(--admin-control-hover)]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to company
              </Link>
              <button
                type="button"
                onClick={loadCampaign}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--admin-card-border)] bg-[color:var(--admin-card)] px-3 py-1.5 text-xs font-semibold text-[var(--admin-heading)] shadow-sm transition hover:bg-[color:var(--admin-control-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={classNames('h-3.5 w-3.5', loading && 'animate-spin')} />
                Refresh
              </button>
            </div>
          }
          meta={
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-[color:var(--admin-card-border)] bg-[color:color-mix(in_srgb,var(--admin-card)_88%,var(--admin-bg-canvas))] px-3 py-1.5 text-[var(--admin-muted)]">
                {campaign.status}
              </span>
              <span className="rounded-full border border-[color:var(--admin-card-border)] bg-[color:color-mix(in_srgb,var(--admin-card)_88%,var(--admin-bg-canvas))] px-3 py-1.5 text-[var(--admin-muted)]">
                {campaign.isApproved ? 'Approved' : 'Not approved'}
              </span>
            </div>
          }
        />

        <div className="admin-tab-bar mb-1" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            className={`admin-tab-bar__tab ${activeTab === 'overview' ? 'admin-tab-bar__tab--active' : ''}`}
          >
            Overview
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'recipients'}
            onClick={() => setActiveTab('recipients')}
            className={`admin-tab-bar__tab ${activeTab === 'recipients' ? 'admin-tab-bar__tab--active' : ''}`}
          >
            Recipients
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'actions'}
            onClick={() => setActiveTab('actions')}
            className={`admin-tab-bar__tab ${activeTab === 'actions' ? 'admin-tab-bar__tab--active' : ''}`}
          >
            Actions
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'logs'}
            onClick={() => setActiveTab('logs')}
            className={`admin-tab-bar__tab ${activeTab === 'logs' ? 'admin-tab-bar__tab--active' : ''}`}
          >
            Logs
          </button>
        </div>

        {activeTab === 'overview' ? (
        <>
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500">Current status</p>
            <span
              className={classNames(
                'mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
                getCampaignStatusClasses(campaign.status),
              )}
            >
              {campaign.status}
            </span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500">Approval</p>
            <span
              className={classNames(
                'mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
                campaign.isApproved
                  ? 'border-emerald-300/80 bg-emerald-50 text-emerald-700'
                  : 'border-amber-300/80 bg-amber-50 text-amber-700',
              )}
            >
              {campaign.isApproved ? (
                <>
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Approved
                </>
              ) : (
                <>
                  <CircleDashed className="h-3.5 w-3.5" />
                  Not approved
                </>
              )}
            </span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500">Date window</p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              {formatDateRange(campaign.startDate, campaign.endDate)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500">Creator ID</p>
            <p className="mt-2 text-sm font-medium text-slate-800">{campaign.creatorId}</p>
          </div>
        </section>
        </>
        ) : null}

        {activeTab === 'recipients' ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recipients</h2>
              <p className="mt-1 text-xs text-slate-500">Delivery targets and per-recipient statuses.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 font-semibold text-slate-700">
                Total: {recipients.length}
              </span>
              <span className="rounded-full border border-emerald-300/80 bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                Sent: {sentRecipientsCount}
              </span>
              <span className="rounded-full border border-red-300/80 bg-red-50 px-2.5 py-1 font-semibold text-red-700">
                Failed: {failedRecipientsCount}
              </span>
            </div>
          </div>
          {recipients.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-500">
              No recipients found for this campaign.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-white text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    <th className="whitespace-nowrap px-3 py-3">Recipient</th>
                    <th className="whitespace-nowrap px-3 py-3">Name</th>
                    <th className="whitespace-nowrap px-3 py-3">Channel</th>
                    <th className="whitespace-nowrap px-3 py-3">Status</th>
                    <th className="whitespace-nowrap px-3 py-3">Attempts</th>
                    <th className="whitespace-nowrap px-3 py-3">Last error</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.map((recipient) => (
                    <tr key={recipient.id} className="border-t border-slate-100">
                      <td className="px-3 py-3 font-medium text-slate-800">{recipient.account}</td>
                      <td className="px-3 py-3 text-slate-700">{recipient.name || '—'}</td>
                      <td className="px-3 py-3 text-slate-700">{recipient.channel}</td>
                      <td className="px-3 py-3">
                        <span
                          className={classNames(
                            'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
                            getRecipientStatusClasses(recipient.status),
                          )}
                        >
                          {recipient.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-700">{recipient.attemptCount}</td>
                      <td className="px-3 py-3 text-xs text-slate-600">
                        {recipient.lastErrorCode || recipient.lastErrorMessage || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        ) : null}

        {activeTab === 'overview' ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={classNames(
                'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
                getCampaignStatusClasses(campaign.status),
              )}
            >
              {campaign.status}
            </span>
            <span
              className={classNames(
                'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
                campaign.isApproved
                  ? 'border-emerald-300/80 bg-emerald-50 text-emerald-700'
                  : 'border-amber-300/80 bg-amber-50 text-amber-700',
              )}
            >
              {campaign.isApproved ? 'Approved' : 'Not approved'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDateRange(campaign.startDate, campaign.endDate)}
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500">Channel</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{campaign.campaignChannel}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500">Purpose</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{campaign.campaignPurpose}</p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Campaign message</p>
            <div className="mt-2 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
              {campaign.campaignMessage || '—'}
            </div>
          </div>

          {campaign.mediaFileUrl ? (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Media URL</p>
              <a
                href={campaign.mediaFileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block break-all text-sm font-medium text-[var(--admin-ui-accent)] hover:text-[var(--brand-color-1)] hover:underline"
              >
                {campaign.mediaFileUrl}
              </a>
            </div>
          ) : null}

          {campaign.attachments?.length ? (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Attachments</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-800">
                {campaign.attachments.map((attachment) => (
                  <li key={attachment} className="break-all">{attachment}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {campaign.whatsAppTemplatePayload ? (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">WhatsApp template payload</p>
              <pre className="mt-2 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                {campaign.whatsAppTemplatePayload}
              </pre>
            </div>
          ) : null}

        </section>
        ) : null}

        {activeTab === 'actions' ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500">Actions</p>
              {actionLoading ? <span className="text-xs font-medium text-slate-500">Updating campaign...</span> : null}
            </div>
            {canRetarget ? (
              <div className="mb-3">
                <p className="text-xs text-slate-500">
                  {pendingSenderIdCount} recipient(s) pending sender ID approval on one or more networks.
                </p>
                {campaign.networkDispatchSummary?.pendingNetworks?.length ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Pending networks: {campaign.networkDispatchSummary.pendingNetworks.join(', ')}
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={actionDisabled || !canApprove}
                onClick={() =>
                  runConfirmedAction(
                    `Approve campaign #${campaignId}?`,
                    () => adminApi.approveCampaign(companyId, campaignId, true),
                    'Campaign approved',
                    { type: "campaign_approval_decision", payload: { status: "approved" } },
                    { title: 'Approve campaign', confirmLabel: 'Approve' },
                  )
                }
                className="inline-flex rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={actionDisabled || !canReject}
                onClick={() =>
                  runConfirmedAction(
                    `Reject campaign #${campaignId}?`,
                    () => adminApi.approveCampaign(companyId, campaignId, false),
                    'Campaign rejected',
                    { type: "campaign_approval_decision", payload: { status: "rejected" } },
                    { title: 'Reject campaign', confirmLabel: 'Reject', tone: 'danger' },
                  )
                }
                className="inline-flex rounded-lg border border-amber-300 bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reject
              </button>
              <button
                type="button"
                disabled={actionDisabled || !canActivate}
                onClick={() =>
                  runConfirmedAction(
                    `Activate campaign #${campaignId}?`,
                    () => adminApi.activateCampaign(companyId, campaignId),
                    'Campaign activated',
                    { type: "campaign_activated" },
                    { title: 'Activate campaign', confirmLabel: 'Activate' },
                  )
                }
                className="inline-flex rounded-lg border border-[var(--admin-ui-accent)] bg-[var(--admin-ui-accent)] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--brand-color-1)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Activate
              </button>
              <button
                type="button"
                disabled={actionDisabled || !canCancel}
                onClick={() =>
                  runConfirmedAction(
                    `Cancel campaign #${campaignId}?`,
                    () => adminApi.cancelCampaign(companyId, campaignId),
                    'Campaign cancelled',
                    { type: "campaign_cancelled" },
                    { title: 'Cancel campaign', confirmLabel: 'Cancel campaign', tone: 'danger' },
                  )
                }
                className="inline-flex rounded-lg border border-red-300 bg-red-100 px-3 py-2 text-xs font-semibold text-red-800 transition-colors hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              {canRetarget ? (
                <button
                  type="button"
                  disabled={actionDisabled}
                  onClick={() => void handleRetargetPendingRecipients()}
                  className="inline-flex rounded-lg border border-[var(--admin-ui-accent)] bg-white px-3 py-2 text-xs font-semibold text-[var(--admin-ui-accent)] transition-colors hover:bg-[color-mix(in_srgb,var(--admin-ui-accent)_8%,#ffffff)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Retarget pending ({pendingSenderIdCount})
                </button>
              ) : null}
              <button
                type="button"
                disabled={actionDisabled}
                onClick={() =>
                  runConfirmedAction(
                    `Resend campaign #${campaignId}? This will queue another delivery attempt.`,
                    () => adminApi.resendCampaign(companyId, campaignId),
                    'Campaign resend queued',
                    undefined,
                    { title: 'Resend campaign', confirmLabel: 'Queue resend' },
                  )
                }
                className="inline-flex rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Resend
              </button>
            </div>
          </div>
        </section>
        ) : null}

        {activeTab === 'logs' ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="mb-3 border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900">Campaign logs</h2>
            <p className="mt-1 text-xs text-slate-500">Audit trail of campaign status transitions.</p>
          </div>
          {logs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-500">
              No logs yet.
            </div>
          ) : (
            <ul className="space-y-2">
              {logs
                .slice()
                .sort((a, b) => b.id - a.id)
                .map((log) => {
                  const actorName = [log.actorFirstName, log.actorLastName].filter(Boolean).join(' ')
                  return (
                    <li
                      key={log.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3 text-sm text-slate-700"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{log.initialStatus ?? '—'}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium">{log.finalStatus ?? '—'}</span>
                        <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          Log #{log.id}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {actorName ? (
                          <>Changed by {actorName}</>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <CircleX className="h-3 w-3" />
                            Actor unknown
                          </span>
                        )}
                      </div>
                    </li>
                  )
                })}
            </ul>
          )}
        </section>
        ) : null}
        {confirmDialog}
      </div>
    </div>
  )
}
