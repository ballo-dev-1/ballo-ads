"use client";

import { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ModalHost } from "@/components/crm/modals/ModalHost";
import { ClientDetailPanel } from "@/components/crm/clients/ClientDetailPanel";

interface AppShellProps {
  user: { id: string; name: string; email: string; role: string } | null;
}

export function AppShell({ user, children }: PropsWithChildren<AppShellProps>) {
  const pathname = usePathname() || "/crm";
  const isJourneys = pathname.startsWith("/crm/journeys");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user} />
      <main className="crm-main-panel flex-1 flex flex-col min-w-0 overflow-hidden">
        {!isJourneys && <Topbar />}
        <div className={isJourneys ? "flex-1 overflow-hidden" : "flex-1 overflow-y-auto p-6"}>
          {children}
        </div>
      </main>
      <ModalHost />
      <ClientDetailPanel />
    </div>
  );
}
