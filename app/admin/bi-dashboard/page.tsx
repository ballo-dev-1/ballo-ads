import { redirect } from 'next/navigation'

export default function BiDashboardPage() {
  redirect('/admin/dashboard?tab=bi')
}
