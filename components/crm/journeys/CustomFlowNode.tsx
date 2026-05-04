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

  // Category identification for color coding
  const isAction = ["sms", "email", "whatsapp", "webhook", "slack"].includes(type || "");
  const isLogic = ["delay", "wait", "split", "condition", "stop", "schedule"].includes(type || "");
  const isData = ["update", "mark", "funnel"].includes(type || "");
  const isEngagement = ["popup", "inbox"].includes(type || "");

  const categoryColor = isAction ? "#3B82F6" : isLogic ? "#F59E0B" : isData ? "#10B981" : isEngagement ? "#8B5CF6" : style.color;

  return (
    <div className="relative group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {type !== "wait" && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: categoryColor, border: "2px solid #0B1437", width: 10, height: 10 }}
        />
      )}

      <div
        onClick={() => selectNode(id)}
        className={`min-w-[150px] max-w-[200px] cursor-pointer select-none transition-all duration-200 ${hovered ? "scale-[1.02]" : ""}`}
        style={{
          background: "var(--crm-panel)",
          border: isConfigured ? `1.5px solid ${categoryColor}88` : `1.5px dashed ${categoryColor}44`,
          borderRadius: 12,
          padding: "10px 14px",
          boxShadow: isConfigured ? `0 8px 24px -8px ${categoryColor}33` : "none",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-sm" style={{ background: `${categoryColor}22`, color: categoryColor }}>
              {style.icon}
            </div>
            <span
              className="text-[9.5px] font-bold uppercase tracking-[0.1em]"
              style={{ color: categoryColor }}
            >
              {type}
            </span>
          </div>
          {isConfigured && <div className="w-1.5 h-1.5 rounded-full" style={{ background: categoryColor }} />}
        </div>

        <div className="text-[12px] leading-snug font-medium line-clamp-2" style={{ color: isConfigured ? "#F1F5F9" : "#64748B" }}>
          {isConfigured ? label : "Unconfigured"}
        </div>
      </div>

      {hovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteNode(id);
          }}
          className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-[#EF4444] text-white rounded-full text-[10px] flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-20 border-2 border-[#0B1437]"
        >
          ✕
        </button>
      )}

      {type !== "stop" && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: categoryColor, border: "2px solid #0B1437", width: 10, height: 10 }}
        />
      )}

      {(type === "condition" || type === "split") && (
        <>
          <Handle
            type="source"
            id="yes"
            position={Position.Left}
            style={{ background: "#10B981", border: "2px solid #0B1437", width: 10, height: 10, top: "50%" }}
          />
          <Handle
            type="source"
            id="no"
            position={Position.Right}
            style={{ background: "#EF4444", border: "2px solid #0B1437", width: 10, height: 10, top: "50%" }}
          />
          <div className="absolute text-[8px] text-green-400 font-bold tracking-tighter" style={{ left: -24, top: "42%" }}>
            TRUE
          </div>
          <div className="absolute text-[8px] text-red-400 font-bold tracking-tighter" style={{ right: -24, top: "42%" }}>
            FALSE
          </div>
        </>
      )}
    </div>
  );
}
