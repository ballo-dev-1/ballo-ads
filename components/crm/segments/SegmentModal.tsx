"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { segmentsApi } from "@/lib/crmApiClient";
import { useAppStore } from "@/lib/crmStores";
import type { SegmentRule } from "@/lib/crmTypes";

const ATTRIBUTES = [
  { value: "health_score", label: "Health Score", type: "number" },
  { value: "credits_remaining", label: "Credits Remaining", type: "number" },
  { value: "plan_tier", label: "Plan Tier", type: "string" },
  { value: "industry", label: "Industry", type: "string" },
  { value: "region", label: "Region", type: "string" },
  { value: "account_status", label: "Account Status", type: "string" },
  { value: "interests", label: "Interests", type: "array" },
  { value: "has_clicked", label: "Has Clicked Ad", type: "boolean" },
  { value: "last_active_at", label: "Last Active", type: "date" },
];

const NUMBER_OPS = [
  { value: "eq", label: "equals" },
  { value: "gt", label: "is greater than" },
  { value: "lt", label: "is less than" },
  { value: "gte", label: "is at least" },
  { value: "lte", label: "is at most" },
];

const STRING_OPS = [
  { value: "eq", label: "equals" },
  { value: "neq", label: "does not equal" },
  { value: "contains", label: "contains" },
];

const ARRAY_OPS = [
  { value: "has", label: "includes any of" },
  { value: "has_all", label: "includes all of" },
];

const BOOLEAN_OPS = [
  { value: "eq", label: "is" },
];

const DATE_OPS = [
  { value: "before", label: "is before" },
  { value: "after", label: "is after" },
];

