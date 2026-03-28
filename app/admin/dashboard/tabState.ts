export type DashboardTab = 'operations' | 'bi'

export function normalizeDashboardTab(input: string | null | undefined): DashboardTab {
  if (input === 'bi') return 'bi'
  return 'operations'
}
