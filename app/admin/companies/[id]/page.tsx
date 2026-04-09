'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AlertTriangle,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronRight,
  CheckCircle2,
  CircleDashed,
  CircleX,
  Clock3,
  Facebook,
  FileText,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ShieldX,
  Signature,
  Twitter,
  Youtube,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  adminApi,
  type AdsCampaignResponse,
  type CompanyLeanResponse,
  type CompanyMemberResponse,
  type CompanyMemberRole,
  type CompanyReviewStatus,
} from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import { formatDateRange, getCampaignStatusClasses } from '@/app/admin/utils/campaignDisplay'
import AdminHero from '@/app/admin/components/AdminHero'
import { useConfirmDialog } from '@/app/admin/components/useConfirmDialog'
import { getAdminBasePath } from '@/lib/adminNamespace'
import { notifyBackofficeEvent } from '@/lib/notifications/client'
import CompanyAnalyticsPanel, {
  type CompanyOverviewSnapshot,
} from '@/app/admin/companies/[id]/components/CompanyAnalyticsPanel'

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

type NetworkKey = 'Mtn' | 'Airtel' | 'Zamtel' | 'Zedmobile'
/** Per-network sender ID state shown in the Action dropdown (server truth + optional Hold). */
type NetworkStatus = 'Pending' | 'Approved' | 'Hold'

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

  return null
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
      className="break-all font-medium text-[var(--admin-ui-accent)] transition-colors hover:text-[var(--brand-color-1)] hover:underline"
    >
      {value}
    </a>
  ) : (
    <span className="text-gray-800">{value}</span>
  )

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-200/80 py-3.5 last:border-0 last:pb-0">
      <dt className="inline-flex min-w-0 items-center gap-2.5 text-base font-medium text-slate-800">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          {icon ?? <CircleDashed className="h-3.5 w-3.5" />}
        </span>
        {label}
      </dt>
      <dd className="min-w-0 text-right text-base text-slate-700">
        {isEmpty ? <span className="text-slate-400">Not provided</span> : content}
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
  variant = 'default',
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  rightSlot?: React.ReactNode
  variant?: 'default' | 'overview'
}) {
  const isOverview = variant === 'overview'

  return (
    <section
      className={classNames(
        isOverview
          ? 'overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm'
          : 'overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)]',
        className,
      )}
    >
      <div
        className={classNames(
          'flex flex-wrap items-start justify-between gap-3 border-b border-slate-100',
          isOverview ? 'bg-white px-5 py-4' : 'bg-gradient-to-r from-slate-50 to-white px-5 py-4',
        )}
      >
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-800">{title}</h2>
          {subtitle ? (
            <p className={classNames('mt-1', isOverview ? 'text-sm text-slate-500' : 'text-xs text-slate-500')}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {rightSlot}
      </div>
      <div className={classNames(isOverview ? 'px-5 py-3' : 'px-5 py-4')}>{children}</div>
    </section>
  )
}

function ReviewStatusPill({ status }: { status: CompanyReviewStatus }) {
  if (status === 'Approved') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/80 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        <BadgeCheck className="h-3.5 w-3.5" />
        Approved
      </span>
    )
  }
  if (status === 'Rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300/80 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
        <ShieldX className="h-3.5 w-3.5" />
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

function campaignApprovalOverrideLabel(override: boolean | null | undefined): string {
  if (override === true) return 'Always require approval'
  if (override === false) return 'Skip approval (trusted)'
  return 'Inherit platform default'
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
  const [networkSenderIdActionLoading, setNetworkSenderIdActionLoading] = useState(false)
  const [rejectedSenderId, setRejectedSenderId] = useState(false)
  const [senderIdInputValue, setSenderIdInputValue] = useState('')
  const [senderIdUpdateLoading, setSenderIdUpdateLoading] = useState(false)
  const [bulkNetworkStatus, setBulkNetworkStatus] = useState<NetworkStatus>('Pending')
  const [networkStatuses, setNetworkStatuses] = useState<Record<NetworkKey, NetworkStatus>>({
    Mtn: 'Pending',
    Airtel: 'Pending',
    Zamtel: 'Pending',
    Zedmobile: 'Pending',
  })
  const [campaigns, setCampaigns] = useState<AdsCampaignResponse[]>([])
  const [campaignsLoading, setCampaignsLoading] = useState(false)
  const [lifecycleLoading, setLifecycleLoading] = useState(false)
  const [campaignApprovalOverrideLoading, setCampaignApprovalOverrideLoading] = useState(false)
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
          if (data.senderId && !data.isApprovedSenderId) {
            await notifyBackofficeEvent("sender_id_approval_request", {
              companyId: data.id,
              companyName: data.name ?? "Company",
              senderId: data.senderId,
            })
          }
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
      await notifyBackofficeEvent("sender_id_approval_decision", {
        companyId: company.id,
        companyName: company.name ?? "Company",
        senderId: company.senderId ?? "",
        status: approve ? "approved" : "rejected",
      })
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

  const handleApproveNetworkSenderId = async (
    network: 'Mtn' | 'Airtel' | 'Zamtel' | 'Zedmobile',
    approve: boolean,
    options?: { skipConfirm?: boolean },
  ) => {
    if (!company) return
    if (!company.isActive) {
      toast.error('Cannot change sender approval for a deactivated company')
      return
    }
    if (!company.senderId) {
      toast.error('Set a sender ID before approving it per network')
      return
    }

    const networkLabelMap: Record<
      'Mtn' | 'Airtel' | 'Zamtel' | 'Zedmobile',
      string
    > = {
      Mtn: 'MTN',
      Airtel: 'Airtel',
      Zamtel: 'Zamtel',
      Zedmobile: 'Zedmobile',
    }

    const label = networkLabelMap[network]
    if (!options?.skipConfirm) {
      const approved = await confirm({
        title: `${approve ? 'Approve' : 'Revoke'} sender ID for ${label}`,
        description: `${approve ? 'Approve' : 'Revoke'} network sender ID approval for this company (${company.senderId}).`,
        confirmLabel: approve ? 'Approve' : 'Revoke',
        tone: approve ? 'default' : 'danger',
      })

      if (!approved) return
    }

    setNetworkSenderIdActionLoading(true)
    try {
      const updated = await adminApi.approveCompanyNetworkSenderId(
        company.id,
        network,
        approve,
      )
      setCompany(updated)
      toast.success(approve ? `${label} approved` : `${label} revoked`)
      await notifyBackofficeEvent("sender_id_approval_decision", {
        companyId: company.id,
        companyName: company.name ?? "Company",
        senderId: company.senderId ?? "",
        status: approve ? `${network.toLowerCase()}_approved` : `${network.toLowerCase()}_revoked`,
      })
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update network sender ID approval')
    } finally {
      setNetworkSenderIdActionLoading(false)
    }
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
      setSenderIdInputValue(updated.senderId ?? '')
      toast.success(value ? 'Sender ID updated' : 'Sender ID cleared')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update sender ID')
    } finally {
      setSenderIdUpdateLoading(false)
    }
  }

  const [reviewLoading, setReviewLoading] = useState(false)
  const reviewStatus: CompanyReviewStatus =
    company?.reviewStatus ?? (company?.isCompanyVerified ? 'Approved' : 'Pending')

  const handleSetReviewStatus = async (status: CompanyReviewStatus) => {
    if (!company) return
    if (!company.isActive) {
      toast.error('Cannot review a deactivated company')
      return
    }

    let reason: string | undefined
    if (status === 'Rejected') {
      const entered = window.prompt('Provide rejection reason (required):', company.reviewReason ?? '')
      if (entered == null) return
      const trimmed = entered.trim()
      if (!trimmed) {
        toast.error('Rejection reason is required')
        return
      }
      reason = trimmed
    }

    const approved = await confirm({
      title: `Set review to ${status}`,
      description:
        status === 'Rejected'
          ? `Reject this company submission with reason: "${reason}"`
          : `Mark this company submission as ${status.toLowerCase()}?`,
      confirmLabel: status,
      tone: status === 'Rejected' ? 'danger' : 'default',
    })
    if (!approved) return

    setReviewLoading(true)
    try {
      const updated = await adminApi.reviewCompany(company.id, { status, reason })
      setCompany((prev) => (prev ? { ...prev, ...updated } : null))
      toast.success(`Review set to ${status}`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update review')
    } finally {
      setReviewLoading(false)
    }
  }

  const handleSetCampaignApprovalOverride = async (next: boolean | null) => {
    if (!company) return
    if (!company.isActive) {
      toast.error('Cannot change campaign approval override for a deactivated company')
      return
    }

    if (next === false) {
      const ok = await confirm({
        title: 'Skip campaign approval for this company?',
        description:
          'New campaigns can go live without back-office approval, even when the platform default requires it. Use only for trusted tenants.',
        confirmLabel: 'Skip approval',
        tone: 'danger',
      })
      if (!ok) return
    }

    setCampaignApprovalOverrideLoading(true)
    try {
      const updated = await adminApi.updateCompanyCampaignApprovalOverride(company.id, {
        requireCampaignApprovalOverride: next,
      })
      setCompany(updated)
      toast.success(
        next === null
          ? 'Campaign approval now inherits the platform default'
          : next
            ? 'This company will always require campaign approval'
            : 'Campaign approval is skipped for this company',
      )
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update campaign approval override')
    } finally {
      setCampaignApprovalOverrideLoading(false)
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

  const analyticsOverviewSnapshot = useMemo((): CompanyOverviewSnapshot | null => {
    if (!company) return null
    return {
      isActive: company.isActive,
      reviewStatus,
      reviewReason: company.reviewReason,
      senderStatusLabel,
      senderIdHint: company.senderId ? company.senderId : 'Not configured',
      campaignsTotal: campaigns.length,
      activeCampaignsCount,
      approvedRate,
      approvedCampaignsCount,
    }
  }, [
    company,
    reviewStatus,
    senderStatusLabel,
    campaigns.length,
    activeCampaignsCount,
    approvedRate,
    approvedCampaignsCount,
  ])

  const [activeTab, setActiveTab] = useState<
    'overview' | 'analytics' | 'members' | 'campaigns' | 'settings'
  >('overview')
  const [members, setMembers] = useState<CompanyMemberResponse[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [membersError, setMembersError] = useState('')
  const [memberActionLoading, setMemberActionLoading] = useState<number | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<CompanyMemberRole>('Member')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [documentPreview, setDocumentPreview] = useState<{
    title: string
    url: string
    kind: 'image' | 'document'
  } | null>(null)

  const senderIdValue = company?.senderId ?? ''
  useEffect(() => {
    setSenderIdInputValue(senderIdValue)
  }, [senderIdValue])

  const networkRows = useMemo(
    () =>
      [
        {
          key: 'Mtn' as const,
          label: 'MTN',
          link: 'https://www.mtn.zm/',
          logoSrc: 'https://www.google.com/s2/favicons?domain_url=https%3A%2F%2Fwww.mtn.zm%2F&sz=128',
          approved: company?.isApprovedSenderIdMtn ?? false,
        },
        {
          key: 'Airtel' as const,
          label: 'Airtel',
          link: 'https://commons.wikimedia.org/wiki/File:Bharti_Airtel_Logo.svg',
          logoSrc: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Bharti_Airtel_Logo.svg',
          approved: company?.isApprovedSenderIdAirtel ?? false,
        },
        {
          key: 'Zamtel' as const,
          label: 'Zamtel',
          link: 'https://upload.wikimedia.org/wikipedia/en/a/a1/ZAMTEL_LOGO.gif',
          logoSrc: 'https://upload.wikimedia.org/wikipedia/en/a/a1/ZAMTEL_LOGO.gif',
          approved: company?.isApprovedSenderIdZamtel ?? false,
        },
        {
          key: 'Zedmobile' as const,
          label: 'Zedmobile',
          link: 'https://play-lh.googleusercontent.com/5TdLGU6zf9J9MppdR9ROoTMaLyxlUkivwfIEDu7Q929pllvdVT1yCkbXJ81p9fgt8Ow',
          logoSrc:
            'https://play-lh.googleusercontent.com/5TdLGU6zf9J9MppdR9ROoTMaLyxlUkivwfIEDu7Q929pllvdVT1yCkbXJ81p9fgt8Ow',
          approved: company?.isApprovedSenderIdZedmobile ?? false,
        },
      ] as const,
    [
      company?.isApprovedSenderIdAirtel,
      company?.isApprovedSenderIdMtn,
      company?.isApprovedSenderIdZamtel,
      company?.isApprovedSenderIdZedmobile,
    ],
  )

  useEffect(() => {
    setNetworkStatuses((prev) => ({
      Mtn: prev.Mtn === 'Hold' ? 'Hold' : networkRows[0].approved ? 'Approved' : 'Pending',
      Airtel: prev.Airtel === 'Hold' ? 'Hold' : networkRows[1].approved ? 'Approved' : 'Pending',
      Zamtel: prev.Zamtel === 'Hold' ? 'Hold' : networkRows[2].approved ? 'Approved' : 'Pending',
      Zedmobile: prev.Zedmobile === 'Hold' ? 'Hold' : networkRows[3].approved ? 'Approved' : 'Pending',
    }))
  }, [networkRows])

  const applyNetworkStatus = async (
    network: NetworkKey,
    status: NetworkStatus,
    options?: { skipConfirm?: boolean },
  ) => {
    if (!company) return
    if (!company.isActive) {
      toast.error('Cannot change sender approval for a deactivated company')
      return
    }
    if (!company.senderId) {
      toast.error('Set a sender ID before approving it per network')
      return
    }
    if (status === 'Hold') {
      toast.success('Network left on hold')
      return
    }
    await handleApproveNetworkSenderId(network, status === 'Approved', options)
  }

  const handleApproveAllNetworks = async (
    status: NetworkStatus,
    options?: { skipConfirm?: boolean },
  ) => {
    if (!company) return
    for (const item of networkRows) {
      if (status === 'Hold') continue
      const shouldApprove = status === 'Approved'
      if (item.approved === shouldApprove) continue
      await applyNetworkStatus(item.key, status, options)
    }
  }

  const networkLabelForKey = (key: NetworkKey) =>
    networkRows.find((r) => r.key === key)?.label ?? key

  const confirmAndApplyRowNetworkStatus = async (key: NetworkKey, next: NetworkStatus) => {
    const prev = networkStatuses[key]
    if (next === prev || !company) return
    const label = networkLabelForKey(key)
    const ok = await confirm({
      title: `Update ${label}`,
      description:
        next === 'Hold'
          ? `Leave ${label} on hold? No approval change will be sent for this network.`
          : next === 'Approved'
            ? `Approve sender ID for ${label} for this company (${company.senderId ?? ''})?`
            : `Set ${label} to pending and revoke sender ID approval for this company (${company.senderId ?? ''})?`,
      confirmLabel:
        next === 'Pending' ? 'Revoke' : next === 'Approved' ? 'Approve' : 'Confirm',
      tone: next === 'Pending' ? 'danger' : 'default',
    })
    if (!ok) return
    setNetworkStatuses((p) => ({ ...p, [key]: next }))
    await applyNetworkStatus(key, next, { skipConfirm: true })
  }

  const confirmAndApplyBulkNetworkStatus = async (next: NetworkStatus) => {
    if (!company) return
    const prev = bulkNetworkStatus
    if (next === prev) return
    const actionLabel =
      next === 'Approved'
        ? 'approve all networks that are not yet approved'
        : next === 'Pending'
          ? 'set all approved networks back to pending (revoke approval)'
          : 'mark every network as on hold'
    const ok = await confirm({
      title: 'Apply to all networks',
      description:
        next === 'Hold'
          ? 'Mark every network as on hold? No approval API calls will be made for bulk hold.'
          : `${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)}. Sender ID: ${company.senderId ?? '(none)'}.`,
      confirmLabel: next === 'Hold' ? 'Confirm' : 'Apply',
      tone: next === 'Pending' ? 'danger' : 'default',
    })
    if (!ok) return
    setBulkNetworkStatus(next)
    if (next === 'Hold') {
      setNetworkStatuses({
        Mtn: 'Hold',
        Airtel: 'Hold',
        Zamtel: 'Hold',
        Zedmobile: 'Hold',
      })
      toast.success('All networks marked on hold')
      return
    }
    await handleApproveAllNetworks(next, { skipConfirm: true })
  }

  const breadcrumb = (
    <div className="mb-6 flex flex-wrap items-center gap-1 text-xs text-[var(--admin-muted)] [&_svg]:shrink-0 [&_svg]:opacity-70">
      <Link
        href={`${basePath}/companies`}
        className="transition-colors hover:text-[var(--admin-heading)] hover:underline"
      >
        Companies
      </Link>
      <ChevronRight className="h-3.5 w-3.5" />
      <span className="font-medium text-[var(--admin-heading)]">
        {company ? `Company ${company.id}` : `Company ${numericId}`}
      </span>
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
      await notifyBackofficeEvent("company_deactivated", {
        companyId: company.id,
        companyName: company.name ?? "Company",
        actorName: "Backoffice Admin",
        status: "deactivated",
      })
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
      await notifyBackofficeEvent("company_purged", {
        companyId: company.id,
        companyName: company.name ?? "Company",
        actorName: "Backoffice Admin",
        status: "purged",
      })
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
      <button
        type="button"
        onClick={handleDeactivateCompany}
        disabled={lifecycleLoading || !company.isActive}
        className="rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-300 disabled:text-amber-50 disabled:shadow-none"
      >
        {lifecycleLoading ? 'Working...' : company.isActive ? 'Deactivate' : 'Deactivated'}
      </button>
      <button
        type="button"
        onClick={handlePurgeCompany}
        disabled={lifecycleLoading}
        className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300 disabled:text-red-50 disabled:shadow-none"
      >
        Purge
      </button>
    </div>
  ) : null

  useEffect(() => {
    if (!company || activeTab !== 'members') return
    let cancelled = false
    const loadMembers = async () => {
      setMembersLoading(true)
      setMembersError('')
      try {
        const data = await adminApi.getCompanyMembers(company.id)
        if (!cancelled) setMembers(data)
      } catch (e: unknown) {
        if (!cancelled) {
          setMembers([])
          setMembersError(e instanceof Error ? e.message : 'Failed to load members')
        }
      } finally {
        if (!cancelled) setMembersLoading(false)
      }
    }
    loadMembers()
    return () => {
      cancelled = true
    }
  }, [activeTab, company, env])

  const handleChangeMemberRole = async (member: CompanyMemberResponse, nextRole: CompanyMemberRole) => {
    if (!company || nextRole === member.role) return
    const approved = await confirm({
      title: 'Change member role',
      description: `Change role to ${nextRole} for ${member.user?.email ?? 'this member'}?`,
      confirmLabel: 'Update role',
    })
    if (!approved) return
    setMemberActionLoading(member.id)
    try {
      const updated = await adminApi.updateCompanyMemberRole(company.id, member.id, nextRole)
      setMembers((prev) => prev.map((item) => (item.id === member.id ? updated : item)))
      toast.success('Role updated')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update role')
    } finally {
      setMemberActionLoading(null)
    }
  }

  const handleRemoveMember = async (member: CompanyMemberResponse) => {
    if (!company) return
    const approved = await confirm({
      title: 'Remove member',
      description: `Remove ${member.user?.email ?? 'this member'} from the company?`,
      confirmLabel: 'Remove',
      tone: 'danger',
    })
    if (!approved) return
    setMemberActionLoading(member.id)
    try {
      await adminApi.removeCompanyMember(company.id, member.id)
      setMembers((prev) => prev.filter((item) => item.id !== member.id))
      toast.success('Member removed')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to remove member')
    } finally {
      setMemberActionLoading(null)
    }
  }

  const handleInviteMember = async () => {
    if (!company) return
    const email = inviteEmail.trim()
    if (!email) {
      toast.error('Email is required')
      return
    }
    setInviteLoading(true)
    try {
      await adminApi.createCompanyInvite(company.id, { email, role: inviteRole })
      setInviteEmail('')
      setInviteRole('Member')
      toast.success('Invite sent')
      const refreshed = await adminApi.getCompanyMembers(company.id)
      setMembers(refreshed)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to send invite')
    } finally {
      setInviteLoading(false)
    }
  }

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
            <div className="h-11 w-11 animate-spin rounded-full border-2 border-slate-200 border-t-[var(--admin-ui-accent)]" />
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
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="mx-auto w-full max-w-[1280px] space-y-6 pb-6">
        <AdminHero
          topSlot={breadcrumb}
          eyebrow="Organization management"
          title={company.name ?? 'Company'}
          description={company.industry || 'Industry not specified'}
          variant="blue"
          actions={heroActions}
        />

        <div className="admin-tab-bar" role="tablist">
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
            aria-selected={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            className={`admin-tab-bar__tab ${activeTab === 'analytics' ? 'admin-tab-bar__tab--active' : ''}`}
          >
            Analytics
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'members'}
            onClick={() => setActiveTab('members')}
            className={`admin-tab-bar__tab ${activeTab === 'members' ? 'admin-tab-bar__tab--active' : ''}`}
          >
            Members
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'campaigns'}
            onClick={() => setActiveTab('campaigns')}
            className={`admin-tab-bar__tab ${activeTab === 'campaigns' ? 'admin-tab-bar__tab--active' : ''}`}
          >
            Campaigns
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            className={`admin-tab-bar__tab ${activeTab === 'settings' ? 'admin-tab-bar__tab--active' : ''}`}
          >
            Settings
          </button>
        </div>

        {activeTab === 'overview' ? (
        <div className="space-y-6">
            <SectionCard
              title="Submission Details"
              subtitle="Core information about this company"
              variant="overview"
            >
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500">
                        Submission review status
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Use the Submission review & sender ID section at the bottom of the page to approve, reject, or keep pending.
                      </p>
                    </div>
                    <ReviewStatusPill status={reviewStatus} />
                  </div>
                  {reviewStatus === 'Rejected' && company.reviewReason ? (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      <span className="font-semibold">Rejection reason:</span> {company.reviewReason}
                    </div>
                  ) : null}
                </div>

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
                  <DetailRow
                    label="Address"
                    value={company.physicalAddress}
                    icon={<MapPin className="h-3.5 w-3.5" />}
                  />
                  <DetailRow
                    label="Industry"
                    value={company.industry}
                    icon={<BriefcaseBusiness className="h-3.5 w-3.5" />}
                  />
                  <DetailRow
                    label="Description"
                    value={company.description}
                    icon={<FileText className="h-3.5 w-3.5" />}
                  />
                </dl>
              </div>
            </SectionCard>

            <SectionCard
              title="Submission documents"
              subtitle="Files provided during company onboarding review"
              variant="overview"
            >
              <div className="grid gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
                  <div className="flex items-center gap-2 text-[22px] font-semibold text-slate-700">
                    <FileText className="h-5 w-5 text-slate-500" />
                    <p>Registration Document</p>
                  </div>
                  <p className="mt-1 text-base text-slate-500">
                    {company.registrationDocumentUrl ? 'Uploaded' : 'Not uploaded'}
                  </p>
                  <p className="mt-3 text-sm text-slate-600">Upload a registration document for verification</p>
                  {company.registrationDocumentUrl ? (
                    <button
                      type="button"
                      onClick={() =>
                        setDocumentPreview({
                          title: 'Registration document',
                          url: company.registrationDocumentUrl as string,
                          kind: 'document',
                        })
                      }
                      className="mt-3 inline-flex rounded-lg border border-[var(--admin-ui-accent)] bg-[var(--admin-ui-accent)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--brand-color-1)]"
                    >
                      View document
                    </button>
                  ) : null}
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
                  <div className="flex items-center gap-2 text-[22px] font-semibold text-slate-700">
                    <Signature className="h-5 w-5 text-slate-500" />
                    <p>Signature Image</p>
                  </div>
                  <p className="mt-1 text-base text-slate-500">
                    {company.signatureImageUrl ? 'Uploaded' : 'Not uploaded'}
                  </p>
                  <p className="mt-3 text-sm text-slate-600">Upload a signature image for verification</p>
                  {company.signatureImageUrl ? (
                    <button
                      type="button"
                      onClick={() =>
                        setDocumentPreview({
                          title: 'Signature image',
                          url: company.signatureImageUrl as string,
                          kind: 'image',
                        })
                      }
                      className="mt-3 inline-flex rounded-lg border border-[var(--admin-ui-accent)] bg-[var(--admin-ui-accent)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--brand-color-1)]"
                    >
                      View image
                    </button>
                  ) : null}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Links & social"
              subtitle="Public URLs associated with this company"
              variant="overview"
            >
              <dl className="space-y-0">
                <DetailRow
                  label="Website"
                  value={company.websiteUrl}
                  href={company.websiteUrl}
                  icon={<Globe className="h-3.5 w-3.5" />}
                />
                <DetailRow
                  label="Facebook"
                  value={company.facebookUrl}
                  href={company.facebookUrl}
                  icon={<Facebook className="h-3.5 w-3.5" />}
                />
                <DetailRow
                  label="Twitter"
                  value={company.twitterUrl}
                  href={company.twitterUrl}
                  icon={<Twitter className="h-3.5 w-3.5" />}
                />
                <DetailRow
                  label="LinkedIn"
                  value={company.linkedInUrl}
                  href={company.linkedInUrl}
                  icon={<Linkedin className="h-3.5 w-3.5" />}
                />
                <DetailRow
                  label="Instagram"
                  value={company.instagramUrl}
                  href={company.instagramUrl}
                  icon={<Instagram className="h-3.5 w-3.5" />}
                />
                <DetailRow
                  label="YouTube"
                  value={company.youtubeUrl}
                  href={company.youtubeUrl}
                  icon={<Youtube className="h-3.5 w-3.5" />}
                />
              </dl>
            </SectionCard>

            <SectionCard
              title="Submission review & sender ID"
              subtitle="Review company submission, then manage sender ID controls"
              variant="overview"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
                  <div className="min-w-0 space-y-4">
                    <div className="rounded-xl border border-slate-200">
                      <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-3">
                        <h3 className="text-base font-semibold text-slate-900">Submission review</h3>
                      </div>
                      <div className="space-y-3 px-4 py-4">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="font-medium text-slate-700">Status:</span>
                          <ReviewStatusPill status={reviewStatus} />
                        </div>
                        <p className="text-sm text-slate-600">
                          Review company details before granting access.
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSetReviewStatus('Approved')}
                            disabled={reviewLoading || !company.isActive}
                            className={classNames(
                              buttonBase,
                              'min-w-[96px] justify-center border border-emerald-300 bg-emerald-100 text-emerald-800 shadow-sm hover:bg-emerald-200',
                            )}
                          >
                            {reviewLoading ? 'Updating...' : 'Approve'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetReviewStatus('Rejected')}
                            disabled={reviewLoading || !company.isActive}
                            className={classNames(
                              buttonBase,
                              'min-w-[96px] justify-center border border-red-300 bg-red-100 text-red-800 shadow-sm hover:bg-red-200',
                            )}
                          >
                            {reviewLoading ? 'Updating...' : 'Reject'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetReviewStatus('Pending')}
                            disabled={reviewLoading || !company.isActive}
                            className={classNames(
                              buttonBase,
                              'min-w-[96px] justify-center border border-amber-300 bg-amber-100 text-amber-800 shadow-sm hover:bg-amber-200',
                            )}
                          >
                            {reviewLoading ? 'Updating...' : 'Request changes'}
                          </button>
                        </div>
                        {reviewStatus === 'Rejected' && company.reviewReason ? (
                          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                            Rejection reason: {company.reviewReason}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="sender-id-inline-input"
                        className="text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500"
                      >
                        Sender ID
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          id="sender-id-inline-input"
                          type="text"
                          value={senderIdInputValue}
                          onChange={(event) => setSenderIdInputValue(event.target.value)}
                          placeholder="Enter sender ID"
                          disabled={senderIdUpdateLoading || !company.isActive}
                          className="min-w-[220px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[var(--admin-ui-accent)]/40 transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100"
                        />
                        <button
                          type="button"
                          onClick={handleUpdateSenderId}
                          disabled={senderIdUpdateLoading || !company.isActive}
                          className={classNames(
                            buttonBase,
                            'border border-[var(--admin-ui-accent)] bg-[var(--admin-ui-accent)] text-white hover:bg-[var(--brand-color-1)]',
                          )}
                        >
                          {senderIdUpdateLoading ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <SenderIdStatusBadge company={company} rejectedInSession={rejectedSenderId} />
                        <span className="text-xs text-slate-500">Max 11 characters, no spaces.</span>
                      </div>
                    </div>

                    {!company.senderId ? (
                      <div className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Sender ID must be configured before approval.</span>
                      </div>
                    ) : null}

                    
                  </div>

                  <div className="min-w-0">
                    <div className="rounded-xl border border-slate-200">
                      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-base font-semibold text-slate-900">Network Sender ID Approvals</h3>
                        <select
                          value={bulkNetworkStatus}
                          onChange={(event) =>
                            void confirmAndApplyBulkNetworkStatus(event.target.value as NetworkStatus)
                          }
                          disabled={networkSenderIdActionLoading || !company.isActive}
                          className="w-full shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 sm:w-auto disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="Pending">Pending All</option>
                          <option value="Approved">Approved All</option>
                          <option value="Hold">Hold All</option>
                        </select>
                      </div>
                      <div className="p-4">
                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                          <table className="admin-table-plain min-w-full text-sm">
                            <thead>
                              <tr className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500">
                                <th className="px-3 py-2">Network</th>
                                <th className="px-3 py-2">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {networkRows.map((item) => (
                                <tr key={item.key} className="">
                                  <td className="px-3 py-2.5">
                                    <a
                                      href={item.link}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-2 text-slate-800 hover:text-[var(--admin-ui-accent)]"
                                    >
                                      <img
                                        src={item.logoSrc}
                                        alt={`${item.label} logo`}
                                        className="h-5 w-5 rounded-full border border-slate-200 object-contain bg-white"
                                      />
                                      <span className="font-medium">{item.label}</span>
                                    </a>
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <select
                                      value={networkStatuses[item.key]}
                                      onChange={(event) =>
                                        void confirmAndApplyRowNetworkStatus(
                                          item.key,
                                          event.target.value as NetworkStatus,
                                        )
                                      }
                                      className="min-w-[9.5rem] rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
                                      disabled={networkSenderIdActionLoading || !company.isActive}
                                    >
                                      <option value="Pending">Pending</option>
                                      <option value="Approved">Approved</option>
                                      <option value="Hold">Hold</option>
                                    </select>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          Sender ID must be configured before approval. Each network may require separate sender ID
                          approval.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        ) : null}

        {activeTab === 'members' ? (
          <SectionCard
            title="Members"
            subtitle="Company member listing and roles"
          >
            <div className="space-y-4">
              <div className="grid gap-2 md:grid-cols-[1fr_170px_auto]">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Invite by email"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-[var(--admin-ui-accent)]/40 transition focus:ring-2"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as CompanyMemberRole)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-gray-700"
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                  <option value="SuperAdmin">SuperAdmin</option>
                </select>
                <button
                  type="button"
                  onClick={handleInviteMember}
                  disabled={inviteLoading}
                  className="rounded-lg border border-[var(--admin-ui-accent)] bg-[var(--admin-ui-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-color-1)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {inviteLoading ? 'Inviting...' : 'Invite'}
                </button>
              </div>

              {membersError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {membersError}
                </div>
              ) : null}

              {membersLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[var(--admin-ui-accent)]" />
                </div>
              ) : members.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-500">
                  No members found.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/90 p-4">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-50 to-white text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        <th className="px-3 py-3">Name</th>
                        <th className="px-3 py-3">Email</th>
                        <th className="px-3 py-3">Role</th>
                        <th className="px-3 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.id} className="border-t border-slate-100">
                          <td className="px-3 py-3">{`${member.user?.firstName ?? ''} ${member.user?.lastName ?? ''}`.trim() || '—'}</td>
                          <td className="px-3 py-3">{member.user?.email ?? '—'}</td>
                          <td className="px-3 py-3">
                            <select
                              value={member.role}
                              disabled={memberActionLoading === member.id}
                              onChange={(e) => handleChangeMemberRole(member, e.target.value as CompanyMemberRole)}
                              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-gray-700"
                            >
                              <option value="Member">Member</option>
                              <option value="Admin">Admin</option>
                              <option value="SuperAdmin">SuperAdmin</option>
                            </select>
                          </td>
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member)}
                              disabled={memberActionLoading === member.id}
                              className="rounded-lg border border-red-300 bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {memberActionLoading === member.id ? 'Working...' : 'Remove'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </SectionCard>
        ) : null}

        {activeTab === 'analytics' ? (
          <CompanyAnalyticsPanel
            companyId={company.id}
            overviewSnapshot={analyticsOverviewSnapshot ?? undefined}
          />
        ) : null}

        {activeTab === 'campaigns' ? (
        <SectionCard
          title="Campaigns"
          subtitle={`${campaigns.length} total, ${approvedCampaignsCount} approved`}
        >
          {campaignsLoading ? (
            <div className="flex items-center justify-center py-14">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[var(--admin-ui-accent)]" />
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
                          className="inline-flex rounded-lg border border-[var(--admin-ui-accent)] bg-[var(--admin-ui-accent)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--brand-color-1)]"
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
        ) : null}

        {activeTab === 'settings' ? (
          <SectionCard
            title="Settings"
            subtitle="Company-level policies and platform overrides"
            variant="overview"
          >
            <div className="rounded-xl border border-slate-200">
              <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-3">
                <h3 className="text-base font-semibold text-slate-900">Campaign approval</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Override platform default for new campaigns and client activation rules.
                </p>
              </div>
              <div className="space-y-3 px-4 py-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium text-slate-700">Effective:</span>
                  <span className="text-slate-800">
                    {company.effectiveRequireCampaignApproval ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium text-slate-700">Override:</span>
                  <span className="text-slate-800">
                    {campaignApprovalOverrideLabel(company.requireCampaignApprovalOverride)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetCampaignApprovalOverride(null)}
                    disabled={campaignApprovalOverrideLoading || !company.isActive}
                    className={classNames(
                      buttonBase,
                      'min-w-[96px] justify-center border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50',
                    )}
                  >
                    {campaignApprovalOverrideLoading ? 'Updating...' : 'Inherit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetCampaignApprovalOverride(true)}
                    disabled={campaignApprovalOverrideLoading || !company.isActive}
                    className={classNames(
                      buttonBase,
                      'min-w-[96px] justify-center border border-amber-200 bg-amber-50 text-amber-900 shadow-sm hover:bg-amber-100',
                    )}
                  >
                    {campaignApprovalOverrideLoading ? 'Updating...' : 'Require approval'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetCampaignApprovalOverride(false)}
                    disabled={campaignApprovalOverrideLoading || !company.isActive}
                    className={classNames(
                      buttonBase,
                      'min-w-[96px] justify-center border border-red-200 bg-red-50 text-red-800 shadow-sm hover:bg-red-100',
                    )}
                  >
                    {campaignApprovalOverrideLoading ? 'Updating...' : 'Skip approval'}
                  </button>
                </div>
              </div>
            </div>
          </SectionCard>
        ) : null}

        {documentPreview ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
            onClick={() => setDocumentPreview(null)}
          >
            <div
              className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-900">{documentPreview.title}</h3>
                <button
                  type="button"
                  onClick={() => setDocumentPreview(null)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
              <div className="space-y-3 p-4">
                <div className="h-[70vh] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {documentPreview.kind === 'image' ? (
                    <img
                      src={documentPreview.url}
                      alt={documentPreview.title}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={documentPreview.url}
                      title={documentPreview.title}
                      className="h-full w-full bg-white"
                    />
                  )}
                </div>
                <div className="flex justify-end">
                  <a
                    href={documentPreview.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Open in new tab
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {confirmDialog}
      </div>
    </div>
  )
}
