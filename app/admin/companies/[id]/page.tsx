'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  CircleX,
  Clock3,
  Link2,
  Mail,
  Phone,
  ShieldCheck,
  ShieldX,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  adminApi,
  type AdsCampaignResponse,
  type CampaignLogResponse,
  type CompanyLeanResponse,
} from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function SenderIdStatusBadge({
  company,
  rejectedInSession,
}: {
  company: CompanyLeanResponse
  rejectedInSession?: boolean
}) {
  if (!company.senderId) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
        <CircleDashed className="h-3.5 w-3.5" />
        No sender ID
      </span>
    )
  }

  if (company.isApprovedSenderId) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/80 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Approved
      </span>
    )
  }

  if (rejectedInSession) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300/80 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
        <CircleX className="h-3.5 w-3.5" />
        Rejected
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      <Clock3 className="h-3.5 w-3.5" />
      Pending
    </span>
  )
}

function DetailRow({
  label,
  value,
  href,
  icon,
}: {
  label: string
  value: React.ReactNode
  href?: string
  icon?: React.ReactNode
}) {
  const isEmpty = value == null || value === ''

  const content = href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all font-medium text-[var(--brand-color-2)] transition-colors hover:text-[var(--brand-color-1)] hover:underline"
    >
      {value}
    </a>
  ) : (
    <span className="text-gray-800">{value}</span>
  )

  return (
    <div className="grid gap-1 border-b border-gray-100 py-3 last:border-0 last:pb-0 sm:grid-cols-[150px_1fr] sm:gap-4">
      <dt className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.11em] text-gray-500">
        {icon}
        {label}
      </dt>
      <dd className="text-sm text-gray-800">
        {isEmpty ? <span className="italic text-gray-400">—</span> : content}
      </dd>
    </div>
  )
}

