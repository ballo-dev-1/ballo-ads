'use client'

import { type ReactNode } from 'react'

type AdminHeroProps = {
  topSlot?: ReactNode
  eyebrow?: string
  title: string
  description?: string
  meta?: ReactNode
  actions?: ReactNode
  className?: string
  variant?: 'violet' | 'indigo' | 'blue' | 'teal' | 'sky' | 'slate'
}

const HERO_VARIANTS: Record<
  NonNullable<AdminHeroProps['variant']>,
  { border: string; bg: string; shadow: string }
> = {
  violet: {
    border: 'border-[#7e75f8]',
    bg: 'bg-[linear-gradient(130deg,#675de4_0%,#5c61df_42%,#6a6ee9_75%,#6762db_100%)]',
    shadow: 'shadow-[0_16px_40px_rgba(84,72,190,0.24)]',
  },
  indigo: {
    border: 'border-[#5f7eea]',
    bg: 'bg-[linear-gradient(130deg,#3757cb_0%,#3f62d8_42%,#4b71df_75%,#3555c2_100%)]',
    shadow: 'shadow-[0_16px_40px_rgba(40,71,175,0.24)]',
  },
  blue: {
    border: 'border-[#4c8fd7]',
    bg: 'bg-[linear-gradient(130deg,#1d5a9a_0%,#256eb8_42%,#2f7cc8_75%,#1f5e9f_100%)]',
    shadow: 'shadow-[0_16px_40px_rgba(27,93,156,0.24)]',
  },
  teal: {
    border: 'border-[#4f97b2]',
    bg: 'bg-[linear-gradient(130deg,#1f6c84_0%,#267f98_42%,#2e8da7_75%,#1f6b83_100%)]',
    shadow: 'shadow-[0_16px_40px_rgba(25,99,120,0.24)]',
  },
  sky: {
    border: 'border-[#59a7e5]',
    bg: 'bg-[linear-gradient(130deg,#2a79c1_0%,#3593dc_42%,#41a3eb_75%,#2e83cc_100%)]',
    shadow: 'shadow-[0_16px_40px_rgba(38,127,198,0.24)]',
  },
  slate: {
    border: 'border-[#6f86d3]',
    bg: 'bg-[linear-gradient(130deg,#33418d_0%,#3f529f_42%,#4d64b1_75%,#35478f_100%)]',
    shadow: 'shadow-[0_16px_40px_rgba(44,64,138,0.24)]',
  },
}

export default function AdminHero({
  topSlot,
  eyebrow = 'Admin panel',
  title,
  description,
  meta,
  actions,
  className = '',
  variant = 'violet',
}: AdminHeroProps) {
  const styles = HERO_VARIANTS[variant]
  return (
    <header
      className={`relative overflow-hidden rounded-[28px] border px-7 py-6 text-white ${styles.border} ${styles.bg} ${styles.shadow} ${className}`.trim()}
    >
      <div className="pointer-events-none absolute -top-10 right-32 h-36 w-36 rounded-[2.2rem] border border-white/10 bg-white/5 blur-[1px]" />
      <div className="pointer-events-none absolute top-8 right-10 h-28 w-28 rounded-[2rem] border border-white/10 bg-white/5 blur-[1px]" />
      <div className="pointer-events-none absolute bottom-6 right-40 h-20 w-20 rounded-[1.6rem] border border-white/10 bg-white/5 blur-[1px]" />
      <div className="pointer-events-none absolute right-8 top-8 h-20 w-20 rounded-full bg-white/10 blur-xl" />
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          {topSlot ? <div className="mb-2">{topSlot}</div> : null}
          <p className="text-xs uppercase tracking-[0.24em] text-white/80">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight md:text-4xl">{title}</h1>
          {description ? <p className="mt-2 text-sm text-white/90 md:text-base">{description}</p> : null}
          {meta ? <div className="mt-3">{meta}</div> : null}
        </div>
        {actions ? <div className="self-start md:self-auto">{actions}</div> : null}
      </div>
    </header>
  )
}
