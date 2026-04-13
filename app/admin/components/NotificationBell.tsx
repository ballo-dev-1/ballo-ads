'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { useNotifications } from '../contexts/NotificationsContext'
import { useConfirmDialog } from './useConfirmDialog'
import { useAdminTheme } from '@/app/admin/contexts/AdminThemeContext'

function formatTime(createdAt: string) {
  const d = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString()
}

function severityBadgeClass(severity?: string) {
  if (severity === 'critical') return 'bg-red-50 text-red-700'
  if (severity === 'high') return 'bg-amber-50 text-amber-700'
  if (severity === 'warning') return 'bg-yellow-50 text-yellow-700'
  return 'bg-slate-100 text-slate-700'
}

export default function NotificationBell() {
  const { notifications, unreadCount, loading, markAsRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { confirm, confirmDialog } = useConfirmDialog()
  const { isDark } = useAdminTheme()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = (id: string, link: string | null) => {
    markAsRead(id)
    setOpen(false)
    if (link) router.push(link)
  }

  const panelSurface = isDark ? 'border-white/10 bg-[var(--admin-card)]' : 'border-gray-200 bg-white'
  const panelHeader = isDark ? 'border-white/10' : 'border-gray-200'
  const panelTitle = isDark ? 'text-slate-100' : 'text-gray-800'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="admin-header-icon-btn relative"
        aria-label="Notifications"
      >
        <Bell className="admin-icon" strokeWidth={1.5} />
        {!loading && unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute right-0 z-50 mt-2 flex max-h-[24rem] w-80 flex-col overflow-hidden rounded-xl border shadow-xl ${panelSurface}`}>
          <div className={`flex items-center justify-between border-b px-4 py-3 ${panelHeader}`}>
            <span className={`font-semibold ${panelTitle}`}>Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={async () => {
                  const approved = await confirm({
                    title: 'Mark all as read',
                    description: 'Mark all notifications as read?',
                    confirmLabel: 'Mark all read',
                  })
                  if (!approved) return
                  markAllRead()
                }}
                className="text-sm text-[var(--admin-ui-accent)] hover:text-[var(--admin-accent-deep)]"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center px-4 py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[var(--brand-color-3)]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className={`px-4 py-8 text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                No notifications yet
              </div>
            ) : (
              <ul className="py-1">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(n.id, n.link)}
                      className={`w-full border-b px-4 py-3 text-left transition-colors last:border-0 ${
                        isDark ? 'border-white/5 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'
                      } ${
                        !n.read
                          ? isDark
                            ? 'bg-[color-mix(in_srgb,var(--admin-ui-accent)_18%,transparent)]'
                            : 'bg-[color-mix(in_srgb,var(--admin-ui-accent)_10%,#ffffff)]'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-medium ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{n.title}</p>
                        <div className="flex items-center gap-1">
                          {n.category ? (
                            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                              {n.category}
                            </span>
                          ) : null}
                          {n.severity ? (
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${severityBadgeClass(n.severity)}`}>
                              {n.severity}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <p className={`mt-0.5 line-clamp-2 text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{n.message}</p>
                      <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{formatTime(n.createdAt)}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {confirmDialog}
    </div>
  )
}
