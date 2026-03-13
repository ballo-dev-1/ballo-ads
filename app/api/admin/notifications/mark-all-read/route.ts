import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'
import {
  isNotificationTableMissingError,
  isPrismaDatabaseUnavailableError,
} from '../prismaErrors'

export async function POST() {
  const authError = await requireAdminAuth()
  if (authError) return authError

  try {
    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    })
  } catch (err) {
    if (isNotificationTableMissingError(err) || isPrismaDatabaseUnavailableError(err)) {
      return NextResponse.json({ success: false, degraded: true })
    }
    throw err
  }

  return NextResponse.json({ success: true })
}
