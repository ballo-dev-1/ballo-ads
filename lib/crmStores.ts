"use client";

import { create } from "zustand";
import type { Client } from "@/lib/crmTypes";
import { journeysApi } from "@/lib/crmApiClient";

type Screen = "dashboard" | "clients" | "segments" | "journeys" | "campaigns" | "analytics";

let navigatorFn: ((screen: Screen) => void) | null = null;
export function setCrmNavigator(fn: (screen: Screen) => void) {
  navigatorFn = fn;
}

export type CrmModal =
  | { id: "campaign"; props?: { clientId?: string; segmentId?: string } }
  | { id: "segment"; props?: Record<string, unknown> }
  | { id: "journey"; props?: Record<string, unknown> };

interface AppState {
  activeModal: CrmModal | null;
  isSyncing: boolean;
  openModal: (modal: CrmModal) => void;
  closeModal: () => void;
  setSyncing: (value: boolean) => void;
  navigate: (screen: Screen) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeModal: null,
  isSyncing: false,
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  setSyncing: (value) => set({ isSyncing: value }),
  navigate: (screen) => {
    if (navigatorFn) navigatorFn(screen);
  },
}));

interface ClientState {
  selectedClient: Client | null;
  isDetailPanelOpen: boolean;
  selectClient: (client: Client) => void;
  closeDetailPanel: () => void;
}

export const useClientStore = create<ClientState>((set) => ({
  selectedClient: null,
  isDetailPanelOpen: false,
  selectClient: (client) => set({ selectedClient: client, isDetailPanelOpen: true }),
  closeDetailPanel: () => set({ selectedClient: null, isDetailPanelOpen: false }),
}));

export type FlowNodeType =
  | "sms"
  | "email"
  | "whatsapp"
  | "popup"
  | "inbox"
  | "delay"
  | "wait"
  | "split"
  | "condition"
  | "funnel"
  | "stop"
  | "update"
  | "mark"
  | "webhook"
  | "slack"
  | "schedule";

export interface FlowNodeModel {
  id: string;
  type: FlowNodeType;
  x: number;
  y: number;
  config: Record<string, unknown> & { type?: FlowNodeType };
  label: string;
}

export interface JourneySavePayload {
  name: string;
  triggerType: string;
  triggerConfig: Record<string, unknown>;
  entrySegmentId?: string;
  maxDurationDays: number;
  entryMode: "once_per_client" | "once_during_open" | "recurring";
}

interface JourneyState {
  currentJourneyId: string | null;
  nodes: FlowNodeModel[];
  edges: Array<[string, string]>;
  selectedNodeId: string | null;
  isConfigPopupOpen: boolean;

  addNode: (node: FlowNodeModel) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  updateNodeConfig: (nodeId: string, config: Record<string, unknown>, label?: string) => void;
  deleteNode: (nodeId: string) => void;
  clearCanvas: () => void;
  selectNode: (nodeId: string | null) => void;
  closeConfigPopup: () => void;
  loadSampleFlow: () => void;
  loadJourney: (journeyId: string) => Promise<void>;
  saveJourney: (meta: JourneySavePayload) => Promise<void>;
  setFlow: (nodes: FlowNodeModel[], edges: Array<[string, string]>) => void;
  addEdge: (edge: [string, string]) => void;
}

