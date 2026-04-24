"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PropsWithChildren } from "react";

const links = [
  { href: "/crm", label: "Dashboard" },
  { href: "/crm/clients", label: "Clients" },
  { href: "/crm/segments", label: "Segments" },
  { href: "/crm/journeys", label: "Journeys" },
  { href: "/crm/campaigns", label: "Campaigns" },
  { href: "/crm/analytics", label: "Analytics" },
];

export default function CrmShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="w-64 border-r border-white/10 p-4">
        <h2 className="mb-4 text-lg font-bold">BalloAds CRM</h2>
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded px-3 py-2 text-sm ${pathname === link.href ? "bg-slate-800 font-semibold" : "hover:bg-slate-900"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={async () => {
            await fetch("/api/crm/auth/logout", { method: "POST" });
            router.push("/crm/login");
            router.refresh();
          }}
          className="mt-6 rounded bg-slate-700 px-3 py-2 text-sm"
        >
          Logout
        </button>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
