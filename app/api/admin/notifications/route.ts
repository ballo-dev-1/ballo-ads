import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/adminAuth'
import type { ReliabilityAlert } from '@/lib/adminApi'
import { dedupeReliabilityAlerts, toNotificationRecordInput } from './reliabilityIngestion'
import { getCurrentAdminRoles } from '@/lib/adminClaims'
import { createNotification, createNotificationFromEvent } from '@/lib/notifications/service'
import { isNotificationVisibleToRoles } from '@/lib/notifications/roles'
import type { NotificationEventType } from '@/lib/notifications/catalog'
import { adminBackendFetch } from '@/lib/serverBackendApi'

export const runtime = 'nodejs'

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
  const categoryFilter = searchParams.get('category') ?? undefined
  const severityFilter = searchParams.get('severity') ?? undefined
  const roles = await getCurrentAdminRoles()

  const qs = new URLSearchParams()
  qs.set('limit', String(Math.min(MAX_LIMIT, limit + 50)))
  if (readFilter === 'true' || readFilter === 'false') qs.set('read', readFilter)
  if (categoryFilter) qs.set('category', categoryFilter)
  if (severityFilter) qs.set('severity', severityFilter)
  const backendRes = await adminBackendFetch(`Backoffice/notifications?${qs.toString()}`)
  if (!backendRes.ok) {
    return NextResponse.json({ notifications: [], nextCursor: null, degraded: true }, { status: 200 })
  }
  const notifications = (await backendRes.json()) as Array<{
    id: number | string
    title: string
    message: string
    type: string
    category?: string | null
    severity?: string | null
    read: boolean
    link?: string | null
    targetRoles?: string[] | null
    createdAt?: string
  }>

  const normalized = notifications.map((item) => ({
    ...item,
    id: String(item.id),
    category: item.category ?? 'operations',
    severity: item.severity ?? 'info',
    targetRoles: item.targetRoles ?? [],
  }))

  const afterCursor =
    cursor != null ? normalized.slice(Math.max(0, normalized.findIndex((x) => x.id === cursor) + 1)) : normalized

  const filtered = afterCursor.filter((item) =>
    isNotificationVisibleToRoles(item.targetRoles, roles)
  )

  const hasMore = filtered.length > limit
  const list = hasMore ? filtered.slice(0, limit) : filtered
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
    eventType?: NotificationEventType
    payload?: Record<string, string | number | boolean | null | undefined>
  }

  if (body.eventType) {
    const result = await createNotificationFromEvent(body.eventType, body.payload ?? {}, {
      source: "backoffice-event-route",
    })
    return NextResponse.json({
      inserted: result.skipped ? 0 : 1,
      skipped: result.skipped,
    })
  }

  const alerts = Array.isArray(body.alerts) ? body.alerts : []
  if (alerts.length === 0) {
    return NextResponse.json({ inserted: 0 })
  }

  const deduped = dedupeReliabilityAlerts(alerts)
  let inserted = 0

  for (const alert of deduped) {
    const notification = toNotificationRecordInput(alert)

    await createNotification({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      category: notification.category,
      severity: notification.severity,
      link: notification.link,
      dedupeKey: notification.dedupeKey,
      cooldownSeconds: notification.cooldownSeconds,
      targetRoles: notification.targetRoles,
      entityType: notification.entityType,
      entityId: notification.entityId,
      metadata: notification.metadata,
      source: notification.source,
    })
    inserted += 1
  }

  return NextResponse.json({ inserted })
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 })
}
