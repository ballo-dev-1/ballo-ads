'use client'

import { useEffect, useState } from 'react'
import { adminApi, type CompanyLeanResponse } from '@/lib/adminApi'

export default function CompaniesPage() {
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
      } catch (e: any) {
        setError(e?.message || 'Failed to load companies')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const handleApproveSenderId = async (companyId: number, approve: boolean) => {
    try {
      setError('') // Clear previous errors
      const updated = await adminApi.approveCompanySenderId(companyId, approve)
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, ...updated } : c))
      )
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'Failed to approve/reject sender ID')
    }
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
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
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
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
                        {company.senderId ? (
                          <div className="flex items-center gap-2">
                            {company.isApprovedSenderId ? (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                Approved
                              </span>
                            ) : (
                              <>
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Pending
                                </span>
                                <button
                                  onClick={() => handleApproveSenderId(company.id, true)}
                                  className="px-3 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleApproveSenderId(company.id, false)}
                                  className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">No sender ID</span>
                        )}
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


