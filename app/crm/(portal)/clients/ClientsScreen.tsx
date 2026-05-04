"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { clientsApi } from "@/lib/crmApiClient";
import { useClientStore } from "@/lib/crmStores";
import { formatRelativeTime } from "@/lib/crmHelpers";
import type { Client } from "@/lib/crmTypes";

const INDUSTRIES = ["All", "Insurance", "Finance", "Retail", "Government", "Tech", "Other"];
const INDUSTRY_API_MAP: Record<string, string> = {
  Finance: "FinancialServices",
  Tech: "InformationTechnology",
};

const PAGE_SIZE = 50;

export default function ClientsScreen() {
  const selectClient = useClientStore((s) => s.selectClient);
  const [industry, setIndustry] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Reset to page 1 when filters change
  React.useEffect(() => { setPage(1); }, [industry, search]);

  const { data: rawData, isLoading } = useQuery({
    queryKey: ["clients", industry, search, page],
    queryFn: () =>
      clientsApi.list({
        ...(industry !== "All" ? { industry: INDUSTRY_API_MAP[industry] ?? industry } : {}),
        ...(search ? { search } : {}),
        limit: PAGE_SIZE,
        page,
      }),
    staleTime: 30_000,
  });

  const clients: Client[] = Array.isArray(rawData) ? rawData : (rawData?.data ?? []);
  const total: number = Array.isArray(rawData) ? clients.length : (rawData?.total ?? clients.length);
  const hasMore: boolean = Array.isArray(rawData) ? false : (rawData?.hasMore ?? false);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] border border-white/[0.08] rounded-full">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind}
              onClick={() => setIndustry(ind)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                industry === ind
                  ? "bg-blue-500/20 text-blue-300 shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
        <div className="ml-auto relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="pl-10 pr-4 py-2 bg-white/[0.05] border border-white/[0.08] rounded-full text-[13px] text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all w-64"
            placeholder="Search clients by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="crm-card crm-glass-card overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Clients">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                {["Company", "Plan", "Industry", "Health", "Last Active", "Credits", "Status"].map((label) => (
                  <th
                    key={label}
                    className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-5 py-20 text-center text-slate-500 text-[13px]">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                      Loading clients database...
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && clients.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-20 text-center text-slate-500 text-[13px]">
                    No clients found matching your filters
                  </td>
                </tr>
              )}
              {clients.map((client) => (
                <ClientRow key={client.id} client={client} onClick={() => selectClient(client)} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06] mt-0">
          <span className="text-[12px] text-slate-500">
            {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} clients
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="px-3 py-1.5 text-[12px] bg-white/[0.05] text-slate-300 border border-white/[0.1] rounded-[7px] hover:bg-white/[0.09] disabled:opacity-40 transition-colors"
            >
              ← Prev
            </button>
            <span className="text-[12px] text-slate-400 px-2">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore || isLoading}
              className="px-3 py-1.5 text-[12px] bg-white/[0.05] text-slate-300 border border-white/[0.1] rounded-[7px] hover:bg-white/[0.09] disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientRow({ client, onClick }: { client: Client; onClick: () => void }) {
  const hColor = client.healthScore >= 70 ? "#10B981" : client.healthScore >= 40 ? "#F59E0B" : "#EF4444";
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
    <tr
      onClick={onClick}
      className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.04] cursor-pointer transition-colors group"
    >
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center text-[11px] font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
            {initials}
          </div>
          <span className="text-[13px] font-semibold text-slate-200 group-hover:text-white transition-colors">
            {client.companyName}
          </span>
        </div>
      </td>
      <td className="px-5 py-4">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            planColors[client.planTier] || planColors.Standard
          }`}
        >
          {client.planTier}
        </span>
      </td>
      <td className="px-5 py-4 text-[13px] text-slate-400 font-medium">{client.industry}</td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${client.healthScore}%`, background: hColor }}
            />
          </div>
          <span className="text-[12px] font-bold tabular-nums" style={{ color: hColor }}>
            {client.healthScore}
          </span>
        </div>
      </td>
      <td className="px-5 py-4">
        <span
          className={`text-[12px] font-medium ${
            client.lastActiveAt &&
            new Date(client.lastActiveAt) < new Date(Date.now() - 20 * 86400000)
              ? "text-red-400"
              : "text-slate-400"
          }`}
        >
          {client.lastActiveAt ? formatRelativeTime(client.lastActiveAt) : "Never"}
        </span>
      </td>
      <td className="px-5 py-4">
        <span
          className={`text-[13px] font-bold tabular-nums ${client.creditsRemaining < 200 ? "text-amber-400" : "text-slate-200"}`}
        >
          {client.creditsRemaining.toLocaleString()}
        </span>
      </td>
      <td className="px-5 py-4">
        {client.accountStatus === "active" ? (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
            Active
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            At risk
          </span>
        )}
      </td>
    </tr>
  );
}
