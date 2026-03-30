'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'

type Row = {
  id: string
  status: string
  companyId?: number
  companyName?: string
  senderId?: string
  submittedAt: string
  networks: string[]
}

function statusStyles(status: string) {
  if (status === 'accepted') {
    return 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }
  if (status === 'withdrawn') {
    return 'bg-slate-200 text-slate-700 border-slate-300'
  }
  return 'bg-amber-100 text-amber-900 border-amber-200'
}

export default function MtnReviewSubmissionsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    void fetch('/api/mtn-review/submissions')
      .then((r) => {
        if (!r.ok) throw new Error('unauthorized')
        return r.json()
      })
      .then((data: { submissions?: Row[] }) => setRows(data.submissions ?? []))
      .catch(() => setError('Unable to load submissions.'))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Submissions</h1>
        <p className="mt-1 text-sm text-slate-600">
          Open a row to review documents, company details, and accept or withdraw.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={`/mtn-review/submissions/${r.id}`}
                className="flex items-center gap-4 px-4 py-4 transition hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">
                    {r.companyName ?? `Company #${r.companyId ?? '—'}`}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Sender ID: {r.senderId ?? '—'} · Networks:{' '}
                    {r.networks?.length ? r.networks.join(', ') : '—'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Submitted {new Date(r.submittedAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles(r.status)}`}
                >
                  {r.status}
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
              </Link>
            </li>
          ))}
        </ul>
        {rows.length === 0 && !error ? (
          <p className="px-4 py-12 text-center text-sm text-slate-500">No submissions yet.</p>
        ) : null}
      </div>
    </div>
  )
}