function SectionCard({
  title,
  subtitle,
  children,
  className = '',
  rightSlot,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  rightSlot?: React.ReactNode
}) {
  return (
    <section
      className={classNames(
        'overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-800">{title}</h2>
          {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        {rightSlot}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

function getCampaignStatusClasses(status: string) {
  const lower = status.toLowerCase()

  if (lower.includes('active')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-300/70'
  }
  if (lower.includes('cancel') || lower.includes('reject') || lower.includes('fail')) {
    return 'bg-red-50 text-red-700 border-red-300/70'
  }
  if (lower.includes('pending') || lower.includes('draft') || lower.includes('review')) {
    return 'bg-amber-50 text-amber-700 border-amber-300/70'
  }

  return 'bg-slate-100 text-slate-700 border-slate-300/70'
}

function formatDateRange(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) {
    return '—'
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return '—'
  }

  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
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
  const [senderIdModalOpen, setSenderIdModalOpen] = useState(false)
  const [senderIdInputValue, setSenderIdInputValue] = useState('')
  const [senderIdUpdateLoading, setSenderIdUpdateLoading] = useState(false)
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
        if (!cancelled) {
          setCompany(data)
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load company')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [numericId, invalidId, env])

  useEffect(() => {
    if (invalidId || !company) {
      return
    }

    let cancelled = false
    const companyId = company.id

    const loadCampaigns = async () => {
      setCampaignsLoading(true)
      try {
        const data = await adminApi.getCompanyCampaignsAll(companyId)
        if (!cancelled) {
          setCampaigns(data)
        }
      } catch {
        if (!cancelled) {
          setCampaigns([])
        }
      } finally {
        if (!cancelled) {
          setCampaignsLoading(false)
        }
      }
    }

    loadCampaigns()

    return () => {
      cancelled = true
    }
  }, [company, invalidId, env])

  const loadCampaignLogs = async (campaignId: number) => {
    if (!company) {
      return
    }

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
    if (!company) {
      return
    }

    setCampaignActionLoading(campaignId)

    try {
      const updated = await adminApi.activateCampaign(company.id, campaignId)
      setCampaigns((prev) => prev.map((campaign) => (campaign.id === campaignId ? updated : campaign)))
      toast.success('Campaign activated')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to activate campaign')
    } finally {
      setCampaignActionLoading(null)
    }
  }

  const handleCancelCampaign = async (campaignId: number) => {
    if (!company) {
      return
    }

    setCampaignActionLoading(campaignId)

    try {
      const updated = await adminApi.cancelCampaign(company.id, campaignId)
      setCampaigns((prev) => prev.map((campaign) => (campaign.id === campaignId ? updated : campaign)))
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
    if (!company) {
      return
    }

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

  const startSenderIdEdit = () => {
    setSenderIdInputValue(company?.senderId ?? '')
    setSenderIdModalOpen(true)
  }

  const cancelSenderIdEdit = () => {
    setSenderIdModalOpen(false)
    setSenderIdInputValue('')
  }

  const handleUpdateSenderId = async () => {
    if (!company) {
      return
    }

    const value = senderIdInputValue.trim()

    setSenderIdUpdateLoading(true)

    try {
      const updated = await adminApi.updateCompanySenderId(company.id, value)
      setCompany((prev) => (prev ? { ...prev, ...updated } : null))
      setSenderIdModalOpen(false)
      setSenderIdInputValue('')
      toast.success(value ? 'Sender ID updated' : 'Sender ID cleared')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update sender ID')
    } finally {
      setSenderIdUpdateLoading(false)
    }
  }

  const [verifyLoading, setVerifyLoading] = useState(false)

  const handleProfileVerificationClick = async () => {
    if (!company) {
      return
    }

    setVerifyLoading(true)

    try {
      const updated = await adminApi.verifyCompany(company.id, !company.isCompanyVerified)
      setCompany((prev) => (prev ? { ...prev, ...updated } : null))
      toast.success(company.isCompanyVerified ? 'Company unverified' : 'Company verified')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update verification')
    } finally {
      setVerifyLoading(false)
    }
  }

  const approvedCampaignsCount = useMemo(
    () => campaigns.filter((campaign) => campaign.isApproved).length,
    [campaigns],
  )

  const activeCampaignsCount = useMemo(
    () =>
      campaigns.filter((campaign) => campaign.status.toLowerCase().includes('active')).length,
    [campaigns],
  )

  const backLink = (
    <Link
      href="/admin/companies"
      className="inline-flex items-center gap-2 text-sm font-medium text-white/85 transition-colors hover:text-white"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to companies
    </Link>
  )

  const buttonBase =
    'inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'

  if (invalidId) {
    return (
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mx-auto w-full max-w-6xl space-y-5">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm">
            Invalid company ID
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mx-auto w-full max-w-6xl space-y-5">
          <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e0e39] via-[#123968] to-[var(--brand-color-2)] p-5 text-white ">
            {backLink}
          </header>
          <div className="flex min-h-[320px] items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white">
            <div className="h-11 w-11 animate-spin rounded-full border-2 border-slate-200 border-t-[var(--brand-color-2)]" />
            <p className="text-sm text-slate-500">Loading company...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mx-auto w-full max-w-6xl space-y-5">
          <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e0e39] via-[#123968] to-[var(--brand-color-2)] p-5 text-white">
            {backLink}
          </header>
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm">
            {error || 'Company not found'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="mx-auto w-full max-w-[1280px] space-y-6 pb-6">
        <header className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#0e0e39] via-[#123968] to-[var(--brand-color-2)] text-white shadow-[0_25px_70px_rgba(14,14,57,0.32)]">
          <div className="absolute -left-20 top-0 h-52 w-52 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -right-24 -bottom-16 h-64 w-64 rounded-full bg-[var(--brand-color-4)]/25 blur-3xl" />

          <div className="relative p-5 sm:p-7">
            {backLink}

            <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold uppercase text-white ring-1 ring-white/25 backdrop-blur-sm">
                  {(company.name ?? 'C').charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {company.name ?? 'Company'}
                  </h1>
                  <p className="mt-1 text-sm text-white/80">
                    {company.industry || 'Industry not specified'}
                  </p>
                </div>
              </div>

              <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto">
                <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-white/75">Company</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold">
                    {company.isCompanyVerified ? (
                      <>
                        <BadgeCheck className="h-4 w-4 text-emerald-300" />
                        Verified
                      </>
                    ) : (
                      <>
                        <ShieldX className="h-4 w-4 text-amber-300" />
                        Unverified
                      </>
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-white/75">Sender ID</p>
                  <div className="mt-1 text-sm font-semibold">
                    <SenderIdStatusBadge
                      company={company}
                      rejectedInSession={rejectedSenderId}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-white/75">Campaigns</p>
                  <p className="mt-1 text-sm font-semibold">
                    {campaigns.length} total, {activeCampaignsCount} active
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <SectionCard
              title="Overview"
              subtitle="Core profile details for this company"
            >
              <dl className="space-y-0">
                <DetailRow label="Name" value={company.name} icon={<Building2 className="h-3.5 w-3.5" />} />
                <DetailRow
                  label="Email"
                  value={company.email}
                  href={company.email ? `mailto:${company.email}` : undefined}
                  icon={<Mail className="h-3.5 w-3.5" />}
                />
                <DetailRow
                  label="Phone"
                  value={company.phoneNumber}
                  href={company.phoneNumber ? `tel:${company.phoneNumber}` : undefined}
                  icon={<Phone className="h-3.5 w-3.5" />}
                />
                <DetailRow label="Physical address" value={company.physicalAddress} />
                <DetailRow label="Industry" value={company.industry} />
                <DetailRow label="Description" value={company.description} />
              </dl>
            </SectionCard>

            <SectionCard
              title="Links & social"
              subtitle="Public URLs associated with this company"
            >
              <dl className="space-y-0">
                <DetailRow
                  label="Website"
                  value={company.websiteUrl}
                  href={company.websiteUrl}
                  icon={<Link2 className="h-3.5 w-3.5" />}
                />
                <DetailRow label="Facebook" value={company.facebookUrl} href={company.facebookUrl} />
                <DetailRow label="Twitter" value={company.twitterUrl} href={company.twitterUrl} />
                <DetailRow label="LinkedIn" value={company.linkedInUrl} href={company.linkedInUrl} />
                <DetailRow label="Instagram" value={company.instagramUrl} href={company.instagramUrl} />
                <DetailRow label="YouTube" value={company.youtubeUrl} href={company.youtubeUrl} />
              </dl>
            </SectionCard>
          </div>

          <SectionCard
            title="Verification & sender ID"
            subtitle="Approve verification status and sender ID controls"
            rightSlot={
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                ID: {company.id}
              </div>
            }
          >
            <dl className="space-y-0">
              <div className="grid gap-2 border-b border-gray-100 py-3 sm:grid-cols-[150px_1fr] sm:gap-4">
                <dt className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.11em] text-gray-500">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Company verified
                </dt>
                <dd className="text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    {company.isCompanyVerified ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/80 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        <ShieldX className="h-3.5 w-3.5" />
                        Not verified
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleProfileVerificationClick}
                      disabled={verifyLoading}
                      className={classNames(
                        buttonBase,
                        company.isCompanyVerified
                          ? 'border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'border border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
                      )}
                    >
                      {verifyLoading ? 'Updating...' : company.isCompanyVerified ? 'Unverify' : 'Verify'}
                    </button>
                  </div>
                </dd>
              </div>

              <div className="grid gap-2 border-b border-gray-100 py-3 sm:grid-cols-[150px_1fr] sm:gap-4">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.11em] text-gray-500">Sender ID</dt>
                <dd className="text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={classNames('font-medium', company.senderId ? 'text-gray-800' : 'italic text-gray-400')}>
                      {company.senderId || '—'}
                    </span>
                    <button
                      type="button"
                      onClick={startSenderIdEdit}
                      className={classNames(
                        buttonBase,
                        'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
                      )}
                    >
                      {company.senderId ? 'Edit' : 'Set sender ID'}
                    </button>
                  </div>
                </dd>
              </div>

              <div className="grid gap-2 border-b border-gray-100 py-3 sm:grid-cols-[150px_1fr] sm:gap-4">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.11em] text-gray-500">Sender status</dt>
                <dd className="text-sm">
                  <SenderIdStatusBadge company={company} rejectedInSession={rejectedSenderId} />
                </dd>
              </div>

              {company.senderId && (
                <div className="grid gap-2 py-3 sm:grid-cols-[150px_1fr] sm:gap-4">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.11em] text-gray-500">Actions</dt>
                  <dd className="text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      {senderIdActionLoading ? (
                        <span className="text-xs text-slate-500">Updating...</span>
                      ) : null}

                      <button
                        type="button"
                        disabled={senderIdActionLoading}
                        onClick={() => handleApproveSenderId(true)}
                        className={classNames(
                          buttonBase,
                          'border border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
                        )}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={senderIdActionLoading}
                        onClick={handleSetSenderIdPending}
                        className={classNames(
                          buttonBase,
                          'border border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200',
                        )}
                      >
                        Pending
                      </button>
                      <button
                        type="button"
                        disabled={senderIdActionLoading}
                        onClick={() => handleApproveSenderId(false)}
                        className={classNames(
                          buttonBase,
                          'border border-red-300 bg-red-100 text-red-800 hover:bg-red-200',
                        )}
                      >
                        Reject
                      </button>
                    </div>
                  </dd>
                </div>
              )}
            </dl>
          </SectionCard>
        </div>

        <SectionCard
          title="Campaigns"
          subtitle={`${campaigns.length} total, ${approvedCampaignsCount} approved`}
        >
          {campaignsLoading ? (
            <div className="flex items-center justify-center gap-3 py-14">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[var(--brand-color-2)]" />
              <span className="text-sm text-slate-500">Loading campaigns...</span>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-500">
              No campaigns yet
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-white text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    <th className="whitespace-nowrap px-3 py-3">Name</th>
                    <th className="whitespace-nowrap px-3 py-3">Purpose</th>
                    <th className="whitespace-nowrap px-3 py-3">Channel</th>
                    <th className="whitespace-nowrap px-3 py-3">Status</th>
                    <th className="whitespace-nowrap px-3 py-3">Approved</th>
                    <th className="whitespace-nowrap px-3 py-3">Dates</th>
                    <th className="whitespace-nowrap px-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <React.Fragment key={campaign.id}>
                      <tr className="border-t border-slate-100 transition-colors hover:bg-slate-50/70">
                        <td className="px-3 py-3 text-slate-800">
                          <div className="font-medium">{campaign.name}</div>
                        </td>
                        <td className="px-3 py-3 text-slate-700">{campaign.campaignPurpose}</td>
                        <td className="px-3 py-3 text-slate-700">{campaign.campaignChannel}</td>
                        <td className="px-3 py-3">
                          <span
                            className={classNames(
                              'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
                              getCampaignStatusClasses(campaign.status),
                            )}
                          >
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={classNames(
                              'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
                              campaign.isApproved
                                ? 'border-emerald-300/80 bg-emerald-50 text-emerald-700'
                                : 'border-amber-300/80 bg-amber-50 text-amber-700',
                            )}
                          >
                            {campaign.isApproved ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-600">
                          <div className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDateRange(campaign.startDate, campaign.endDate)}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              disabled={campaignActionLoading === campaign.id}
                              onClick={() => handleActivateCampaign(campaign.id)}
                              className={classNames(
                                buttonBase,
                                'border border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
                              )}
                            >
                              Activate
                            </button>
                            <button
                              type="button"
                              disabled={campaignActionLoading === campaign.id}
                              onClick={() => handleCancelCampaign(campaign.id)}
                              className={classNames(
                                buttonBase,
                                'border border-red-300 bg-red-100 text-red-800 hover:bg-red-200',
                              )}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                logsByCampaignId[campaign.id]
                                  ? setExpandedLogsCampaignId(
                                      expandedLogsCampaignId === campaign.id ? null : campaign.id,
                                    )
                                  : loadCampaignLogs(campaign.id)
                              }
                              disabled={logsLoadingCampaignId === campaign.id}
                              className={classNames(
                                buttonBase,
                                'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
                              )}
                            >
                              {logsLoadingCampaignId === campaign.id
                                ? '...'
                                : expandedLogsCampaignId === campaign.id
                                  ? 'Hide logs'
                                  : 'View logs'}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedLogsCampaignId === campaign.id ? (
                        <tr className="border-t border-slate-100 bg-slate-50/80">
                          <td colSpan={7} className="px-3 py-3">
                            {logsLoadingCampaignId === campaign.id ? (
                              <span className="text-xs text-slate-500">Loading logs...</span>
                            ) : (logsByCampaignId[campaign.id]?.length ?? 0) === 0 ? (
                              <span className="text-xs text-slate-500">No logs</span>
                            ) : (
                              <ul className="space-y-1.5 text-xs">
                                {(logsByCampaignId[campaign.id] ?? []).map((log) => (
                                  <li
                                    key={log.id}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700"
                                  >
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
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {senderIdModalOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[1px]"
            onClick={cancelSenderIdEdit}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="sender-id-modal-title"
              className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 id="sender-id-modal-title" className="text-base font-semibold text-slate-900">
                    Update Sender ID
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Edit the sender ID for this company.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cancelSenderIdEdit}
                  className="inline-flex rounded-lg border border-slate-200 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                  aria-label="Close sender ID modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 px-5 py-4">
                <label htmlFor="sender-id-input" className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500">
                  Sender ID
                </label>
                <input
                  id="sender-id-input"
                  type="text"
                  value={senderIdInputValue}
                  onChange={(event) => setSenderIdInputValue(event.target.value)}
                  placeholder="Enter sender ID"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-[var(--brand-color-2)]/40 transition focus:ring-2"
                  disabled={senderIdUpdateLoading}
                  autoFocus
                />
                <p className="text-xs text-slate-500">Leave empty to clear the sender ID.</p>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
                <button
                  type="button"
                  onClick={cancelSenderIdEdit}
                  disabled={senderIdUpdateLoading}
                  className={classNames(
                    buttonBase,
                    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
                  )}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateSenderId}
                  disabled={senderIdUpdateLoading}
                  className={classNames(
                    buttonBase,
                    'border border-[var(--brand-color-2)] bg-[var(--brand-color-2)] text-white hover:bg-[var(--brand-color-1)]',
                  )}
                >
                  {senderIdUpdateLoading ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
