"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import Image from "next/image";
import logo_1 from "@/public/BalloAds Logo New/BalloAds-logo.png";
import logo_2 from "@/public/BalloAds Logo New/BalloAds-logo-full.png";
import { clearCrmTokens, getCrmApiBase, getCrmToken } from "@/lib/crmApiClient";

const SIDEBAR_WIDTH_MS = 300;
const LABEL_SHOW_DELAY_MS = Math.round(SIDEBAR_WIDTH_MS * 0.72);

type Screen = "dashboard" | "clients" | "segments" | "journeys" | "campaigns" | "analytics";

interface NavItem {
  screen: Screen;
  href: string;
  label: string;
  badge?: number;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    screen: "dashboard",
    href: "/crm",
    label: "Dashboard",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="1" width="6" height="6" rx="1.5" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" />
      </svg>
    ),
  },
  {
    screen: "clients",
    href: "/crm/clients",
    label: "Clients",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="6" cy="5" r="3" />
        <path d="M0 13c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <circle cx="13" cy="5" r="2" />
        <path d="M11 13c0-2.2.9-4 2-5.3" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    screen: "segments",
    href: "/crm/segments",
    label: "Segments",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="6" />
        <circle cx="8" cy="8" r="3" />
        <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    screen: "journeys",
    href: "/crm/journeys",
    label: "Journey builder",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="3" cy="8" r="2" />
        <circle cx="13" cy="3" r="2" />
        <circle cx="13" cy="13" r="2" />
        <path d="M5 8h4M11 3H9a2 2 0 00-2 2v6a2 2 0 002 2h2" />
      </svg>
    ),
  },
  {
    screen: "campaigns",
    href: "/crm/campaigns",
    label: "Campaigns",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="2" y="4" width="12" height="9" rx="1.5" />
        <path d="M2 4l6 5 6-5" />
      </svg>
    ),
  },
  {
    screen: "analytics",
    href: "/crm/analytics",
    label: "Analytics",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="9" width="3" height="6" rx="1" />
        <rect x="6" y="5" width="3" height="10" rx="1" />
        <rect x="11" y="1" width="3" height="14" rx="1" />
      </svg>
    ),
  },
];

