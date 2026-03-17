'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { adminApi, type CompanyLeanResponse } from '@/lib/adminApi'
import { getAdminBasePath } from '@/lib/adminNamespace'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import AdminHero from '@/app/admin/components/AdminHero'
import { ChevronDown, ChevronUp, ChevronsUpDown, Filter, Search } from 'lucide-react'

type SortKey = 'name' | 'email' | 'industry' | 'verified' | 'lifecycle' | 'senderId'
type SortDir = 'asc' | 'desc'


function SenderIdStatusBadge({
  company,
  rejectedInSession,
}: {
  company: CompanyLeanResponse
  rejectedInSession?: boolean
}) {
  if (!company.senderId) {
    return (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200/80"
        title="Company has not set a sender ID."
      >
        No sender ID
      </span>
    )
  }
  if (company.isApprovedSenderId) {
    return (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80"
        title="Sender ID approved for use."
      >
        Approved
      </span>
    )
  }
  if (rejectedInSession) {
    return (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200/80"
        title="Sender ID was rejected by admin."
      >
        Rejected
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80"
      title="Awaiting admin approval. Open company details to approve or reject."
    >
      Pending
    </span>
  )
}

export default function CompaniesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const basePath = getAdminBasePath(pathname)
  const { env } = useApiEnv()
  const [companies, setCompanies] = useState<CompanyLeanResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [query, setQuery] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')
  const [filterVerified, setFilterVerified] = useState(true)
  const [filterPendingVerification, setFilterPendingVerification] = useState(true)
  const [filterActive, setFilterActive] = useState(true)
  const [filterDeactivated, setFilterDeactivated] = useState(true)
  const [filtersPopoverOpen, setFiltersPopoverOpen] = useState(false)
  const filtersPopoverRef = useRef<HTMLDivElement>(null)

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

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortBy !== column) return <ChevronsUpDown className="w-4 h-4 inline-block ml-1 opacity-50" aria-hidden />
    return sortDir === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline-block ml-1" aria-hidden />
    ) : (
      <ChevronDown className="w-4 h-4 inline-block ml-1" aria-hidden />
    )
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
                className="rounded-full bg-[#0f1222] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-black"
              >
                Create company
              </button>
            </div>
          }
        />

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
                    className="px-4 py-2 rounded-lg bg-[#0e0e39] text-white hover:opacity-90 disabled:opacity-50"
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
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[var(--brand-color-2)]" />
          </div>
        ) : (
          <div className="bg-transparent rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 px-5 py-4 border-b border-gray-200 bg-gray-50">
              <div className="relative" ref={filtersPopoverRef}>
                <button
                  type="button"
                  onClick={() => setFiltersPopoverOpen((o) => !o)}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-2)] ${
                    filtersPopoverOpen
                      ? 'bg-[var(--brand-color-2)]/10 text-[var(--brand-color-2)]'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-label="Filters"
                  aria-expanded={filtersPopoverOpen}
                  aria-haspopup="true"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  {(industryFilter || !filterVerified || !filterPendingVerification || !filterActive || !filterDeactivated) && (
                    <span className="flex h-2 w-2 rounded-full bg-[var(--brand-color-2)]" aria-hidden />
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
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-2)]"
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
                              className="rounded border-gray-300 text-[var(--brand-color-2)] focus:ring-[var(--brand-color-2)]"
                            />
                            <span className="text-sm text-gray-700">Verified</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filterPendingVerification}
                              onChange={(e) => setFilterPendingVerification(e.target.checked)}
                              className="rounded border-gray-300 text-[var(--brand-color-2)] focus:ring-[var(--brand-color-2)]"
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
                              className="rounded border-gray-300 text-[var(--brand-color-2)] focus:ring-[var(--brand-color-2)]"
                            />
                            <span className="text-sm text-gray-700">Active</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filterDeactivated}
                              onChange={(e) => setFilterDeactivated(e.target.checked)}
                              className="rounded border-gray-300 text-[var(--brand-color-2)] focus:ring-[var(--brand-color-2)]"
                            />
                            <span className="text-sm text-gray-700">Deactivated</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="h-8 w-px bg-gray-200 shrink-0" aria-hidden />
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Sort</span>
                <label htmlFor="company-sort-by" className="sr-only">Sort by</label>
                <select
                  id="company-sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-2)]"
                >
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="industry">Industry</option>
                  <option value="verified">Verification</option>
                  <option value="lifecycle">Lifecycle</option>
                  <option value="senderId">Sender ID</option>
                </select>
                <select
                  aria-label="Sort direction"
                  value={sortDir}
                  onChange={(e) => setSortDir(e.target.value as SortDir)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-2)]"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
              <div className="relative min-w-[220px] flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <label htmlFor="companies-search" className="sr-only">Search companies</label>
                <input
                  id="companies-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, email, phone, industry, sender ID"
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-2)]"
                />
              </div>
              <span className="text-sm text-gray-500 ml-auto shrink-0">
                Showing {filteredAndSortedCompanies.length} of {companies.length}
              </span>
            </div>
            <div className="p-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('name')}
                      className="inline-flex items-center hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-2)] rounded"
                    >
                      Name
                      <SortIcon column="name" />
                    </button>
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('email')}
                      className="inline-flex items-center hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-2)] rounded"
                    >
                      Email
                      <SortIcon column="email" />
                    </button>
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('verified')}
                      className="inline-flex items-center hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-2)] rounded"
                    >
                      Verified
                      <SortIcon column="verified" />
                    </button>
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('lifecycle')}
                      className="inline-flex items-center hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-2)] rounded"
                    >
                      Lifecycle
                      <SortIcon column="lifecycle" />
                    </button>
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('senderId')}
                      className="inline-flex items-center hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-2)] rounded"
                    >
                      Sender ID
                      <SortIcon column="senderId" />
                    </button>
                  </th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Sender ID status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
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
                      className="border-b border-gray-100 hover:bg-[var(--brand-color-2)]/5 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-5 text-sm font-medium text-gray-900 group-hover:text-[var(--brand-color-2)] transition-colors">
                        {company.name}
                      </td>
                      <td className="py-3.5 px-5 text-sm">
                        {company.email ? (
                          <a
                            href={`mailto:${company.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[var(--brand-color-2)] hover:text-[var(--brand-color-1)] hover:underline underline-offset-1"
                          >
                            {company.email}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-sm">
                        {company.phoneNumber ? (
                          <a
                            href={`tel:${company.phoneNumber}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[var(--brand-color-2)] hover:text-[var(--brand-color-1)] hover:underline underline-offset-1"
                          >
                            {company.phoneNumber}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-sm">
                        {company.isCompanyVerified ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-sm">
                        {company.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300/80">
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-sm text-gray-700">
                        {company.senderId || <span className="text-gray-400">Not set</span>}
                      </td>
                      <td className="py-3.5 px-5 text-sm">
                        <SenderIdStatusBadge company={company} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
