'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ClipboardList, LayoutDashboard, LogOut, Search, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const nav = [
  { href: '/mtn-review', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/mtn-review/submissions', label: 'Submissions', icon: ClipboardList },
  { href: '/mtn-review/profile', label: 'Profile', icon: UserRound },
]

export default function MtnReviewShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [reviewerName, setReviewerName] = useState('MTN Reviewer')

  const signOut = async () => {
    await fetch('/api/mtn-review/logout', { method: 'POST' })
    router.push('/mtn-review/login')
    router.refresh()
  }

  useEffect(() => {
    void fetch('/api/mtn-review/session')
      .then((r) => r.json())
      .then((data: { reviewer?: { firstName?: string; lastName?: string } }) => {
        const firstName = data.reviewer?.firstName?.trim() ?? ''
        const lastName = data.reviewer?.lastName?.trim() ?? ''
        const fullName = `${firstName} ${lastName}`.trim()
        if (fullName) setReviewerName(fullName)
      })
      .catch(() => {
        // keep fallback name
      })
  }, [])

  const reviewerInitials = useMemo(
    () =>
      reviewerName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((x) => x[0]?.toUpperCase() ?? '')
        .join('') || 'MR',
    [reviewerName],
  )

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-56 shrink-0 flex-col bg-[#0a1628] text-white">
        <div className="border-b border-white/10 px-4 py-5">
          <p className="text-lg font-bold tracking-tight">Ballo Ads</p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-sky-300/90">
            MTN review
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/mtn-review' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-sky-500/20 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0 opacity-90" />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-slate-200/80 bg-white px-6 shadow-sm">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search submissions…"
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-800 outline-none ring-sky-500/30 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2"
              readOnly
              aria-readonly
            />
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">{reviewerName}</span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-xs font-bold text-white">
              {reviewerInitials}
            </div>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
