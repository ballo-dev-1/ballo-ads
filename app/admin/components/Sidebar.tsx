'use client'

import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { LayoutDashboard, Users, LogOut } from 'lucide-react'
import logo_1 from '@/public/BalloAds Logo New/BalloAds-logo.png'
import logo_2 from '@/public/BalloAds Logo New/BalloAds-logo-full.png'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <div className="w-64 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-4 flex w-full justify-center items-center">
        <Image
          src={logo_1}
          alt="Ballo Logo"
          quality={100}
          className="h-16 py-2"
          priority
        />
        <Image
          src={logo_2}
          alt="Ballo Logo"
          quality={100}
          className="w-full h-auto flex-1  -ml-6"
          priority
        />
      </div>

    <div className="bg-[#0e0e39] h-full flex flex-col justify-between rounded-tr-[7rem] pt-20">

      {/* Navigation */}
      <nav className="flex-1 px-4 text-white">
        <div className="space-y-1">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[7rem] transition-colors  cursor-pointer ${
              pathname === '/admin/dashboard' || pathname === '/admin'
                ? 'bg-[#1a5c9c] text-white'
                : 'hover:bg-[var(--brand-color-2)]/50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => router.push('/admin/waitlist')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[7rem] transition-colors cursor-pointer ${
              pathname.startsWith('/admin/waitlist')
                ? 'bg-[var(--brand-color-3)] text-white'
                : 'hover:bg-[var(--brand-color-2)]/50'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Waitlist</span>
          </button>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 text-white">
        <button
          onClick={handleLogout}
          className=" cursor-pointer w-full border border-white flex justify-center items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-[var(--brand-color-2)]/50"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
    </div>
  )
}

