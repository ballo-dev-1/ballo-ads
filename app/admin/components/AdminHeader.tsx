'use client'

import { useRef, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { User, LogOut, ChevronDown } from 'lucide-react'
import NotificationBell from './NotificationBell'
import { getAdminBasePath } from '@/lib/adminNamespace'
import { unsubscribeAdminPush } from '@/lib/firebase/fcm-service'

export default function AdminHeader() {
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
    <header className="flex items-center justify-end gap-4 px-6 py-2 shrink-0">
      <NotificationBell />
      <div className="relative" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Profile menu"
        >
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
