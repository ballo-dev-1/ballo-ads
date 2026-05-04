"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { useAppStore } from "@/lib/crmStores";
import { clientsApi } from "@/lib/crmApiClient";
import { useCrmTheme } from "@/app/crm/contexts/CrmThemeContext";
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
  const { isDark, toggleTheme } = useCrmTheme();

  const title =
    pageTitles[pathname] ||
    pageTitles[Object.keys(pageTitles).find((key) => pathname.startsWith(key)) || ""] ||
    "CRM";

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
          className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest border rounded-full transition-all disabled:opacity-50 flex items-center gap-2 hover:bg-white/[0.05]"
          style={{
            background: "transparent",
            borderColor: "rgba(255,255,255,0.1)",
            color: "var(--crm-text-secondary)",
          }}
        >
          <span className={isSyncing ? "animate-spin" : ""}>↻</span>
          {isSyncing ? "Syncing" : "Refresh"}
        </button>
      );
    }
    if (pathname.startsWith("/crm/clients")) {
      return (
        <button
          onClick={() => openModal({ id: "campaign" })}
          className="px-5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg"
          style={{ 
            background: "var(--brand-color-3)", 
            boxShadow: "0 6px 16px -4px rgba(0,0,0,0.4)"
          }}
        >
          + New campaign
        </button>
      );
    }
    if (pathname.startsWith("/crm/segments")) {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal({ id: "segment" })}
            className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest border rounded-full transition-all hover:bg-white/[0.05]"
            style={{
              background: "transparent",
              borderColor: "rgba(255,255,255,0.1)",
              color: "var(--crm-text-secondary)",
            }}
          >
            + New segment
          </button>
          <button
            onClick={() => openModal({ id: "campaign" })}
            className="px-5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg"
            style={{ 
              background: "var(--brand-color-3)",
              boxShadow: "0 6px 16px -4px rgba(0,0,0,0.4)"
            }}
          >
            Run campaign
          </button>
        </div>
      );
    }
    if (pathname.startsWith("/crm/campaigns")) {
      return (
        <button
          onClick={() => openModal({ id: "campaign" })}
          className="px-5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg"
          style={{ 
            background: "var(--brand-color-3)",
            boxShadow: "0 6px 16px -4px rgba(0,0,0,0.4)"
          }}
        >
          + New campaign
        </button>
      );
    }
    if (pathname.startsWith("/crm/analytics")) {
      return (
        <button
          onClick={() => window.print()}
          className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest border rounded-full transition-all hover:bg-white/[0.05]"
          style={{
            background: "transparent",
            borderColor: "rgba(255,255,255,0.1)",
            color: "var(--crm-text-secondary)",
          }}
        >
          Export PDF
        </button>
      );
    }
    return null;
  };

  return (
    <div
      className="h-[64px] flex items-center px-8 gap-4 flex-shrink-0 relative z-20"
      style={{
        background: "transparent",
      }}
    >
      <h1
        className="font-syne text-[17px] font-bold tracking-tight flex-1"
        style={{ color: "var(--crm-heading)" }}
      >
        {title}
      </h1>
      <div className="flex items-center gap-4">
        {renderAction()}
        <div className="w-[1px] h-6 bg-white/[0.08]" />
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08]"
          style={{
            color: "var(--crm-text-secondary)",
          }}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  );
}
