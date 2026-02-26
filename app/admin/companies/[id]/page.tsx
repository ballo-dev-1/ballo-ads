'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  adminApi,
  type AdsCampaignResponse,
  type CampaignLogResponse,
  type CompanyLeanResponse,
} from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'

const NOT_IMPLEMENTED_MESSAGE = 'This action is not yet implemented on the backend.'

function SenderIdStatusBadge({
  company,
  rejectedInSession,
}: {
  company: CompanyLeanResponse
  rejectedInSession?: boolean
}) {
  if (!company.senderId) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200/80">
        No sender ID
      </span>
    )
  }
  if (company.isApprovedSenderId) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
        Approved
      </span>
    )
  }
  if (rejectedInSession) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200/80">
        Rejected
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
      Pending
    </span>
  )
}

function DetailRow({
  label,
  value,
  href,
}: {
  label: string
  value: React.ReactNode
  href?: string
}) {
  const isEmpty = value == null || value === ''
  const content = href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--brand-color-2)] hover:text-[var(--brand-color-1)] font-medium hover:underline underline-offset-2 break-all transition-colors"
    >
      {value}
    </a>
  ) : (
    <span className="text-gray-800">{value}</span>
  )
  return (
    <div className="py-3 border-b border-gray-100 last:border-0 last:pb-0">
      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </dt>
      <dd className="text-sm text-gray-800">{isEmpty ? <span className="text-gray-400 italic">—</span> : content}</dd>
    </div>
  )
}

