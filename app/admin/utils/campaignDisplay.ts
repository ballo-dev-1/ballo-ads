export function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function getCampaignStatusClasses(status: string) {
  const lower = status.toLowerCase()

  if (lower.includes('active')) return 'bg-emerald-50 text-emerald-700 border-emerald-300/70'
  if (lower.includes('cancel') || lower.includes('reject') || lower.includes('fail')) {
    return 'bg-red-50 text-red-700 border-red-300/70'
  }
  if (lower.includes('pending') || lower.includes('draft') || lower.includes('review')) {
    return 'bg-amber-50 text-amber-700 border-amber-300/70'
  }

  return 'bg-slate-100 text-slate-700 border-slate-300/70'
}

export function getRecipientStatusClasses(status: string) {
  const lower = status.toLowerCase()

  if (lower.includes('sent')) return 'bg-emerald-50 text-emerald-700 border-emerald-300/70'
  if (lower.includes('failed')) return 'bg-red-50 text-red-700 border-red-300/70'
  if (lower.includes('claimed')) return 'bg-blue-50 text-blue-700 border-blue-300/70'
  if (lower.includes('networkpending') || lower.includes('senderid')) {
    return 'bg-amber-50 text-amber-700 border-amber-300/70'
  }
  if (lower.includes('pending') || lower.includes('retry')) {
    return 'bg-yellow-50 text-yellow-700 border-yellow-300/70'
  }

  return 'bg-slate-100 text-slate-700 border-slate-300/70'
}

export function formatDateRange(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return '—'
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '—'
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
}

/** Human-readable recurrence line for admin recurring schedules. */
export function formatRecurringPattern(
  frequency: string,
  interval: number,
  sendTime: string,
): string {
  const f = frequency.trim() || 'custom'
  const i = Number.isFinite(interval) && interval > 0 ? interval : 1
  const timePart = sendTime?.trim() ? sendTime : '—'
  return `${f} every ${i} · ${timePart}`
}
