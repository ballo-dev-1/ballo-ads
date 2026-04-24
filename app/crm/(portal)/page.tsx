"use client";

import { useEffect, useState } from "react";
import { crmFetch } from "@/lib/crmClientApi";

type Overview = { data: { totalClients: number; activeJourneys: number; messagesSentMtd: number; atRiskCount: number } };

export default function CrmDashboardPage() {
  const [overview, setOverview] = useState<Overview["data"] | null>(null);

  useEffect(() => {
    crmFetch<Overview>("/api/crm/v1/analytics/overview")
      .then((json) => setOverview(json.data))
      .catch(() => setOverview(null));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">CRM Dashboard</h1>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          ["Total Clients", overview?.totalClients ?? 0],
          ["Active Journeys", overview?.activeJourneys ?? 0],
          ["Messages Sent", overview?.messagesSentMtd ?? 0],
          ["At-risk Clients", overview?.atRiskCount ?? 0],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-white/10 bg-slate-900 p-4">
            <p className="text-sm text-slate-300">{label}</p>
            <p className="mt-1 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
