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
          className="px-3 py-1.5 text-xs border rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
          style={{
            background: "var(--crm-hover-subtle)",
            borderColor: "var(--crm-panel-border)",
            color: "var(--crm-text-secondary)",
          }}
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
            className="px-3 py-1.5 text-xs border rounded-lg font-medium transition-colors"
            style={{
              background: "var(--crm-hover-subtle)",
              borderColor: "var(--crm-panel-border)",
              color: "var(--crm-text-secondary)",
            }}
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
          className="px-3 py-1.5 text-xs border rounded-lg font-medium transition-colors"
          style={{
            background: "var(--crm-hover-subtle)",
            borderColor: "var(--crm-panel-border)",
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
      className="h-[54px] border-b flex items-center px-6 gap-4 flex-shrink-0"
      style={{
        borderColor: "var(--crm-divider)",
        background: "color-mix(in srgb, var(--crm-panel) 35%, var(--crm-bg))",
      }}
    >
      <h1
        className="font-syne text-[15px] font-semibold flex-1"
        style={{ color: "var(--crm-heading)" }}
      >
        {title}
      </h1>
      <div className="flex items-center gap-2">
        {renderAction()}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          style={{
            color: "var(--crm-text-secondary)",
            background: "var(--crm-hover-subtle)",
            border: "1px solid var(--crm-panel-border)",
          }}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </div>
  );
}
