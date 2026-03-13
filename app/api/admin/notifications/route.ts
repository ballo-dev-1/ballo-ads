import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'
import type { ReliabilityAlert } from '@/lib/adminApi'
import { dedupeReliabilityAlerts, toNotificationRecordInput } from './reliabilityIngestion'
import {
  isNotificationTableMissingError,
  isPrismaDatabaseUnavailableError,
} from './prismaErrors'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth()
  if (authError) return authError

  const searchParams = request.nextUrl.searchParams
  const limit = Math.min(
    parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT,
    MAX_LIMIT
  )
  const cursor = searchParams.get('cursor') ?? undefined
  const readFilter = searchParams.get('read') // 'true' | 'false' | undefined (all)

  const where =
    readFilter === 'true'
      ? { read: true }
      : readFilter === 'false'
        ? { read: false }
        : undefined

  let notifications
  try {
    notifications = await prisma.notification.findMany({
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where,
      orderBy: { createdAt: 'desc' },
    })
  } catch (err) {
    if (isNotificationTableMissingError(err) || isPrismaDatabaseUnavailableError(err)) {
      // Keep backoffice usable when notifications storage is unavailable.
      return NextResponse.json({ notifications: [], nextCursor: null, degraded: true })
    }
    throw err
  }

  const hasMore = notifications.length > limit
  const list = hasMore ? notifications.slice(0, limit) : notifications
  const nextCursor = hasMore ? list[list.length - 1]?.id : null

  return NextResponse.json({
    notifications: list,
    nextCursor,
  })
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth()
  if (authError) return authError

  const body = (await request.json().catch(() => ({}))) as {
    alerts?: ReliabilityAlert[]
  }

  const alerts = Array.isArray(body.alerts) ? body.alerts : []
  if (alerts.length === 0) {
    return NextResponse.json({ inserted: 0 })
  }

  const deduped = dedupeReliabilityAlerts(alerts)
  let inserted = 0

  try {
    for (const alert of deduped) {
      const notification = toNotificationRecordInput(alert)
      const existing = await prisma.notification.findFirst({
        where: {
          type: notification.type,
          link: notification.link,
        },
        select: { id: true },
      })

      if (existing) continue

      await prisma.notification.create({
        data: notification,
      })
      inserted += 1
    }
  } catch (err) {
    if (isNotificationTableMissingError(err) || isPrismaDatabaseUnavailableError(err)) {
      return NextResponse.json({ inserted: 0, degraded: true })
    }
    throw err
  }

  return NextResponse.json({ inserted })
}
