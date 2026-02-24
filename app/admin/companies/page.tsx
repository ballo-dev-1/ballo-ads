'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi, type CompanyLeanResponse } from '@/lib/adminApi'

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
      title="Awaiting admin approval. Use the row menu to approve or reject."
    >
      Pending
    </span>
  )
}

export default function CompaniesPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<CompanyLeanResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)
  const [rejectedSenderIdIds, setRejectedSenderIdIds] = useState<Set<number>>(new Set())
  const dropdownRef = useRef<HTMLDivElement>(null)

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
  }, [])

  useEffect(() => {
    if (openDropdownId === null) return
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdownId])

  const handleApproveSenderId = async (companyId: number, approve: boolean) => {
    try {
      setError('')
      const updated = await adminApi.approveCompanySenderId(companyId, approve)
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, ...updated } : c))
      )
      setRejectedSenderIdIds((prev) => {
        const next = new Set(prev)
        if (approve) next.delete(companyId)
        else next.add(companyId)
        return next
      })
      setOpenDropdownId(null)
    } catch (e: unknown) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Failed to approve/reject sender ID')
    }
  }

  const handleSetSenderIdPending = (companyId: number, currentlyApproved: boolean) => {
    if (currentlyApproved) {
      handleApproveSenderId(companyId, false)
    } else {
      setRejectedSenderIdIds((prev) => {
        const next = new Set(prev)
        next.delete(companyId)
        return next
      })
      setOpenDropdownId(null)
    }
  }

  const handleProfileVerificationClick = () => {
    toast.error(NOT_IMPLEMENTED_MESSAGE)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <header className="rounded-xl p-5 bg-[whitesmoke] border border-gray-200/80 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Companies</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage registered companies</p>
        </header>
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
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider w-14" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
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
                      onClick={() => router.push(`/admin/companies/${company.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          router.push(`/admin/companies/${company.id}`)
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
                        <SenderIdStatusBadge
                          company={company}
                          rejectedInSession={rejectedSenderIdIds.has(company.id)}
                        />
                      </td>
                      <td className="py-3.5 px-5 text-sm relative" onClick={(e) => e.stopPropagation()}>
                        <div ref={openDropdownId === company.id ? dropdownRef : undefined} className="relative inline-block">
                          <button
                            type="button"
                            onClick={() => setOpenDropdownId((id) => (id === company.id ? null : company.id))}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                            aria-label="Open actions"
                            aria-expanded={openDropdownId === company.id}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {openDropdownId === company.id && (
                            <div
                              className="absolute right-0 top-full mt-1.5 w-64 rounded-xl border border-gray-200 bg-white shadow-lg z-50 py-2 overflow-hidden"
                              role="menu"
                            >
                              <div className="px-4 py-3 border-b border-gray-100">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                  Profile verification
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
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
                                </div>
                              </div>
                              <div className="px-4 py-3">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                  Sender ID approval
                                </div>
                                {company.senderId ? (
                                  (() => {
                                    const rejected = rejectedSenderIdIds.has(company.id)
                                    const approved = company.isApprovedSenderId
                                    const pending = !approved && !rejected
                                    const btn = 'px-2.5 py-1 rounded-md text-xs font-medium transition-colors'
                                    const current = 'opacity-60 cursor-default'
                                    return (
                                      <div className="flex gap-1.5 flex-wrap">
                                        {approved ? (
                                          <span className={`${btn} bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${current}`}>Approve</span>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => handleApproveSenderId(company.id, true)}
                                            className={`${btn} bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200/80`}
                                          >
                                            Approve
                                          </button>
                                        )}
                                        {pending ? (
                                          <span className={`${btn} bg-amber-50 text-amber-700 border border-amber-200/80 ${current}`}>Pending</span>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => handleSetSenderIdPending(company.id, approved)}
                                            className={`${btn} bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200/80`}
                                          >
                                            Pending
                                          </button>
                                        )}
                                        {rejected ? (
                                          <span className={`${btn} bg-red-50 text-red-700 border border-red-200/80 ${current}`}>Rejected</span>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => handleApproveSenderId(company.id, false)}
                                            className={`${btn} bg-red-100 text-red-800 hover:bg-red-200 border border-red-200/80`}
                                          >
                                            Reject
                                          </button>
                                        )}
                                      </div>
                                    )
                                  })()
                                ) : (
                                  <span className="text-xs text-gray-500">No sender ID set</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
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
