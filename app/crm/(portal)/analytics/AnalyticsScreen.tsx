"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { analyticsApi, journeysApi } from "@/lib/crmApiClient";
import type { Journey } from "@/lib/crmTypes";

export default function AnalyticsScreen() {
  const { data: retention } = useQuery({
    queryKey: ["analytics-retention"],
    queryFn: () => analyticsApi.retention(),
  });
  const { data: monthly } = useQuery({
    queryKey: ["analytics-messages"],
    queryFn: () => analyticsApi.messages(),
  });
  const { data: health } = useQuery({
    queryKey: ["analytics-health"],
    queryFn: () => analyticsApi.health(),
  });

  const { data: journeys } = useQuery({
    queryKey: ["journeys"],
    queryFn: () => journeysApi.list().then((r) => r as Journey[]),
  });
  const firstActiveJourney = (journeys || []).find((j) => j.status === "active");

  const { data: funnelData } = useQuery({
    queryKey: ["journey-funnel", firstActiveJourney?.id],
    queryFn: () =>
      firstActiveJourney
        ? journeysApi.analytics(firstActiveJourney.id).then((r) => r.funnel)
        : Promise.resolve([]),
    enabled: !!firstActiveJourney,
  });

  const stats = [
    { label: "Avg open rate", value: retention?.avgOpenRate != null ? `${retention.avgOpenRate}%` : "—" },
    { label: "Avg click rate", value: retention?.ctr != null ? `${retention.ctr}%` : "—" },
    { label: "Churn rate", value: retention?.churnRate != null ? `${retention.churnRate}%` : "—" },
    { label: "Retention score", value: retention?.retentionScore != null ? `${retention.retentionScore}%` : "—" },
  ];

  const healthTotal = health ? health.healthyCount + health.atRiskCount + health.criticalCount : 1;

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="crm-card p-4">
            <div className="text-[11px] text-slate-500 uppercase tracking-[0.05em] mb-2">{s.label}</div>
            <div className="text-[26px] font-bold text-slate-200 font-syne leading-none">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1.5fr_1fr] gap-4 mb-4">
        <div className="crm-card p-4">
          <div className="text-[13px] font-semibold text-slate-200 font-syne mb-0.5">Messages sent per month</div>
          <div className="text-[11.5px] text-slate-500 mb-4">All channels combined</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={monthly || []} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => (typeof v === "string" ? v.slice(5) : String(v))}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--crm-panel)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#94A3B8" }}
                itemStyle={{ color: "#60A5FA" }}
              />
              <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="crm-card p-4">
          <div className="text-[13px] font-semibold text-slate-200 font-syne mb-0.5">Client health</div>
          <div className="text-[11.5px] text-slate-500 mb-4">
            Current snapshot · {health?.total || 0} clients
          </div>
          <div className="space-y-4">
            <HealthTier label="Healthy (70–100)" count={health?.healthyCount || 0} total={healthTotal} color="#10B981" />
            <HealthTier label="At risk (40–69)" count={health?.atRiskCount || 0} total={healthTotal} color="#F59E0B" />
            <HealthTier label="Critical (0–39)" count={health?.criticalCount || 0} total={healthTotal} color="#EF4444" />
          </div>
        </div>
      </div>

      {firstActiveJourney && (
        <div className="crm-card p-4">
          <div className="text-[13px] font-semibold text-slate-200 font-syne mb-0.5">
            Journey funnel — &ldquo;{firstActiveJourney.name}&rdquo;
          </div>
          <div className="text-[11.5px] text-slate-500 mb-5">
            Active automation &middot; live funnel snapshot
          </div>
          <div className="flex items-end gap-1.5 h-24">
            {(funnelData || []).map((step, i) => {
              const maxCount = Math.max(...((funnelData || []).map((s) => s.count) as number[]), 1);
              const heightPct = Math.round((step.count / maxCount) * 100);
              const colors = ["#3B82F6", "#3B82F6", "#10B981", "#10B981", "#F59E0B", "#EF4444"];
              const color = colors[i % colors.length];
              return (
                <div key={step.nodeName} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t-[4px]"
                    style={{ height: `${heightPct}%`, background: color, opacity: 0.85 }}
                  />
                  <div className="text-[9.5px] text-slate-500 text-center leading-tight">{step.nodeName}</div>
                  <div className="text-[12px] font-semibold" style={{ color }}>
                    {step.count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function HealthTier({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-[11.5px] mb-1.5">
        <span style={{ color }}>{label}</span>
        <span className="text-slate-400">{count} clients</span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
