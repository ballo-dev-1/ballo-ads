'use client'

import { type ReactNode } from 'react'
import { useAdminTheme } from '@/app/admin/contexts/AdminThemeContext'

type AdminHeroProps = {
  topSlot?: ReactNode
  eyebrow?: string
  title: string
  description?: string
  meta?: ReactNode
  actions?: ReactNode
  className?: string
  /** @deprecated Kept for call-site compatibility; styling is unified. */
  variant?: 'violet' | 'indigo' | 'blue' | 'teal' | 'sky' | 'slate'
}

/** Minimal page title row (no hero card)—aligned with clean dashboard chrome. */
export default function AdminHero({
  topSlot,
  eyebrow = 'Backoffice',
  title,
  description,
  meta,
  actions,
  className = '',
}: AdminHeroProps) {
  const { isDark } = useAdminTheme()
  const muted = isDark ? 'text-slate-400' : 'text-[var(--admin-muted)]'
  const heading = isDark ? 'text-white' : 'text-[var(--admin-heading)]'

  return (
    <div
      className={`mb-6 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between ${className}`.trim()}
    >
      <div className="min-w-0">
        {topSlot ? <div className="mb-1">{topSlot}</div> : null}
        <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${muted}`}>{eyebrow}</p>
        <h1 className={`mt-1 text-lg font-semibold leading-snug tracking-tight sm:text-xl ${heading}`}>{title}</h1>
        {description ? <p className={`mt-1.5 max-w-2xl text-sm leading-relaxed ${muted}`}>{description}</p> : null}
        {meta ? <div className="mt-2">{meta}</div> : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 self-start sm:self-end">{actions}</div>
      ) : null}
    </div>
  )
}
