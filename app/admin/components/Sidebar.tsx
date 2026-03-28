'use client'

import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { useRef, useState } from 'react'
import {
  LayoutDashboard,
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

/** Sidebar width transition (ms); labels fade in shortly before this completes. */
const SIDEBAR_WIDTH_MS = 300
const LABEL_SHOW_DELAY_MS = Math.round(SIDEBAR_WIDTH_MS * 0.72)
/** Stagger nav label animations after they mount */
const LABEL_ANIM_BASE_MS = 24
const LABEL_ANIM_STAGGER_MS = 40

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [showExpandedLabels, setShowExpandedLabels] = useState(true)
  const labelShowTimeoutRef = useRef<number | null>(null)

  const toggleCollapsed = () => {
    if (labelShowTimeoutRef.current) {
      window.clearTimeout(labelShowTimeoutRef.current)
      labelShowTimeoutRef.current = null
    }
    if (collapsed) {
      setCollapsed(false)
      setShowExpandedLabels(false)
      labelShowTimeoutRef.current = window.setTimeout(() => {
        setShowExpandedLabels(true)
        labelShowTimeoutRef.current = null
      }, LABEL_SHOW_DELAY_MS)
    } else {
      setShowExpandedLabels(false)
      setCollapsed(true)
    }
  }
  const basePath = getAdminBasePath(pathname)
  const isLoginPage = pathname === `${basePath}/login`
  const to = (suffix: string) => `${basePath}${suffix}`
  const active = (suffix: string) => pathname === to(suffix)
  const activeStartsWith = (suffix: string) => pathname?.startsWith(to(suffix))

  const items = [
    { label: 'Dashboard', suffix: '/dashboard', icon: LayoutDashboard, isActive: active('/dashboard') || pathname === basePath },
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

  if (isLoginPage) {
    return null
  }

  return (
    <div
      className={`relative flex flex-col ease-out ${collapsed ? 'w-24' : 'w-64'}`}
      style={{ transition: `width ${SIDEBAR_WIDTH_MS}ms ease-out` }}
    >
      <button
        type="button"
        onClick={toggleCollapsed}
        className={`cursor-pointer absolute  top-[55%] ${collapsed ? 'left-[85%]': 'left-[93%]'} z-30 flex -translate-y-1/2 items-center justify-center rounded-r-xl rounded-l-xl bg-[#0e0e39] py-7 pl-1.5 pr-2.5 text-white shadow-[4px_0_12px_rgba(14,14,57,0.15)] transition-colors hover:bg-[#12124a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40`}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={2} /> : <ChevronLeft className="h-4 w-4 shrink-0" strokeWidth={2} />}
      </button>

      <div className={`px-4 py-4 flex w-full justify-center items-center ${collapsed ? 'min-h-[88px]' : ''}`}>
        <Image
          src={logo_1}
          alt="Ballo Logo"
          quality={100}
          className={`h-12 w-auto ${collapsed ? '' : 'py-2'}`}
          priority
        />
        {!collapsed && showExpandedLabels ? (
          <Image
            src={logo_2}
            alt="Ballo Logo"
            quality={100}
            className="admin-sidebar-reveal w-full h-auto flex-1 -ml-6"
            style={{ animationDelay: `${LABEL_ANIM_BASE_MS}ms` }}
            priority
          />
        ) : null}
      </div>

      <div className="bg-[#0e0e39] h-full flex flex-col justify-between rounded-tr-[7rem] pt-5">

        {/* Navigation */}
        <nav className={`flex-1 text-white ${collapsed ? 'px-2' : 'px-4'}`}>
          <div className="space-y-1">
            {items.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={item.suffix}
                  onClick={() => router.push(to(item.suffix))}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-[7rem] transition-colors cursor-pointer first:w-[87%] first:mt-2 ${
                    collapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'
                  } ${
                    item.isActive ? 'bg-[var(--brand-color-3)] text-white' : 'hover:bg-[var(--brand-color-2)]/50'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && showExpandedLabels ? (
                    <span
                      className="admin-sidebar-reveal min-w-0"
                      style={{
                        animationDelay: `${LABEL_ANIM_BASE_MS + index * LABEL_ANIM_STAGGER_MS}ms`,
                      }}
                    >
                      {item.label}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </nav>

        <div className="px-4 pb-2" />
      </div>
    </div>
  )
}

