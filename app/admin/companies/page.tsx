'use client'

import { useEffect, useRef, useState } from 'react'
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
        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600"
        title="Company has not set a sender ID."
      >
        No sender ID
      </span>
    )
  }
  if (company.isApprovedSenderId) {
    return (
      <span
        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800"
        title="Sender ID approved for use."
      >
        Approved
      </span>
    )
  }
  if (rejectedInSession) {
    return (
      <span
        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800"
        title="Sender ID was rejected by admin."
      >
        Rejected
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
      title="Awaiting admin approval. Use the row menu to approve or reject."
    >
      Pending
    </span>
  )
}

export default function CompaniesPage() {
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
      <header className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">Companies</h1>
      </header>
      <div className="flex-1 overflow-auto p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Verified</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sender ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sender ID status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-14" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No companies found
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => (
                    <tr
                      key={company.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-800">{company.name}</td>
                      <td className="py-3 px-4 text-sm">
                        {company.email ? (
                          <a
                            href={`mailto:${company.email}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {company.email}
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {company.phoneNumber ? (
                          <a
                            href={`tel:${company.phoneNumber}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {company.phoneNumber}
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {company.isCompanyVerified ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {company.senderId || <span className="text-gray-400">Not set</span>}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <SenderIdStatusBadge
                          company={company}
                          rejectedInSession={rejectedSenderIdIds.has(company.id)}
                        />
                      </td>
                      <td className="py-3 px-4 text-sm relative">
                        <div ref={openDropdownId === company.id ? dropdownRef : undefined} className="relative inline-block">
                          <button
                            type="button"
                            onClick={() => setOpenDropdownId((id) => (id === company.id ? null : company.id))}
                            className="p-1.5 rounded hover:bg-gray-200 text-gray-600"
                            aria-label="Open actions"
                            aria-expanded={openDropdownId === company.id}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {openDropdownId === company.id && (
                            <div
                              className="absolute right-0 top-full mt-1 w-64 rounded-lg border border-gray-200 bg-white shadow-lg z-50 py-2"
                              role="menu"
                            >
                              <div className="px-3 py-2 border-b border-gray-100">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                                  Profile verification
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {company.isCompanyVerified ? (
                                    <>
                                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                        Verified
                                      </span>
                                      <button
                                        type="button"
                                        onClick={handleProfileVerificationClick}
                                        className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                                      >
                                        Unverify
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={handleProfileVerificationClick}
                                      className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                    >
                                      Verify
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="px-3 py-2">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                                  Sender ID approval
                                </div>
                                {company.senderId ? (
                                  (() => {
                                    const rejected = rejectedSenderIdIds.has(company.id)
                                    const approved = company.isApprovedSenderId
                                    const pending = !approved && !rejected
                                    const btn = 'px-2 py-1 rounded text-xs font-medium'
                                    const current = 'opacity-60 cursor-default'
                                    return (
                                      <div className="flex gap-1">
                                        <div className="flex items-center gap-2">
                                          {approved ? (
                                            <span className={`${btn} bg-emerald-100 text-emerald-800 ${current}`}>Approve</span>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => handleApproveSenderId(company.id, true)}
                                              className={`${btn} bg-emerald-100 text-emerald-800 hover:bg-emerald-200`}
                                            >
                                              Approve
                                            </button>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {pending ? (
                                            <span className={`${btn} bg-yellow-100 text-yellow-800 ${current}`}>Pending</span>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => handleSetSenderIdPending(company.id, approved)}
                                              className={`${btn} bg-yellow-100 text-yellow-800 hover:bg-yellow-200`}
                                            >
                                              Pending
                                            </button>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {rejected ? (
                                            <span className={`${btn} bg-red-100 text-red-800 ${current}`}>Rejected</span>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => handleApproveSenderId(company.id, false)}
                                              className={`${btn} bg-red-100 text-red-800 hover:bg-red-200`}
                                            >
                                              Reject
                                            </button>
                                          )}
                                        </div>
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
