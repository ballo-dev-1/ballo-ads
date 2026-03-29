'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import {
  adminApi,
  type AdsCampaignResponse,
  type CompanyLeanResponse,
} from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import {
  classNames,
  formatDateRange,
  getCampaignStatusClasses,
} from '@/app/admin/utils/campaignDisplay'
import AdminHero from '@/app/admin/components/AdminHero'
import { getAdminBasePath } from '@/lib/adminNamespace'

type CampaignWithCompany = AdsCampaignResponse & {
  companyName: string
}

type SortOption =
  | 'most_recently_sent'
  | 'newest_first'
  | 'oldest_first'
  | 'name_az'
  | 'name_za'
type ReviewTab = 'pending' | 'approved' | 'rejected'

function getDateMs(value?: string) {
  if (!value) return Number.NaN
  const ms = new Date(value).getTime()
  return Number.isNaN(ms) ? Number.NaN : ms
}

function getMostRecentlySentMs(campaign: CampaignWithCompany) {
  const endMs = getDateMs(campaign.endDate)
  if (!Number.isNaN(endMs)) return endMs
  const startMs = getDateMs(campaign.startDate)
  if (!Number.isNaN(startMs)) return startMs
  return Number.NEGATIVE_INFINITY
}

export default function CampaignsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const basePath = getAdminBasePath(pathname)
  const { env } = useApiEnv()
  const [campaigns, setCampaigns] = useState<CampaignWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [channelFilter, setChannelFilter] = useState('all')
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'approved' | 'not_approved'>('all')
  const [companyFilter, setCompanyFilter] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('most_recently_sent')
  const [reviewTab, setReviewTab] = useState<ReviewTab>('pending')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const companies = await adminApi.getCompanies()

        const campaignsPerCompany = await Promise.all(
          companies.map(async (company: CompanyLeanResponse) => {
            try {
              const companyCampaigns = await adminApi.getCompanyCampaignsAll(company.id)
              return companyCampaigns.map((campaign) => ({
                ...campaign,
                companyName: company.name || `Company #${company.id}`,
              }))
            } catch {
              return []
            }
          }),
        )

        if (!cancelled) {
          const flattened = campaignsPerCompany.flat()
          setCampaigns(flattened)
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load campaigns')
          setCampaigns([])
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
  }, [env])

  const approvedCount = useMemo(() => campaigns.filter((campaign) => campaign.isApproved).length, [campaigns])

  const activeCount = useMemo(
    () => campaigns.filter((campaign) => campaign.status.toLowerCase().includes('active')).length,
    [campaigns],
  )

  const companyOptions = useMemo(
    () => Array.from(new Set(campaigns.map((campaign) => campaign.companyName))).sort((a, b) => a.localeCompare(b)),
    [campaigns],
  )

  const statusOptions = useMemo(
    () => Array.from(new Set(campaigns.map((campaign) => campaign.status))).sort((a, b) => a.localeCompare(b)),
    [campaigns],
  )

  const channelOptions = useMemo(
    () => Array.from(new Set(campaigns.map((campaign) => campaign.campaignChannel))).sort((a, b) => a.localeCompare(b)),
    [campaigns],
  )

  const visibleCampaigns = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    const filtered = campaigns.filter((campaign) => {
      const normalizedStatus = campaign.status.toLowerCase()
      if (reviewTab === 'pending' && campaign.isApproved) return false
      if (reviewTab === 'approved' && !campaign.isApproved) return false
      if (reviewTab === 'rejected' && (campaign.isApproved || !normalizedStatus.includes('cancel'))) return false

      if (companyFilter !== 'all' && campaign.companyName !== companyFilter) return false
      if (statusFilter !== 'all' && campaign.status !== statusFilter) return false
      if (channelFilter !== 'all' && campaign.campaignChannel !== channelFilter) return false
      if (approvalFilter === 'approved' && !campaign.isApproved) return false
      if (approvalFilter === 'not_approved' && campaign.isApproved) return false
      if (!normalizedQuery) return true

      return (
        campaign.name.toLowerCase().includes(normalizedQuery) ||
        campaign.companyName.toLowerCase().includes(normalizedQuery) ||
        campaign.campaignPurpose.toLowerCase().includes(normalizedQuery)
      )
    })

    return filtered.sort((a, b) => {
      if (sortBy === 'most_recently_sent') {
        const diff = getMostRecentlySentMs(b) - getMostRecentlySentMs(a)
        if (diff !== 0) return diff
        return b.id - a.id
      }
      if (sortBy === 'newest_first') return b.id - a.id
      if (sortBy === 'oldest_first') return a.id - b.id
      if (sortBy === 'name_az') return a.name.localeCompare(b.name)
      return b.name.localeCompare(a.name)
    })
  }, [approvalFilter, campaigns, channelFilter, companyFilter, reviewTab, searchQuery, sortBy, statusFilter])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <AdminHero
          className="mb-6"
          eyebrow="Campaign hub"
          title="Campaigns"
          description="Global campaign management across all companies."
          variant="teal"
          meta={
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5">
                Total: {campaigns.length}
              </span>
              <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5">
                Approved: {approvedCount}
              </span>
              <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5">
                Active: {activeCount}
              </span>
            </div>
          }
        />

        <div className="admin-tab-bar" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={reviewTab === 'pending'}
            onClick={() => setReviewTab('pending')}
            className={`admin-tab-bar__tab ${reviewTab === 'pending' ? 'admin-tab-bar__tab--active' : ''}`}
          >
            Pending
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={reviewTab === 'approved'}
            onClick={() => setReviewTab('approved')}
            className={`admin-tab-bar__tab ${reviewTab === 'approved' ? 'admin-tab-bar__tab--active' : ''}`}
          >
            Approved
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={reviewTab === 'rejected'}
            onClick={() => setReviewTab('rejected')}
            className={`admin-tab-bar__tab ${reviewTab === 'rejected' ? 'admin-tab-bar__tab--active' : ''}`}
          >
            Rejected
          </button>
        </div>

        <section className="rounded-xl border border-gray-200/80 bg-white p-4 mb-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, company, purpose"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-[var(--admin-ui-accent)]/30 focus:ring-2 xl:col-span-2"
            />
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-[var(--admin-ui-accent)]/30 focus:ring-2"
            >
              <option value="all">All companies</option>
              {companyOptions.map((companyName) => (
                <option key={companyName} value={companyName}>
                  {companyName}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-[var(--admin-ui-accent)]/30 focus:ring-2"
            >
              <option value="all">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-[var(--admin-ui-accent)]/30 focus:ring-2"
            >
              <option value="all">All channels</option>
              {channelOptions.map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value as 'all' | 'approved' | 'not_approved')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-[var(--admin-ui-accent)]/30 focus:ring-2"
            >
              <option value="all">All approvals</option>
              <option value="approved">Approved only</option>
              <option value="not_approved">Not approved only</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-[var(--admin-ui-accent)]/30 focus:ring-2"
            >
              <option value="most_recently_sent">Sort: Most recently sent</option>
              <option value="newest_first">Sort: Newest first</option>
              <option value="oldest_first">Sort: Oldest first</option>
              <option value="name_az">Sort: Name A-Z</option>
              <option value="name_za">Sort: Name Z-A</option>
            </select>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Showing {visibleCampaigns.length} of {campaigns.length} campaigns.
          </p>
        </section>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50/90 border border-red-200 text-red-700 px-5 py-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[220px]">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-[var(--admin-ui-accent)]" />
          </div>
        ) : visibleCampaigns.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-500">
            No campaigns match your current filters.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-transparent p-4">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-white text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <th className="whitespace-nowrap px-3 py-3">Name</th>
                  <th className="whitespace-nowrap px-3 py-3">Company</th>
                  <th className="whitespace-nowrap px-3 py-3">Purpose</th>
                  <th className="whitespace-nowrap px-3 py-3">Channel</th>
                  <th className="whitespace-nowrap px-3 py-3">Status</th>
                  <th className="whitespace-nowrap px-3 py-3">Approved</th>
                  <th className="whitespace-nowrap px-3 py-3">Dates</th>
                </tr>
              </thead>
              <tbody>
                {visibleCampaigns.map((campaign) => {
                  const detailsPath = `${basePath}/companies/${campaign.companyId}/campaigns/${campaign.id}`
                  return (
                    <tr
                      key={`${campaign.companyId}:${campaign.id}`}
                      className="border-t border-slate-100 transition-colors hover:bg-slate-50/70 cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onClick={() => router.push(detailsPath)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          router.push(detailsPath)
                        }
                      }}
                    >
                      <td className="px-3 py-3 text-slate-800">
                        <div className="font-medium">{campaign.name}</div>
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        <Link
                          href={`${basePath}/companies/${campaign.companyId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[var(--admin-ui-accent)] hover:underline"
                        >
                          {campaign.companyName}
                        </Link>
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
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
