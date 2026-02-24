import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { requireAdminAuth } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

const POLL_INTERVAL_MS = 2000
const HEARTBEAT_INTERVAL_MS = 20000

function isTableMissingError(err: unknown): err is Prisma.PrismaClientKnownRequestError {
  return err instanceof Error && 'code' in err && (err as Prisma.PrismaClientKnownRequestError).code === 'P2021'
}

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth()
  if (authError) return authError

  const lastEventId = request.headers.get('Last-Event-ID')
  let lastCreatedAt: Date = new Date(0)
  if (lastEventId) {
    try {
      const lastNotif = await prisma.notification.findUnique({
        where: { id: lastEventId },
        select: { createdAt: true },
      })
      if (lastNotif) lastCreatedAt = lastNotif.createdAt
    } catch (err) {
      if (isTableMissingError(err)) {
        return new NextResponse(
          JSON.stringify({ error: 'Notifications table not set up. Run: npx prisma db push' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      }
      throw err
    }
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      let lastHeartbeat = Date.now()
      let closed = false
      let tableMissingLogged = false

      const send = (data: string, eventId?: string) => {
        if (closed) return
        const lines = eventId ? `id: ${eventId}\ndata: ${data}\n\n` : `data: ${data}\n\n`
        controller.enqueue(encoder.encode(lines))
      }
      const sendComment = (comment: string) => {
        if (closed) return
        controller.enqueue(encoder.encode(`: ${comment}\n\n`))
      }

      const poll = async (intervalRef: ReturnType<typeof setInterval> | null): Promise<void> => {
        if (closed) return
        try {
          const newNotifications = await prisma.notification.findMany({
            where: { createdAt: { gt: lastCreatedAt } },
            orderBy: { createdAt: 'asc' },
          })
          for (const n of newNotifications) {
            send(
              JSON.stringify({
                id: n.id,
                title: n.title,
                message: n.message,
                type: n.type,
                read: n.read,
                link: n.link,
                createdAt: n.createdAt.toISOString(),
              }),
              n.id
            )
            if (n.createdAt > lastCreatedAt) lastCreatedAt = n.createdAt
          }
        } catch (err) {
          if (isTableMissingError(err)) {
            if (!tableMissingLogged) {
              tableMissingLogged = true
              console.warn('Notifications SSE: Notification table does not exist. Run: npx prisma db push')
            }
            if (intervalRef) clearInterval(intervalRef)
            closed = true
            controller.close()
            return
          }
          console.error('SSE poll error:', err)
        }
      }

      let interval: ReturnType<typeof setInterval> | null = setInterval(async () => {
        if (closed) {
          if (interval) clearInterval(interval)
          interval = null
          return
        }
        await poll(interval)
        if (closed) return
        if (Date.now() - lastHeartbeat > HEARTBEAT_INTERVAL_MS) {
          sendComment('heartbeat')
          lastHeartbeat = Date.now()
        }
      }, POLL_INTERVAL_MS)

      request.signal?.addEventListener('abort', () => {
        closed = true
        if (interval) clearInterval(interval)
        interval = null
        controller.close()
      })

      await poll(interval)
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
