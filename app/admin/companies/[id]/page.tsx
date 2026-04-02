'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AlertTriangle,
  BadgeCheck,
  Bold,
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
  List,
  Mail,
  MapPin,
  Phone,
  ShieldX,
  Signature,
  Twitter,
  Underline,
  Youtube,
  Italic,
  ListOrdered,
  ListChecks,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  adminApi,
  type AdsCampaignResponse,
  type CompanyLeanResponse,
  type CompanyMemberResponse,
  type CompanyMemberRole,
  type CompanyMnoSubmissionHistoryItem,
  type CompanyReviewStatus,
  type SubmitCompanyToMnosPayload,
} from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import { formatDateRange, getCampaignStatusClasses } from '@/app/admin/utils/campaignDisplay'
import AdminHero from '@/app/admin/components/AdminHero'
import { useConfirmDialog } from '@/app/admin/components/useConfirmDialog'
import { getAdminBasePath } from '@/lib/adminNamespace'
import { notifyBackofficeEvent } from '@/lib/notifications/client'
import LetterOfConsentBackendPreview from '@/app/components/letter-of-consent/LetterOfConsentBackendPreview'
import CompanyAnalyticsPanel, {
  type CompanyOverviewSnapshot,
} from '@/app/admin/companies/[id]/components/CompanyAnalyticsPanel'

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function plainTextToHtml(value: string): string {
  return value
    .split('\n\n')
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll('\n', '<br />')}</p>`)
    .join('')
}

function htmlToPlainText(value: string): string {
  const withBreaks = value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<\/div>\s*<div>/gi, '\n')
    .replace(/<li>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
  return withBreaks.replace(/\n{3,}/g, '\n\n').trim()
}

function toTitleCaseWord(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

function getGreetingName(recipientName: string, recipientEmail: string): string {
  const fromName = recipientName.trim()
  if (fromName) return fromName
  const localPart = recipientEmail.trim().split('@')[0] ?? ''
  const firstToken = localPart.split(/[._-]+/).find(Boolean) ?? ''
  const normalized = firstToken.replace(/[^a-zA-Z]/g, '')
  if (normalized.length > 0) return toTitleCaseWord(normalized)
  return 'MTN Team'
}

function applyGreetingToEmailHtml(value: string, greetingName: string): string {
  const target = `Dear ${escapeHtml(greetingName)},`
  return value.replace(/Dear\s+[^,<]+(?:\s+[^,<]+)*,?/i, target)
}

function normalizeEmailBodyHtml(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  let candidate = trimmed

  // Old snapshots sometimes include "Subject:" in the body payload. Keep only the message body.
  const dearIndex = candidate.search(/Dear\s+[^,]+,/i)
  if (dearIndex > 0) {
    candidate = candidate.slice(dearIndex)
  } else {
    candidate = candidate.replace(/^Subject:[\s\S]*?(?:<br\s*\/?>|\r?\n){1,2}/i, '')
  }
  candidate = candidate.trim()
  candidate = candidate
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')

  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(candidate)
  if (hasHtmlTags) {
    return candidate
      .replace(/sender ID\s+&quot;([^"&]+)&quot;/gi, 'sender ID <strong>$1</strong>')
      .replace(/sender ID\s+"([^"]+)"/gi, 'sender ID <strong>$1</strong>')
      .replace(/sender ID\s+([A-Za-z0-9_-]{2,})/gi, 'sender ID <strong>$1</strong>')
  }

  // Recover readable paragraphing from legacy flat plain-text snapshots.
  const withParagraphHints = candidate
    .replace(/\s+/g, ' ')
    .replace(/(Dear\s+[^,]+,)\s*/i, '$1\n\n')
    .replace(/\s*(Please find attached\b)/i, '\n\n$1')
    .replace(/\s*(Kindly proceed\b)/i, '\n$1')
    .replace(/\s*(Regards,)\s*/i, '\n\n$1\n')
    .replace(/\s*(Company contact:)/i, '\n$1')
    .trim()

  return plainTextToHtml(withParagraphHints)
    .replace(/sender ID\s+&quot;([^"&]+)&quot;/gi, 'sender ID <strong>$1</strong>')
    .replace(/sender ID\s+"([^"]+)"/gi, 'sender ID <strong>$1</strong>')
    .replace(/sender ID\s+([A-Za-z0-9_-]{2,})/gi, 'sender ID <strong>$1</strong>')
}

type NetworkKey = 'Mtn' | 'Airtel' | 'Zamtel' | 'Zedmobile'
/** Per-network sender ID state shown in the Action dropdown (server truth + optional Hold). */
type NetworkStatus = 'Pending' | 'Approved' | 'Hold'

type ReviewFeedbackMode = 'reject' | 'requestChanges'

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

function hasSubmittedValue(value?: string | null): boolean {
  return value != null && String(value).trim().length > 0
}

function SubmissionReviewChecklist({ company }: { company: CompanyLeanResponse }) {
  const items = [
    { label: 'Company name', ok: hasSubmittedValue(company.name) },
    { label: 'Contact email', ok: hasSubmittedValue(company.email) },
    { label: 'Phone number', ok: hasSubmittedValue(company.phoneNumber) },
    { label: 'Physical address', ok: hasSubmittedValue(company.physicalAddress) },
    { label: 'Industry', ok: hasSubmittedValue(company.industry) },
    { label: 'Company description', ok: hasSubmittedValue(company.description) },
    { label: 'Registration document uploaded', ok: hasSubmittedValue(company.registrationDocumentUrl) },
    { label: 'Authorized signatory (signature image)', ok: hasSubmittedValue(company.signatureImageUrl) },
    { label: 'Company logo / profile image', ok: hasSubmittedValue(company.profileImageUrl) },
    { label: 'Sender ID configured', ok: hasSubmittedValue(company.senderId) },
  ] as const

  const complete = items.filter((i) => i.ok).length
  const total = items.length

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-3">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500">
        <ListChecks className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} aria-hidden />
        Submission checklist
      </div>
      <p className="mt-1 text-xs text-slate-600">
        <span className="font-medium text-slate-700">{complete}</span> of {total} items submitted
      </p>
      <ul className="mt-3 space-y-2" aria-label="Submission requirements">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-2.5 text-sm">
            {item.ok ? (
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                strokeWidth={2}
                aria-hidden
              />
            ) : (
              <CircleDashed
                className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                strokeWidth={2}
                aria-hidden
              />
            )}
            <span
              className={classNames(
                'leading-snug',
                item.ok ? 'font-medium text-slate-800' : 'text-slate-500',
              )}
            >
              {item.label}
              <span className="sr-only">{item.ok ? ' — provided' : ' — not provided'}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
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
  const [submitToMnosLoading, setSubmitToMnosLoading] = useState(false)
  const [submitToMnosModalOpen, setSubmitToMnosModalOpen] = useState(false)
  const [submitToMnosStep, setSubmitToMnosStep] = useState<1 | 2 | 3>(1)
  const [submitToMnosNetworks, setSubmitToMnosNetworks] = useState<Record<NetworkKey, boolean>>({
    Mtn: false,
    Airtel: false,
    Zamtel: false,
    Zedmobile: false,
  })
  const [submitToMnosSubmissionType, setSubmitToMnosSubmissionType] = useState<
    'review-dashboard' | 'generated-letter' | null
  >(null)
  const [submitToMnosRecipientEmail, setSubmitToMnosRecipientEmail] = useState('')
  const [submitToMnosRecipientName, setSubmitToMnosRecipientName] = useState('')
  const [submitToMnosCcRaw, setSubmitToMnosCcRaw] = useState('')
  const [submitToMnosBccRaw, setSubmitToMnosBccRaw] = useState('')
  const [submitToMnosEmailSubjectOverride, setSubmitToMnosEmailSubjectOverride] = useState('')
  const [submitToMnosEmailBodyHtmlOverride, setSubmitToMnosEmailBodyHtmlOverride] = useState('')
  const [submitToMnosLetterHtmlOverride, setSubmitToMnosLetterHtmlOverride] = useState('')
  const [submitToMnosPreviewLoading, setSubmitToMnosPreviewLoading] = useState(false)
  const [submitToMnosDidRegenerate, setSubmitToMnosDidRegenerate] = useState(false)
  const [submitToMnosStepError, setSubmitToMnosStepError] = useState('')
  const [mnoSubmissionHistory, setMnoSubmissionHistory] = useState<CompanyMnoSubmissionHistoryItem[]>([])
  const [mnoSubmissionHistoryLoading, setMnoSubmissionHistoryLoading] = useState(false)
  const submitToMnosEmailEditorRef = useRef<HTMLDivElement | null>(null)
  const { confirm, confirmDialog } = useConfirmDialog()

  const latestReviewerFeedback = useMemo(
    () =>
      mnoSubmissionHistory.find(
        (item) =>
          item.submissionType === 'review-dashboard' &&
          (Boolean(item.reviewMessage) ||
            item.reviewAttachments.length > 0 ||
            Boolean(item.reviewedAt)),
      ),
    [mnoSubmissionHistory],
  )

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

  useEffect(() => {
    if (invalidId || !company) {
      setMnoSubmissionHistory([])
      return
    }

    let cancelled = false
    const loadHistory = async () => {
      setMnoSubmissionHistoryLoading(true)
      try {
        const data = await adminApi.getCompanyMnoSubmissions(company.id)
        if (!cancelled) {
          setMnoSubmissionHistory(data)
        }
      } catch {
        if (!cancelled) {
          setMnoSubmissionHistory([])
        }
      } finally {
        if (!cancelled) {
          setMnoSubmissionHistoryLoading(false)
        }
      }
    }

    void loadHistory()
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
  const [reviewFeedbackOpen, setReviewFeedbackOpen] = useState(false)
  const [reviewFeedbackMode, setReviewFeedbackMode] = useState<ReviewFeedbackMode>('reject')
  const [reviewFeedbackText, setReviewFeedbackText] = useState('')
  const [reviewFeedbackFieldError, setReviewFeedbackFieldError] = useState('')
  const reviewStatus: CompanyReviewStatus =
    company?.reviewStatus ?? (company?.isCompanyVerified ? 'Approved' : 'Pending')

  const closeReviewFeedbackModal = () => {
    setReviewFeedbackOpen(false)
    setReviewFeedbackFieldError('')
  }

  const openReviewFeedbackModal = (mode: ReviewFeedbackMode) => {
    if (!company) return
    setReviewFeedbackMode(mode)
    setReviewFeedbackText(company.reviewReason ?? '')
    setReviewFeedbackFieldError('')
    setReviewFeedbackOpen(true)
  }

  const submitReviewFeedback = async () => {
    if (!company) return
    const trimmed = reviewFeedbackText.trim()
    if (!trimmed) {
      setReviewFeedbackFieldError(
        reviewFeedbackMode === 'reject' ? 'Rejection reason is required' : 'Feedback is required',
      )
      return
    }
    setReviewFeedbackFieldError('')
    setReviewLoading(true)
    try {
      const status = reviewFeedbackMode === 'reject' ? 'Rejected' : 'Pending'
      const updated = await adminApi.reviewCompany(company.id, {
        status,
        reason: trimmed,
      })
      setCompany((prev) => (prev ? { ...prev, ...updated } : null))
      toast.success(
        reviewFeedbackMode === 'reject' ? 'Review set to Rejected' : 'Changes requested; company is pending review',
      )
      setReviewFeedbackOpen(false)
      setReviewFeedbackText('')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update review')
    } finally {
      setReviewLoading(false)
    }
  }

  const handleSetReviewStatus = async (status: CompanyReviewStatus) => {
    if (!company) return
    if (!company.isActive) {
      toast.error('Cannot review a deactivated company')
      return
    }

    if (status === 'Rejected') {
      openReviewFeedbackModal('reject')
      return
    }

    if (status === 'Pending') {
      openReviewFeedbackModal('requestChanges')
      return
    }

    const approved = await confirm({
      title: `Set review to ${status}`,
      description: `Mark this company submission as ${status.toLowerCase()}?`,
      confirmLabel: status,
      tone: 'default',
    })
    if (!approved) return

    setReviewLoading(true)
    try {
      const updated = await adminApi.reviewCompany(company.id, { status })
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

  const closeSubmitToMnosModal = () => {
    setSubmitToMnosModalOpen(false)
    setSubmitToMnosStepError('')
    setSubmitToMnosLoading(false)
  }

  const openSubmitToMnosModal = () => {
    if (!company?.isActive) {
      toast.error('Cannot submit for a deactivated company')
      return
    }
    const latestSnapshot = mnoSubmissionHistory[0]
    setSubmitToMnosStep(1)
    setSubmitToMnosNetworks({ Mtn: false, Airtel: false, Zamtel: false, Zedmobile: false })
    setSubmitToMnosSubmissionType(null)
    setSubmitToMnosRecipientEmail(latestSnapshot?.submittedRecipientEmail?.trim() || (company.email ?? '').trim())
    setSubmitToMnosRecipientName('')
    setSubmitToMnosCcRaw((latestSnapshot?.submittedCc ?? []).join(', '))
    setSubmitToMnosBccRaw((latestSnapshot?.submittedBcc ?? []).join(', '))
    setSubmitToMnosEmailSubjectOverride(latestSnapshot?.submittedEmailSubject || defaultSubmitToMnosEmailSubject)
    setSubmitToMnosEmailBodyHtmlOverride(
      normalizeEmailBodyHtml(latestSnapshot?.submittedEmailBodyHtml || defaultSubmitToMnosEmailBodyHtml),
    )
    setSubmitToMnosLetterHtmlOverride(latestSnapshot?.submittedLetterHtml || '')
    setSubmitToMnosDidRegenerate(false)
    setSubmitToMnosStepError('')
    setSubmitToMnosModalOpen(true)
  }

  const selectedSubmitToMnosNetworks = useMemo(
    () => (['Mtn', 'Airtel', 'Zamtel', 'Zedmobile'] as const).filter((k) => submitToMnosNetworks[k]),
    [submitToMnosNetworks],
  )

  const defaultSubmitToMnosEmailSubject = useMemo(
    () => `Sender ID approval request - ${company?.name ?? 'Company'} (${company?.senderId?.trim() || 'N/A'})`,
    [company?.name, company?.senderId],
  )

  const submitToMnosGreetingName = useMemo(
    () => getGreetingName(submitToMnosRecipientName, submitToMnosRecipientEmail),
    [submitToMnosRecipientEmail, submitToMnosRecipientName],
  )

  const defaultSubmitToMnosEmailBodyHtml = useMemo(() => {
    if (!company) return ''
    const senderId = company.senderId ?? 'N/A'
    const companyName = company.name ?? 'the client company'
    return [
      `<p>Dear ${escapeHtml(submitToMnosGreetingName)},</p>`,
      `<p>Please assist with approval of sender ID <strong>${escapeHtml(senderId)}</strong> for ${escapeHtml(companyName)} for our BalloAds SMPP account (Source IP: 167.172.100.128).</p>`,
      '<p>Please find attached the client consent letter for your review and approval.<br />Kindly proceed with approval and share confirmation once completed.</p>',
      '<p>Regards,<br />Ballo Ads Team</p>',
      company.email ? `<p>Company contact: ${escapeHtml(company.email)}</p>` : '',
    ]
      .filter(Boolean)
      .join('')
  }, [company, submitToMnosGreetingName])

  const submitToMnosEmailBodyHtmlForSubmit = useMemo(
    () => applyGreetingToEmailHtml(submitToMnosEmailBodyHtmlOverride, submitToMnosGreetingName),
    [submitToMnosEmailBodyHtmlOverride, submitToMnosGreetingName],
  )

  const submitToMnosEmailPreview = useMemo(() => {
    const subject = submitToMnosEmailSubjectOverride.trim() || defaultSubmitToMnosEmailSubject
    const bodyText = htmlToPlainText(submitToMnosEmailBodyHtmlForSubmit).trim()
    return [
      `Subject: ${subject}`,
      '',
      bodyText,
    ].join('\n')
  }, [
    defaultSubmitToMnosEmailSubject,
    submitToMnosEmailBodyHtmlForSubmit,
    submitToMnosEmailSubjectOverride,
  ])

  useEffect(() => {
    if (submitToMnosStep !== 3 || !submitToMnosModalOpen) return
    const editor = submitToMnosEmailEditorRef.current
    if (!editor) return
    if (editor.innerHTML !== submitToMnosEmailBodyHtmlOverride) {
      editor.innerHTML = submitToMnosEmailBodyHtmlOverride
    }
  }, [submitToMnosEmailBodyHtmlOverride, submitToMnosModalOpen, submitToMnosStep])

  const applyEmailBodyFormatting = (command: string) => {
    const editor = submitToMnosEmailEditorRef.current
    if (!editor) return
    editor.focus()
    document.execCommand(command, false)
    setSubmitToMnosEmailBodyHtmlOverride(editor.innerHTML)
    if (submitToMnosStepError) setSubmitToMnosStepError('')
  }

  const fetchRegeneratedContent = async () => {
    if (!company) return
    setSubmitToMnosPreviewLoading(true)
    setSubmitToMnosStepError('')
    try {
      const response = await fetch('/api/mtn-review/letter-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          companyId: company.id,
          companyName: company.name,
          senderId: company.senderId,
          networks: selectedSubmitToMnosNetworks.length ? selectedSubmitToMnosNetworks : ['Mtn'],
          physicalAddress: company.physicalAddress,
          phoneNumber: company.phoneNumber,
          email: company.email,
          websiteUrl: company.websiteUrl,
          description: company.description,
          industry: company.industry,
        }),
      })
      const data = (await response.json().catch(() => ({}))) as { letterHtml?: string; error?: string }
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }
      if (!data.letterHtml?.trim()) {
        throw new Error('Generated letter preview was empty')
      }
      setSubmitToMnosLetterHtmlOverride(data.letterHtml)
      setSubmitToMnosDidRegenerate(true)
      toast.success('Regenerated letter content')
    } catch (e: unknown) {
      setSubmitToMnosStepError(e instanceof Error ? e.message : 'Failed to regenerate content')
    } finally {
      setSubmitToMnosPreviewLoading(false)
    }
  }

  const executeSubmitToMnos = async (forceRegenerate = false) => {
    if (!company) return
    const submissionType = submitToMnosSubmissionType
    if (!submissionType) {
      setSubmitToMnosStepError('Select a submission type.')
      return
    }
    const networks = selectedSubmitToMnosNetworks
    if (selectedSubmitToMnosNetworks.length === 0) {
      setSubmitToMnosStepError('Select at least one MNO.')
      return
    }
    const emailTrim = submitToMnosRecipientEmail.trim()
    const nameTrim = submitToMnosRecipientName.trim()
    const cc = submitToMnosCcRaw
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
    const bcc = submitToMnosBccRaw
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
    const hasInvalidCc = cc.some((x) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x))
    const hasInvalidBcc = bcc.some((x) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x))
    if (submissionType === 'generated-letter') {
      if (!emailTrim || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
        setSubmitToMnosStepError('Enter a valid recipient email.')
        return
      }
      if (hasInvalidCc) {
        setSubmitToMnosStepError('Enter valid CC email addresses (comma-separated).')
        return
      }
      if (hasInvalidBcc) {
        setSubmitToMnosStepError('Enter valid BCC email addresses (comma-separated).')
        return
      }
    }
    const payload: SubmitCompanyToMnosPayload = {
      networks,
      submissionType,
      ...(submissionType === 'generated-letter'
        ? {
            recipientEmail: emailTrim,
            recipientName: nameTrim || undefined,
            cc: cc.length > 0 ? cc : undefined,
            bcc: bcc.length > 0 ? bcc : undefined,
            forceRegenerate: forceRegenerate || submitToMnosDidRegenerate,
            useStoredSnapshot: true,
            letterHtmlOverride: submitToMnosLetterHtmlOverride.trim() || undefined,
            emailSubjectOverride: submitToMnosEmailSubjectOverride.trim() || undefined,
            emailBodyHtmlOverride: submitToMnosEmailBodyHtmlForSubmit.trim() || undefined,
            emailPreviewBody: submitToMnosEmailPreview,
          }
        : {}),
    }
    setSubmitToMnosLoading(true)
    try {
      const updated = await adminApi.submitCompanyToMnos(company.id, payload)
      setCompany((prev) => (prev ? { ...prev, ...updated } : null))
      if (submissionType === 'review-dashboard') {
        toast.success(
          (t) => (
            <div className="text-sm">
              <p>Submitted to MNO review dashboard.</p>
              <a
                href="/mtn-review/submissions"
                className="mt-2 inline-block font-semibold text-sky-600 underline"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => toast.dismiss(t.id)}
              >
                Open MTN review portal
              </a>
            </div>
          ),
          { duration: 8000 },
        )
      } else {
        toast.success('Generated letter submission sent.')
      }
      const history = await adminApi.getCompanyMnoSubmissions(company.id)
      setMnoSubmissionHistory(history)
      closeSubmitToMnosModal()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to submit to MNOs')
    } finally {
      setSubmitToMnosLoading(false)
    }
  }

  const submitToMnosGoNext = () => {
    setSubmitToMnosStepError('')
    if (submitToMnosStep === 1) {
      const any = (['Mtn', 'Airtel', 'Zamtel', 'Zedmobile'] as const).some(
        (k) => submitToMnosNetworks[k],
      )
      if (!any) {
        setSubmitToMnosStepError('Select at least one MNO.')
        return
      }
      setSubmitToMnosStep(2)
      return
    }
    if (submitToMnosStep === 2) {
      if (!submitToMnosSubmissionType) {
        setSubmitToMnosStepError('Select a submission type.')
        return
      }
      if (submitToMnosSubmissionType === 'generated-letter') {
        if (!submitToMnosLetterHtmlOverride.trim() && !mnoSubmissionHistory[0]) {
          void fetchRegeneratedContent()
        }
        setSubmitToMnosStep(3)
        return
      }
      void executeSubmitToMnos()
    }
  }

  const submitToMnosGoBack = () => {
    setSubmitToMnosStepError('')
    if (submitToMnosStep === 1) {
      closeSubmitToMnosModal()
      return
    }
    if (submitToMnosStep === 3) {
      setSubmitToMnosStep(2)
      return
    }
    setSubmitToMnosStep(1)
  }

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
      <div className="min-h-0 min-w-0 flex-1 p-4 sm:p-6">
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
      <div className="min-h-0 min-w-0 flex-1 p-4 sm:p-6">
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
      <div className="min-h-0 min-w-0 flex-1 p-4 sm:p-6">
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
    <div className="min-h-0 min-w-0 flex-1 p-4 sm:p-6">
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
                  {reviewStatus === 'Pending' && company.reviewReason ? (
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                      <span className="font-semibold">Changes requested:</span> {company.reviewReason}
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
                        <SubmissionReviewChecklist company={company} />

                        <p className="text-sm text-slate-600">
                          Review company details before granting access.
                        </p>
                        <div className="flex flex-col gap-2">
                          <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-3">
                            <button
                              type="button"
                              onClick={() => handleSetReviewStatus('Approved')}
                              disabled={reviewLoading || !company.isActive}
                              className={classNames(
                                buttonBase,
                                'min-w-0 w-full justify-center border border-emerald-300 bg-emerald-100 text-emerald-800 shadow-sm hover:bg-emerald-200',
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
                                'min-w-0 w-full justify-center border border-red-300 bg-red-100 text-red-800 shadow-sm hover:bg-red-200',
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
                                'min-w-0 w-full justify-center border border-amber-300 bg-amber-100 text-amber-800 shadow-sm hover:bg-amber-200',
                              )}
                            >
                              {reviewLoading ? 'Updating...' : 'Request changes'}
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => openSubmitToMnosModal()}
                            disabled={
                              reviewLoading || submitToMnosLoading || !company.isActive
                            }
                            className={classNames(
                              buttonBase,
                              'w-full mt-5 justify-center border border-[var(--admin-ui-accent)] bg-[var(--admin-ui-accent)] text-white shadow-sm hover:bg-[var(--brand-color-1)]',
                            )}
                          >
                            {submitToMnosLoading ? 'Submitting…' : 'Submit to MNOs'}
                          </button>
                        </div>
                        {reviewStatus === 'Rejected' && company.reviewReason ? (
                          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                            Rejection reason: {company.reviewReason}
                          </p>
                        ) : null}
                        {reviewStatus === 'Pending' && company.reviewReason ? (
                          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                            Changes requested: {company.reviewReason}
                          </p>
                        ) : null}
                      </div>
                    </div>
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
                      <div className="space-y-4 p-4">
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
                        <p className="text-xs text-slate-500">
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

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Submitted MNO history</h3>
            {mnoSubmissionHistoryLoading ? (
              <span className="text-xs text-slate-500">Loading…</span>
            ) : null}
          </div>
          {latestReviewerFeedback ? (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <p className="font-semibold">Latest MTN reviewer feedback</p>
              <p className="mt-1">
                {latestReviewerFeedback.reviewedAt
                  ? `Updated ${new Date(latestReviewerFeedback.reviewedAt).toLocaleString()}`
                  : 'Updated recently'}
              </p>
              {latestReviewerFeedback.reviewMessage ? (
                <p className="mt-2 whitespace-pre-wrap">{latestReviewerFeedback.reviewMessage}</p>
              ) : (
                <p className="mt-2 text-amber-800">No message was provided by the reviewer.</p>
              )}
              {latestReviewerFeedback.reviewAttachments.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {latestReviewerFeedback.reviewAttachments.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-[11px] underline"
                    >
                      {url}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          {mnoSubmissionHistory.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">No MNO submissions yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {mnoSubmissionHistory.map((item) => (
                <details key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <summary className="cursor-pointer text-sm font-medium text-slate-800">
                    {new Date(item.submittedAt).toLocaleString()} · {item.status} ·{' '}
                    {item.submissionType === 'review-dashboard'
                      ? 'Reviewed in MTN portal'
                      : item.submittedRecipientEmail ?? 'No recipient'}
                    {item.reviewMessage ? (
                      <span className="mt-1 block text-xs font-semibold text-amber-700">
                        Feedback: {item.reviewMessage}
                      </span>
                    ) : null}
                  </summary>
                  <div className="mt-3 space-y-2 text-xs text-slate-700">
                    <p>Networks: {(item.networks || []).join(', ') || 'N/A'}</p>
                    {item.submissionType === 'generated-letter' ? (
                      <>
                        <p>Subject: {item.submittedEmailSubject || 'N/A'}</p>
                        <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded border border-slate-200 bg-white p-2">
                          {item.submittedEmailBodyHtml || item.submittedLetterHtml || '(No stored content)'}
                        </pre>
                      </>
                    ) : null}
                    {item.reviewedAt ? (
                      <p className="text-slate-600">
                        Reviewer action time: {new Date(item.reviewedAt).toLocaleString()}
                      </p>
                    ) : null}
                    {item.reviewMessage ? (
                      <div className="rounded border border-amber-200 bg-amber-50 p-2">
                        <p className="font-semibold text-amber-900">Reviewer feedback</p>
                        <p className="mt-1 whitespace-pre-wrap text-amber-900">{item.reviewMessage}</p>
                      </div>
                    ) : null}
                    {item.reviewAttachments.length > 0 ? (
                      <div className="space-y-1 rounded border border-slate-200 bg-white p-2">
                        <p className="font-semibold text-slate-800">Reviewer attachments</p>
                        {item.reviewAttachments.map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block truncate text-[11px] text-blue-700 underline"
                          >
                            {url}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>

        {submitToMnosModalOpen && company ? (
          <div
            className="fixed inset-0 z-[86] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-[1px]"
            role="presentation"
            onClick={closeSubmitToMnosModal}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="submit-to-mnos-modal-title"
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 id="submit-to-mnos-modal-title" className="text-base font-semibold text-slate-900">
                    Submit to MNOs
                  </h2>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Step {submitToMnosStep}
                    {submitToMnosStep === 1
                      ? ' — Select MNOs'
                      : submitToMnosStep === 2
                        ? ' — Submission type'
                        : ' — Letter & recipient'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeSubmitToMnosModal}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                {submitToMnosStep === 1 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">
                      Choose one or more mobile network operators to include in this submission.
                    </p>
                    <div className="space-y-2">
                      {networkRows.map((row) => (
                        <label
                          key={row.key}
                          className={classNames(
                            'flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition',
                            submitToMnosNetworks[row.key]
                              ? 'border-[var(--admin-ui-accent)] bg-[color-mix(in_srgb,var(--admin-ui-accent)_8%,transparent)]'
                              : 'border-slate-200 hover:border-slate-300',
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={submitToMnosNetworks[row.key]}
                            onChange={() =>
                              setSubmitToMnosNetworks((prev) => ({
                                ...prev,
                                [row.key]: !prev[row.key],
                              }))
                            }
                            className="h-4 w-4 rounded border-slate-300 text-[var(--admin-ui-accent)]"
                          />
                          <img
                            src={row.logoSrc}
                            alt=""
                            className="h-8 w-8 shrink-0 rounded-full border border-slate-200 bg-white object-contain"
                          />
                          <span className="text-sm font-medium text-slate-800">{row.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}

                {submitToMnosStep === 2 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">How should this submission be delivered?</p>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitToMnosSubmissionType('review-dashboard')
                          if (submitToMnosStepError) setSubmitToMnosStepError('')
                        }}
                        className={classNames(
                          'w-full rounded-xl border px-4 py-3 text-left transition',
                          submitToMnosSubmissionType === 'review-dashboard'
                            ? 'border-[var(--admin-ui-accent)] ring-2 ring-[var(--admin-ui-accent)]/25'
                            : 'border-slate-200 hover:border-slate-300',
                        )}
                      >
                        <span className="block text-sm font-semibold text-slate-900">
                          Submit to MNO review dashboard
                        </span>
                        <span className="mt-1 block text-xs text-slate-600">
                          Send this company’s sender ID details to the operator review dashboard.
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitToMnosSubmissionType('generated-letter')
                          if (submitToMnosStepError) setSubmitToMnosStepError('')
                        }}
                        className={classNames(
                          'w-full rounded-xl border px-4 py-3 text-left transition',
                          submitToMnosSubmissionType === 'generated-letter'
                            ? 'border-[var(--admin-ui-accent)] ring-2 ring-[var(--admin-ui-accent)]/25'
                            : 'border-slate-200 hover:border-slate-300',
                        )}
                      >
                        <span className="block text-sm font-semibold text-slate-900">
                          Submit generated letter
                        </span>
                        <span className="mt-1 block text-xs text-slate-600">
                          Continue to letter preview and email the letter to a recipient.
                        </span>
                      </button>
                    </div>
                  </div>
                ) : null}

                {submitToMnosStep === 3 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs text-slate-600">
                        Reuse previous submitted content by default. Regenerate only when needed.
                      </p>
                      <button
                        type="button"
                        onClick={() => void fetchRegeneratedContent()}
                        disabled={submitToMnosPreviewLoading || submitToMnosLoading}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                      >
                        {submitToMnosPreviewLoading ? 'Regenerating…' : 'Regenerate content'}
                      </button>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Email preview
                      </h3>
                      <div className="mt-2 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <input
                          type="text"
                          value={submitToMnosEmailSubjectOverride}
                          onChange={(e) => {
                            setSubmitToMnosEmailSubjectOverride(e.target.value)
                            if (submitToMnosStepError) setSubmitToMnosStepError('')
                          }}
                          placeholder="Email subject"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[var(--admin-ui-accent)]/30 focus:ring-2"
                        />
                        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
                          <button
                            type="button"
                            onClick={() => applyEmailBodyFormatting('bold')}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
                            aria-label="Bold"
                            title="Bold"
                          >
                            <Bold className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => applyEmailBodyFormatting('italic')}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
                            aria-label="Italic"
                            title="Italic"
                          >
                            <Italic className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => applyEmailBodyFormatting('underline')}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
                            aria-label="Underline"
                            title="Underline"
                          >
                            <Underline className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => applyEmailBodyFormatting('insertUnorderedList')}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
                            aria-label="Bullet list"
                            title="Bullet list"
                          >
                            <List className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => applyEmailBodyFormatting('insertOrderedList')}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
                            aria-label="Numbered list"
                            title="Numbered list"
                          >
                            <ListOrdered className="h-4 w-4" />
                          </button>
                        </div>
                        <div
                          ref={submitToMnosEmailEditorRef}
                          contentEditable
                          suppressContentEditableWarning
                          onInput={(event) => {
                            setSubmitToMnosEmailBodyHtmlOverride(event.currentTarget.innerHTML)
                            if (submitToMnosStepError) setSubmitToMnosStepError('')
                          }}
                          className="min-h-[22vh] max-h-[32vh] overflow-y-auto rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-[var(--admin-ui-accent)]/30 focus:ring-2"
                        />
                        <p className="text-[11px] text-slate-500">
                          Click in the preview to edit the message directly.
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Letter preview
                      </h3>
                      <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <LetterOfConsentBackendPreview
                          payload={{
                            companyId: company.id,
                            companyName: company.name,
                            senderId: company.senderId,
                            networks: selectedSubmitToMnosNetworks.length
                              ? selectedSubmitToMnosNetworks
                              : ['Mtn'],
                            physicalAddress: company.physicalAddress,
                            phoneNumber: company.phoneNumber,
                            email: company.email,
                            websiteUrl: company.websiteUrl,
                            description: company.description,
                            industry: company.industry,
                          }}
                          compact
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Email recipient details
                      </h3>
                      <div className="space-y-2">
                        <label htmlFor="mno-letter-recipient-name" className="sr-only">
                          Recipient name
                        </label>
                        <input
                          id="mno-letter-recipient-name"
                          type="text"
                          value={submitToMnosRecipientName}
                          onChange={(e) => {
                            const nextName = e.target.value
                            setSubmitToMnosRecipientName(nextName)
                            setSubmitToMnosEmailBodyHtmlOverride((prev) =>
                              applyGreetingToEmailHtml(
                                prev,
                                getGreetingName(nextName, submitToMnosRecipientEmail),
                              ),
                            )
                            if (submitToMnosStepError) setSubmitToMnosStepError('')
                          }}
                          placeholder="Recipient name (optional)"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[var(--admin-ui-accent)]/30 focus:ring-2"
                          autoComplete="name"
                        />
                        <label htmlFor="mno-letter-recipient-email" className="sr-only">
                          Recipient email
                        </label>
                        <input
                          id="mno-letter-recipient-email"
                          type="email"
                          value={submitToMnosRecipientEmail}
                          onChange={(e) => {
                            const nextEmail = e.target.value
                            setSubmitToMnosRecipientEmail(nextEmail)
                            setSubmitToMnosEmailBodyHtmlOverride((prev) =>
                              applyGreetingToEmailHtml(
                                prev,
                                getGreetingName(submitToMnosRecipientName, nextEmail),
                              ),
                            )
                            if (submitToMnosStepError) setSubmitToMnosStepError('')
                          }}
                          placeholder="Recipient email (required)"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[var(--admin-ui-accent)]/30 focus:ring-2"
                          autoComplete="email"
                        />
                        <label htmlFor="mno-letter-recipient-cc" className="sr-only">
                          CC email addresses
                        </label>
                        <input
                          id="mno-letter-recipient-cc"
                          type="text"
                          value={submitToMnosCcRaw}
                          onChange={(e) => {
                            setSubmitToMnosCcRaw(e.target.value)
                            if (submitToMnosStepError) setSubmitToMnosStepError('')
                          }}
                          placeholder="CC emails (comma-separated, optional)"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[var(--admin-ui-accent)]/30 focus:ring-2"
                          autoComplete="off"
                        />
                        <label htmlFor="mno-letter-recipient-bcc" className="sr-only">
                          BCC email addresses
                        </label>
                        <input
                          id="mno-letter-recipient-bcc"
                          type="text"
                          value={submitToMnosBccRaw}
                          onChange={(e) => {
                            setSubmitToMnosBccRaw(e.target.value)
                            if (submitToMnosStepError) setSubmitToMnosStepError('')
                          }}
                          placeholder="BCC emails (comma-separated, optional)"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[var(--admin-ui-accent)]/30 focus:ring-2"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                {submitToMnosStepError ? (
                  <p className="mt-3 text-sm font-medium text-red-600" role="alert">
                    {submitToMnosStepError}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-5 py-4">
                <button
                  type="button"
                  onClick={submitToMnosGoBack}
                  disabled={submitToMnosLoading}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {submitToMnosStep === 1 ? 'Cancel' : 'Back'}
                </button>
                <div className="flex gap-2">
                  {submitToMnosStep === 3 ? (
                    <button
                      type="button"
                      onClick={() => void executeSubmitToMnos()}
                      disabled={submitToMnosLoading}
                      className="rounded-lg border border-[var(--admin-ui-accent)] bg-[var(--admin-ui-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-color-1)] disabled:opacity-50"
                    >
                      {submitToMnosLoading ? 'Submitting…' : 'Submit'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submitToMnosGoNext}
                      disabled={submitToMnosLoading}
                      className="rounded-lg border border-[var(--admin-ui-accent)] bg-[var(--admin-ui-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-color-1)] disabled:opacity-50"
                    >
                      {submitToMnosLoading ? 'Submitting…' : 'Continue'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {reviewFeedbackOpen && company ? (
          <div
            className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-[1px]"
            role="presentation"
            onClick={closeReviewFeedbackModal}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="review-feedback-modal-title"
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 id="review-feedback-modal-title" className="text-base font-semibold text-slate-900">
                  {reviewFeedbackMode === 'reject' ? 'Reject submission' : 'Request changes'}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {reviewFeedbackMode === 'reject' ? (
                    <>
                      Provide rejection reason <span className="font-medium text-slate-800">(required)</span>. The
                      company will see this in their account.
                    </>
                  ) : (
                    <>
                      Describe what the company should update <span className="font-medium text-slate-800">(required)</span>.
                      Status stays <span className="font-medium text-slate-800">Pending</span> and they will see this
                      message when they open their company profile.
                    </>
                  )}
                </p>
              </div>
              <div className="px-5 py-4">
                <label htmlFor="review-feedback-text" className="sr-only">
                  {reviewFeedbackMode === 'reject' ? 'Rejection reason' : 'Requested changes'}
                </label>
                <textarea
                  id="review-feedback-text"
                  rows={4}
                  value={reviewFeedbackText}
                  onChange={(e) => {
                    setReviewFeedbackText(e.target.value)
                    if (reviewFeedbackFieldError) setReviewFeedbackFieldError('')
                  }}
                  placeholder="Explain what is missing or needs to change…"
                  disabled={reviewLoading}
                  className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[var(--admin-ui-accent)]/30 transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
                {reviewFeedbackFieldError ? (
                  <p className="mt-2 text-xs font-medium text-red-600" role="alert">
                    {reviewFeedbackFieldError}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
                <button
                  type="button"
                  onClick={closeReviewFeedbackModal}
                  disabled={reviewLoading}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void submitReviewFeedback()}
                  disabled={reviewLoading}
                  className={classNames(
                    'rounded-lg border px-4 py-2 text-sm font-semibold shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                    reviewFeedbackMode === 'reject'
                      ? 'border-red-300 bg-red-600 text-white hover:bg-red-700'
                      : 'border-amber-300 bg-amber-600 text-white hover:bg-amber-700',
                  )}
                >
                  {reviewLoading
                    ? reviewFeedbackMode === 'reject'
                      ? 'Rejecting…'
                      : 'Saving…'
                    : reviewFeedbackMode === 'reject'
                      ? 'Reject submission'
                      : 'Send feedback'}
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