export function Sidebar({ user }: { user?: { name: string; email: string; role: string } | null }) {
  const pathname = usePathname() || "/crm";
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const timeoutRef = useRef<number | null>(null);

  const toggleCollapsed = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    if (collapsed) {
      setCollapsed(false);
      setShowLabels(false);
      timeoutRef.current = window.setTimeout(() => {
        setShowLabels(true);
      }, LABEL_SHOW_DELAY_MS);
    } else {
      setShowLabels(false);
      setCollapsed(true);
    }
  };

  const isActive = (href: string) => {
    if (href === "/crm") return pathname === "/crm";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const initials =
    (user?.name || user?.email || "BA")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "BA";

  return (
    <aside 
      className={`admin-sidebar-surface flex flex-col h-screen relative transition-all duration-300 ease-out shrink-0 ${collapsed ? "w-[84px] min-w-[84px]" : "w-[264px] min-w-[264px]"}`}
      style={{ transition: `width ${SIDEBAR_WIDTH_MS}ms ease-out` }}
    >
      <button
        onClick={toggleCollapsed}
        className={`admin-sidebar-toggle-btn absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center z-50 transition-all ${collapsed ? "rotate-0" : "rotate-0"}`}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={14} strokeWidth={2.5} /> : <ChevronLeft size={14} strokeWidth={2.5} />}
      </button>

      {/* Brand header */}
      <Link
        href="/crm"
        className={`flex items-center gap-2 px-6 pb-2 pt-8 transition-all ${collapsed ? "justify-center px-0" : ""}`}
      >
        <Image
          src={logo_1}
          alt="Ballo"
          quality={100}
          className="h-10 w-auto shrink-0 brightness-0 invert drop-shadow-[0_1px_2px_rgba(0,0,0,0.22)]"
          priority
        />
        {!collapsed && showLabels && (
          <Image
            src={logo_2}
            alt="Ballo Ads"
            quality={100}
            className="scale-150 ml-5 h-9 w-auto flex-1 object-contain object-left brightness-0 invert drop-shadow-[0_1px_2px_rgba(0,0,0,0.22)] admin-sidebar-reveal"
            priority
          />
        )}
      </Link>

      {/* Navigation */}
      <div className={`flex-1 overflow-y-auto py-6 ${collapsed ? "px-2" : ""}`}>
        <SectionLabel collapsed={collapsed} showLabels={showLabels}>Overview</SectionLabel>
        {navItems.slice(0, 3).map((item) => (
          <NavButton key={item.screen} item={item} active={isActive(item.href)} collapsed={collapsed} showLabels={showLabels} />
        ))}
        <SectionLabel collapsed={collapsed} showLabels={showLabels}>Automation</SectionLabel>
        {navItems.slice(3, 5).map((item) => (
          <NavButton key={item.screen} item={item} active={isActive(item.href)} collapsed={collapsed} showLabels={showLabels} />
        ))}
        <SectionLabel collapsed={collapsed} showLabels={showLabels}>Insights</SectionLabel>
        {navItems.slice(5).map((item) => (
          <NavButton key={item.screen} item={item} active={isActive(item.href)} collapsed={collapsed} showLabels={showLabels} />
        ))}
      </div>

      {/* User footer */}
      <div className="p-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] group ${collapsed ? "justify-center px-0" : ""}`}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-lg"
            style={{ background: "var(--brand-color-4)", color: "var(--brand-color-1)" }}
          >
            {initials}
          </div>
          {!collapsed && showLabels && (
            <div className="min-w-0 flex-1 admin-sidebar-reveal">
              <div className="text-[13px] font-bold truncate text-white">
                {user?.name || "SuperAdmin"}
              </div>
              <div className="text-[10px] truncate opacity-50 font-medium uppercase tracking-wider" style={{ color: "var(--admin-sidebar-fg-muted)" }}>
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Ballo Innovations"}
              </div>
            </div>
          )}
          {!collapsed && showLabels && (
            <button
              onClick={async () => {
                const token = getCrmToken();
                if (token) {
                  await fetch(`${getCrmApiBase()}/api/crm/auth/logout`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                  }).catch(() => undefined);
                }
                clearCrmTokens();
                router.push("/crm/login");
                router.refresh();
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
              title="Sign out"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({ children, collapsed, showLabels }: { children: React.ReactNode; collapsed: boolean; showLabels: boolean }) {
  if (collapsed) return <div className="h-px bg-white/5 my-4 mx-4" />;
  return (
    <div
      className="px-6 py-2 mt-4 text-[10px] font-bold uppercase tracking-[0.15em] admin-sidebar-reveal"
      style={{ color: "var(--admin-sidebar-fg-muted)", opacity: 0.6 }}
    >
      {children}
    </div>
  );
}

function NavButton({ item, active, collapsed, showLabels }: { item: NavItem; active: boolean; collapsed: boolean; showLabels: boolean }) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-3 py-2.5 text-[13px] font-medium transition-all duration-200 relative group ${
        collapsed ? "justify-center px-0 rounded-xl mx-2" : "px-6"
      } ${
        active
          ? "text-[var(--brand-color-4)]"
          : "text-[var(--admin-sidebar-fg-muted)] hover:text-white"
      } ${collapsed && active ? "bg-white/[0.06]" : ""}`}
    >
      {active && !collapsed && (
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
          style={{ background: "var(--brand-color-4)" }}
        />
      )}
      <span className={`transition-transform duration-200 shrink-0 ${active ? "scale-110" : "group-hover:scale-110 opacity-70 group-hover:opacity-100"}`}>
        {item.icon}
      </span>
      {!collapsed && showLabels && (
        <span className="tracking-wide truncate admin-sidebar-reveal">{item.label}</span>
      )}
      {!collapsed && showLabels && item.badge != null && (
        <span
          className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md admin-sidebar-reveal"
          style={{ background: "var(--brand-color-4)", color: "var(--brand-color-1)" }}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}
