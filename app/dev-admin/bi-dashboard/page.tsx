import { redirect } from 'next/navigation'

export default function DevAdminBiDashboardPage() {
  redirect('/dev-admin/dashboard?tab=bi')
}
