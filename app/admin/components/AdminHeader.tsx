'use client'

import { useRef, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { User, LogOut, ChevronDown } from 'lucide-react'
import NotificationBell from './NotificationBell'
import { getAdminBasePath } from '@/lib/adminNamespace'
import { unsubscribeAdminPush } from '@/lib/firebase/fcm-service'

export function HeaderActions({ className = '' }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const basePath = getAdminBasePath(pathname)
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

  return (
    <div className={`flex items-center justify-end gap-3 ${className}`.trim()}>
      <NotificationBell />
      <div className="relative" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex h-11 cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-2 text-gray-600 shadow-sm transition-colors hover:bg-gray-100"
          aria-label="Profile menu"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>

        {open && (
          <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-gray-700 transition-colors hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" />
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
  const basePath = getAdminBasePath(pathname)
  const isLoginPage = pathname === `${basePath}/login`

  if (isLoginPage) {
    return null
  }

  return (
    <div className="fixed right-9 top-8 z-40">
      <HeaderActions />
    </div>
  )
}
