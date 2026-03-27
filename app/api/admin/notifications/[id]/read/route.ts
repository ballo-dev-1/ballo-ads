import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/adminAuth'
import { adminBackendFetch } from '@/lib/serverBackendApi'

export const runtime = 'nodejs'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminAuth()
  if (authError) return authError

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const res = await adminBackendFetch(`Backoffice/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PATCH',
  })
  if (!res.ok) {
    return NextResponse.json({ success: false }, { status: res.status })
  }

  return NextResponse.json({ success: true })
}
