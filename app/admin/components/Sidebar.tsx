'use client'

import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { LayoutDashboard, Users, Building2, Megaphone, Tags, UserCog, ShoppingCart, Receipt, PlugZap, Activity } from 'lucide-react'
import logo_1 from '@/public/BalloAds Logo New/BalloAds-logo.png'
import logo_2 from '@/public/BalloAds Logo New/BalloAds-logo-full.png'
import { getAdminBasePath } from '@/lib/adminNamespace'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const basePath = getAdminBasePath(pathname)
  const isLoginPage =
    pathname === '/admin/login' ||
    pathname === '/dev-admin/login' ||
    pathname === '/staging-admin/login'
  const to = (suffix: string) => `${basePath}${suffix}`
  const active = (suffix: string) => pathname === to(suffix)
  const activeStartsWith = (suffix: string) => pathname?.startsWith(to(suffix))

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

    <div className="bg-[#0e0e39] h-full flex flex-col justify-between rounded-tr-[7rem] pt-5">

      {/* Navigation */}
      <nav className="flex-1 px-4 text-white">
        <div className="space-y-1">
          <button
            onClick={() => router.push(to('/dashboard'))}
            className={`first:w-[85%] w-full flex items-center gap-3 px-4 py-3 rounded-[7rem] transition-colors  cursor-pointer ${
              active('/dashboard') || pathname === basePath
                ? 'bg-[#1a5c9c] text-white'
                : 'hover:bg-[var(--brand-color-2)]/50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => router.push(to('/companies'))}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[7rem] transition-colors cursor-pointer ${
              activeStartsWith('/companies')
                ? 'bg-[var(--brand-color-3)] text-white'
                : 'hover:bg-[var(--brand-color-2)]/50'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span>Companies</span>
          </button>
          <button
            onClick={() => router.push(to('/campaigns'))}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[7rem] transition-colors cursor-pointer ${
              activeStartsWith('/campaigns')
                ? 'bg-[var(--brand-color-3)] text-white'
                : 'hover:bg-[var(--brand-color-2)]/50'
            }`}
          >
            <Megaphone className="w-5 h-5" />
            <span>Campaigns</span>
          </button>
          <button
            onClick={() => router.push(to('/pricing'))}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[7rem] transition-colors cursor-pointer ${
              activeStartsWith('/pricing')
                ? 'bg-[var(--brand-color-3)] text-white'
                : 'hover:bg-[var(--brand-color-2)]/50'
            }`}
          >
            <Tags className="w-5 h-5" />
            <span>Pricing</span>
          </button>
          <button
            onClick={() => router.push(to('/waitlist'))}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[7rem] transition-colors cursor-pointer ${
              activeStartsWith('/waitlist')
                ? 'bg-[var(--brand-color-3)] text-white'
                : 'hover:bg-[var(--brand-color-2)]/50'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Waitlist</span>
          </button>
          <button
            onClick={() => router.push(to('/backoffice-users'))}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[7rem] transition-colors cursor-pointer ${
              activeStartsWith('/backoffice-users')
                ? 'bg-[var(--brand-color-3)] text-white'
                : 'hover:bg-[var(--brand-color-2)]/50'
            }`}
          >
            <UserCog className="w-5 h-5" />
            <span>Backoffice Users</span>
          </button>
          <button
            onClick={() => router.push(to('/purchase-orders'))}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[7rem] transition-colors cursor-pointer ${
              activeStartsWith('/purchase-orders')
                ? 'bg-[var(--brand-color-3)] text-white'
                : 'hover:bg-[var(--brand-color-2)]/50'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Purchase Orders</span>
          </button>
          <button
            onClick={() => router.push(to('/transactions'))}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[7rem] transition-colors cursor-pointer ${
              activeStartsWith('/transactions')
                ? 'bg-[var(--brand-color-3)] text-white'
                : 'hover:bg-[var(--brand-color-2)]/50'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span>Transactions</span>
          </button>
          <button
            onClick={() => router.push(to('/sms-providers'))}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-[7rem] transition-colors cursor-pointer ${
              activeStartsWith('/sms-providers')
                ? 'bg-[var(--brand-color-3)] text-white'
                : 'hover:bg-[var(--brand-color-2)]/50'
            }`}
          >
            <Megaphone className="w-5 h-5" />
            <span>SMS Providers</span>
          </button>
          <button
            onClick={() => router.push(to('/api-management'))}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-[7rem] transition-colors cursor-pointer ${
              activeStartsWith('/api-management')
                ? 'bg-[var(--brand-color-3)] text-white'
                : 'hover:bg-[var(--brand-color-2)]/50'
            }`}
          >
            <PlugZap className="w-5 h-5" />
            <span>API Management</span>
          </button>
          <button
            onClick={() => router.push(to('/apm'))}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-[7rem] transition-colors cursor-pointer ${
              activeStartsWith('/apm')
                ? 'bg-[var(--brand-color-3)] text-white'
                : 'hover:bg-[var(--brand-color-2)]/50'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span>APM & Reliability</span>
          </button>
        </div>
      </nav>

      {!isLoginPage && <div className="px-4 pb-2" />}
    </div>
    </div>
  )
}

