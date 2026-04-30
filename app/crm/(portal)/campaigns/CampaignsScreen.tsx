"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { campaignsApi } from "@/lib/crmApiClient";
import { useAppStore } from "@/lib/crmStores";
import type { Campaign } from "@/lib/crmTypes";

const TABS = ["All", "Active", "Scheduled", "Completed"] as const;
type Tab = (typeof TABS)[number];

const CHANNEL_ICONS: Record<string, { icon: string; color: string }> = {
  sms: { icon: "💬", color: "#3B82F6" },
  email: { icon: "✉️", color: "#10B981" },
  whatsapp: { icon: "📱", color: "#25D366" },
  popup: { icon: "🔔", color: "#F59E0B" },
  inbox: { icon: "📥", color: "#8B5CF6" },
};

const TAB_STATUS: Record<Tab, string | undefined> = {
  All: undefined,
  Active: "active",
  Scheduled: "scheduled",
  Completed: "completed",
};

export default function CampaignsScreen() {
  const [tab, setTab] = useState<Tab>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const openModal = useAppStore((s) => s.openModal);

  const { data, isLoading } = useQuery({
    queryKey: ["campaigns", tab],
    queryFn: () =>
      campaignsApi
        .list({ ...(TAB_STATUS[tab] ? { status: TAB_STATUS[tab]! } : {}) })
        .then((r) => r as Campaign[]),
  });

  const campaigns: Campaign[] = data || [];

  return (
    <div>
      <div className="flex gap-0.5 bg-white/[0.04] rounded-[9px] p-[3px] w-fit mb-5">
        {TABS.map((t) => (
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
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {isLoading && (
          <div className="text-center py-8 text-slate-500 text-[13px]">Loading campaigns...</div>
        )}
        {!isLoading && campaigns.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <div className="text-[32px] mb-3 opacity-40">📋</div>
            <div className="text-[14px] font-medium text-slate-400 mb-1">No campaigns yet</div>
            <div className="text-[12.5px] mb-4">Create your first campaign to start reaching clients</div>
            <button
              onClick={() => openModal({ id: "campaign" })}
              className="text-[12.5px] text-white px-4 py-2 rounded-full font-medium transition-all hover:brightness-110"
              style={{ background: "var(--brand-color-3)", color: "white" }}
            >
              + New campaign
            </button>
          </div>
        )}
        {campaigns.map((c) => (
          <CampaignRow
            key={c.id}
            campaign={c}
            expanded={expandedId === c.id}
            onToggle={() => setExpandedId((prev) => (prev === c.id ? null : c.id))}
          />
        ))}
      </div>
    </div>
  );
}

function CampaignRow({
  campaign,
  expanded,
  onToggle,
}: {
  campaign: Campaign;
  expanded: boolean;
  onToggle: () => void;
}) {
  const ch = CHANNEL_ICONS[campaign.channel] || CHANNEL_ICONS.sms;
  const qc = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["campaign-stats", campaign.id],
    queryFn: () => campaignsApi.stats(campaign.id),
    enabled: campaign.status === "completed" || campaign.status === "active",
  });

  const cancelMutation = useMutation({
    mutationFn: () => campaignsApi.cancel(campaign.id),
    onSuccess: () => {
      toast.success(`Campaign "${campaign.name}" cancelled`);
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: () => toast.error("Failed to cancel campaign"),
  });

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Cancel campaign "${campaign.name}"? This cannot be undone.`)) return;
    cancelMutation.mutate();
  };

  const sent = stats?.sent || 0;
  const delivered = stats?.delivered || 0;
  const opened = stats?.opened || 0;
  const clicked = stats?.clicked || 0;
  const openRate = stats?.openRate || 0;
  const ctr = stats?.ctr || 0;

  const statusBadge: Record<string, string> = {
    active: "bg-green-500/10 text-green-300 border-green-500/20",
    scheduled: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    completed: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    paused: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  const canCancel = campaign.status === "active" || campaign.status === "scheduled";

  return (
    <div
      className={`crm-card transition-all ${
        expanded ? "!border-blue-500/30 !bg-blue-500/[0.03]" : "hover:!border-white/[0.14]"
      }`}
    >
      <div
        className="px-4 py-3.5 flex items-center gap-3 cursor-pointer"
        onClick={onToggle}
      >
        <div
          className="w-9 h-9 rounded-[9px] flex items-center justify-center text-[15px] flex-shrink-0"
          style={{ background: `${ch.color}22` }}
        >
          {ch.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-medium text-slate-200 mb-0.5">{campaign.name}</div>
          <div className="text-[11.5px] text-slate-500">
            {campaign.scheduledAt
              ? new Date(campaign.scheduledAt).toLocaleString()
              : campaign.sentAt
              ? `Sent ${new Date(campaign.sentAt).toLocaleDateString()}`
              : "Not scheduled"}
          </div>
          {sent > 0 && (
            <div className="mt-1.5 w-48 h-[3px] bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${openRate}%`, background: ch.color }}
              />
            </div>
          )}
        </div>

        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
            statusBadge[campaign.status] || statusBadge.draft
          }`}
        >
          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
        </span>

        <div className="flex gap-4 text-right flex-shrink-0">
          <Metric label="Sent" value={sent} />
          <Metric label="Open rate" value={`${openRate}%`} color="#10B981" />
          <Metric label="Clicked" value={clicked} color="#60A5FA" />
        </div>

        <div className="text-slate-500 text-[11px] ml-1">{expanded ? "▲" : "▼"}</div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/[0.06] pt-3.5 space-y-4">
          <div className="grid grid-cols-6 gap-3">
            <StatBox label="Sent" value={sent} color="#94A3B8" />
            <StatBox label="Delivered" value={delivered} color="#60A5FA" />
            <StatBox label="Opened" value={opened} color="#10B981" />
            <StatBox label="Clicked" value={clicked} color="#60A5FA" />
            <StatBox label="Open rate" value={`${openRate}%`} color="#10B981" />
            <StatBox label="CTR" value={`${ctr}%`} color="#A78BFA" />
          </div>

          {stats?.byDay && stats.byDay.length > 0 && (
            <div>
              <div className="text-[11px] text-slate-500 mb-2">Daily sends</div>
              <div className="flex items-end gap-1 h-10">
                {stats.byDay.map((d) => {
                  const max = Math.max(...stats.byDay.map((x) => x.sent), 1);
                  const h = Math.round((d.sent / max) * 100);
                  return (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-0.5" title={`${d.day}: ${d.sent}`}>
                      <div
                        className="w-full rounded-sm"
                        style={{ height: `${h}%`, background: ch.color, opacity: 0.7, minHeight: 2 }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="text-[11.5px] text-slate-500">
              Channel: <span className="text-slate-300">{campaign.channel.toUpperCase()}</span>
              {campaign.execSpeed ? (
                <span className="ml-3">Speed: <span className="text-slate-300">{campaign.execSpeed}/min</span></span>
              ) : null}
              {campaign.userLimit ? (
                <span className="ml-3">Limit: <span className="text-slate-300">{campaign.userLimit.toLocaleString()}</span></span>
              ) : null}
            </div>
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
                className="px-3 py-1.5 text-[12px] bg-red-500/10 text-red-300 border border-red-500/20 rounded-[7px] hover:bg-red-500/15 disabled:opacity-40 transition-colors font-medium"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Cancel campaign"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div>
      <div className="text-[15px] font-semibold font-syne" style={{ color: color || "#e2e8f0" }}>
        {value}
      </div>
      <div className="text-[10.5px] text-slate-500">{label}</div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-[10px] p-2.5 text-center">
      <div className="text-[16px] font-bold font-syne" style={{ color }}>{value}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}
