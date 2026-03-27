import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/adminAuth'
import { adminBackendFetch } from '@/lib/serverBackendApi'

export const runtime = 'nodejs'

export async function POST() {
  const authError = await requireAdminAuth()
  if (authError) return authError

  const res = await adminBackendFetch('Backoffice/notifications/mark-all-read', { method: 'POST' })
  if (!res.ok) {
    return NextResponse.json({ success: false }, { status: res.status })
  }

  return NextResponse.json({ success: true })
}