export function SegmentModal() {
  const closeModal = useAppStore((s) => s.closeModal);
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState<SegmentRule[]>([]);
  const [contactInput, setContactInput] = useState("");
  const [manualContacts, setManualContacts] = useState<string[]>([]);
  const [estimatedCount, setEstimatedCount] = useState<number | null>(null);

  useEffect(() => {
    if (rules.length === 0) {
      setEstimatedCount(null);
      return;
    }
    const timer = setTimeout(() => {
      segmentsApi
        .estimateReach(rules)
        .then((r) => setEstimatedCount(r.count ?? null))
        .catch(() => setEstimatedCount(null));
    }, 500);
    return () => clearTimeout(timer);
  }, [rules]);

  const addRule = () => {
    setRules((prev) => [...prev, { attr: "health_score", op: "<", val: "40" }]);
  };

  const updateRule = (i: number, field: keyof SegmentRule, value: string) => {
    setRules((prev) =>
      prev.map((r, idx) => {
        if (idx !== i) return r;
        const next = { ...r, [field]: value };
        // Reset operator if attribute changed to prevent invalid ops
        if (field === "attr") {
          const def = ATTRIBUTES.find((a) => a.value === value);
          if (def?.type === "number") next.op = "eq";
          else if (def?.type === "array") next.op = "has";
          else if (def?.type === "boolean") next.op = "eq";
          else if (def?.type === "date") next.op = "after";
          else next.op = "eq";
        }
        return next;
      }),
    );
  };

  const removeRule = (i: number) => {
    setRules((prev) => prev.filter((_, idx) => idx !== i));
  };

  const create = useMutation({
    mutationFn: () =>
      segmentsApi.create({
        name,
        description,
        rules,
        ...(manualContacts.length > 0 ? { manualContacts } : {}),
      }),
    onSuccess: () => {
      toast.success("Segment created");
      qc.invalidateQueries({ queryKey: ["segments"] });
      closeModal();
    },
    onError: () => toast.error("Failed to create segment"),
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-[500] flex items-center justify-center">
      <div className="border border-white/[0.1] rounded-[14px] p-6 w-[520px] max-w-[92vw] max-h-[88vh] overflow-y-auto shadow-2xl" style={{ background: "var(--crm-panel)" }}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[16px] font-bold text-slate-200 font-syne">New segment</h2>
          <button onClick={closeModal}>
            <X size={18} className="text-slate-400 hover:text-white" />
          </button>
        </div>
        <p className="text-[12px] text-slate-500 mb-5">Define rules to dynamically group clients</p>

        <div className="space-y-4">
          <div>
            <label className="block text-[11.5px] font-medium text-slate-300 mb-1.5">Segment name</label>
            <input
              className="crm-input w-full"
              placeholder="e.g. At-risk Pro clients"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[11.5px] font-medium text-slate-300 mb-1.5">Description (optional)</label>
            <input
              className="crm-input w-full"
              placeholder="Used for re-engagement campaigns"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11.5px] font-medium text-slate-300">Rules</label>
              {rules.length > 0 && (
                <span className="text-[10.5px] text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded">
                  AND logic — all must match
                </span>
              )}
            </div>

            <div className="space-y-2 mb-2">
              {rules.map((rule, i) => {
                const attrDef = ATTRIBUTES.find((a) => a.value === rule.attr);
                let ops = STRING_OPS;
                if (attrDef?.type === "number") ops = NUMBER_OPS;
                else if (attrDef?.type === "array") ops = ARRAY_OPS;
                else if (attrDef?.type === "boolean") ops = BOOLEAN_OPS;
                else if (attrDef?.type === "date") ops = DATE_OPS;

                return (
                  <div key={i} className="flex items-center gap-2">
                    <select
                      className="crm-input flex-1"
                      value={rule.attr}
                      onChange={(e) => updateRule(i, "attr", e.target.value)}
                    >
                      {ATTRIBUTES.map((a) => (
                        <option key={a.value} value={a.value}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                    <select
                      className="crm-input w-36"
                      value={rule.op}
                      onChange={(e) => updateRule(i, "op", e.target.value)}
                    >
                      {ops.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>
                    {attrDef?.type === "boolean" ? (
                      <select
                        className="crm-input w-24"
                        value={rule.val}
                        onChange={(e) => updateRule(i, "val", e.target.value)}
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    ) : (
                      <input
                        className="crm-input w-24"
                        type={attrDef?.type === "date" ? "date" : "text"}
                        value={rule.val}
                        onChange={(e) => updateRule(i, "val", e.target.value)}
                        placeholder={attrDef?.type === "array" ? "tag1,tag2" : "value"}
                      />
                    )}
                    <button
                      onClick={() => removeRule(i)}
                      className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={addRule}
              className="flex items-center gap-1.5 text-[11.5px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Plus size={13} /> Add rule
            </button>
          </div>

          {estimatedCount !== null && (
            <div className="bg-blue-500/[0.07] border border-blue-500/20 rounded-[8px] px-3 py-2.5">
              <span className="text-[11.5px] text-blue-300">
                Estimated reach: <span className="font-semibold text-[14px]">{estimatedCount}</span> clients
              </span>
            </div>
          )}

          <div>
            <label className="block text-[11.5px] font-medium text-slate-300 mb-1.5">Manual contacts (optional)</label>
            <div className="flex flex-wrap gap-1.5 bg-white/[0.05] border border-white/[0.1] rounded-[7px] p-2 min-h-[40px] focus-within:border-blue-500/50">
              {manualContacts.map((c) => (
                <span
                  key={c}
                  className="flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/30 text-blue-300 px-2 py-0.5 rounded text-[11.5px]"
                >
                  {c}
                  <button
                    onClick={() => setManualContacts((prev) => prev.filter((x) => x !== c))}
                    className="text-blue-300/50 hover:text-red-400 text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                className="bg-transparent outline-none text-[12.5px] text-slate-200 placeholder-slate-500 flex-1 min-w-[120px]"
                placeholder="Type phone or email, press Enter..."
                value={contactInput}
                onChange={(e) => setContactInput(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === ",") && contactInput.trim()) {
                    e.preventDefault();
                    setManualContacts((prev) => [...prev, contactInput.trim()]);
                    setContactInput("");
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/[0.08]">
          <button
            onClick={closeModal}
            className="px-4 py-2 text-[12.5px] text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => create.mutate()}
            disabled={!name.trim() || create.isPending}
            className="px-5 py-2 text-[12.5px] rounded-[8px] disabled:opacity-40 font-medium transition-colors"
            style={{ background: "var(--brand-color-3)", color: "white" }}
          >
            {create.isPending ? "Creating..." : "Create segment"}
          </button>
        </div>
      </div>
    </div>
  );
}
