'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { adminApi, type CompanyLeanResponse } from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'


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
  const basePath = pathname?.startsWith('/dev-admin') ? '/dev-admin' : '/admin'
  const { env } = useApiEnv()
  const [companies, setCompanies] = useState<CompanyLeanResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await adminApi.getCompanies()
        setCompanies(data)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load companies')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [env])

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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <header className="rounded-xl p-5 bg-[whitesmoke] border border-gray-200/80 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Companies</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage registered companies</p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#0e0e39] text-white text-sm font-medium hover:opacity-90"
          >
            Create company
          </button>
        </header>

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
          <div className="flex flex-col items-center justify-center min-h-[320px] gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[var(--brand-color-2)]" />
            <p className="text-sm text-gray-500">Loading companies…</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Verified</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Sender ID</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Sender ID status</th>
                </tr>
              </thead>
              <tbody>
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <p className="text-gray-500 font-medium">No companies found</p>
                      <p className="text-sm text-gray-400 mt-1">Companies will appear here once they register</p>
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => (
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
                      <td className="py-3.5 px-5 text-sm font-medium text-gray-900 group-hover:text-[var(--brand-color-2)] transition-colors">{company.name}</td>
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
        )}
      </div>
    </div>
  )
}
