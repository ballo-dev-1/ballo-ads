import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

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

  const notifications = await prisma.notification.findMany({
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    where,
    orderBy: { createdAt: 'desc' },
  })

  const hasMore = notifications.length > limit
  const list = hasMore ? notifications.slice(0, limit) : notifications
  const nextCursor = hasMore ? list[list.length - 1]?.id : null

  return NextResponse.json({
    notifications: list,
    nextCursor,
  })
}
