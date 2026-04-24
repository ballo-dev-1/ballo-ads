"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Send, Zap, FileText, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { clientsApi } from "@/lib/crmApiClient";
import { useAppStore, useClientStore } from "@/lib/crmStores";
import { formatRelativeTime, getHealthColor, getHealthTier } from "@/lib/crmHelpers";

interface ClientDetail {
  usageEvents?: Array<{ id: string; eventType: string; occurredAt: string }>;
}

export function ClientDetailPanel() {
  const selectedClient = useClientStore((state) => state.selectedClient);
  const isDetailPanelOpen = useClientStore((state) => state.isDetailPanelOpen);
  const closeDetailPanel = useClientStore((state) => state.closeDetailPanel);
  const openModal = useAppStore((state) => state.openModal);
  const navigate = useAppStore((state) => state.navigate);
  const qc = useQueryClient();
  const [note, setNote] = useState("");

  const client = selectedClient;

  const { data: detail } = useQuery({
    queryKey: ["client-detail", client?.id],
    queryFn: () => clientsApi.get(client!.id).then((r) => r as ClientDetail),
    enabled: !!client?.id && isDetailPanelOpen,
  });

  const events = detail?.usageEvents || [];

  const saveNote = useMutation({
    mutationFn: () => clientsApi.addNote(client!.id, note.trim()),
    onSuccess: () => {
      toast.success("Note saved");
      setNote("");
      qc.invalidateQueries({ queryKey: ["client-detail", client?.id] });
    },
  });

  const flagRisk = useMutation({
    mutationFn: () => clientsApi.flag(client!.id),
    onSuccess: () => {
      toast.success("Client flagged as at-risk");
      qc.invalidateQueries({ queryKey: ["clients"] });
      closeDetailPanel();
    },
  });

  if (!isDetailPanelOpen || !client) return null;

  const hColor = getHealthColor(client.healthScore);
  const hLabel = getHealthTier(client.healthScore);
  const initials = client.companyName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const planColors: Record<string, string> = {
    Standard: "bg-slate-500/10 text-slate-300 border-slate-500/20",
    Pro: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    Enterprise: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  };

  return (
    <>
      <div className="fixed inset-0 z-[99]" onClick={closeDetailPanel} />

      <div className="fixed right-0 top-0 w-[390px] h-screen bg-[#111C47] border-l border-white/[0.12] z-[100] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#111C47] z-10 px-5 py-4 border-b border-white/[0.08] flex items-start gap-3">
          <div className="w-11 h-11 rounded-[10px] bg-blue-500/20 text-blue-300 flex items-center justify-center text-[14px] font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-syne text-[15px] font-bold text-slate-100 truncate">{client.companyName}</div>
            <div className="text-[11.5px] text-slate-400 mt-0.5">{client.industry} · {client.planTier} plan</div>
          </div>
          <button
            onClick={closeDetailPanel}
            className="w-7 h-7 bg-white/[0.05] border border-white/[0.1] rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/[0.1] transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          <div>
            <SectionLabel>Health score</SectionLabel>
            <div className="flex items-center gap-3 p-3.5 bg-white/[0.04] border border-white/[0.08] rounded-[10px]">
              <div className="font-syne text-[32px] font-bold leading-none" style={{ color: hColor }}>
                {client.healthScore}
              </div>
              <div className="flex-1">
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full rounded-full" style={{ width: `${client.healthScore}%`, background: hColor }} />
                </div>
                <div className="text-[11.5px]" style={{ color: hColor }}>
                  {hLabel} ·{" "}
                  {hLabel === "Healthy"
                    ? "No action required"
                    : hLabel === "At risk"
                    ? "Monitor closely"
                    : "Immediate action needed"}
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>Profile</SectionLabel>
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-[10px] overflow-hidden">
              {(
                [
                  ["Industry", client.industry],
                  [
                    "Plan",
                    <span
                      key="plan"
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${planColors[client.planTier]}`}
                    >
                      {client.planTier}
                    </span>,
                  ],
                  [
                    "Credits",
                    <span key="credits" className={client.creditsRemaining < 200 ? "text-amber-400" : "text-slate-300"}>
                      {client.creditsRemaining.toLocaleString()}
                    </span>,
                  ],
                  ["Last active", client.lastActiveAt ? formatRelativeTime(client.lastActiveAt) : "Never"],
                  ["Region", client.region || "Lusaka, Zambia"],
                  [
                    "Status",
                    client.accountStatus === "active" ? (
                      <span
                        key="st"
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-300 border border-green-500/20"
                      >
                        Active
                      </span>
                    ) : (
                      <span
                        key="st"
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/20"
                      >
                        At risk
                      </span>
                    ),
                  ],
                ] as Array<[string, React.ReactNode]>
              ).map(([k, v], i, arr) => (
                <div
                  key={String(k)}
                  className={`flex items-center justify-between px-3.5 py-2.5 text-[12.5px] ${
                    i < arr.length - 1 ? "border-b border-white/[0.06]" : ""
                  }`}
                >
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-200 font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Quick actions</SectionLabel>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <ActionBtn
                icon={<Send size={13} />}
                label="Send message"
                onClick={() => openModal({ id: "campaign", props: { clientId: client.id } })}
              />
              <ActionBtn icon={<Zap size={13} />} label="Enrol in journey" onClick={() => navigate("journeys")} />
            </div>

            <div>
              <textarea
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-[8px] px-3 py-2.5 text-[12.5px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-blue-500/50 resize-none h-20 mb-2 transition-colors"
                placeholder="Add an internal note about this client..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => saveNote.mutate()}
                  disabled={!note.trim() || saveNote.isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] bg-white/[0.07] text-slate-300 border border-white/[0.1] rounded-[7px] hover:bg-white/[0.1] disabled:opacity-40 transition-colors font-medium"
                >
                  <FileText size={12} />
                  {saveNote.isPending ? "Saving..." : "Save note"}
                </button>
                <button
                  onClick={() => flagRisk.mutate()}
                  disabled={flagRisk.isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] bg-red-500/10 text-red-300 border border-red-500/20 rounded-[7px] hover:bg-red-500/15 disabled:opacity-40 transition-colors font-medium"
                >
                  <AlertTriangle size={12} />
                  Flag at-risk
                </button>
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>Activity timeline</SectionLabel>
            {events.length === 0 ? (
              <p className="text-[12.5px] text-slate-500 py-2">No recent activity recorded.</p>
            ) : (
              <div className="relative pl-4 border-l border-white/[0.08] space-y-0">
                {events.slice(0, 10).map((e) => (
                  <div key={e.id} className="pb-3 relative">
                    <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-blue-500/60 border border-[#111C47]" />
                    <div className="text-[12.5px] text-slate-300 capitalize leading-tight">
                      {e.eventType.replace(/_/g, " ")}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{formatRelativeTime(e.occurredAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.08em] mb-2">
      {children}
    </div>
  );
}

function ActionBtn({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 py-2 text-[12px] bg-white/[0.05] text-slate-300 border border-white/[0.1] rounded-[7px] hover:bg-white/[0.09] hover:text-slate-200 transition-colors font-medium"
    >
      {icon} {label}
    </button>
  );
}
