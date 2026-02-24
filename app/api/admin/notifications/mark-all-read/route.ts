import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const authError = await requireAdminAuth()
  if (authError) return authError

  await prisma.notification.updateMany({
    where: { read: false },
    data: { read: true },
  })

  return NextResponse.json({ success: true })
}
