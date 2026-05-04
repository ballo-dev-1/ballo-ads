"use client";

import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Users, 
  Zap, 
  MessageSquare, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { analyticsApi, clientsApi } from "@/lib/crmApiClient";
import { useAppStore, useClientStore } from "@/lib/crmStores";
import { Badge, HealthBar, Button } from "@/components/crm/ui/Primitives";
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
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Total clients" 
          value={overview?.totalClients ?? 0} 
          icon={<Users size={18} />}
          delta="+12% from last month"
          deltaType="up"
        />
        <StatCard 
          label="Active journeys" 
          value={overview?.activeJourneys ?? 0} 
          icon={<Zap size={18} />}
          delta="4 running now"
          deltaType="up"
        />
        <StatCard
          label="Messages sent (MTD)"
          value={(overview?.messagesSentMtd ?? 0).toLocaleString()}
          icon={<MessageSquare size={18} />}
          delta="+8.2k today"
          deltaType="up"
        />
        <StatCard 
          label="At-risk clients" 
          value={overview?.atRiskCount ?? 0} 
          icon={<AlertCircle size={18} />}
          delta="Needs attention" 
          deltaType="down" 
        />
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-6 mb-6">
        <div className="crm-card crm-glass-card">
          <div className="flex items-center px-5 py-4 border-b border-white/[0.08]">
            <h2 className="font-syne text-[14px] font-bold tracking-tight flex-1">Recent Activity</h2>
            <button
              onClick={() => navigate("clients")}
              className="group flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition-colors"
            >
              View all
              <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {["Client", "Event", "Time"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] border-b border-white/[0.06]"
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
                    className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                    onClick={() => selectClient(c)}
                  >
                    <td className="px-5 py-4 border-b border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <ClientAvatar name={c.companyName} />
                        <span className="text-[13px] font-semibold text-slate-200">{c.companyName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 border-b border-white/[0.04]">
                      <Badge variant="amber">Credits low</Badge>
                    </td>
                    <td className="px-5 py-4 border-b border-white/[0.04] text-[12px] text-slate-500">
                      {c.lastActiveAt ? formatDistanceToNow(new Date(c.lastActiveAt), { addSuffix: true }) : "—"}
                    </td>
                  </tr>
                ))}
                {atRiskClients.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-12 text-center text-slate-500 text-[13px]">
                      No recent at-risk activity
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="crm-card p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-syne text-[14px] font-bold tracking-tight mb-1">Messages by Channel</h2>
              <p className="text-[11px] text-slate-500">
                Last 30 days · {channelData?.total?.toLocaleString() ?? 0} total
              </p>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="flex items-center justify-around gap-6">
            <DonutChart data={channelData} />
            <ChannelLegend data={channelData} />
          </div>
        </div>
      </div>

      <div className="crm-card crm-glass-card">
        <div className="flex items-center px-5 py-4 border-b border-white/[0.08]">
          <h2 className="font-syne text-[14px] font-bold tracking-tight flex-1">At-risk Clients</h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("journeys")}
          >
            Run retention journey
            <Zap size={14} className="ml-1" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {["Client", "Industry", "Last Active", "Health", "Status", "Action"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] border-b border-white/[0.06]"
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
                  className="hover:bg-white/[0.03] cursor-pointer transition-colors group"
                  onClick={() => selectClient(c)}
                >
                  <td className="px-5 py-4 border-b border-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <ClientAvatar name={c.companyName} />
                      <span className="text-[13px] font-semibold text-slate-200">{c.companyName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 border-b border-white/[0.04] text-[12.5px] text-slate-400">{c.industry}</td>
                  <td className="px-5 py-4 border-b border-white/[0.04] text-[12px] text-red-400/90 font-medium">
                    {c.lastActiveAt ? formatDistanceToNow(new Date(c.lastActiveAt), { addSuffix: true }) : "Never"}
                  </td>
                  <td className="px-5 py-4 border-b border-white/[0.04] w-48">
                    <HealthBar score={c.healthScore} showLabel={false} />
                  </td>
                  <td className="px-5 py-4 border-b border-white/[0.04]">
                    <Badge variant={c.healthScore < 40 ? "red" : "amber"}>
                      {c.healthScore < 40 ? "Critical" : "At risk"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 border-b border-white/[0.04]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal({ id: "campaign", props: { clientId: c.id } });
                      }}
                      className="opacity-0 group-hover:opacity-100 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white rounded-full transition-all hover:scale-105 active:scale-95"
                      style={{ background: "var(--brand-color-3)", boxShadow: "0 4px 12px -2px rgba(0,0,0,0.3)" }}
                    >
                      Send SMS
                    </button>
                  </td>
                </tr>
              ))}
              {atRiskClients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500 text-[13px]">
                    No clients are at risk right now
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  delta,
  deltaType,
  icon,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: "up" | "down";
  icon?: React.ReactNode;
}) {
  return (
    <div className="crm-card p-5 group transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.04] border border-white/[0.08] text-slate-300 group-hover:scale-110 group-hover:bg-white/[0.08] transition-all duration-300">
          {icon}
        </div>
        {delta && (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            deltaType === "up" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          }`}>
            {deltaType === "up" ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {delta}
          </div>
        )}
      </div>
      <div>
        <div className="text-[10px] text-slate-500 uppercase tracking-[0.12em] mb-1 font-bold">{label}</div>
        <div className="font-syne text-[26px] font-bold text-white leading-none tracking-tight">{value}</div>
      </div>
      
      {/* Decorative gradient */}
      <div
        className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
        style={{ background: "var(--brand-color-4)" }}
      />
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
      <circle cx="48" cy="48" r={r} fill="none" stroke="var(--crm-panel-border)" strokeWidth="15" />
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
          <div key={i} className="h-24 crm-card" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-64 crm-card" />
        <div className="h-64 crm-card" />
      </div>
      <div className="h-64 crm-card" />
    </div>
  );
}