const SAMPLE_FLOW: { nodes: FlowNodeModel[]; edges: Array<[string, string]> } = {
  nodes: [
    { id: "n0", type: "wait", x: 50, y: 50, config: { type: "wait", event: "inactive_30d", timeoutAmount: 3, timeoutUnit: "days" }, label: "Client inactive > 30 days" },
    { id: "n1", type: "condition", x: 260, y: 50, config: { type: "condition", attr: "credits", op: ">", val: "100" }, label: "credits > 100?" },
    { id: "n2", type: "sms", x: 100, y: 200, config: { type: "sms", msg: "Hi {{company_name}}, we miss you! Log in to BalloAds and check your campaigns." }, label: "SMS — re-engagement" },
    { id: "n3", type: "delay", x: 320, y: 200, config: { type: "delay", amount: 2, unit: "days" }, label: "Wait 2 days" },
    { id: "n4", type: "email", x: 100, y: 360, config: { type: "email", subject: "Come back to BalloAds", body: "Hi {{company_name}},\n\nWe noticed you have not logged in recently..." }, label: "Email — follow up" },
    { id: "n5", type: "sms", x: 440, y: 360, config: { type: "sms", msg: "{{company_name}} — your BalloAds credits are running low. Top up now." }, label: "SMS — credits low" },
    { id: "n6", type: "mark", x: 260, y: 500, config: { type: "mark", marker: "re-engaged", action: "add" }, label: "Mark: re-engaged" },
    { id: "n7", type: "stop", x: 260, y: 640, config: { type: "stop", reason: "completed", archive: false }, label: "Stop — completed" },
  ],
  edges: [
    ["n0", "n1"],
    ["n1", "n2"],
    ["n1", "n3"],
    ["n2", "n4"],
    ["n3", "n5"],
    ["n4", "n6"],
    ["n5", "n6"],
    ["n6", "n7"],
  ],
};

export const useJourneyStore = create<JourneyState>((set, get) => ({
  currentJourneyId: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isConfigPopupOpen: false,

  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  updateNodePosition: (id, x, y) =>
    set((state) => ({ nodes: state.nodes.map((node) => (node.id === id ? { ...node, x, y } : node)) })),
  updateNodeConfig: (nodeId, config, label) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, config: { ...node.config, ...config }, label: label || node.label }
          : node,
      ),
      isConfigPopupOpen: false,
      selectedNodeId: null,
    })),
  deleteNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter(([from, to]) => from !== nodeId && to !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    })),
  clearCanvas: () => set({ nodes: [], edges: [], selectedNodeId: null, isConfigPopupOpen: false, currentJourneyId: null }),
  selectNode: (nodeId) => set({ selectedNodeId: nodeId, isConfigPopupOpen: nodeId !== null }),
  closeConfigPopup: () => set({ isConfigPopupOpen: false, selectedNodeId: null }),
  loadSampleFlow: () => set({ nodes: SAMPLE_FLOW.nodes, edges: SAMPLE_FLOW.edges }),
  loadJourney: async (journeyId) => {
    const res = await journeysApi.get(journeyId);
    const journey = res as {
      flowDefinition?: { nodes?: FlowNodeModel[]; edges?: Array<[string, string]> };
    } | undefined;
    const flow = journey?.flowDefinition;
    const nodes: FlowNodeModel[] = Array.isArray(flow?.nodes) ? (flow!.nodes as FlowNodeModel[]) : [];
    const edges: Array<[string, string]> = Array.isArray(flow?.edges) ? (flow!.edges as Array<[string, string]>) : [];
    set({ currentJourneyId: journeyId, nodes, edges });
  },
  saveJourney: async (meta) => {
    const state = get();
    const payload = {
      name: meta.name,
      triggerType: meta.triggerType,
      triggerConfig: meta.triggerConfig,
      flowDefinition: { nodes: state.nodes, edges: state.edges },
      entrySegmentId: meta.entrySegmentId,
      maxDurationDays: meta.maxDurationDays,
      entryMode: meta.entryMode,
    } as Record<string, unknown>;
    let journeyId = state.currentJourneyId;
    if (journeyId) {
      await journeysApi.update(journeyId, payload);
    } else {
      const res = await journeysApi.create(payload);
      const created = res as { id?: string } | undefined;
      journeyId = created?.id || null;
    }
    if (journeyId) {
      await journeysApi.activate(journeyId);
      set({ currentJourneyId: journeyId });
    }
  },
  setFlow: (nodes, edges) => set({ nodes, edges }),
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
}));
