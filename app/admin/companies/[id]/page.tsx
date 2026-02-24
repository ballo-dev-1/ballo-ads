'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { adminApi, type CompanyLeanResponse } from '@/lib/adminApi'

function SenderIdStatusBadge({ company }: { company: CompanyLeanResponse }) {
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
  const id = params.id
  const [company, setCompany] = useState<CompanyLeanResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
  }, [numericId, invalidId])

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
                <dd className="text-sm">
                  {company.isCompanyVerified ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
                      Pending
                    </span>
                  )}
                </dd>
              </div>
              <DetailRow label="Sender ID" value={company.senderId} />
              <div className="py-3 border-b border-gray-100 last:border-0 last:pb-0">
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Sender ID status</dt>
                <dd className="text-sm pt-0.5">
                  <SenderIdStatusBadge company={company} />
                </dd>
              </div>
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
        </div>
      </div>
    </div>
  )
}
