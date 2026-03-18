'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  ChevronRight,
  CheckCircle2,
  CircleDashed,
  CircleX,
  Clock3,
  Link2,
  Mail,
  Megaphone,
  Phone,
  ShieldCheck,
  ShieldX,
  SignalHigh,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  adminApi,
  type AdsCampaignResponse,
  type CompanyLeanResponse,
} from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import { formatDateRange, getCampaignStatusClasses } from '@/app/admin/utils/campaignDisplay'
import AdminHero from '@/app/admin/components/AdminHero'
import { useConfirmDialog } from '@/app/admin/components/useConfirmDialog'
import { getAdminBasePath } from '@/lib/adminNamespace'

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
        'overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)]',
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

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string
  value: React.ReactNode
  hint?: string
  icon: React.ReactNode
}) {
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
      <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
        {icon}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-800">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </article>
  )
}

export default function CompanyDetailsPage() {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const { env } = useApiEnv()
  const basePath = getAdminBasePath(pathname)
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
  const [lifecycleLoading, setLifecycleLoading] = useState(false)
  const { confirm, confirmDialog } = useConfirmDialog()

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

  const handleApproveSenderId = async (
    approve: boolean,
    opts?: { intent?: 'approve' | 'reject' | 'pending' }
  ) => {
    if (!company) {
      return
    }
    if (!company.isActive) {
      toast.error('Cannot change sender approval for a deactivated company')
      return
    }
    const senderIdLabel = company.senderId?.trim() || 'this sender ID'
    const intent = opts?.intent ?? (approve ? 'approve' : 'reject')
    const confirmationMessage =
      intent === 'pending'
        ? `Set sender ID "${senderIdLabel}" to pending review?`
        : intent === 'approve'
          ? `Approve sender ID "${senderIdLabel}" for this company?`
          : `Reject sender ID "${senderIdLabel}" for this company?`
    const approved = await confirm({
      title: 'Update sender status',
      description: confirmationMessage,
      confirmLabel: intent === 'approve' ? 'Approve' : intent === 'reject' ? 'Reject' : 'Set pending',
      tone: intent === 'reject' ? 'danger' : 'default',
    })
    if (!approved) {
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
    if (company && !company.isActive) {
      toast.error('Cannot edit sender ID for a deactivated company')
      return
    }
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
    if (!company.isActive) {
      toast.error('Cannot update sender ID for a deactivated company')
      return
    }

    const value = senderIdInputValue.trim()
    const currentValue = company.senderId?.trim() || '(empty)'
    const nextValue = value || '(empty)'
    const approved = await confirm({
      title: 'Update sender ID',
      description: `Update sender ID from "${currentValue}" to "${nextValue}"?`,
      confirmLabel: 'Save changes',
    })
    if (!approved) {
      return
    }

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
    if (!company.isActive) {
      toast.error('Cannot change verification for a deactivated company')
      return
    }
    const nextAction = company.isCompanyVerified ? 'unverify' : 'verify'
    const approved = await confirm({
      title: nextAction === 'verify' ? 'Verify company' : 'Unverify company',
      description: `${nextAction === 'verify' ? 'Verify' : 'Unverify'} this company profile?`,
      confirmLabel: nextAction === 'verify' ? 'Verify' : 'Unverify',
      tone: nextAction === 'verify' ? 'default' : 'danger',
    })
    if (!approved) {
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

  const senderStatusLabel = useMemo(() => {
    if (!company?.senderId) {
      return 'No sender ID'
    }
    if (company.isApprovedSenderId) {
      return 'Approved'
    }
    if (rejectedSenderId) {
      return 'Rejected'
    }
    return 'Pending'
  }, [company, rejectedSenderId])

  const approvedRate = useMemo(() => {
    if (campaigns.length === 0) {
      return '0%'
    }
    const ratio = Math.round((approvedCampaignsCount / campaigns.length) * 100)
    return `${ratio}%`
  }, [approvedCampaignsCount, campaigns.length])

  const breadcrumb = (
    <div className="mb-6 flex flex-wrap items-center gap-1 text-xs text-white/80">
      <Link href={`${basePath}/companies`} className="hover:text-white hover:underline">
        Companies
      </Link>
      <ChevronRight className="h-3.5 w-3.5" />
      <span>{company ? `Company ${company.id}` : `Company ${numericId}`}</span>
    </div>
  )

  const buttonBase =
    'inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'

  const handleDeactivateCompany = async () => {
    if (!company || !company.isActive) return
    const confirmed = await confirm({
      title: 'Deactivate company',
      description: 'Deactivate this company? This blocks operational actions but keeps data.',
      confirmLabel: 'Deactivate',
      tone: 'danger',
    })
    if (!confirmed) return
    const reason = window.prompt('Optional reason for deactivation') || undefined
    setLifecycleLoading(true)
    try {
      const updated = await adminApi.deactivateCompany(company.id, reason)
      setCompany((prev) => (prev ? { ...prev, ...updated } : null))
      toast.success('Company deactivated')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to deactivate company')
    } finally {
      setLifecycleLoading(false)
    }
  }

  const handlePurgeCompany = async () => {
    if (!company) return
    const confirmed = await confirm({
      title: 'Purge company',
      description: 'Purge this company? This is irreversible and removes operational data.',
      confirmLabel: 'Continue',
      tone: 'danger',
    })
    if (!confirmed) return
    const typed = window.prompt('Type PURGE to confirm permanent deletion')
    if (typed !== 'PURGE') {
      toast.error('Purge cancelled: confirmation text did not match')
      return
    }
    setLifecycleLoading(true)
    try {
      await adminApi.purgeCompany(company.id, 'Backoffice purge')
      toast.success('Company purged')
      router.push(`${basePath}/companies`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to purge company')
    } finally {
      setLifecycleLoading(false)
    }
  }

  const heroActions = company ? (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`${basePath}/companies/${company.id}/analytics`}
        className="rounded-full bg-[#0f1222] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-black"
      >
        View analytics
      </Link>
      <button
        type="button"
        onClick={handleDeactivateCompany}
        disabled={lifecycleLoading || !company.isActive}
        className="rounded-full bg-[#0f1222] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {lifecycleLoading ? 'Working...' : company.isActive ? 'Deactivate' : 'Deactivated'}
      </button>
      <button
        type="button"
        onClick={handlePurgeCompany}
        disabled={lifecycleLoading}
        className="rounded-full bg-[#0f1222] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        Purge
      </button>
    </div>
  ) : null

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
          <AdminHero
            title="Company details"
            description="Loading company information and campaign overview."
            eyebrow="Organization management"
            variant="blue"
            topSlot={breadcrumb}
          />
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="h-11 w-11 animate-spin rounded-full border-2 border-slate-200 border-t-[var(--brand-color-2)]" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mx-auto w-full max-w-6xl space-y-5">
          <AdminHero
            title="Company details"
            description="Unable to load company details."
            eyebrow="Organization management"
            variant="blue"
            topSlot={breadcrumb}
          />
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm">
            {error || 'Company not found'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.14),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.09),transparent_42%)] p-4 sm:p-6">
      <div className="mx-auto w-full max-w-[1280px] space-y-6 pb-6">
        <AdminHero
          topSlot={breadcrumb}
          eyebrow="Organization management"
          title={company.name ?? 'Company'}
          description={company.industry || 'Industry not specified'}
          variant="blue"
          actions={heroActions}
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Lifecycle"
            value={company.isActive ? 'Active' : 'Deactivated'}
            hint={company.isActive ? 'Operational actions enabled' : 'Operational actions blocked'}
            icon={<SignalHigh className="h-4 w-4" />}
          />
          <StatCard
            label="Verification"
            value={company.isCompanyVerified ? 'Verified' : 'Not verified'}
            hint={company.isCompanyVerified ? 'Public profile is trusted' : 'Awaiting verification'}
            icon={<ShieldCheck className="h-4 w-4" />}
          />
          <StatCard
            label="Sender ID"
            value={senderStatusLabel}
            hint={company.senderId ? company.senderId : 'Not configured'}
            icon={<BadgeCheck className="h-4 w-4" />}
          />
          <StatCard
            label="Campaigns"
            value={`${campaigns.length} total`}
            hint={`${activeCampaignsCount} currently active`}
            icon={<Megaphone className="h-4 w-4" />}
          />
          <StatCard
            label="Approval rate"
            value={approvedRate}
            hint={`${approvedCampaignsCount} approved`}
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
        </div>

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

          <div className="xl:sticky xl:top-6 xl:self-start">
            <SectionCard
              title="Verification & sender ID"
              subtitle="Approve verification status and sender ID controls"
            >
              <dl className="space-y-0">
                <div className="grid gap-2 border-b border-gray-100 py-3 sm:grid-cols-[150px_1fr] sm:gap-4">
                  <dt className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.11em] text-gray-500">
                    <Clock3 className="h-3.5 w-3.5" />
                    Lifecycle
                  </dt>
                  <dd className="text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={classNames(
                          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
                          company.isActive
                            ? 'border-emerald-300/80 bg-emerald-50 text-emerald-700'
                            : 'border-slate-300/80 bg-slate-100 text-slate-700',
                        )}
                      >
                        {company.isActive ? 'Active' : 'Deactivated'}
                      </span>
                      {!company.isActive && company.deactivatedAt ? (
                        <span className="text-xs text-slate-500">
                          Deactivated at {new Date(company.deactivatedAt).toLocaleString()}
                        </span>
                      ) : null}
                    </div>
                  </dd>
                </div>

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
                        disabled={verifyLoading || !company.isActive}
                        className={classNames(
                          buttonBase,
                          company.isCompanyVerified
                            ? 'border border-slate-300 bg-slate-100 text-slate-700 shadow-sm hover:bg-slate-200'
                            : 'border border-emerald-300 bg-emerald-100 text-emerald-800 shadow-sm hover:bg-emerald-200',
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
                          'border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50',
                        )}
                        disabled={!company.isActive}
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
                          disabled={senderIdActionLoading || !company.isActive}
                          onClick={() => handleApproveSenderId(true)}
                          className={classNames(
                            buttonBase,
                            'border border-emerald-300 bg-emerald-100 text-emerald-800 shadow-sm hover:bg-emerald-200',
                          )}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={senderIdActionLoading || !company.isActive}
                          onClick={handleSetSenderIdPending}
                          className={classNames(
                            buttonBase,
                            'border border-amber-300 bg-amber-100 text-amber-800 shadow-sm hover:bg-amber-200',
                          )}
                        >
                          Pending
                        </button>
                        <button
                          type="button"
                          disabled={senderIdActionLoading || !company.isActive}
                          onClick={() => handleApproveSenderId(false)}
                          className={classNames(
                            buttonBase,
                            'border border-red-300 bg-red-100 text-red-800 shadow-sm hover:bg-red-200',
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
        </div>

        <SectionCard
          title="Campaigns"
          subtitle={`${campaigns.length} total, ${approvedCampaignsCount} approved`}
        >
          {campaignsLoading ? (
            <div className="flex items-center justify-center py-14">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[var(--brand-color-2)]" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-500">
              No campaigns yet
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/90 p-4">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-white text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    <th className="whitespace-nowrap px-3 py-3">Name</th>
                    <th className="whitespace-nowrap px-3 py-3">Purpose</th>
                    <th className="whitespace-nowrap px-3 py-3">Channel</th>
                    <th className="whitespace-nowrap px-3 py-3">Status</th>
                    <th className="whitespace-nowrap px-3 py-3">Approved</th>
                    <th className="whitespace-nowrap px-3 py-3">Dates</th>
                    <th className="whitespace-nowrap px-3 py-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-t border-slate-100 transition-colors hover:bg-slate-50/70">
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
                        <Link
                          href={`${basePath}/companies/${company.id}/campaigns/${campaign.id}`}
                          className="inline-flex rounded-lg border border-[var(--brand-color-2)] bg-[var(--brand-color-2)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--brand-color-1)]"
                        >
                          Open details
                        </Link>
                      </td>
                    </tr>
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
        {confirmDialog}
      </div>
    </div>
  )
}
