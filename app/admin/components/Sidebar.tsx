'use client'

import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { LayoutDashboard, Users, Building2, Tags } from 'lucide-react'
import logo_1 from '@/public/BalloAds Logo New/BalloAds-logo.png'
import logo_2 from '@/public/BalloAds Logo New/BalloAds-logo-full.png'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { env, setEnv } = useApiEnv()
  const isLoginPage = pathname === '/admin/login'

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
            onClick={() => router.push('/admin/companies')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[7rem] transition-colors cursor-pointer ${
              pathname.startsWith('/admin/companies')
                ? 'bg-[var(--brand-color-3)] text-white'
                : 'hover:bg-[var(--brand-color-2)]/50'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span>Companies</span>
          </button>
          <button
            onClick={() => router.push('/admin/pricing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[7rem] transition-colors cursor-pointer ${
              pathname.startsWith('/admin/pricing')
                ? 'bg-[var(--brand-color-3)] text-white'
                : 'hover:bg-[var(--brand-color-2)]/50'
            }`}
          >
            <Tags className="w-5 h-5" />
            <span>Pricing</span>
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

      {/* API environment selector (when authenticated) */}
      {!isLoginPage && (
        <div className="px-4 pb-2 text-white">
          <div className="text-xs font-medium text-white/80 mb-1.5">Environment</div>
          <div className="flex rounded-lg border border-white/30 overflow-hidden">
            <button
              type="button"
              onClick={() => setEnv('dev')}
              className={`flex-1 px-3 py-2 text-sm transition-colors ${
                env === 'dev'
                  ? 'bg-[#1a5c9c] text-white'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              Dev
            </button>
            <button
              type="button"
              onClick={() => setEnv('prod')}
              className={`flex-1 px-3 py-2 text-sm transition-colors ${
                env === 'prod'
                  ? 'bg-[#1a5c9c] text-white'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              Prod
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}

