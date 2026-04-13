'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, Clock3, Fingerprint, Network } from 'lucide-react'
import { LoadingCentered } from '@/app/components/LoadingSpinner'

type Row = {
  id: string
  status: string
  companyName?: string
  senderId?: string
  submittedAt: string
  networks: string[]
}

function statusStyles(status: string) {
  if (status === 'accepted') {
    return 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }
  if (status === 'request_changes') {
    return 'bg-rose-100 text-rose-800 border-rose-200'
  }
  if (status === 'withdrawn') {
    return 'bg-slate-200 text-slate-700 border-slate-300'
  }
  return 'bg-amber-100 text-amber-900 border-amber-200'
}

function submissionAccent(status: string) {
  if (status === 'accepted') return 'bg-gradient-to-r from-sky-400 via-cyan-500 to-teal-600'
  if (status === 'request_changes') return 'bg-gradient-to-r from-rose-400 via-pink-500 to-orange-500'
  if (status === 'withdrawn') return 'bg-gradient-to-r from-fuchsia-400 via-pink-500 to-rose-600'
  return 'bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500'
}

export default function MtnReviewSubmissionsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'accepted' | 'withdrawn' | 'request_changes'
  >(
    'all',
  )

  useEffect(() => {
    setLoading(true)
    void fetch('/api/mtn-review/submissions')
      .then((r) => {
        if (!r.ok) throw new Error('unauthorized')
        return r.json()
      })
      .then((data: { submissions?: Row[] }) =>
        setRows(
          [...(data.submissions ?? [])].sort(
            (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
          ),
        ),
      )
      .catch(() => setError('Unable to load submissions.'))
      .finally(() => setLoading(false))
  }, [])

  const counts = useMemo(() => {
    return {
      total: rows.length,
      pending: rows.filter((r) => r.status === 'pending').length,
      accepted: rows.filter((r) => r.status === 'accepted').length,
      requestChanges: rows.filter((r) => r.status === 'request_changes').length,
      withdrawn: rows.filter((r) => r.status === 'withdrawn').length,
    }
  }, [rows])

  const filteredRows = useMemo(() => {
    if (statusFilter === 'all') return rows
    return rows.filter((r) => r.status === statusFilter)
  }, [rows, statusFilter])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Submissions</h1>
        <p className="mt-1 text-sm text-slate-600">
          Open a submission to review documents, company details, and approve or withdraw.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="space-y-4">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Queue filters
          </h2>
          <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All', count: counts.total },
            { key: 'pending', label: 'Pending', count: counts.pending },
            { key: 'accepted', label: 'Accepted', count: counts.accepted },
            { key: 'request_changes', label: 'Request changes', count: counts.requestChanges },
            { key: 'withdrawn', label: 'Withdrawn', count: counts.withdrawn },
          ].map((opt) => {
            const active = statusFilter === opt.key
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() =>
                  setStatusFilter(
                    opt.key as 'all' | 'pending' | 'accepted' | 'withdrawn' | 'request_changes',
                  )
                }
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'border-sky-300 bg-sky-50 text-sky-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700'
                }`}
              >
                {opt.label}
                <span className="rounded-full bg-black/5 px-2 py-0.5 tabular-nums">{opt.count}</span>
              </button>
            )
          })}
        </div>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <li className="col-span-full list-none">
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <LoadingCentered minHeight={200} label="Loading submissions" />
              </div>
            </li>
          ) : null}
          {filteredRows.map((r) => (
            <li
              key={r.id}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
            >
              <div className={`h-1.5 w-full ${submissionAccent(r.status)}`} />
              <Link
                href={`/mtn-review/submissions/${r.id}`}
                className="block h-full p-4 transition hover:bg-slate-50/70"
              >
                <div className="flex min-h-[170px] flex-col">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="line-clamp-2 text-base font-semibold text-slate-900">
                      {r.companyName ?? 'Unknown company'}
                    </p>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles(r.status)}`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <p className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Fingerprint className="h-3.5 w-3.5 text-slate-400" />
                      Sender ID:{' '}
                      <span className="truncate font-medium text-slate-700">{r.senderId ?? '—'}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Network className="h-3.5 w-3.5 text-slate-400" />
                      Networks:{' '}
                      <span className="truncate font-medium text-slate-700">
                        {r.networks?.length ? r.networks.join(', ') : '—'}
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                      Submitted {new Date(r.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3 text-xs font-semibold text-sky-700">
                    View details
                    <ChevronRight className="ml-1 h-4 w-4 shrink-0" />
                  </div>
                </div>
              </Link>
            </li>
          ))}
          {!loading && filteredRows.length === 0 && !error ? (
            <li className="rounded-2xl border border-slate-200/80 bg-white px-4 py-12 text-center text-sm text-slate-500 shadow-sm">
              {rows.length === 0
                ? 'No submissions yet.'
                : `No ${statusFilter === 'all' ? '' : statusFilter + ' '}submissions found.`}
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  )
}
