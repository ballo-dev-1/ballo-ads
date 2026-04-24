"use client";

import { useEffect, useState } from "react";
import { crmFetch } from "@/lib/crmClientApi";

export default function AnalyticsPage() {
  const [health, setHealth] = useState<{ healthyCount: number; atRiskCount: number; criticalCount: number; avgScore: number } | null>(null);

  useEffect(() => {
    crmFetch<{ data: { healthyCount: number; atRiskCount: number; criticalCount: number; avgScore: number } }>("/api/crm/v1/analytics/health")
      .then((json) => setHealth(json.data))
      .catch(() => setHealth(null));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Stat label="Healthy" value={health?.healthyCount ?? 0} />
        <Stat label="At Risk" value={health?.atRiskCount ?? 0} />
        <Stat label="Critical" value={health?.criticalCount ?? 0} />
        <Stat label="Average Score" value={health?.avgScore ?? 0} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