function SectionCard({
  title,
  children,
  className = '',
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden ${className}`}>
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h2 className="text-sm font-semibold text-gray-700 tracking-tight">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function CompanyDetailsPage() {
  const params = useParams()
  const { env } = useApiEnv()
  const id = params.id
  const [company, setCompany] = useState<CompanyLeanResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [senderIdActionLoading, setSenderIdActionLoading] = useState(false)
  const [rejectedSenderId, setRejectedSenderId] = useState(false)
  const [campaigns, setCampaigns] = useState<AdsCampaignResponse[]>([])
  const [campaignsLoading, setCampaignsLoading] = useState(false)
  const [campaignActionLoading, setCampaignActionLoading] = useState<number | null>(null)
  const [logsByCampaignId, setLogsByCampaignId] = useState<Record<number, CampaignLogResponse[]>>({})
  const [logsLoadingCampaignId, setLogsLoadingCampaignId] = useState<number | null>(null)
  const [expandedLogsCampaignId, setExpandedLogsCampaignId] = useState<number | null>(null)

  const numericId = id != null ? Number(id) : NaN
  const invalidId = typeof id !== 'string' || id === '' || Number.isNaN(numericId)

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
      try {
        const data = await adminApi.getCompanyById(numericId)
        if (!cancelled) setCompany(data)
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load company')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [numericId, invalidId, env])

  useEffect(() => {
    if (invalidId || !company) return
    let cancelled = false
    const companyId = company.id
    const loadCampaigns = async () => {
      setCampaignsLoading(true)
      try {
        const data = await adminApi.getCompanyCampaignsAll(companyId)
        if (!cancelled) setCampaigns(data)
      } catch {
        if (!cancelled) setCampaigns([])
      } finally {
        if (!cancelled) setCampaignsLoading(false)
      }
    }
    loadCampaigns()
    return () => {
      cancelled = true
    }
  }, [company?.id, invalidId, env])

  const loadCampaignLogs = async (campaignId: number) => {
    if (!company) return
    setLogsLoadingCampaignId(campaignId)
    try {
      const list = await adminApi.getCampaignLogs(company.id, campaignId)
      setLogsByCampaignId((prev) => ({ ...prev, [campaignId]: list }))
      setExpandedLogsCampaignId(campaignId)
    } catch {
      setLogsByCampaignId((prev) => ({ ...prev, [campaignId]: [] }))
    } finally {
      setLogsLoadingCampaignId(null)
    }
  }

  const handleActivateCampaign = async (campaignId: number) => {
    if (!company) return
    setCampaignActionLoading(campaignId)
    try {
      const updated = await adminApi.activateCampaign(company.id, campaignId)
      setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? updated : c)))
      toast.success('Campaign activated')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to activate campaign')
    } finally {
      setCampaignActionLoading(null)
    }
  }

  const handleCancelCampaign = async (campaignId: number) => {
    if (!company) return
    setCampaignActionLoading(campaignId)
    try {
      const updated = await adminApi.cancelCampaign(company.id, campaignId)
      setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? updated : c)))
      toast.success('Campaign cancelled')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to cancel campaign')
    } finally {
      setCampaignActionLoading(null)
    }
  }

  const handleApproveSenderId = async (
    approve: boolean,
    opts?: { intent?: 'approve' | 'reject' | 'pending' }
  ) => {
    if (!company) return
    setSenderIdActionLoading(true)
    try {
      const updated = await adminApi.approveCompanySenderId(company.id, approve)
      setCompany((prev) => (prev ? { ...prev, ...updated } : null))
      if (opts?.intent === 'pending') {
        setRejectedSenderId(false)
      } else {
        setRejectedSenderId(!approve)
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to approve/reject sender ID')
    } finally {
      setSenderIdActionLoading(false)
    }
  }

  const handleSetSenderIdPending = () => {
    if (company?.isApprovedSenderId) {
      handleApproveSenderId(false, { intent: 'pending' })
    } else {
      setRejectedSenderId(false)
    }
  }

  const handleProfileVerificationClick = () => {
    toast.error(NOT_IMPLEMENTED_MESSAGE)
  }

  const backLink = (
    <Link
      href="/admin/companies"
      className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[var(--brand-color-2)] transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to companies
    </Link>
  )

  const pageHeaderClass = 'rounded-xl p-5 bg-[whitesmoke] border border-gray-200/80'

  if (invalidId) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <header className={pageHeaderClass}>
            {backLink}
          </header>
          <div className="mt-6 max-w-xl rounded-xl bg-red-50/90 border border-red-200 text-red-700 px-5 py-4 shadow-sm">
            Invalid company ID
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <header className={pageHeaderClass}>
            {backLink}
          </header>
          <div className="flex items-center justify-center min-h-[280px] gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[var(--brand-color-2)]" />
            <p className="text-sm text-gray-500">Loading company…</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <header className={pageHeaderClass}>
            {backLink}
          </header>
          <div className="mt-6 max-w-xl rounded-xl bg-red-50/90 border border-red-200 text-red-700 px-5 py-4 shadow-sm">
            {error || 'Company not found'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <header className={`${pageHeaderClass} mb-6`}>
          <div className="mb-3">{backLink}</div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-color-2)]/10 text-[var(--brand-color-2)] font-bold text-lg">
              {(company.name ?? 'C').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{company.name ?? 'Company'}</h1>
              {company.industry && (
                <p className="text-sm text-gray-500 mt-0.5">{company.industry}</p>
              )}
            </div>
          </div>
        </header>
        <div className="space-y-6">
          <SectionCard title="Overview">
            <div className="space-y-0">
              <DetailRow label="Name" value={company.name} />
              <DetailRow label="Email" value={company.email} href={company.email ? `mailto:${company.email}` : undefined} />
              <DetailRow label="Phone" value={company.phoneNumber} href={company.phoneNumber ? `tel:${company.phoneNumber}` : undefined} />
              <DetailRow label="Physical address" value={company.physicalAddress} />
              <DetailRow label="Industry" value={company.industry} />
              <DetailRow label="Description" value={company.description} />
            </div>
          </SectionCard>
          <SectionCard title="Verification & sender ID">
            <div className="space-y-0">
              <div className="py-3 border-b border-gray-100">
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Company verified</dt>
                <dd className="text-sm flex items-center gap-2 flex-wrap">
                  {company.isCompanyVerified ? (
                    <>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        Verified
                      </span>
                      <button
                        type="button"
                        onClick={handleProfileVerificationClick}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        Unverify
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleProfileVerificationClick}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                    >
                      Verify
                    </button>
                  )}
                </dd>
              </div>
              <DetailRow label="Sender ID" value={company.senderId} />
              <div className="py-3 border-b border-gray-100">
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Sender ID status</dt>
                <dd className="text-sm pt-0.5">
                  <SenderIdStatusBadge company={company} rejectedInSession={rejectedSenderId} />
                </dd>
              </div>
              {company.senderId && (
                <div className="py-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Actions</dt>
                  <dd className="text-sm flex flex-wrap items-center gap-1.5">
                    {senderIdActionLoading && (
                      <span className="text-gray-500 text-xs mr-1">Updating…</span>
                    )}
                    <button
                      type="button"
                      disabled={senderIdActionLoading}
                      onClick={() => handleApproveSenderId(true)}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={senderIdActionLoading}
                      onClick={handleSetSenderIdPending}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      disabled={senderIdActionLoading}
                      onClick={() => handleApproveSenderId(false)}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 border border-red-200/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject
                    </button>
                  </dd>
                </div>
              )}
            </div>
          </SectionCard>
          <SectionCard title="Links & social">
            <div className="space-y-0">
              <DetailRow label="Website" value={company.websiteUrl} href={company.websiteUrl} />
              <DetailRow label="Facebook" value={company.facebookUrl} href={company.facebookUrl} />
              <DetailRow label="Twitter" value={company.twitterUrl} href={company.twitterUrl} />
              <DetailRow label="LinkedIn" value={company.linkedInUrl} href={company.linkedInUrl} />
              <DetailRow label="Instagram" value={company.instagramUrl} href={company.instagramUrl} />
              <DetailRow label="YouTube" value={company.youtubeUrl} href={company.youtubeUrl} />
            </div>
          </SectionCard>

          <SectionCard title="Campaigns">
            {campaignsLoading ? (
              <div className="flex items-center justify-center py-12 gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-[var(--brand-color-2)]" />
                <span className="text-sm text-gray-500">Loading campaigns…</span>
              </div>
            ) : campaigns.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No campaigns</p>
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="py-2.5 px-2">Name</th>
                      <th className="py-2.5 px-2">Purpose</th>
                      <th className="py-2.5 px-2">Channel</th>
                      <th className="py-2.5 px-2">Status</th>
                      <th className="py-2.5 px-2">Approved</th>
                      <th className="py-2.5 px-2">Dates</th>
                      <th className="py-2.5 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <React.Fragment key={c.id}>
                        <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="py-2.5 px-2 text-gray-800 font-medium">{c.name}</td>
                          <td className="py-2.5 px-2 text-gray-700">{c.campaignPurpose}</td>
                          <td className="py-2.5 px-2 text-gray-700">{c.campaignChannel}</td>
                          <td className="py-2.5 px-2">
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              {c.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-2">
                            {c.isApproved ? (
                              <span className="text-emerald-600 text-xs font-medium">Yes</span>
                            ) : (
                              <span className="text-amber-600 text-xs font-medium">No</span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-gray-600 text-xs">
                            {c.startDate && c.endDate
                              ? `${new Date(c.startDate).toLocaleDateString()} – ${new Date(c.endDate).toLocaleDateString()}`
                              : '—'}
                          </td>
                          <td className="py-2.5 px-2">
                            <div className="flex flex-wrap items-center gap-1">
                              <button
                                type="button"
                                disabled={campaignActionLoading === c.id}
                                onClick={() => handleActivateCampaign(c.id)}
                                className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800 hover:bg-emerald-200 disabled:opacity-50"
                              >
                                Activate
                              </button>
                              <button
                                type="button"
                                disabled={campaignActionLoading === c.id}
                                onClick={() => handleCancelCampaign(c.id)}
                                className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  logsByCampaignId[c.id]
                                    ? setExpandedLogsCampaignId(expandedLogsCampaignId === c.id ? null : c.id)
                                    : loadCampaignLogs(c.id)
                                }
                                disabled={logsLoadingCampaignId === c.id}
                                className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                              >
                                {logsLoadingCampaignId === c.id
                                  ? '…'
                                  : expandedLogsCampaignId === c.id
                                    ? 'Hide logs'
                                    : 'View logs'}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedLogsCampaignId === c.id && (
                          <tr className="bg-gray-50/80">
                            <td colSpan={7} className="py-3 px-2">
                              {logsLoadingCampaignId === c.id ? (
                                <span className="text-xs text-gray-500">Loading logs…</span>
                              ) : (logsByCampaignId[c.id]?.length ?? 0) === 0 ? (
                                <span className="text-xs text-gray-500">No logs</span>
                              ) : (
                                <ul className="space-y-1 text-xs">
                                  {(logsByCampaignId[c.id] ?? []).map((log) => (
                                    <li key={log.id} className="text-gray-700">
                                      {log.initialStatus ?? '—'} → {log.finalStatus ?? '—'}
                                      {(log.actorFirstName || log.actorLastName) &&
                                        ` (${[log.actorFirstName, log.actorLastName].filter(Boolean).join(' ')})`}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
