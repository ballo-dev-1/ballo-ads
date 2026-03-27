import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/adminAuth'
import { getCurrentAdminRoles } from '@/lib/adminClaims'
import { isNotificationVisibleToRoles } from '@/lib/notifications/roles'
import { adminBackendFetch } from '@/lib/serverBackendApi'

export const runtime = 'nodejs'

const POLL_INTERVAL_MS = 2000
const HEARTBEAT_INTERVAL_MS = 20000

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth()
  if (authError) return authError

  let lastCreatedAt: Date = new Date(0)

  const roles = await getCurrentAdminRoles()

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      let lastHeartbeat = Date.now()
      let closed = false
      let unavailableLogged = false

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
          const sinceIso = encodeURIComponent(lastCreatedAt.toISOString())
          const res = await adminBackendFetch(`Backoffice/notifications/stream?createdAfter=${sinceIso}&limit=200`)
          if (!res.ok) throw new Error(`Backend stream polling failed: ${res.status}`)
          const newNotifications = (await res.json()) as Array<{
            id: string | number
            title: string
            message: string
            type: string
            category: string | null
            severity: string | null
            read: boolean
            link: string | null
            targetRoles: string[] | null
            createdAt: string
          }>
          for (const n of newNotifications) {
            const targetRoles = n.targetRoles ?? []
            if (!isNotificationVisibleToRoles(targetRoles, roles)) {
              continue
            }
            const createdAt = new Date(n.createdAt)
            send(
              JSON.stringify({
                id: String(n.id),
                title: n.title,
                message: n.message,
                type: n.type,
                category: n.category ?? 'operations',
                severity: n.severity ?? 'info',
                read: n.read,
                link: n.link,
                targetRoles,
                createdAt: createdAt.toISOString(),
              }),
              String(n.id)
            )
            if (createdAt > lastCreatedAt) lastCreatedAt = createdAt
          }
        } catch (err) {
          if (!unavailableLogged) unavailableLogged = true
          console.error('SSE poll error:', err)
          if (intervalRef) clearInterval(intervalRef)
          closed = true
          controller.close()
          return
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
