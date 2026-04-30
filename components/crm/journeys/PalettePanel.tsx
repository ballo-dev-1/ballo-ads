"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { journeysApi } from "@/lib/crmApiClient";
import { useAppStore, useJourneyStore } from "@/lib/crmStores";
import type { Journey } from "@/lib/crmTypes";

interface PaletteItem {
  type: string;
  label: string;
  color: string;
}

const PALETTE: { section: string; items: PaletteItem[] }[] = [
  {
    section: "Communication",
    items: [
      { type: "sms", label: "SMS", color: "#3B82F6" },
      { type: "email", label: "Email", color: "#10B981" },
      { type: "whatsapp", label: "WhatsApp", color: "#25D366" },
      { type: "popup", label: "Popup", color: "#F59E0B" },
      { type: "inbox", label: "Inbox", color: "#8B5CF6" },
    ],
  },
  {
    section: "Flow control",
    items: [
      { type: "delay", label: "Delay", color: "#64748B" },
      { type: "wait", label: "Wait for event", color: "#7C3AED" },
      { type: "split", label: "Split traffic", color: "#EC4899" },
      { type: "condition", label: "Condition", color: "#06B6D4" },
      { type: "funnel", label: "Funnel marker", color: "#64748B" },
      { type: "stop", label: "Stop campaign", color: "#EF4444" },
    ],
  },
  {
    section: "User profile",
    items: [
      { type: "update", label: "Update attribute", color: "#0EA5E9" },
      { type: "mark", label: "Mark client", color: "#84CC16" },
    ],
  },
  {
    section: "Actions",
    items: [
      { type: "webhook", label: "Webhook", color: "#F97316" },
      { type: "slack", label: "Slack alert", color: "#A855F7" },
      { type: "schedule", label: "Schedule send", color: "#0EA5E9" },
    ],
  },
];

export function PalettePanel() {
  const loadJourney = useJourneyStore((s) => s.loadJourney);
  const clearCanvas = useJourneyStore((s) => s.clearCanvas);
  const openModal = useAppStore((s) => s.openModal);

  const { data: journeysData } = useQuery({
    queryKey: ["journeys"],
    queryFn: () => journeysApi.list().then((r) => r as Journey[]),
    staleTime: 30_000,
  });

  const activeJourneys = (journeysData || []).filter((j) => j.status === "active").slice(0, 5);

  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData("application/balloads-crm-node", nodeType);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleLoadJourney = async (journeyId: string) => {
    clearCanvas();
    await loadJourney(journeyId);
  };

  return (
    <aside className="w-[190px] min-w-[190px] flex flex-col h-full overflow-y-auto" style={{ background: "var(--crm-panel)", borderRight: "1px solid var(--crm-panel-border)" }}>
      <div className="px-3 pt-3 pb-3 border-b border-white/[0.08]">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.08em] mb-2">
          Active journeys
        </div>
        {activeJourneys.length === 0 && (
          <p className="text-[11px] text-slate-600 mb-2">No active journeys yet</p>
        )}
        {activeJourneys.map((j) => (
          <div
            key={j.id}
            onClick={() => handleLoadJourney(j.id)}
            className="flex items-center gap-2 py-1.5 px-2 rounded-[6px] cursor-pointer hover:bg-white/[0.06] transition-colors mb-0.5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
            <span className="text-[11.5px] text-slate-300 truncate">{j.name}</span>
          </div>
        ))}
        <button
          onClick={() => openModal({ id: "journey" })}
          className="w-full mt-2 py-1.5 text-[11.5px] rounded-[7px] transition-colors font-medium"
          style={{ background: "var(--brand-color-3)", color: "white" }}
        >
          + New journey
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {PALETTE.map(({ section, items }) => (
          <div key={section}>
            <div className="px-3 pt-3 pb-1 text-[9.5px] font-semibold text-slate-500 uppercase tracking-[0.08em]">
              {section}
            </div>
            {items.map((item) => (
              <div
                key={item.type}
                draggable
                onDragStart={(e) => handleDragStart(e, item.type)}
                className="flex items-center gap-2 mx-2 px-2 py-2 rounded-[6px] cursor-grab active:cursor-grabbing hover:bg-white/[0.07] transition-colors select-none"
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <span className="text-[12px] text-slate-300">{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
