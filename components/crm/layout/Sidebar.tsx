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
    <aside className="w-[214px] min-w-[214px] bg-[#111C47] border-r border-white/[0.08] flex flex-col h-screen">
      <div className="px-4 py-[18px] border-b border-white/[0.08] flex items-center gap-2.5">
        <div className="w-[30px] h-[30px] bg-[#3B82F6] rounded-[7px] flex items-center justify-center font-bold text-sm text-white font-syne">
          B
        </div>
        <div>
          <div className="text-[12.5px] font-semibold text-slate-200 leading-tight font-syne">BalloAds CRM</div>
          <div className="text-[9.5px] text-slate-500 tracking-[0.05em]">INTERNAL TOOL</div>
        </div>
      </div>

      <div className="pt-2">
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

      <div className="mt-auto p-2 border-t border-white/[0.08]">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.04] transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-slate-200 truncate">{user?.name || "SuperAdmin"}</div>
            <div className="text-[10px] text-slate-500 truncate">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Ballo Innovations"}</div>
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
            className="text-[10px] text-slate-500 hover:text-slate-200 transition-colors"
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
    <div className="px-2.5 py-1.5 mt-1 text-[9.5px] font-semibold text-slate-500 uppercase tracking-[0.08em]">
      {children}
    </div>
  );
}

function NavButton({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`relative flex items-center gap-2.5 w-full text-left px-3 py-2 mx-2 rounded-lg text-[13px] transition-all mb-0.5 ${
        active ? "bg-blue-500/[0.15] text-[#60A5FA]" : "text-slate-400 hover:bg-white/[0.07] hover:text-slate-200"
      }`}
      style={{ width: "calc(100% - 16px)" }}
    >
      {active && <span className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#3B82F6] rounded-sm" />}
      <span className="opacity-80 flex-shrink-0">{item.icon}</span>
      <span>{item.label}</span>
      {item.badge && (
        <span className="ml-auto bg-[#3B82F6] text-white text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
