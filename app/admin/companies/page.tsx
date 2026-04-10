'use client'

import { useEffect, useMemo, useRef, useState, Suspense } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { adminApi, type CompanyLeanResponse, type CompanyReviewStatus } from '@/lib/adminApi'
import { getAdminBasePath } from '@/lib/adminNamespace'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import AdminHero from '@/app/admin/components/AdminHero'
import { ChevronDown, ChevronUp, ChevronsUpDown, Filter, MoreHorizontal, Search, Rows3, Grid2X2 } from 'lucide-react'

type SortKey = 'createdAt' | 'updatedAt' | 'name' | 'email' | 'industry' | 'verified' | 'lifecycle' | 'senderId'
type SortDir = 'asc' | 'desc'
type ReviewTab = 'all' | 'pending' | 'approved' | 'rejected'
type ViewMode = 'list' | 'grid'

function getCompanyReviewStatus(company: CompanyLeanResponse): 'Pending' | 'Approved' | 'Rejected' {
  if (company.reviewStatus) return company.reviewStatus
  return company.isCompanyVerified ? 'Approved' : 'Pending'
}

function toComparableTimestamp(value?: string): number {
  if (!value) return Number.NEGATIVE_INFINITY
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed
}

function CompanyTableLogoCell({ company }: { company: Pick<CompanyLeanResponse, 'profileImageUrl'> }) {
  const url = company.profileImageUrl?.trim()
  return (
    <div className="flex w-9 items-center justify-center">
      {url ? (
        // Remote tenant URLs; avoid next/image domain allowlist churn.
        // eslint-disable-next-line @next/next/no-img-element -- see above
        <img
          src={url}
          alt=""
          className="h-9 w-9 rounded-full object-cover"
        />
      ) : (
        <span className="block h-9 w-9 shrink-0" aria-hidden />
      )}
    </div>
  )
}

function CompanyListIdentity({
  company,
  variant,
}: {
  company: Pick<CompanyLeanResponse, 'name' | 'email' | 'profileImageUrl'>
  variant: 'table' | 'grid'
}) {
  const url = company.profileImageUrl?.trim()
  const imgClass = 'h-11 w-11 shrink-0 rounded-lg border border-gray-200 bg-gray-50 object-cover'

  if (variant === 'table') {
    return (
      <div className="min-w-0">
        <div className="font-medium text-gray-900 transition-colors group-hover:text-[var(--admin-ui-accent)]">
          {company.name}
        </div>
        <div className="text-xs font-normal text-gray-500">{company.email || '—'}</div>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 items-start gap-3">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- see above
        <img src={url} alt="" className={imgClass} />
      ) : null}
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-gray-900">{company.name}</h3>
        <p className="mt-0.5 text-sm text-gray-500">{company.email || '—'}</p>
      </div>
    </div>
  )
}

function CompaniesPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const basePath = getAdminBasePath(pathname)
  const { env } = useApiEnv()
  const [companies, setCompanies] = useState<CompanyLeanResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [query, setQuery] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')
  const [filterVerified, setFilterVerified] = useState(true)
  const [filterPendingVerification, setFilterPendingVerification] = useState(true)
  const [filterActive, setFilterActive] = useState(true)
  const [filterDeactivated, setFilterDeactivated] = useState(true)
  const [reviewTab, setReviewTab] = useState<ReviewTab>('pending')
  const [filtersPopoverOpen, setFiltersPopoverOpen] = useState(false)
  const filtersPopoverRef = useRef<HTMLDivElement>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false)
  const [rowMenu, setRowMenu] = useState<{ companyId: number; top: number; left: number } | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await adminApi.getCompanies({ includeDeactivated: true })
        setCompanies(data)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load companies')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [env])

  useEffect(() => {
    const s = searchParams?.get('search')?.trim()
    if (s) setQuery(s)
  }, [searchParams])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filtersPopoverRef.current && !filtersPopoverRef.current.contains(e.target as Node)) {
        setFiltersPopoverOpen(false)
      }
    }
    if (filtersPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [filtersPopoverOpen])

  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    companyId: '',
    description: 'Description not set',
    industry: 'Technology',
    email: '',
    phoneNumber: '',
    physicalAddress: '',
    websiteUrl: '',
    senderId: '',
  })

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.name.trim() || !createForm.companyId.trim() || !createForm.email.trim() || !createForm.phoneNumber.trim() || !createForm.physicalAddress.trim()) {
      toast.error('Name, Company ID, Email, Phone and Address are required')
      return
    }
    setCreateLoading(true)
    setError('')
    try {
      const created = await adminApi.createCompany({
        Name: createForm.name.trim(),
        CompanyId: createForm.companyId.trim(),
        Description: createForm.description || 'Description not set',
        Industry: createForm.industry,
        Email: createForm.email.trim(),
        PhoneNumber: createForm.phoneNumber.trim(),
        PhysicalAddress: createForm.physicalAddress.trim(),
        WebsiteUrl: createForm.websiteUrl.trim() || undefined,
        SenderId: createForm.senderId.trim() || undefined,
      })
      setCompanies((prev) => [created, ...prev])
      setCreateOpen(false)
      setCreateForm({ name: '', companyId: '', description: 'Description not set', industry: 'Technology', email: '', phoneNumber: '', physicalAddress: '', websiteUrl: '', senderId: '' })
      toast.success('Company created')
      router.push(`${basePath}/companies/${created.id}`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create company')
    } finally {
      setCreateLoading(false)
    }
  }

  const uniqueIndustries = useMemo(() => {
    const set = new Set(companies.map((company) => company.industry).filter(Boolean))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [companies])

  const filteredAndSortedCompanies = useMemo(() => {
    const search = query.trim().toLowerCase()
    let list = companies.filter((company) => {
      const reviewStatus = getCompanyReviewStatus(company)
      if (reviewTab === 'all') {
        // Include every review status.
      } else
      if (reviewTab === 'pending' && reviewStatus !== 'Pending') return false
      if (reviewTab === 'approved' && reviewStatus !== 'Approved') return false
      if (reviewTab === 'rejected' && reviewStatus !== 'Rejected') return false

      if (industryFilter && company.industry !== industryFilter) return false

      const noVerificationFilter = !filterVerified && !filterPendingVerification
      if (!noVerificationFilter) {
        if (filterVerified && company.isCompanyVerified) {
          // allowed
        } else if (filterPendingVerification && !company.isCompanyVerified) {
          // allowed
        } else {
          return false
        }
      }

      const noLifecycleFilter = !filterActive && !filterDeactivated
      if (!noLifecycleFilter) {
        if (filterActive && company.isActive) {
          // allowed
        } else if (filterDeactivated && !company.isActive) {
          // allowed
        } else {
          return false
        }
      }

      if (!search) return true

      return [
        company.name,
        company.email,
        company.phoneNumber,
        company.industry,
        company.senderId,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(search))
    })

    list = [...list].sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'createdAt':
          cmp = toComparableTimestamp(a.createdAt) - toComparableTimestamp(b.createdAt)
          if (cmp === 0) cmp = a.id - b.id
          break
        case 'updatedAt':
          cmp = toComparableTimestamp(a.updatedAt) - toComparableTimestamp(b.updatedAt)
          if (cmp === 0) cmp = a.id - b.id
          break
        case 'name':
          cmp = (a.name || '').localeCompare(b.name || '')
          break
        case 'email':
          cmp = (a.email || '').localeCompare(b.email || '')
          break
        case 'industry':
          cmp = (a.industry || '').localeCompare(b.industry || '')
          break
        case 'verified':
          cmp = Number(a.isCompanyVerified) - Number(b.isCompanyVerified)
          break
        case 'lifecycle':
          cmp = Number(a.isActive) - Number(b.isActive)
          break
        case 'senderId':
          cmp = (a.senderId || '').localeCompare(b.senderId || '')
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [
    companies,
    reviewTab,
    industryFilter,
    filterVerified,
    filterPendingVerification,
    filterActive,
    filterDeactivated,
    query,
    sortBy,
    sortDir,
  ])

  const handleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortBy(key)
      setSortDir('asc')
    }
  }

  const handleToggleSortDirection = () => {
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortBy !== column) return <ChevronsUpDown className="w-4 h-4 inline-block ml-1 opacity-50" aria-hidden />
    return sortDir === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline-block ml-1" aria-hidden />
    ) : (
      <ChevronDown className="w-4 h-4 inline-block ml-1" aria-hidden />
    )
  }

  const reviewCounts = useMemo(() => {
    const all = companies.length
    const pending = companies.filter((c) => getCompanyReviewStatus(c) === 'Pending').length
    const approved = companies.filter((c) => getCompanyReviewStatus(c) === 'Approved').length
    const rejected = companies.filter((c) => getCompanyReviewStatus(c) === 'Rejected').length
    return { all, pending, approved, rejected }
  }, [companies])

  const handleSetCompanyReviewStatus = async (company: CompanyLeanResponse, status: CompanyReviewStatus) => {
    let reason: string | undefined
    if (status === 'Rejected') {
      const entered = window.prompt('Provide rejection reason (required):', company.reviewReason ?? '')
      if (entered == null) return
      reason = entered.trim()
      if (!reason) {
        toast.error('Rejection reason is required')
        return
      }
    }
    try {
      const updated = await adminApi.reviewCompany(company.id, { status, reason })
      setCompanies((prev) => prev.map((item) => (item.id === company.id ? { ...item, ...updated } : item)))
      toast.success(`${company.name} set to ${status}`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update review')
    }
  }

  const handleBulkAction = async (action: 'approve' | 'reject' | 'export') => {
    if (selectedIds.length === 0) return
    if (action === 'export') {
      toast.success(`Export started for ${selectedIds.length} selected`)
      setBulkActionsOpen(false)
      return
    }
    const selected = companies.filter((company) => selectedIds.includes(company.id))
    for (const company of selected) {
      await handleSetCompanyReviewStatus(company, action === 'approve' ? 'Approved' : 'Rejected')
    }
    setBulkActionsOpen(false)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <AdminHero
          className="mb-6"
          eyebrow="Organization management"
          title="Companies"
          description="View and manage registered companies."
          variant="blue"
          actions={
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="rounded-full bg-[var(--brand-color-1)] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-black"
              >
                Create company
              </button>
            </div>
          }
        />

        <div className="admin-tab-bar" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={reviewTab === 'all'}
            onClick={() => setReviewTab('all')}
            className={`admin-tab-bar__tab inline-flex items-center gap-1.5 ${reviewTab === 'all' ? 'admin-tab-bar__tab--active' : ''}`}
          >
            All{' '}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                reviewTab === 'all'
                  ? 'bg-[color-mix(in_srgb,var(--brand-color-3)_22%,transparent)]'
                  : 'bg-[var(--admin-heading)]/[0.08] admin-dark:bg-white/15'
              }`}
            >
              {reviewCounts.all}
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={reviewTab === 'pending'}
            onClick={() => setReviewTab('pending')}
            className={`admin-tab-bar__tab inline-flex items-center gap-1.5 ${reviewTab === 'pending' ? 'admin-tab-bar__tab--active' : ''}`}
          >
            Pending{' '}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                reviewTab === 'pending'
                  ? 'bg-[color-mix(in_srgb,var(--brand-color-3)_22%,transparent)]'
                  : 'bg-[var(--admin-heading)]/[0.08] admin-dark:bg-white/15'
              }`}
            >
              {reviewCounts.pending}
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={reviewTab === 'approved'}
            onClick={() => setReviewTab('approved')}
            className={`admin-tab-bar__tab inline-flex items-center gap-1.5 ${reviewTab === 'approved' ? 'admin-tab-bar__tab--active' : ''}`}
          >
            Approved{' '}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                reviewTab === 'approved'
                  ? 'bg-[color-mix(in_srgb,var(--brand-color-3)_22%,transparent)]'
                  : 'bg-[var(--admin-heading)]/[0.08] admin-dark:bg-white/15'
              }`}
            >
              {reviewCounts.approved}
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={reviewTab === 'rejected'}
            onClick={() => setReviewTab('rejected')}
            className={`admin-tab-bar__tab inline-flex items-center gap-1.5 ${reviewTab === 'rejected' ? 'admin-tab-bar__tab--active' : ''}`}
          >
            Rejected{' '}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                reviewTab === 'rejected'
                  ? 'bg-[color-mix(in_srgb,var(--brand-color-3)_22%,transparent)]'
                  : 'bg-[var(--admin-heading)]/[0.08] admin-dark:bg-white/15'
              }`}
            >
              {reviewCounts.rejected}
            </span>
          </button>
        </div>

        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create company</h2>
              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company ID *</label>
                  <input
                    type="text"
                    value={createForm.companyId}
                    onChange={(e) => setCreateForm((f) => ({ ...f, companyId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select
                    value={createForm.industry}
                    onChange={(e) => setCreateForm((f) => ({ ...f, industry: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Farming">Farming</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Construction">Construction</option>
                    <option value="Energy">Energy</option>
                    <option value="TransportationAndLogistics">Transportation & Logistics</option>
                    <option value="FinancialServices">Financial Services</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    value={createForm.phoneNumber}
                    onChange={(e) => setCreateForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Physical address *</label>
                  <input
                    type="text"
                    value={createForm.physicalAddress}
                    onChange={(e) => setCreateForm((f) => ({ ...f, physicalAddress: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={createForm.description}
                    onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={createForm.websiteUrl}
                    onChange={(e) => setCreateForm((f) => ({ ...f, websiteUrl: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sender ID</label>
                  <input
                    type="text"
                    value={createForm.senderId}
                    onChange={(e) => setCreateForm((f) => ({ ...f, senderId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-4 py-2 rounded-lg bg-[var(--brand-color-1)] text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {createLoading ? 'Creating…' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50/90 border border-red-200 text-red-700 px-5 py-4 shadow-sm">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center min-h-[320px]">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[var(--admin-ui-accent)]" />
          </div>
        ) : (
          <div className="bg-transparent rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBulkActionsOpen((o) => !o)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Actions
                  <ChevronDown className="h-4 w-4" />
                </button>
                {bulkActionsOpen ? (
                  <div className="absolute left-0 top-full z-50 mt-2 w-44 rounded-xl border border-gray-200 bg-white p-1 shadow-xl">
                    <button type="button" onClick={() => handleBulkAction('approve')} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100">
                      Approve
                    </button>
                    <button type="button" onClick={() => handleBulkAction('reject')} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100">
                      Reject
                    </button>
                    <button type="button" onClick={() => handleBulkAction('export')} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100">
                      Export
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700">
                {selectedIds.length} selected
              </div>
              <div className="relative" ref={filtersPopoverRef}>
                <button
                  type="button"
                  onClick={() => setFiltersPopoverOpen((o) => !o)}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--admin-ui-accent)] ${
                    filtersPopoverOpen
                      ? 'bg-[var(--admin-ui-accent)]/10 text-[var(--admin-ui-accent)]'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-label="Filters"
                  aria-expanded={filtersPopoverOpen}
                  aria-haspopup="true"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  {(industryFilter || !filterVerified || !filterPendingVerification || !filterActive || !filterDeactivated) && (
                    <span className="flex h-2 w-2 rounded-full bg-[var(--admin-ui-accent)]" aria-hidden />
                  )}
                </button>
                {filtersPopoverOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border border-gray-200 bg-white py-3 px-4 shadow-lg">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="filter-industry" className="block text-sm font-medium text-gray-700 mb-1.5">
                          Industry
                        </label>
                        <select
                          id="filter-industry"
                          value={industryFilter}
                          onChange={(e) => setIndustryFilter(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-ui-accent)]"
                        >
                          <option value="">All</option>
                          {uniqueIndustries.map((industry) => (
                            <option key={industry} value={industry}>
                              {industry}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-700 mb-2">Verification</span>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filterVerified}
                              onChange={(e) => setFilterVerified(e.target.checked)}
                              className="rounded border-gray-300 text-[var(--admin-ui-accent)] focus:ring-[var(--admin-ui-accent)]"
                            />
                            <span className="text-sm text-gray-700">Verified</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filterPendingVerification}
                              onChange={(e) => setFilterPendingVerification(e.target.checked)}
                              className="rounded border-gray-300 text-[var(--admin-ui-accent)] focus:ring-[var(--admin-ui-accent)]"
                            />
                            <span className="text-sm text-gray-700">Pending verification</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-700 mb-2">Lifecycle</span>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filterActive}
                              onChange={(e) => setFilterActive(e.target.checked)}
                              className="rounded border-gray-300 text-[var(--admin-ui-accent)] focus:ring-[var(--admin-ui-accent)]"
                            />
                            <span className="text-sm text-gray-700">Active</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filterDeactivated}
                              onChange={(e) => setFilterDeactivated(e.target.checked)}
                              className="rounded border-gray-300 text-[var(--admin-ui-accent)] focus:ring-[var(--admin-ui-accent)]"
                            />
                            <span className="text-sm text-gray-700">Deactivated</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative min-w-[220px] flex-1 max-w-[420px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <label htmlFor="companies-search" className="sr-only">Search companies</label>
                <input
                  id="companies-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, email, phone, industry, sender ID"
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--admin-ui-accent)]"
                />
              </div>
              <select
                value={reviewTab}
                onChange={(e) => setReviewTab(e.target.value as ReviewTab)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
              >
                <option value="all">Status: All</option>
                <option value="pending">Status: Pending</option>
                <option value="approved">Status: Approved</option>
                <option value="rejected">Status: Rejected</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
              >
                <option value="createdAt">Created date</option>
                <option value="updatedAt">Modified date</option>
                <option value="name">Name (A-Z)</option>
                <option value="email">Email</option>
                <option value="industry">Industry</option>
                <option value="verified">Status</option>
                <option value="lifecycle">Lifecycle</option>
                <option value="senderId">Sender ID</option>
              </select>
              <div className="ml-auto inline-flex items-center rounded-lg border border-gray-300 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`inline-flex items-center justify-center rounded-md p-2 transition ${
                    viewMode === 'list'
                      ? 'bg-[var(--admin-ui-accent)]/10 text-[var(--admin-ui-accent)]'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label="List view"
                  title="List view"
                >
                  <Rows3 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`inline-flex items-center justify-center rounded-md p-2 transition ${
                    viewMode === 'grid'
                      ? 'bg-[var(--admin-ui-accent)]/10 text-[var(--admin-ui-accent)]'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <Grid2X2 className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm font-semibold text-gray-700">{filteredAndSortedCompanies.length} results</span>
            </div>
            <div className="p-4 overflow-x-auto">
            {viewMode === 'list' ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <th className="text-left py-3.5 px-4">
                    <input
                      type="checkbox"
                      checked={filteredAndSortedCompanies.length > 0 && filteredAndSortedCompanies.every((c) => selectedIds.includes(c.id))}
                      onChange={(event) =>
                        setSelectedIds(
                          event.target.checked ? filteredAndSortedCompanies.map((company) => company.id) : [],
                        )
                      }
                    />
                  </th>
                  <th scope="col" className="w-11 py-3.5 pl-3 pr-2 text-left" />
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={handleToggleSortDirection}
                      className="inline-flex items-center hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--admin-ui-accent)] rounded"
                    >
                      Company
                      <SortIcon column="name" />
                    </button>
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('verified')}
                      className="inline-flex items-center hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--admin-ui-accent)] rounded"
                    >
                      Verified
                      <SortIcon column="verified" />
                    </button>
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('lifecycle')}
                      className="inline-flex items-center hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--admin-ui-accent)] rounded"
                    >
                      Lifecycle
                      <SortIcon column="lifecycle" />
                    </button>
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('senderId')}
                      className="inline-flex items-center hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--admin-ui-accent)] rounded"
                    >
                      Sender ID
                      <SortIcon column="senderId" />
                    </button>
                  </th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16">
                      <p className="text-gray-500 font-medium">
                        {companies.length === 0 ? 'No companies found' : 'No companies match the current filters'}
                      </p>
                      {companies.length === 0 ? (
                        <p className="text-sm text-gray-400 mt-1">Companies will appear here once they register</p>
                      ) : null}
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedCompanies.map((company) => (
                    <tr
                      key={company.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => router.push(`${basePath}/companies/${company.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          router.push(`${basePath}/companies/${company.id}`)
                        }
                      }}
                      className="border-b border-gray-100 hover:bg-[var(--admin-ui-accent)]/5 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 align-middle">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(company.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(event) =>
                            setSelectedIds((prev) =>
                              event.target.checked ? [...prev, company.id] : prev.filter((id) => id !== company.id),
                            )
                          }
                        />
                      </td>
                      <td className="py-3.5 align-middle">
                        <CompanyTableLogoCell company={company} />
                      </td>
                      <td className="py-3.5 align-middle text-sm text-gray-900 transition-colors">
                        <CompanyListIdentity company={company} variant="table" />
                      </td>
                      <td className="py-3.5 px-5 text-sm">
                        {company.phoneNumber ? (
                          <a
                            href={`tel:${company.phoneNumber}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[var(--admin-ui-accent)] hover:text-[var(--brand-color-1)] hover:underline underline-offset-1"
                          >
                            {company.phoneNumber}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-sm">
                        {getCompanyReviewStatus(company) === 'Approved' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            Approved
                          </span>
                        ) : getCompanyReviewStatus(company) === 'Rejected' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200/80">
                            Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-sm">
                        {company.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300/80">
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-sm text-gray-700">
                        {company.senderId || <span className="text-gray-400">Not set</span>}
                      </td>
                      <td className="relative py-3.5 px-4 text-sm">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            const rect = event.currentTarget.getBoundingClientRect()
                            setRowMenu((prev) =>
                              prev?.companyId === company.id
                                ? null
                                : {
                                    companyId: company.id,
                                    top: rect.bottom + 8,
                                    left: rect.right - 176,
                                  },
                            )
                          }}
                          className="rounded-lg bg-white p-2 text-gray-600 hover:bg-gray-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            ) : filteredAndSortedCompanies.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 font-medium">
                  {companies.length === 0 ? 'No companies found' : 'No companies match the current filters'}
                </p>
                {companies.length === 0 ? (
                  <p className="text-sm text-gray-400 mt-1">Companies will appear here once they register</p>
                ) : null}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredAndSortedCompanies.map((company) => (
                  <article
                    key={company.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`${basePath}/companies/${company.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        router.push(`${basePath}/companies/${company.id}`)
                      }
                    }}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[var(--admin-ui-accent)]/40 hover:shadow-md cursor-pointer"
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(company.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(event) =>
                          setSelectedIds((prev) =>
                            event.target.checked ? [...prev, company.id] : prev.filter((id) => id !== company.id),
                          )
                        }
                      />
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          const rect = event.currentTarget.getBoundingClientRect()
                          setRowMenu((prev) =>
                            prev?.companyId === company.id
                              ? null
                              : {
                                  companyId: company.id,
                                  top: rect.bottom + 8,
                                  left: rect.right - 176,
                                },
                          )
                        }}
                        className="rounded-lg bg-white p-2 text-gray-600 hover:bg-gray-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                    <CompanyListIdentity company={company} variant="grid" />
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-500">Phone</span>
                        {company.phoneNumber ? (
                          <a
                            href={`tel:${company.phoneNumber}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[var(--admin-ui-accent)] hover:text-[var(--brand-color-1)] hover:underline underline-offset-1"
                          >
                            {company.phoneNumber}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-500">Verified</span>
                        {getCompanyReviewStatus(company) === 'Approved' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            Approved
                          </span>
                        ) : getCompanyReviewStatus(company) === 'Rejected' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200/80">
                            Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-500">Lifecycle</span>
                        {company.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300/80">
                            Deactivated
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-500">Sender ID</span>
                        <span className="text-gray-700">{company.senderId || 'Not set'}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            </div>
          </div>
        )}
        {rowMenu ? (
          <div
            className="fixed inset-0 z-[200]"
            onClick={() => setRowMenu(null)}
          >
            <div
              className="fixed z-[210] w-44 rounded-xl border border-gray-200 bg-white p-1 shadow-xl"
              style={{ top: rowMenu.top, left: rowMenu.left }}
              onClick={(event) => event.stopPropagation()}
            >
              {(() => {
                const company = companies.find((item) => item.id === rowMenu.companyId)
                if (!company) return null
                return (
                  <>
                    <button type="button" onClick={() => { router.push(`${basePath}/companies/${company.id}`); setRowMenu(null) }} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100">View details</button>
                    <button type="button" onClick={() => { void handleSetCompanyReviewStatus(company, 'Approved'); setRowMenu(null) }} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100">Approve</button>
                    <button type="button" onClick={() => { void handleSetCompanyReviewStatus(company, 'Rejected'); setRowMenu(null) }} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100">Reject</button>
                    <button type="button" onClick={() => { router.push(`${basePath}/companies/${company.id}`); setRowMenu(null) }} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100">Edit company</button>
                    <button type="button" onClick={() => { router.push(`${basePath}/companies/${company.id}`); setRowMenu(null) }} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100">Assign Sender ID</button>
                  </>
                )
              })()}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function CompaniesPageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-[var(--brand-color-3)]" />
    </div>
  )
}

export default function CompaniesPage() {
  return (
    <Suspense fallback={<CompaniesPageFallback />}>
      <CompaniesPageContent />
    </Suspense>
  )
}
