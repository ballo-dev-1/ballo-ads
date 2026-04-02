'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  Building2,
  ClipboardList,
  FileText,
  Fingerprint,
  PenLine,
} from 'lucide-react'

type Submission = {
  id: string
  status: string
  companyName?: string
  senderId?: string
  submittedAt: string
}

export default function MtnReviewDashboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    void fetch('/api/mtn-review/submissions')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load')
        return r.json()
      })
      .then((data: { submissions?: Submission[] }) => {
        setSubmissions(data.submissions ?? [])
      })
      .catch(() => setLoadError('Could not load submissions.'))
  }, [])

  const stats = useMemo(() => {
    const pending = submissions.filter((s) => s.status === 'pending').length
    const accepted = submissions.filter((s) => s.status === 'accepted').length
    const requestChanges = submissions.filter((s) => s.status === 'request_changes').length
    const withdrawn = submissions.filter((s) => s.status === 'withdrawn').length
    return {
      total: submissions.length,
      pending,
      accepted,
      requestChanges,
      withdrawn,
    }
  }, [submissions])

  const statCards = [
    {
      label: 'Pending review',
      value: stats.pending,
      className:
        'bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white',
    },
    {
      label: 'Accepted',
      value: stats.accepted,
      className:
        'bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500 text-white',
    },
    {
      label: 'Request changes',
      value: stats.requestChanges,
      className:
        'bg-gradient-to-br from-sky-400 via-cyan-500 to-teal-600 text-white',
    },
    {
      label: 'Withdrawn',
      value: stats.withdrawn,
      className:
        'bg-gradient-to-br from-fuchsia-400 via-pink-500 to-rose-600 text-white',
    },
    {
      label: 'Total submissions',
      value: stats.total,
      className:
        'bg-gradient-to-br from-indigo-400 via-blue-500 to-sky-600 text-white',
    },
  ]

  const shortcuts = [
    {
      href: '/mtn-review/submissions',
      label: 'All submissions',
      icon: ClipboardList,
      desc: 'Queue and statuses',
    },
    {
      href: '/mtn-review/submissions',
      label: 'Company details',
      icon: Building2,
      desc: 'Per submission profile',
    },
    {
      href: '/mtn-review/submissions',
      label: 'Documents',
      icon: FileText,
      desc: 'Registration & uploads',
    },
    {
      href: '/mtn-review/submissions',
      label: 'Letter / consent',
      icon: PenLine,
      desc: 'Signature & consent trail',
    },
    {
      href: '/mtn-review/submissions',
      label: 'Sender ID',
      icon: Fingerprint,
      desc: 'Requested ID & networks',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Review Ballo Ads sender ID submissions for MTN and related networks.
        </p>
      </div>

      {loadError ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-2xl p-5 shadow-lg ${card.className}`}
          >
            <div className="flex items-start justify-between">
              <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                <Bell className="h-7 w-7" />
              </div>
              <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                Live
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold tabular-nums">{card.value}</p>
            <p className="mt-1 text-sm font-medium opacity-90">{card.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Review areas
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {shortcuts.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={label}
              href={href}
              className="group flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm transition hover:border-sky-300 hover:shadow-md"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-700 transition group-hover:bg-sky-200">
                <Icon className="h-7 w-7" />
              </span>
              <span className="mt-3 text-sm font-semibold text-slate-900">{label}</span>
              <span className="mt-1 text-xs text-slate-500">{desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
