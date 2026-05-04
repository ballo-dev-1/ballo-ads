import { JOURNEY_TEMPLATES } from "@/lib/journey_templates"; // I'll assume I'll move it to lib/ soon
import { useQuery } from "@tanstack/react-query";
import { journeysApi } from "@/lib/crmApiClient";
import { useAppStore, useJourneyStore } from "@/lib/crmStores";
import type { Journey } from "@/lib/crmTypes";
import { Search, Sparkles, Layout, Database, Zap, Clock } from "lucide-react";

interface PaletteItem {
  type: string;
  label: string;
  color: string;
  icon: React.ReactNode;
}

const CATEGORIES: { section: string; icon: React.ReactNode; items: PaletteItem[] }[] = [
  {
    section: "Communication",
    icon: <Zap size={12} />,
    items: [
      { type: "sms", label: "SMS", color: "#3B82F6", icon: "💬" },
      { type: "email", label: "Email", color: "#10B981", icon: "✉️" },
      { type: "whatsapp", label: "WhatsApp", color: "#25D366", icon: "📱" },
      { type: "popup", label: "Popup", color: "#8B5CF6", icon: "🔔" },
      { type: "inbox", label: "Inbox", color: "#8B5CF6", icon: "📥" },
    ],
  },
  {
    section: "Flow control",
    icon: <Clock size={12} />,
    items: [
      { type: "delay", label: "Delay", color: "#F59E0B", icon: "⏱" },
      { type: "wait", label: "Wait for event", color: "#F59E0B", icon: "⌛" },
      { type: "split", label: "Split traffic", color: "#F59E0B", icon: "⑂" },
      { type: "condition", label: "Condition", color: "#F59E0B", icon: "◇" },
      { type: "stop", label: "Stop campaign", color: "#EF4444", icon: "⊗" },
    ],
  },
  {
    section: "User profile",
    icon: <Database size={12} />,
    items: [
      { type: "update", label: "Update attribute", color: "#10B981", icon: "✎" },
      { type: "mark", label: "Mark client", color: "#10B981", icon: "🏷" },
    ],
  },
  {
    section: "Actions",
    icon: <Layout size={12} />,
    items: [
      { type: "webhook", label: "Webhook", color: "#3B82F6", icon: "⇅" },
      { type: "slack", label: "Slack alert", color: "#3B82F6", icon: "💜" },
      { type: "schedule", label: "Schedule send", color: "#3B82F6", icon: "📅" },
    ],
  },
];

export function PalettePanel() {
  const loadJourney = useJourneyStore((s) => s.loadJourney);
  const setFlow = useJourneyStore((s) => s.setFlow);
  const clearCanvas = useJourneyStore((s) => s.clearCanvas);
  const openModal = useAppStore((s) => s.openModal);

  const { data: journeysData } = useQuery({
    queryKey: ["journeys"],
    queryFn: () => journeysApi.list().then((r) => r as Journey[]),
    staleTime: 30_000,
  });

  const activeJourneys = (journeysData || []).filter((j) => j.status === "active").slice(0, 3);

  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData("application/balloads-crm-node", nodeType);
    e.dataTransfer.effectAllowed = "move";
  };

  const applyTemplate = (templateId: string) => {
    const template = JOURNEY_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    clearCanvas();
    setFlow(template.nodes, template.edges);
  };

  return (
    <aside className="w-[220px] min-w-[220px] flex flex-col h-full overflow-hidden" style={{ background: "var(--crm-panel)", borderRight: "1px solid var(--crm-panel-border)" }}>
      {/* Search Bar */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search nodes..." 
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg py-2 pl-9 pr-3 text-[12px] text-slate-200 outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-4 space-y-6">
        {/* Templates Section */}
        <div>
          <div className="flex items-center gap-2 px-2 mb-3">
            <Sparkles size={13} className="text-amber-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Templates</span>
          </div>
          <div className="space-y-1.5">
            {JOURNEY_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t.id)}
                className="w-full text-left p-2.5 rounded-xl bg-amber-500/[0.03] border border-amber-500/[0.08] hover:bg-amber-500/[0.06] hover:border-amber-500/20 transition-all group"
              >
                <div className="text-[11.5px] font-semibold text-amber-200 mb-0.5 group-hover:text-amber-100">{t.name}</div>
                <div className="text-[10px] text-slate-500 leading-tight line-clamp-1">{t.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        {CATEGORIES.map(({ section, icon, items }) => (
          <div key={section}>
            <div className="flex items-center gap-2 px-2 mb-3">
              <span className="text-slate-500">{icon}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{section}</span>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {items.map((item) => (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.type)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-grab active:cursor-grabbing hover:bg-white/[0.05] transition-all group border border-transparent hover:border-white/[0.04]"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-sm" style={{ background: `${item.color}15`, border: `1px solid ${item.color}33`, color: item.color }}>
                    {item.icon}
                  </div>
                  <span className="text-[12.5px] text-slate-300 font-medium group-hover:text-white transition-colors">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Active Journeys */}
      {activeJourneys.length > 0 && (
        <div className="p-4 border-t border-white/[0.06] bg-white/[0.01]">
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-3">Recent Active</div>
          <div className="space-y-1.5">
            {activeJourneys.map((j) => (
              <div
                key={j.id}
                onClick={() => loadJourney(j.id)}
                className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg cursor-pointer hover:bg-white/[0.06] transition-colors"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
                <span className="text-[11px] text-slate-400 truncate">{j.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
