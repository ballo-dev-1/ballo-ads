"use client";

import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { analyticsApi, clientsApi } from "@/lib/crmApiClient";
import { useAppStore, useClientStore } from "@/lib/crmStores";
import { Badge, HealthBar } from "@/components/crm/ui/Primitives";
import type { Client } from "@/lib/crmTypes";

interface DashboardOverview {
  totalClients: number;
  activeJourneys: number;
  messagesSentMtd: number;
  atRiskCount: number;
}

interface ChannelRow {
  month: string;
  sms: number;
  email: number;
  whatsapp: number;
  popup: number;
  inbox: number;
  total: number;
}

export default function DashboardScreen() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [atRiskClients, setAtRiskClients] = useState<Client[]>([]);
  const [channelData, setChannelData] = useState<ChannelRow | null>(null);
  const [loading, setLoading] = useState(true);
  const selectClient = useClientStore((s) => s.selectClient);
  const openModal = useAppStore((s) => s.openModal);
  const navigate = useAppStore((s) => s.navigate);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [ov, clients, msgs] = await Promise.all([
          analyticsApi.overview(),
          clientsApi.list({ status: "at_risk", limit: 10 }),
          analyticsApi.messages(),
        ]);
        if (!mounted) return;
        setOverview(ov as DashboardOverview);
        setAtRiskClients((Array.isArray(clients) ? clients : (clients.data as Client[])) || []);
        const arr = (msgs as ChannelRow[]) || [];
        setChannelData(arr[arr.length - 1] || null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) return <ScreenSkeleton />;

  return (
    <>
      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatCard label="Total clients" value={overview?.totalClients ?? 0} delta="↑ 4 this month" deltaType="up" />
        <StatCard label="Active journeys" value={overview?.activeJourneys ?? 0} delta="↑ 2 this week" deltaType="up" />
        <StatCard
          label="Messages sent"
          value={(overview?.messagesSentMtd ?? 0).toLocaleString()}
          delta="↑ 18% vs last month"
          deltaType="up"
        />
        <StatCard label="At-risk clients" value={overview?.atRiskCount ?? 0} delta="Needs attention" deltaType="down" />
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-4 mb-4">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
          <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08]">
            <h2 className="font-syne text-[13.5px] font-semibold flex-1">Recent activity</h2>
            <button
              onClick={() => navigate("clients")}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              View all →
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                {["Client", "Event", "Channel", "Time"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-[10.5px] font-semibold text-slate-500 uppercase tracking-[0.05em] border-b border-white/[0.08]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {atRiskClients.slice(0, 5).map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-white/[0.04] cursor-pointer transition-colors"
                  onClick={() => selectClient(c)}
                >
                  <td className="px-4 py-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <ClientAvatar name={c.companyName} />
                      <span className="text-[13px] font-medium text-slate-200">{c.companyName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b border-white/[0.06]">
                    <Badge variant="amber">Credits low</Badge>
                  </td>
                  <td className="px-4 py-3 border-b border-white/[0.06] text-slate-500">—</td>
                  <td className="px-4 py-3 border-b border-white/[0.06] text-[11.5px] text-slate-500">
                    {c.lastActiveAt ? formatDistanceToNow(new Date(c.lastActiveAt), { addSuffix: true }) : "—"}
                  </td>
                </tr>
              ))}
              {atRiskClients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-[13px]">
                    No recent at-risk activity
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
          <h2 className="font-syne text-[13px] font-semibold mb-1">Messages by channel</h2>
          <p className="text-[11.5px] text-slate-500 mb-4">
            Last 30 days · {channelData?.total?.toLocaleString() ?? 0} total
          </p>
          <div className="flex items-center gap-4">
            <DonutChart data={channelData} />
            <ChannelLegend data={channelData} />
          </div>
        </div>
      </div>

      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08]">
          <h2 className="font-syne text-[13.5px] font-semibold flex-1">At-risk clients</h2>
          <button
            onClick={() => navigate("journeys")}
            className="px-3 py-1.5 text-xs bg-[#3B82F6] text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
          >
            Run retention journey →
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              {["Client", "Industry", "Last active", "Health", "Risk reason", "Action"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-[10.5px] font-semibold text-slate-500 uppercase tracking-[0.05em] border-b border-white/[0.08]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {atRiskClients.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-white/[0.04] cursor-pointer transition-colors"
                onClick={() => selectClient(c)}
              >
                <td className="px-4 py-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <ClientAvatar name={c.companyName} />
                    <span className="text-[13px] font-medium text-slate-200">{c.companyName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 border-b border-white/[0.06] text-[13px] text-slate-400">{c.industry}</td>
                <td className="px-4 py-3 border-b border-white/[0.06] text-[12.5px] text-red-400">
                  {c.lastActiveAt ? formatDistanceToNow(new Date(c.lastActiveAt), { addSuffix: true }) : "Never"}
                </td>
                <td className="px-4 py-3 border-b border-white/[0.06]">
                  <HealthBar score={c.healthScore} showLabel={false} />
                </td>
                <td className="px-4 py-3 border-b border-white/[0.06]">
                  <Badge variant={c.healthScore < 40 ? "red" : "amber"}>
                    {c.healthScore < 40 ? "Critical" : "At risk"}
                  </Badge>
                </td>
                <td className="px-4 py-3 border-b border-white/[0.06]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal({ id: "campaign", props: { clientId: c.id } });
                    }}
                    className="px-3 py-1.5 text-xs bg-[#3B82F6] text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
                  >
                    Send SMS
                  </button>
                </td>
              </tr>
            ))}
            {atRiskClients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-[13px]">
                  No clients are at risk right now
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  delta,
  deltaType,
}: {
  label: string;
  value: string | number;
  delta: string;
  deltaType: "up" | "down";
}) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
      <div className="text-[11px] text-slate-500 uppercase tracking-[0.05em] mb-1.5">{label}</div>
      <div className="font-syne text-[26px] font-bold text-slate-100 leading-none mb-1.5">{value}</div>
      <div className={`text-[11px] ${deltaType === "up" ? "text-emerald-400" : "text-red-400"}`}>{delta}</div>
    </div>
  );
}

function ClientAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colors = [
    "bg-blue-500/20 text-blue-300",
    "bg-green-500/20 text-green-300",
    "bg-amber-500/20 text-amber-300",
    "bg-purple-500/20 text-purple-300",
    "bg-pink-500/20 text-pink-300",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${color}`}
    >
      {initials}
    </div>
  );
}

function DonutChart({ data }: { data: ChannelRow | null }) {
  const channels: Array<{ key: keyof ChannelRow; color: string }> = [
    { key: "sms", color: "#3B82F6" },
    { key: "email", color: "#10B981" },
    { key: "whatsapp", color: "#F59E0B" },
    { key: "popup", color: "#8B5CF6" },
    { key: "inbox", color: "#8B5CF6" },
  ];
  const total = data?.total || 1;
  const r = 36;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="15" />
      {channels.map(({ key, color }) => {
        const val = (data?.[key] as number | undefined) || 0;
        const pct = val / total;
        const dash = pct * circumference;
        const el = (
          <circle
            key={key}
            cx="48"
            cy="48"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="15"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={(-offset * circumference) / 1 + circumference / 4}
            transform="rotate(-90 48 48)"
          />
        );
        offset += pct;
        return el;
      })}
    </svg>
  );
}

function ChannelLegend({ data }: { data: ChannelRow | null }) {
  const items: Array<{ label: string; key: keyof ChannelRow; color: string }> = [
    { label: "SMS", key: "sms", color: "#3B82F6" },
    { label: "Email", key: "email", color: "#10B981" },
    { label: "WhatsApp", key: "whatsapp", color: "#F59E0B" },
    { label: "Inbox/Pop", key: "inbox", color: "#8B5CF6" },
  ];
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((i) => (
        <div key={i.key} className="flex items-center gap-2 text-[12px] text-slate-300">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: i.color }} />
          {i.label} — {((data?.[i.key] as number | undefined) || 0).toLocaleString()}
        </div>
      ))}
    </div>
  );
}

function ScreenSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white/[0.04] rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-64 bg-white/[0.04] rounded-2xl" />
        <div className="h-64 bg-white/[0.04] rounded-2xl" />
      </div>
      <div className="h-64 bg-white/[0.04] rounded-2xl" />
    </div>
  );
}
