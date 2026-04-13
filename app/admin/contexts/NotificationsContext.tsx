'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { adminApi } from '@/lib/adminApi'
import {
  listenForAdminForegroundPush,
  subscribeAdminPush,
  unsubscribeAdminPush,
} from "@/lib/firebase/fcm-service";

export type NotificationItem = {
  id: string
  title: string
  message: string
  type: string
  category?: string
  severity?: 'info' | 'warning' | 'high' | 'critical'
  read: boolean
  link: string | null
  targetRoles?: string[]
  metadata?: Record<string, unknown>
  createdAt: string
}

function notificationDedupKey(item: NotificationItem): string {
  return item.link ? `${item.type}:${item.link}` : item.id
}

type NotificationsContextValue = {
  notifications: NotificationItem[]
  unreadCount: number
  loading: boolean
  error: string | null
  markAsRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  refresh: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const fetchInFlightRef = useRef(false)

  const syncReliabilityAlerts = useCallback(async () => {
    try {
      const apmAlerts = await adminApi.getApmAlerts()
      if (apmAlerts.alerts.length === 0) return
      await fetch('/api/admin/notifications', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alerts: apmAlerts.alerts }),
      })
    } catch {
      // sync failures should not block notification rendering
    }
  }, [])

  const fetchList = useCallback(async () => {
    if (fetchInFlightRef.current) return
    fetchInFlightRef.current = true
    try {
      await syncReliabilityAlerts()
      const res = await fetch('/api/admin/notifications?limit=20', { credentials: 'include' })
      if (!res.ok) {
        setError('Failed to load notifications')
        return
      }
      const data = await res.json()
      const incoming = (data.notifications ?? []) as NotificationItem[]
      const unique = new Map<string, NotificationItem>()
      for (const item of incoming) {
        unique.set(notificationDedupKey(item), item)
      }
      setNotifications([...unique.values()])
      setError(null)
    } catch {
      setError('Failed to load notifications')
    } finally {
      fetchInFlightRef.current = false
      setLoading(false)
    }
  }, [syncReliabilityAlerts])

  const refresh = useCallback(async () => {
    setLoading(true)
    await fetchList()
  }, [fetchList])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  useEffect(() => {
    let isMounted = true;

    const setupPush = async () => {
      const { error } = await subscribeAdminPush();
      if (error && isMounted) {
        // Keep existing notification channels active even when push setup fails.
        console.warn("[notifications][push] setup skipped:", error);
      }
    };

    void setupPush();

    return () => {
      isMounted = false;
      void unsubscribeAdminPush();
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      void syncReliabilityAlerts()
    }, 30000)
    return () => window.clearInterval(id)
  }, [syncReliabilityAlerts])

  useEffect(() => {
    const es = new EventSource('/api/admin/notifications/stream', { withCredentials: true })
    eventSourceRef.current = es

    es.onmessage = (event) => {
      try {
        const item = JSON.parse(event.data) as NotificationItem
        setNotifications((prev) => {
          const key = notificationDedupKey(item)
          const exists = prev.some((n) => notificationDedupKey(n) === key)
          if (exists) return prev
          return [item, ...prev]
        })
      } catch {
        // ignore parse errors
      }
    }

    es.onerror = () => {
      es.close()
      eventSourceRef.current = null
    }

    return () => {
      es.close()
      eventSourceRef.current = null
    }
  }, [])

  useEffect(() => {
    let off: () => void = () => {};
    listenForAdminForegroundPush(() => {
      void fetchList();
    })
      .then((unsub) => {
        off = unsub;
      })
      .catch(() => undefined);

    return () => off();
  }, [fetchList]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}/read`, {
        method: 'PATCH',
        credentials: 'include',
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch {
      // optimistic or retry
    }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      await fetch('/api/admin/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include',
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      // ignore
    }
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const value: NotificationsContextValue = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllRead,
    refresh,
  }

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}
