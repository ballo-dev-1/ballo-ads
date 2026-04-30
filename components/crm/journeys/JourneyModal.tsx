"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { segmentsApi } from "@/lib/crmApiClient";
import { useAppStore, useJourneyStore } from "@/lib/crmStores";
import type { Segment } from "@/lib/crmTypes";

const TRIGGERS = [
  { value: "inactive_30d", label: "Client inactive for 30 days" },
  { value: "credits_low", label: "Credits fall below 100" },
  { value: "plan_downgraded", label: "Plan downgraded" },
  { value: "payment_failed", label: "Payment failed" },
  { value: "new_signup", label: "New client signup" },
  { value: "plan_upgraded", label: "Plan upgraded" },
  { value: "manual", label: "Manual — bulk enrol" },
];

export function JourneyModal() {
  const closeModal = useAppStore((s) => s.closeModal);
  const nodes = useJourneyStore((s) => s.nodes);
  const edges = useJourneyStore((s) => s.edges);
  const saveJourney = useJourneyStore((s) => s.saveJourney);
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("inactive_30d");
  const [segId, setSegId] = useState("");
  const [maxDays, setMaxDays] = useState(7);
  const [entryMode, setEntryMode] = useState<"once_per_client" | "once_during_open" | "recurring">(
    "once_per_client",
  );

  const { data: segs } = useQuery({
    queryKey: ["segments"],
    queryFn: () => segmentsApi.list().then((r) => r as Segment[]),
  });

  const activate = useMutation({
    mutationFn: () =>
      saveJourney({
        name,
        triggerType: trigger,
        triggerConfig: {},
        entrySegmentId: segId || undefined,
        maxDurationDays: maxDays,
        entryMode,
      }),
    onSuccess: () => {
      toast.success("Journey activated! Clients will start enrolling within 60 minutes.");
      qc.invalidateQueries({ queryKey: ["journeys"] });
      closeModal();
    },
    onError: () => {
      toast.error("Failed to activate journey");
    },
  });

  const isValid = name.length > 0 && nodes.length > 0;

  return (
    <div className="fixed inset-0 bg-black/60 z-[500] flex items-center justify-center">
      <div className="border border-white/[0.1] rounded-[14px] p-6 w-[480px] max-w-[92vw] shadow-2xl" style={{ background: "var(--crm-panel)" }}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[16px] font-bold text-slate-200 font-syne">Save journey</h2>
          <button onClick={closeModal}>
            <X size={18} className="text-slate-400 hover:text-white" />
          </button>
        </div>
        <p className="text-[12px] text-slate-500 mb-5">Configure and activate your automation flow</p>

        <div className="bg-blue-500/[0.07] border border-blue-500/20 rounded-[9px] px-3 py-2.5 mb-5 flex items-center gap-3">
          <div className="text-[11.5px] text-blue-300">
            <span className="font-semibold">{nodes.length} nodes</span> ·{" "}
            <span className="font-semibold">{edges.length} connections</span> on canvas
          </div>
          {nodes.length === 0 && (
            <span className="ml-auto text-[10.5px] text-amber-400 font-medium">
              ⚠ Add nodes to the canvas first
            </span>
          )}
        </div>

        <div className="space-y-4">
          <Field label="Journey name">
            <input
              className="crm-input"
              placeholder="e.g. 30-day inactivity re-engagement"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field label="Trigger event">
            <select className="crm-input" value={trigger} onChange={(e) => setTrigger(e.target.value)}>
              {TRIGGERS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Entry segment">
            <select className="crm-input" value={segId} onChange={(e) => setSegId(e.target.value)}>
              <option value="">All clients (no filter)</option>
              {(segs || []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.clientCount})
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Max duration (days)">
              <select
                className="crm-input"
                value={maxDays}
                onChange={(e) => setMaxDays(parseInt(e.target.value))}
              >
                {[1, 3, 7, 14, 30].map((d) => (
                  <option key={d} value={d}>
                    {d} {d === 1 ? "day" : "days"}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Entry mode">
              <select
                className="crm-input"
                value={entryMode}
                onChange={(e) =>
                  setEntryMode(e.target.value as "once_per_client" | "once_during_open" | "recurring")
                }
              >
                <option value="once_per_client">Once per client</option>
                <option value="once_during_open">Once (re-enter after)</option>
                <option value="recurring">Recurring</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/[0.08]">
          <button
            onClick={closeModal}
            className="px-4 py-2 text-[12.5px] text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => activate.mutate()}
            disabled={!isValid || activate.isPending}
            className="px-5 py-2 text-[12.5px] rounded-[8px] disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
            style={{ background: "var(--brand-color-3)", color: "white" }}
          >
            {activate.isPending ? "Activating..." : "⚡ Activate journey"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11.5px] font-medium text-slate-300 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
