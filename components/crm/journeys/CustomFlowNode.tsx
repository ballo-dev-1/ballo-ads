"use client";

import React, { useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useJourneyStore } from "@/lib/crmStores";

const NODE_STYLES: Record<string, { color: string; icon: string }> = {
  sms: { color: "#3B82F6", icon: "💬" },
  email: { color: "#10B981", icon: "✉️" },
  whatsapp: { color: "#25D366", icon: "📱" },
  popup: { color: "#F59E0B", icon: "🔔" },
  inbox: { color: "#8B5CF6", icon: "📥" },
  delay: { color: "#64748B", icon: "⏱" },
  wait: { color: "#7C3AED", icon: "⌛" },
  split: { color: "#EC4899", icon: "⑂" },
  condition: { color: "#06B6D4", icon: "◇" },
  funnel: { color: "#94A3B8", icon: "▽" },
  stop: { color: "#EF4444", icon: "⊗" },
  update: { color: "#0EA5E9", icon: "✎" },
  mark: { color: "#84CC16", icon: "🏷" },
  webhook: { color: "#F97316", icon: "⇅" },
  slack: { color: "#A855F7", icon: "💜" },
  schedule: { color: "#0EA5E9", icon: "📅" },
};

export function CustomFlowNode({ id, type, data }: NodeProps) {
  const [hovered, setHovered] = useState(false);
  const deleteNode = useJourneyStore((s) => s.deleteNode);
  const selectNode = useJourneyStore((s) => s.selectNode);

  const style = NODE_STYLES[type || ""] || { color: "#64748B", icon: "?" };
  const label: string = (data as { label?: string })?.label || "";
  const isConfigured = label && label !== "Click to configure";

  return (
    <div className="relative group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {type !== "wait" && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: style.color, border: "2px solid #0B1437", width: 10, height: 10 }}
        />
      )}

      <div
        onClick={() => selectNode(id)}
        className="min-w-[140px] max-w-[180px] cursor-pointer select-none"
        style={{
          background: `${style.color}18`,
          border: `1.5px solid ${style.color}55`,
          borderRadius: 10,
          padding: "8px 12px",
          boxShadow: isConfigured ? `0 0 0 2px ${style.color}22` : "none",
        }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[12px]">{style.icon}</span>
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.07em]"
            style={{ color: style.color }}
          >
            {type}
          </span>
        </div>

        <div className="text-[11.5px] leading-tight" style={{ color: isConfigured ? "#CBD5E1" : "#64748B" }}>
          {isConfigured ? label : "Click to configure"}
        </div>
      </div>

      {hovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteNode(id);
          }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500/20 border border-red-500/40 text-red-300 rounded-full text-[10px] flex items-center justify-center hover:bg-red-500/40 transition-colors"
        >
          ✕
        </button>
      )}

      {type !== "stop" && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: style.color, border: "2px solid #0B1437", width: 10, height: 10 }}
        />
      )}

      {(type === "condition" || type === "split") && (
        <>
          <Handle
            type="source"
            id="yes"
            position={Position.Left}
            style={{ background: "#10B981", border: "2px solid #0B1437", width: 9, height: 9, top: "60%" }}
          />
          <Handle
            type="source"
            id="no"
            position={Position.Right}
            style={{ background: "#EF4444", border: "2px solid #0B1437", width: 9, height: 9, top: "60%" }}
          />
          <div className="absolute text-[9px] text-green-400 font-semibold" style={{ left: -26, top: "55%" }}>
            YES
          </div>
          <div className="absolute text-[9px] text-red-400 font-semibold" style={{ right: -20, top: "55%" }}>
            NO
          </div>
        </>
      )}
    </div>
  );
}
