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

export function formatDateRange(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return '—'
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '—'
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
}
