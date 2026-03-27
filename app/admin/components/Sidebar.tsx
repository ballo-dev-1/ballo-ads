'use client'

import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { useState } from 'react'
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Building2,
  Megaphone,
  Tags,
  UserCog,
  ShoppingCart,
  Receipt,
  PlugZap,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import logo_1 from '@/public/BalloAds Logo New/BalloAds-logo.png'
import logo_2 from '@/public/BalloAds Logo New/BalloAds-logo-full.png'
import { getAdminBasePath } from '@/lib/adminNamespace'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const basePath = getAdminBasePath(pathname)
  const isLoginPage =
    pathname === '/admin/login' ||
    pathname === '/dev-admin/login' ||
    pathname === '/staging-admin/login'
  const to = (suffix: string) => `${basePath}${suffix}`
  const active = (suffix: string) => pathname === to(suffix)
  const activeStartsWith = (suffix: string) => pathname?.startsWith(to(suffix))

  const items = [
    { label: 'Dashboard', suffix: '/dashboard', icon: LayoutDashboard, isActive: active('/dashboard') || pathname === basePath },
    { label: 'BI Dashboard', suffix: '/bi-dashboard', icon: BarChart3, isActive: activeStartsWith('/bi-dashboard') },
    { label: 'Companies', suffix: '/companies', icon: Building2, isActive: activeStartsWith('/companies') },
    { label: 'Campaigns', suffix: '/campaigns', icon: Megaphone, isActive: activeStartsWith('/campaigns') },
    { label: 'Pricing', suffix: '/pricing', icon: Tags, isActive: activeStartsWith('/pricing') },
    { label: 'Waitlist', suffix: '/waitlist', icon: Users, isActive: activeStartsWith('/waitlist') },
    { label: 'Backoffice Users', suffix: '/backoffice-users', icon: UserCog, isActive: activeStartsWith('/backoffice-users') },
    { label: 'Purchase Orders', suffix: '/purchase-orders', icon: ShoppingCart, isActive: activeStartsWith('/purchase-orders') },
    { label: 'Transactions', suffix: '/transactions', icon: Receipt, isActive: activeStartsWith('/transactions') },
    { label: 'SMS Providers', suffix: '/sms-providers', icon: Megaphone, isActive: activeStartsWith('/sms-providers') },
    { label: 'API Management', suffix: '/api-management', icon: PlugZap, isActive: activeStartsWith('/api-management') },
    { label: 'APM & Reliability', suffix: '/apm', icon: Activity, isActive: activeStartsWith('/apm') },
  ]

  return (
    <div className={`relative flex flex-col transition-all duration-200 ${collapsed ? 'w-24' : 'w-64'}`}>
      {/* Logo */}
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      <div className={`px-4 py-4 flex w-full justify-center items-center ${collapsed ? 'min-h-[88px]' : ''}`}>
        <Image
          src={logo_1}
          alt="Ballo Logo"
          quality={100}
          className={`h-12 w-auto ${collapsed ? '' : 'py-2'}`}
          priority
        />
        {!collapsed ? (
          <Image
            src={logo_2}
            alt="Ballo Logo"
            quality={100}
            className="w-full h-auto flex-1 -ml-6"
            priority
          />
        ) : null}
      </div>

      <div className="bg-[#0e0e39] h-full flex flex-col justify-between rounded-tr-[7rem] pt-5">

        {/* Navigation */}
        <nav className={`flex-1 text-white ${collapsed ? 'px-2' : 'px-4'}`}>
          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.suffix}
                  onClick={() => router.push(to(item.suffix))}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-[7rem] transition-colors cursor-pointer ${
                    collapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'
                  } ${
                    item.isActive ? 'bg-[var(--brand-color-3)] text-white' : 'hover:bg-[var(--brand-color-2)]/50'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed ? <span>{item.label}</span> : null}
                </button>
              )
            })}
          </div>
        </nav>

        {!isLoginPage && <div className="px-4 pb-2" />}
      </div>
    </div>
  )
}

