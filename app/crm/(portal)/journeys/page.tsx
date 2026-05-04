"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { Pause, Play, Edit2, Zap } from "lucide-react";
import { journeysApi } from "@/lib/crmApiClient";
import { useJourneyStore, useAppStore } from "@/lib/crmStores";
import { JourneyCanvas } from "@/components/crm/journeys/JourneyCanvas";
import type { Journey } from "@/lib/crmTypes";

type JourneyTab = "All" | "Active" | "Paused" | "Draft";

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  active: "bg-green-500/10 text-green-300 border-green-500/20",
  paused: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  archived: "bg-slate-500/10 text-slate-500 border-slate-500/10",
};

const TRIGGER_LABELS: Record<string, string> = {
  manual: "Manual",
  segment_entry: "Segment entry",
  attribute_change: "Attribute change",
  scheduled: "Scheduled",
  event: "Event",
};

export default function Page() {
  const [view, setView] = useState<"list" | "canvas">("list");
  const [tab, setTab] = useState<JourneyTab>("All");
  const loadJourney = useJourneyStore((s) => s.loadJourney);
  const clearCanvas = useJourneyStore((s) => s.clearCanvas);
  const openModal = useAppStore((s) => s.openModal);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["journeys"],
    queryFn: () => journeysApi.list(),
    staleTime: 30_000,
  });

  const journeys: Journey[] = data || [];

  const pauseMutation = useMutation({
    mutationFn: (id: string) => journeysApi.pause(id),
    onSuccess: () => {
      toast.success("Journey paused");
      qc.invalidateQueries({ queryKey: ["journeys"] });
    },
    onError: () => toast.error("Failed to pause journey"),
  });

  const resumeMutation = useMutation({
    mutationFn: (id: string) => journeysApi.activate(id),
    onSuccess: () => {
      toast.success("Journey resumed");
      qc.invalidateQueries({ queryKey: ["journeys"] });
    },
    onError: () => toast.error("Failed to resume journey"),
  });

  const handleEdit = async (journeyId: string) => {
    clearCanvas();
    await loadJourney(journeyId);
    setView("canvas");
  };

  const handleNew = () => {
    clearCanvas();
    setView("canvas");
  };

  if (view === "canvas") {
    return (
      <div className="relative h-full w-full">
        <button
          onClick={() => setView("list")}
          className="absolute top-4 left-[236px] z-20 px-3 py-1.5 text-[11.5px] border border-white/10 text-slate-300 rounded-lg hover:bg-white/[0.08] transition-colors shadow-lg"
          style={{ background: "var(--crm-panel)" }}
        >
          ← All journeys
        </button>
        <JourneyCanvas />
      </div>
    );
  }

  const tabFilter: Record<JourneyTab, string | null> = {
    All: null,
    Active: "active",
    Paused: "paused",
    Draft: "draft",
  };

  const filtered = journeys.filter((j) => {
    const f = tabFilter[tab];
    return f === null || j.status === f;
  });

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-0.5 bg-white/[0.04] rounded-[9px] p-[3px]">
          {(["All", "Active", "Paused", "Draft"] as JourneyTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-[7px] text-[12.5px] transition-all ${
                tab === t
                  ? "text-slate-200 font-medium border border-white/[0.1]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              style={tab === t ? { background: "var(--crm-panel)" } : undefined}
            >
              {t}
              {t === "All" && ` (${journeys.length})`}
            </button>
          ))}
        </div>
        <button
          onClick={handleNew}
          className="px-4 py-2 text-[12.5px] text-white rounded-full font-medium transition-all hover:brightness-110"
          style={{ background: "var(--brand-color-3)", color: "white" }}
        >
          + New journey
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-10 text-slate-500 text-[13px]">Loading journeys...</div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-14 text-slate-500 bg-white/[0.02] border border-dashed border-white/[0.08] rounded-2xl">
          <div className="text-[36px] mb-3 opacity-30">🗺️</div>
          <div className="text-[14px] font-medium text-slate-400 mb-1">No journeys yet</div>
          <div className="text-[12.5px] mb-4">Build automated client engagement flows</div>
          <button
            onClick={handleNew}
            className="text-[12.5px] text-white px-4 py-2 rounded-full font-medium transition-all hover:brightness-110"
            style={{ background: "var(--brand-color-3)", color: "white" }}
          >
            + New journey
          </button>
        </div>
      )}

      <div className="space-y-2.5">
        {filtered.map((journey) => (
          <JourneyRow
            key={journey.id}
            journey={journey}
            onEdit={() => handleEdit(journey.id)}
            onPause={() => pauseMutation.mutate(journey.id)}
            onResume={() => resumeMutation.mutate(journey.id)}
            isPausing={pauseMutation.isPending && pauseMutation.variables === journey.id}
            isResuming={resumeMutation.isPending && resumeMutation.variables === journey.id}
            onEnrol={() => openModal({ id: "campaign", props: { segmentId: journey.entrySegmentId || undefined } })}
          />
        ))}
      </div>
    </div>
  );
}

