'use client'

import { useRef, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { User, LogOut, ChevronDown, Search, Settings, Moon, Sun } from 'lucide-react'
import NotificationBell from './NotificationBell'
import { getAdminBasePath } from '@/lib/adminNamespace'
import { unsubscribeAdminPush } from '@/lib/firebase/fcm-service'
import { useAdminTheme } from '@/app/admin/contexts/AdminThemeContext'

export function HeaderActions({ className = '' }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const basePath = getAdminBasePath(pathname)
  const { isDark } = useAdminTheme()
  const [open, setOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await unsubscribeAdminPush()
      await fetch('/api/admin/logout', { method: 'POST' })
      setOpen(false)
      router.push(`${basePath}/login`)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const surface = isDark
    ? 'border-white/10 bg-[#27293d] text-slate-200 hover:bg-[#303450]'
    : 'border-gray-200/80 bg-white text-gray-600 hover:bg-gray-50'
  const avatarBg = isDark ? 'bg-white/10' : 'bg-gray-100'

  return (
    <div className={`flex items-center justify-end gap-2 sm:gap-3 ${className}`.trim()}>
      <NotificationBell />
      <div className="relative" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`admin-liquid-transition flex h-10 cursor-pointer items-center gap-2 rounded-full border px-2 shadow-sm ${surface}`}
          aria-label="Profile menu"
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${avatarBg}`}>
            <User className="admin-icon" strokeWidth={1.5} />
          </div>
          <ChevronDown className="admin-icon opacity-60" strokeWidth={1.5} />
        </button>

        {open && (
          <div
            className={`absolute right-0 z-50 mt-2 w-48 rounded-xl border py-1 shadow-xl ${
              isDark ? 'border-white/10 bg-[#27293d]' : 'border-gray-200 bg-white'
            }`}
          >
            <button
              type="button"
              onClick={handleLogout}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                isDark ? 'text-slate-200 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <LogOut className="admin-icon" strokeWidth={1.5} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const basePath = getAdminBasePath(pathname)
  const isLoginPage = pathname === `${basePath}/login`
  const { theme, toggleTheme, isDark } = useAdminTheme()

  if (isLoginPage) {
    return null
  }

  const barBg = isDark
    ? 'border-white/[0.08] bg-[#1e2135]/90'
    : 'border-[color:var(--admin-card-border)] bg-[color:var(--admin-bg-canvas)]/95'
  const searchBg = isDark
    ? 'border-white/10 bg-[#27293d] text-slate-100 placeholder:text-slate-500'
    : 'border-[color:var(--admin-card-border)] bg-white text-[var(--admin-heading)] placeholder:text-[var(--admin-muted)] shadow-sm'
  const iconBtn = isDark
    ? 'border-white/10 bg-[#27293d] text-slate-200 hover:bg-[#303450]'
    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'

  return (
    <header
      className={`sticky top-0 z-40 flex shrink-0 flex-col gap-3 border-b px-5 py-3 backdrop-blur-md lg:flex-row lg:items-center lg:justify-between lg:px-8 ${barBg}`}
    >
      <div className="relative min-w-0 flex-1 max-w-xl">
        <Search
          className={`admin-icon pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-[var(--admin-muted)]'}`}
          strokeWidth={1.5}
        />
        <input
          type="search"
          placeholder="Search here..."
          aria-label="Search backoffice"
          className={`admin-liquid-transition h-10 w-full rounded-full border pl-10 pr-4 text-[0.8125rem] outline-none focus-visible:border-[var(--admin-ui-accent)] focus-visible:ring-2 focus-visible:ring-[var(--admin-ui-accent)]/25 ${searchBg}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const q = (e.target as HTMLInputElement).value.trim()
              if (q) router.push(`${basePath}/companies?search=${encodeURIComponent(q)}`)
            }
          }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          className={`admin-liquid-transition flex h-10 w-10 items-center justify-center rounded-full border shadow-sm ${iconBtn}`}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="admin-icon" strokeWidth={1.5} /> : <Moon className="admin-icon" strokeWidth={1.5} />}
        </button>
        <button
          type="button"
          onClick={() => router.push(`${basePath}/api-management`)}
          className={`admin-liquid-transition flex h-10 w-10 items-center justify-center rounded-full border shadow-sm ${iconBtn}`}
          aria-label="API settings"
        >
          <Settings className="admin-icon" strokeWidth={1.5} />
        </button>
        <HeaderActions />
      </div>
    </header>
  )
}
