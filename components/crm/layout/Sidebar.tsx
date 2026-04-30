"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { clearCrmTokens, getCrmApiBase, getCrmToken } from "@/lib/crmApiClient";

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
    <aside className="admin-sidebar-surface w-[214px] min-w-[214px] flex flex-col h-screen">
      {/* Brand header */}
      <div
        className="px-4 py-[18px] flex items-center gap-2.5 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div
          className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center font-bold text-sm font-syne flex-shrink-0"
          style={{ background: "var(--brand-color-4)", color: "var(--brand-color-1)" }}
        >
          B
        </div>
        <div>
          <div
            className="text-[12.5px] font-semibold leading-tight font-syne"
            style={{ color: "var(--admin-sidebar-fg)" }}
          >
            BalloAds CRM
          </div>
          <div
            className="text-[9.5px] tracking-[0.05em]"
            style={{ color: "var(--admin-sidebar-fg-muted)" }}
          >
            INTERNAL TOOL
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        <SectionLabel>Overview</SectionLabel>
        {navItems.slice(0, 3).map((item) => (
          <NavButton key={item.screen} item={item} active={isActive(item.href)} />
        ))}
        <SectionLabel>Automation</SectionLabel>
        {navItems.slice(3, 5).map((item) => (
          <NavButton key={item.screen} item={item} active={isActive(item.href)} />
        ))}
        <SectionLabel>Insights</SectionLabel>
        {navItems.slice(5).map((item) => (
          <NavButton key={item.screen} item={item} active={isActive(item.href)} />
        ))}
      </div>

      {/* User footer */}
      <div className="p-2 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors hover:bg-white/[0.08]">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: "var(--brand-color-4)", color: "var(--brand-color-1)" }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-xs font-medium truncate"
              style={{ color: "var(--admin-sidebar-fg)" }}
            >
              {user?.name || "SuperAdmin"}
            </div>
            <div
              className="text-[10px] truncate"
              style={{ color: "var(--admin-sidebar-fg-muted)" }}
            >
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Ballo Innovations"}
            </div>
          </div>
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
            className="crm-sidebar-user-signout text-[10px] transition-colors"
            title="Sign out"
          >
            ⇥
          </button>
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-3 py-1.5 mt-1 text-[9.5px] font-semibold uppercase tracking-[0.08em]"
      style={{ color: "var(--admin-sidebar-fg-muted)", opacity: 0.75 }}
    >
      {children}
    </div>
  );
}

function NavButton({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-2.5 px-3 py-2 text-[13px] mb-0.5 ${
        active
          ? "admin-sidebar-nav-item-active font-semibold"
          : "admin-sidebar-nav-item-inactive crm-sidebar-nav-inactive"
      }`}
    >
      {active && <span className="admin-sidebar-active-rail-bridge" />}
      <span className="flex-shrink-0">{item.icon}</span>
      <span>{item.label}</span>
      {item.badge != null && (
        <span
          className="ml-auto text-[9.5px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: "var(--brand-color-4)", color: "var(--brand-color-1)" }}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}
