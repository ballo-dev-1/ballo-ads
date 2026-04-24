"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { clientsApi } from "@/lib/crmApiClient";
import { useClientStore } from "@/lib/crmStores";
import { formatRelativeTime } from "@/lib/crmHelpers";
import type { Client } from "@/lib/crmTypes";

const INDUSTRIES = ["All", "Insurance", "Finance", "Retail", "Government", "Tech", "Other"];

export default function ClientsScreen() {
  const selectClient = useClientStore((s) => s.selectClient);
  const [industry, setIndustry] = useState("All");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["clients", industry, search],
    queryFn: () =>
      clientsApi
        .list({
          ...(industry !== "All" ? { industry } : {}),
          ...(search ? { search } : {}),
          limit: 100,
        })
        .then((r) => r.data),
    staleTime: 30_000,
  });

  const clients: Client[] = data || [];

  return (
    <div>
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {INDUSTRIES.map((ind) => (
          <button
            key={ind}
            onClick={() => setIndustry(ind)}
            className={`px-3 py-1.5 rounded-full text-[11.5px] border transition-all ${
              industry === ind
                ? "border-blue-500/60 bg-blue-500/10 text-blue-300"
                : "border-white/[0.08] bg-white/[0.04] text-slate-400 hover:text-slate-200 hover:border-white/20"
            }`}
          >
            {ind}
            {ind === "All" && ` (${clients.length})`}
          </button>
        ))}
        <div className="ml-auto relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="pl-8 pr-3 py-1.5 bg-white/[0.05] border border-white/[0.08] rounded-[7px] text-[12.5px] text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500/50 w-52"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white/[0.04] border border-white/[0.08] rounded-[14px] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.08]">
              {["Company", "Plan", "Industry", "Health", "Last active", "Credits", "Status"].map((label) => (
                <th
                  key={label}
                  className="px-4 py-2.5 text-left text-[10.5px] font-semibold text-slate-500 uppercase tracking-[0.05em]"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-[13px]">
                  Loading clients...
                </td>
              </tr>
            )}
            {!isLoading && clients.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-[13px]">
                  No clients found
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
      className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.03] cursor-pointer transition-colors group"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[7px] bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10.5px] font-bold flex-shrink-0">
            {initials}
          </div>
          <span className="text-[13px] font-medium text-slate-200 group-hover:text-white transition-colors">
            {client.companyName}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
            planColors[client.planTier] || planColors.Standard
          }`}
        >
          {client.planTier}
        </span>
      </td>
      <td className="px-4 py-3 text-[13px] text-slate-400">{client.industry}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-14 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${client.healthScore}%`, background: hColor }}
            />
          </div>
          <span className="text-[11.5px] font-medium" style={{ color: hColor }}>
            {client.healthScore}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`text-[12.5px] ${
            client.lastActiveAt &&
            new Date(client.lastActiveAt) < new Date(Date.now() - 20 * 86400000)
              ? "text-red-400"
              : "text-slate-400"
          }`}
        >
          {client.lastActiveAt ? formatRelativeTime(client.lastActiveAt) : "Never"}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`text-[13px] ${client.creditsRemaining < 200 ? "text-amber-400" : "text-slate-400"}`}
        >
          {client.creditsRemaining.toLocaleString()}
        </span>
      </td>
      <td className="px-4 py-3">
        {client.accountStatus === "active" ? (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-300 border border-green-500/20">
            Active
          </span>
        ) : (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/20">
            At risk
          </span>
        )}
      </td>
    </tr>
  );
}
