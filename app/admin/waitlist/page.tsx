'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import AdminHero from '@/app/admin/components/AdminHero'
import { getAdminBasePath } from '@/lib/adminNamespace'

interface WaitlistEntry {
  id: string
  name: string
  email: string
  phone: string
  createdAt: string
  updatedAt: string
}

interface WaitlistResponse {
  data: WaitlistEntry[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

type StatusFilter = 'all' | 'pending' | 'contacted' | 'completed'

export default function WaitlistDashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const basePath = getAdminBasePath(pathname)
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exportingFormat, setExportingFormat] = useState<'csv' | 'pdf' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  })
  const fetchWaitlist = useCallback(async (page = 1, limit?: number) => {
    setLoading(true)
    setError('')

    const currentLimit = limit || pagination.limit

    try {
      const response = await fetch(`/api/waitlist?page=${page}&limit=${currentLimit}`)
      const data: WaitlistResponse = await response.json()

      if (response.ok) {
        setWaitlist(data.data)
        setPagination(data.pagination)
      } else {
        setError('Failed to fetch waitlist data')
      }
    } catch (err) {
      setError('Error loading waitlist data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [pagination.limit])

  useEffect(() => {
    fetchWaitlist(1, pagination.limit)
  }, [fetchWaitlist, pagination.limit])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const filteredWaitlist = waitlist.filter((entry) => {
    const matchesSearch =
      entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.phone.includes(searchQuery)
    
    // For now, all entries are shown regardless of status
    // You can add status tracking later
    return matchesSearch
  })

  const statusFilters = [
    { id: 'all' as StatusFilter, label: 'All' },
    { id: 'pending' as StatusFilter, label: 'Pending' },
    { id: 'contacted' as StatusFilter, label: 'Contacted' },
    { id: 'completed' as StatusFilter, label: 'Completed' },
  ]

  const handleExport = useCallback(
    async (format: 'csv' | 'pdf') => {
      setExportingFormat(format)
      try {
        const res = await fetch(`/api/admin/waitlist/export?format=${format}`, { credentials: 'include' })
        if (res.status === 401) {
          router.push(`${basePath}/login`)
          return
        }
        if (!res.ok) {
          setError('Export failed. Please try again.')
          return
        }
        const blob = await res.blob()
        const disposition = res.headers.get('Content-Disposition')
        const match = disposition?.match(/filename="([^"]+)"/)
        const filename = match?.[1] ?? `waitlist-${new Date().toISOString().slice(0, 10)}.${format}`
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
      } catch {
        setError('Export failed. Please try again.')
      } finally {
        setExportingFormat(null)
      }
    },
    [basePath, router]
  )

  const renderPaginationNumbers = () => {
    const pages = []
    const totalPages = pagination.totalPages
    const currentPage = pagination.page

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <AdminHero
          className="mb-6"
          eyebrow="Audience pipeline"
          title="Waitlist"
          description="Review waitlist leads, filter by status, and export data."
          variant="sky"
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('csv')}
                disabled={!!exportingFormat}
                className="rounded-full border border-white/45 bg-white/95 px-4 py-2 text-sm font-semibold text-[#1e2153] hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {exportingFormat === 'csv' ? 'Exporting…' : 'Export CSV'}
              </button>
              <button
                onClick={() => handleExport('pdf')}
                disabled={!!exportingFormat}
                className="rounded-full bg-[var(--brand-color-1)] px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {exportingFormat === 'pdf' ? 'Exporting…' : 'Export PDF'}
              </button>
            </div>
          }
        />

      {/* Filters and Search */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
            <div className="flex items-center gap-1 overflow-x-auto">
              <button className="px-2 py-1 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {statusFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    statusFilter === filter.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
              <button className="px-2 py-1 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-transparent p-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-blue-600">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-blue-600">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-blue-600">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-blue-600">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-blue-600">
                    Status
                    <button className="ml-2 text-gray-400 hover:text-gray-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredWaitlist.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-500">
                      No waitlist entries found
                    </td>
                  </tr>
                ) : (
                  filteredWaitlist.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm text-gray-800">{entry.name}</td>
                      <td className="py-4 px-4 text-sm">
                        <a
                          href={`mailto:${entry.email}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {entry.email}
                        </a>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <a
                          href={`tel:${entry.phone}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {entry.phone}
                        </a>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{formatDate(entry.createdAt)}</td>
                      <td className="py-4 px-4 text-sm">
                        <span className="inline-flex items-center gap-1">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                            Pending
                          </span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <select
              value={pagination.limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value)
                fetchWaitlist(1, newLimit)
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">entries</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchWaitlist(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {renderPaginationNumbers().map((pageNum, index) => {
                if (pageNum === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                      ...
                    </span>
                  )
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => fetchWaitlist(pageNum as number)}
                    className={`px-3 py-1.5 rounded text-sm ${
                      pagination.page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => fetchWaitlist(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

