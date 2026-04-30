"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Trash2, UserPlus, Search } from "lucide-react";
import { segmentsApi, clientsApi } from "@/lib/crmApiClient";
import { useAppStore, useClientStore } from "@/lib/crmStores";
import { formatRelativeTime } from "@/lib/crmHelpers";
import type { Client, Segment } from "@/lib/crmTypes";

export default function SegmentsScreen() {
  const [selectedSegId, setSelectedSegId] = useState<string | null>(null);
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set());
  const openModal = useAppStore((s) => s.openModal);
  const selectClient = useClientStore((s) => s.selectClient);
  const qc = useQueryClient();

  const { data: segsData } = useQuery({
    queryKey: ["segments"],
    queryFn: () => segmentsApi.list().then((r) => r as Segment[]),
  });

  const segments = segsData || [];
  const selectedSeg = segments.find((s) => s.id === selectedSegId) || segments[0];

  const { data: segClients } = useQuery({
    queryKey: ["segment-clients", selectedSeg?.id],
    queryFn: () =>
      selectedSeg
        ? segmentsApi.getClients(selectedSeg.id).then((r) => r.data as Client[])
        : Promise.resolve([] as Client[]),
    enabled: !!selectedSeg,
  });

  const { data: allClientsData } = useQuery({
    queryKey: ["clients-all-for-add"],
    queryFn: () => clientsApi.list({ limit: 200 }).then((r) => (Array.isArray(r) ? r : r.data) as Client[]),
    enabled: addMembersOpen,
    staleTime: 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => segmentsApi.delete(id),
    onSuccess: (_, id) => {
      toast.success("Segment deleted");
      if (selectedSegId === id) setSelectedSegId(null);
      qc.invalidateQueries({ queryKey: ["segments"] });
    },
    onError: () => toast.error("Failed to delete segment"),
  });

  const addMembersMutation = useMutation({
    mutationFn: () =>
      segmentsApi.addMembers(selectedSeg!.id, Array.from(selectedClientIds)),
    onSuccess: (res) => {
      toast.success(`Added ${res.added} client${res.added !== 1 ? "s" : ""} to segment`);
      setAddMembersOpen(false);
      setSelectedClientIds(new Set());
      setMemberSearch("");
      qc.invalidateQueries({ queryKey: ["segment-clients", selectedSeg?.id] });
      qc.invalidateQueries({ queryKey: ["segments"] });
    },
    onError: () => toast.error("Failed to add members"),
  });

  const handleDelete = (e: React.MouseEvent, seg: Segment) => {
    e.stopPropagation();
    if (!window.confirm(`Delete segment "${seg.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(seg.id);
  };

  const toggleClient = (id: string) => {
    setSelectedClientIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const hColor = (score: number) => (score >= 70 ? "#10B981" : score >= 40 ? "#F59E0B" : "#EF4444");

  const existingIds = new Set((segClients || []).map((c) => c.id));
  const filteredAllClients = (allClientsData || []).filter(
    (c) =>
      !existingIds.has(c.id) &&
      (!memberSearch || c.companyName.toLowerCase().includes(memberSearch.toLowerCase())),
  );

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {segments.map((seg) => (
          <div
            key={seg.id}
            onClick={() => { setSelectedSegId(seg.id); setAddMembersOpen(false); }}
            className={`crm-card p-4 cursor-pointer transition-all relative group ${
              selectedSeg?.id === seg.id
                ? "!border-blue-500/50 !bg-blue-500/[0.06]"
                : "hover:!border-blue-500/30 hover:!bg-blue-500/[0.03]"
            }`}
          >
            <button
              onClick={(e) => handleDelete(e, seg)}
              disabled={deleteMutation.isPending}
              className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-[5px] text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-40"
            >
              <Trash2 size={12} />
            </button>
            <div className="text-[13.5px] font-semibold text-slate-200 font-syne mb-1.5 pr-6">{seg.name}</div>
            <div className="text-[22px] font-bold text-blue-300 font-syne">{seg.clientCount}</div>
            <div className="text-[11.5px] text-slate-500 mt-1.5 mb-2.5 leading-relaxed">{seg.description}</div>
            <div className="flex flex-wrap gap-1">
              {(seg.rules || []).map((r, i) => (
                <span
                  key={i}
                  className="text-[10.5px] bg-white/[0.06] border border-white/[0.08] text-slate-300 px-2 py-0.5 rounded"
                >
                  {r.attr} {r.op} {r.val}
                </span>
              ))}
            </div>
          </div>
        ))}
        {segments.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-500 bg-white/[0.02] border border-dashed border-white/[0.08] rounded-2xl">
            <div className="text-[32px] mb-3 opacity-40">📊</div>
            <div className="text-[14px] font-medium text-slate-400 mb-1">No segments yet</div>
            <div className="text-[12.5px] mb-4">Create your first segment to group clients dynamically</div>
            <button
              onClick={() => openModal({ id: "segment" })}
              className="text-[12.5px] text-white px-4 py-2 rounded-full font-medium transition-all hover:brightness-110"
              style={{ background: "var(--brand-color-3)", color: "white" }}
            >
              + New segment
            </button>
          </div>
        )}
      </div>

      <div className="crm-card overflow-hidden">
        <div className="flex items-center px-4 py-3 border-b border-white/[0.08] gap-3">
          <div className="text-[13.5px] font-semibold text-slate-200 font-syne flex-1">
            {selectedSeg ? `${selectedSeg.name} — ${segClients?.length || 0} clients` : "Select a segment"}
          </div>
          <button
            onClick={() => openModal({ id: "segment" })}
            className="text-[11.5px] bg-white/[0.07] text-slate-300 border border-white/[0.1] px-3 py-1.5 rounded-[7px] hover:bg-white/[0.1] transition-colors"
          >
            + New segment
          </button>
          {selectedSeg && (
            <>
              <button
                onClick={() => { setAddMembersOpen((o) => !o); setSelectedClientIds(new Set()); setMemberSearch(""); }}
                className="text-[11.5px] bg-white/[0.07] text-slate-300 border border-white/[0.1] px-3 py-1.5 rounded-[7px] hover:bg-white/[0.1] transition-colors flex items-center gap-1.5"
              >
                <UserPlus size={12} /> Add clients
              </button>
              <button
                onClick={() => openModal({ id: "campaign", props: { segmentId: selectedSeg.id } })}
                className="text-[11.5px] bg-[#3B82F6] text-white px-3 py-1.5 rounded-[7px] hover:bg-blue-600 transition-colors font-medium"
              >
                Run campaign →
              </button>
            </>
          )}
        </div>

        {addMembersOpen && selectedSeg && (
          <div className="border-b border-white/[0.08] p-4 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative flex-1">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  className="w-full pl-7 pr-3 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-[7px] text-[12.5px] text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500/50"
                  placeholder="Search clients to add..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <span className="text-[11.5px] text-slate-500">{selectedClientIds.size} selected</span>
              <button
                onClick={() => addMembersMutation.mutate()}
                disabled={selectedClientIds.size === 0 || addMembersMutation.isPending}
                className="px-3 py-1.5 text-[12px] bg-[#3B82F6] text-white rounded-[7px] hover:bg-blue-600 disabled:opacity-40 font-medium transition-colors"
              >
                {addMembersMutation.isPending ? "Adding..." : "Add to segment"}
              </button>
              <button
                onClick={() => { setAddMembersOpen(false); setSelectedClientIds(new Set()); }}
                className="text-[12px] text-slate-500 hover:text-white transition-colors px-2"
              >
                Cancel
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredAllClients.length === 0 && (
                <p className="text-[12px] text-slate-500 py-2 text-center">
                  {memberSearch ? "No clients match your search" : "All clients are already in this segment"}
                </p>
              )}
              {filteredAllClients.slice(0, 50).map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-[7px] hover:bg-white/[0.05] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedClientIds.has(c.id)}
                    onChange={() => toggleClient(c.id)}
                    className="accent-blue-500"
                  />
                  <div className="w-5 h-5 rounded-[5px] bg-blue-500/20 text-blue-300 flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                    {c.companyName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[12.5px] text-slate-200 flex-1 truncate">{c.companyName}</span>
                  <span className="text-[11px] text-slate-500">{c.industry}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.08]">
              {["Company", "Industry", "Health", "Plan", "Last active"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-[10.5px] font-semibold text-slate-500 uppercase tracking-[0.05em]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(segClients || []).map((c) => (
              <tr
                key={c.id}
                onClick={() => selectClient(c)}
                className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.03] cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-[6px] bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {c.companyName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[13px] font-medium text-slate-200">{c.companyName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px] text-slate-400">{c.industry}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${c.healthScore}%`, background: hColor(c.healthScore) }} />
                    </div>
                    <span className="text-[11.5px]" style={{ color: hColor(c.healthScore) }}>{c.healthScore}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    {c.planTier}
                  </span>
                </td>
                <td className="px-4 py-3 text-[12.5px] text-slate-400">
                  {c.lastActiveAt ? formatRelativeTime(c.lastActiveAt) : "—"}
                </td>
              </tr>
            ))}
            {(!segClients || segClients.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-[13px]">
                  {selectedSeg ? "No clients in this segment yet" : "Pick a segment to see its clients"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
