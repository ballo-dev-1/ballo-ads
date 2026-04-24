"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
                ? "bg-[#111C47] text-slate-200 font-medium border border-white/[0.1]"
                : "text-slate-400 hover:text-slate-200"
            }`}
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
              className="text-[12.5px] bg-[#3B82F6] text-white px-4 py-2 rounded-[8px] hover:bg-blue-600 font-medium transition-colors"
            >
              + New campaign
            </button>
          </div>
        )}
        {campaigns.map((c) => (
          <CampaignRow key={c.id} campaign={c} />
        ))}
      </div>
    </div>
  );
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const ch = CHANNEL_ICONS[campaign.channel] || CHANNEL_ICONS.sms;

  const { data: stats } = useQuery({
    queryKey: ["campaign-stats", campaign.id],
    queryFn: () => campaignsApi.stats(campaign.id),
    enabled: campaign.status === "completed" || campaign.status === "active",
  });

  const sent = stats?.sent || 0;
  const openRate = stats?.openRate || 0;
  const clicked = stats?.clicked || 0;

  const statusBadge: Record<string, string> = {
    active: "bg-green-500/10 text-green-300 border-green-500/20",
    scheduled: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    completed: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    paused: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-[14px] px-4 py-3.5 flex items-center gap-3 hover:border-white/[0.14] hover:bg-white/[0.06] transition-all cursor-pointer group">
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
