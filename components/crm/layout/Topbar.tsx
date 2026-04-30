"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/crmStores";
import { clientsApi } from "@/lib/crmApiClient";
import toast from "react-hot-toast";

const pageTitles: Record<string, string> = {
  "/crm": "Dashboard",
  "/crm/clients": "Clients",
  "/crm/segments": "Segments",
  "/crm/campaigns": "Campaigns",
  "/crm/analytics": "Analytics",
  "/crm/journeys": "Journey builder",
};

export function Topbar() {
  const pathname = usePathname() || "/crm";
  const isSyncing = useAppStore((state) => state.isSyncing);
  const setSyncing = useAppStore((state) => state.setSyncing);
  const openModal = useAppStore((state) => state.openModal);

  const title = pageTitles[pathname] || pageTitles[Object.keys(pageTitles).find((key) => pathname.startsWith(key)) || ""] || "CRM";

  const triggerSync = async () => {
    setSyncing(true);
    try {
      await clientsApi.syncAll();
      toast.success("Sync triggered");
    } catch {
      /* toast handled by crmApi */
    } finally {
      setSyncing(false);
    }
  };

  const renderAction = () => {
    if (pathname === "/crm") {
      return (
        <button
          onClick={triggerSync}
          disabled={isSyncing}
          className="px-3 py-1.5 text-xs bg-white/[0.07] text-slate-300 border border-white/[0.12] rounded-lg hover:bg-white/[0.1] transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <span className={isSyncing ? "animate-spin inline-block" : "inline-block"}>↻</span>
          {isSyncing ? "Syncing..." : "Sync"}
        </button>
      );
    }
    if (pathname.startsWith("/crm/clients")) {
      return (
        <button
          onClick={() => openModal({ id: "campaign" })}
          className="px-4 py-1.5 text-xs text-white rounded-full font-medium transition-all hover:brightness-110"
          style={{ background: "var(--brand-color-3)" }}
        >
          + New campaign
        </button>
      );
    }
    if (pathname.startsWith("/crm/segments")) {
      return (
        <>
          <button
            onClick={() => openModal({ id: "segment" })}
            className="px-3 py-1.5 text-xs bg-white/[0.07] text-slate-300 border border-white/[0.12] rounded-lg hover:bg-white/[0.1] transition-colors"
          >
            + New segment
          </button>
          <button
            onClick={() => openModal({ id: "campaign" })}
            className="px-4 py-1.5 text-xs text-white rounded-full font-medium transition-all hover:brightness-110"
          style={{ background: "var(--brand-color-3)" }}
          >
            Run campaign
          </button>
        </>
      );
    }
    if (pathname.startsWith("/crm/campaigns")) {
      return (
        <button
          onClick={() => openModal({ id: "campaign" })}
          className="px-4 py-1.5 text-xs text-white rounded-full font-medium transition-all hover:brightness-110"
          style={{ background: "var(--brand-color-3)" }}
        >
          + New campaign
        </button>
      );
    }
    if (pathname.startsWith("/crm/analytics")) {
      return (
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 text-xs bg-white/[0.07] text-slate-300 border border-white/[0.12] rounded-lg hover:bg-white/[0.1] transition-colors"
        >
          Export PDF
        </button>
      );
    }
    return null;
  };

  return (
    <div className="h-[54px] border-b border-white/[0.08] flex items-center px-6 gap-4 flex-shrink-0" style={{ background: "color-mix(in srgb, var(--crm-panel) 35%, var(--crm-bg))" }}>
      <h1 className="font-syne text-[15px] font-semibold text-slate-200 flex-1">{title}</h1>
      <div className="flex items-center gap-2">{renderAction()}</div>
    </div>
  );
}
