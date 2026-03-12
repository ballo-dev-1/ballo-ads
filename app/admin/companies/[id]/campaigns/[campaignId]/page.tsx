'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { ArrowLeft, CalendarDays } from 'lucide-react'
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
} from '@/app/admin/utils/campaignDisplay'

export default function CampaignDetailsPage() {
  const params = useParams()
  const pathname = usePathname()
  const { env } = useApiEnv()
  const basePath = pathname?.startsWith('/dev-admin') ? '/dev-admin' : '/admin'
  const companyId = Number(params.id)
  const campaignId = Number(params.campaignId)

  const [campaign, setCampaign] = useState<AdsCampaignResponse | null>(null)
  const [logs, setLogs] = useState<CampaignLogResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load campaign')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCampaign()
  }, [companyId, campaignId, env])

  const runAction = async (fn: () => Promise<AdsCampaignResponse>, success: string) => {
    setActionLoading(true)
    try {
      const updated = await fn()
      setCampaign(updated)
      toast.success(success)
      const logsData = await adminApi.getCampaignLogs(companyId, campaignId)
      setLogs(logsData)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Campaign action failed')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="flex min-h-[280px] items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-[var(--brand-color-2)]" />
          <span className="text-sm text-slate-500">Loading campaign details...</span>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
          {error || 'Campaign not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-white/15 bg-gradient-to-br from-[#0e0e39] via-[#123968] to-[var(--brand-color-2)] p-6 text-white">
          <Link
            href={`${basePath}/campaigns`}
            className="inline-flex items-center gap-2 text-sm font-medium text-white/85 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to campaigns
          </Link>
          <h1 className="mt-4 text-2xl font-bold">{campaign.name}</h1>
          <p className="mt-1 text-sm text-white/80">Campaign ID: {campaign.id} · Company ID: {campaign.companyId}</p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
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
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Channel</p>
              <p className="mt-1 text-sm text-gray-900">{campaign.campaignChannel}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Purpose</p>
              <p className="mt-1 text-sm text-gray-900">{campaign.campaignPurpose}</p>
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
                className="mt-1 inline-block text-sm text-[var(--brand-color-2)] hover:underline"
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
                  <li key={attachment}>{attachment}</li>
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

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => runAction(() => adminApi.approveCampaign(companyId, campaignId, true), 'Campaign approved')}
              className="inline-flex rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-200 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => runAction(() => adminApi.approveCampaign(companyId, campaignId, false), 'Campaign rejected')}
              className="inline-flex rounded-lg border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-200 disabled:opacity-50"
            >
              Reject
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => runAction(() => adminApi.activateCampaign(companyId, campaignId), 'Campaign activated')}
              className="inline-flex rounded-lg border border-[var(--brand-color-2)] bg-[var(--brand-color-2)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--brand-color-1)] disabled:opacity-50"
            >
              Activate
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => runAction(() => adminApi.cancelCampaign(companyId, campaignId), 'Campaign cancelled')}
              className="inline-flex rounded-lg border border-red-300 bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => runAction(() => adminApi.resendCampaign(companyId, campaignId), 'Campaign resend queued')}
              className="inline-flex rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            >
              Resend
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Campaign logs</h2>
          {logs.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No logs yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {logs.map((log) => (
                <li key={log.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <span className="font-medium">{log.initialStatus ?? '—'}</span>
                  {' -> '}
                  <span className="font-medium">{log.finalStatus ?? '—'}</span>
                  {(log.actorFirstName || log.actorLastName) ? (
                    <span className="text-slate-500">
                      {' '}
                      ({[log.actorFirstName, log.actorLastName].filter(Boolean).join(' ')})
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