function JourneyRow({
  journey,
  onEdit,
  onPause,
  onResume,
  isPausing,
  isResuming,
  onEnrol,
}: {
  journey: Journey;
  onEdit: () => void;
  onPause: () => void;
  onResume: () => void;
  isPausing: boolean;
  isResuming: boolean;
  onEnrol: () => void;
}) {
  const nodeCount = Array.isArray(journey.flowDefinition?.nodes)
    ? journey.flowDefinition.nodes.length
    : 0;

  return (
    <div className="crm-card px-4 py-3.5 flex items-center gap-3 hover:!border-white/[0.14] transition-all group">
      <div className="w-9 h-9 rounded-[9px] bg-blue-500/15 flex items-center justify-center text-[15px] flex-shrink-0">
        🗺️
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-medium text-slate-200 mb-0.5">{journey.name}</div>
        <div className="text-[11.5px] text-slate-500">
          {TRIGGER_LABELS[journey.triggerType] || journey.triggerType} ·{" "}
          {nodeCount} node{nodeCount !== 1 ? "s" : ""} ·{" "}
          {journey.activatedAt
            ? `Activated ${formatDistanceToNow(new Date(journey.activatedAt), { addSuffix: true })}`
            : `Created ${formatDistanceToNow(new Date(journey.createdAt), { addSuffix: true })}`}
        </div>
      </div>

      <span
        className={`text-[11px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${
          STATUS_BADGE[journey.status] || STATUS_BADGE.draft
        }`}
      >
        {journey.status.charAt(0).toUpperCase() + journey.status.slice(1)}
      </span>

      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {journey.status === "active" && (
          <ActionBtn
            icon={<Pause size={12} />}
            label={isPausing ? "Pausing..." : "Pause"}
            onClick={onPause}
            disabled={isPausing}
            className="text-amber-300 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/15"
          />
        )}
        {journey.status === "paused" && (
          <ActionBtn
            icon={<Play size={12} />}
            label={isResuming ? "Resuming..." : "Resume"}
            onClick={onResume}
            disabled={isResuming}
            className="text-green-300 border-green-500/20 bg-green-500/10 hover:bg-green-500/15"
          />
        )}
        <ActionBtn
          icon={<Zap size={12} />}
          label="Enrol client"
          onClick={onEnrol}
          className="text-blue-300 border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/15"
        />
        <ActionBtn
          icon={<Edit2 size={12} />}
          label="Edit"
          onClick={onEdit}
          className="text-slate-300 border-white/10 bg-white/[0.05] hover:bg-white/[0.08]"
        />
      </div>
    </div>
  );
}

function ActionBtn({
  icon,
  label,
  onClick,
  disabled,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11.5px] rounded-[7px] border font-medium transition-colors disabled:opacity-40 ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}
