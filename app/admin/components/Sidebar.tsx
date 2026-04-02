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
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import logo_1 from '@/public/BalloAds Logo New/BalloAds-logo.png'
import logo_2 from '@/public/BalloAds Logo New/BalloAds-logo-full.png'
import { getAdminBasePath } from '@/lib/adminNamespace'

const SIDEBAR_WIDTH_MS = 300
const LABEL_SHOW_DELAY_MS = Math.round(SIDEBAR_WIDTH_MS * 0.72)
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
    { label: 'Docs', suffix: '/docs', icon: FileText, isActive: activeStartsWith('/docs') },
    { label: 'Settings', suffix: '/settings/mno-sender-id-email', icon: Settings, isActive: activeStartsWith('/settings') },
  ]

  if (isLoginPage) {
    return null
  }

  return (
    <div
      className={`admin-sidebar-surface relative flex shrink-0 flex-col rounded-3xl m-2 ease-out ${collapsed ? 'w-[5.25rem]' : 'w-64'}`}
      style={{ transition: `width ${SIDEBAR_WIDTH_MS}ms ease-out` }}
    >
      <button
        type="button"
        onClick={toggleCollapsed}
        className={`admin-sidebar-toggle-btn admin-liquid-transition absolute top-1/2 z-30 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full py-2.5 pl-1 pr-1.5 backdrop-blur-sm ${
          collapsed ? 'left-full -ml-3' : 'left-full -ml-3'
        }`}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="admin-icon shrink-0" strokeWidth={1.5} /> : <ChevronLeft className="admin-icon shrink-0" strokeWidth={1.5} />}
      </button>

      <div
        className={`flex items-center gap-2 px-4 pb-2 pt-6 ${collapsed ? 'justify-center px-2' : ''}`}
      >
        <Image
          src={logo_1}
          alt="Ballo"
          quality={100}
          className="h-10 w-auto shrink-0 brightness-0 invert drop-shadow-[0_1px_2px_rgba(0,0,0,0.22)]"
          priority
        />
        {!collapsed && showExpandedLabels ? (
          <Image
            src={logo_2}
            alt="Ballo Ads"
            quality={100}
            className="admin-sidebar-reveal scale-150 ml-5 h-9 w-auto flex-1 object-contain object-left brightness-0 invert drop-shadow-[0_1px_2px_rgba(0,0,0,0.22)]"
            style={{ animationDelay: `${LABEL_ANIM_BASE_MS}ms` }}
            priority
          />
        ) : null}
      </div>

      <nav
        className={`mt-2 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6 ${collapsed ? 'px-2' : 'pl-3 pr-0'}`}
      >
        {/* Vertical padding so inverse-fillet masks (tab pill radius) stay outside the scrollport */}
        <div className={`space-y-1 ${collapsed ? '' : 'py-3.5'}`}>
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={item.suffix}
                type="button"
                onClick={() => router.push(to(item.suffix))}
                title={collapsed ? item.label : undefined}
                className={`group/nav admin-liquid-transition ${
                  collapsed
                    ? `flex w-full items-center justify-center rounded-xl px-2 py-3 font-medium ${
                        item.isActive
                          ? 'admin-sidebar-nav-collapsed-active'
                          : 'text-[var(--admin-sidebar-fg-muted)] hover:bg-[color-mix(in_srgb,var(--brand-color-4)_10%,transparent)]'
                      }`
                    : item.isActive
                      ? 'admin-sidebar-nav-item-active flex w-full items-center gap-3 py-2.5 pl-3 pr-0 font-medium'
                      : 'admin-sidebar-nav-item-inactive flex items-center gap-3 py-2.5 pl-3 font-medium tracking-wide text-[var(--admin-sidebar-fg-muted)]'
                }`}
              >
                {item.isActive && !collapsed ? (
                  <span className="admin-sidebar-active-rail-bridge" aria-hidden />
                ) : null}
                <span
                  className={`flex shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                    item.isActive
                      ? ''
                      : collapsed
                        ? 'group-hover/nav:bg-[color-mix(in_srgb,var(--brand-color-4)_14%,transparent)] group-hover/nav:ring-2 group-hover/nav:ring-[color-mix(in_srgb,#ffffff_28%,var(--brand-color-4)_22%)]'
                        : ''
                  }`}
                >
                  <Icon className="admin-icon" strokeWidth={1.5} />
                </span>
                {!collapsed && showExpandedLabels ? (
                  <span
                    className="admin-sidebar-reveal min-w-0 truncate text-[0.8125rem] leading-snug tracking-wide"
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
    </div>
  )
}
