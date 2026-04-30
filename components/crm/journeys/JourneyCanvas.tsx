"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  NodeTypes,
  ReactFlowInstance,
  ReactFlowProvider,
} from "reactflow";
import { useAppStore, useJourneyStore } from "@/lib/crmStores";
import type { FlowNodeType } from "@/lib/crmStores";
import { PalettePanel } from "./PalettePanel";
import { NodeConfigPopup } from "./NodeConfigPopup";
import { CustomFlowNode } from "./CustomFlowNode";

const nodeTypes: NodeTypes = {
  sms: CustomFlowNode,
  email: CustomFlowNode,
  whatsapp: CustomFlowNode,
  popup: CustomFlowNode,
  inbox: CustomFlowNode,
  delay: CustomFlowNode,
  wait: CustomFlowNode,
  split: CustomFlowNode,
  condition: CustomFlowNode,
  funnel: CustomFlowNode,
  stop: CustomFlowNode,
  update: CustomFlowNode,
  mark: CustomFlowNode,
  webhook: CustomFlowNode,
  slack: CustomFlowNode,
  schedule: CustomFlowNode,
};

let nodeCounter = 0;
function generateNodeId(): string {
  return `node_${Date.now()}_${nodeCounter++}`;
}

function JourneyCanvasInner() {
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const isConfigPopupOpen = useJourneyStore((s) => s.isConfigPopupOpen);
  const selectedNodeId = useJourneyStore((s) => s.selectedNodeId);
  const loadSampleFlow = useJourneyStore((s) => s.loadSampleFlow);
  const clearCanvas = useJourneyStore((s) => s.clearCanvas);
  const storeNodes = useJourneyStore((s) => s.nodes);
  const storeEdges = useJourneyStore((s) => s.edges);
  const openModal = useAppStore((s) => s.openModal);

  useEffect(() => {
    if (storeNodes.length > 0 && rfNodes.length === 0) {
      const rfN: Node[] = storeNodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: { x: n.x, y: n.y },
        data: { nodeType: n.type, config: n.config, label: n.label },
      }));
      const rfE: Edge[] = storeEdges.map(([from, to], i) => ({
        id: `e_${from}_${to}_${i}`,
        source: from,
        target: to,
        animated: true,
        style: { strokeDasharray: "5 3", stroke: "rgba(59,130,246,0.45)", strokeWidth: 1.5 },
      }));
      setRfNodes(rfN);
      setRfEdges(rfE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeNodes]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData("application/balloads-crm-node") as FlowNodeType;
      if (!nodeType || !reactFlowWrapper.current || !rfInstance) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = rfInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newId = generateNodeId();
      const newNode: Node = {
        id: newId,
        type: nodeType,
        position,
        data: {
          nodeType,
          config: { type: nodeType },
          label: "Click to configure",
        },
      };

      setRfNodes((prev) => [...prev, newNode]);

      useJourneyStore.getState().addNode({
        id: newId,
        type: nodeType,
        x: position.x,
        y: position.y,
        config: { type: nodeType },
        label: "Click to configure",
      });
    },
    [rfInstance, setRfNodes],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setRfEdges((prev) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { strokeDasharray: "5 3", stroke: "rgba(59,130,246,0.5)" },
          },
          prev,
        ),
      );
      if (connection.source && connection.target) {
        useJourneyStore.getState().addEdge([connection.source, connection.target]);
      }
    },
    [setRfEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleLoadSample = () => {
    clearCanvas();
    setRfNodes([]);
    setRfEdges([]);
    loadSampleFlow();
  };

  const handleClear = () => {
    clearCanvas();
    setRfNodes([]);
    setRfEdges([]);
  };

  return (
    <div className="flex h-[calc(100vh-0px)]" style={{ background: "var(--crm-bg)" }}>
      <PalettePanel />

      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setRfInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.3}
          maxZoom={1.5}
          defaultEdgeOptions={{
            animated: true,
            style: { strokeDasharray: "5 3", stroke: "rgba(59,130,246,0.45)", strokeWidth: 1.5 },
          }}
        >
          <Background color="rgba(255,255,255,0.05)" variant={BackgroundVariant.Dots} gap={26} size={1} />
          <Controls />
          <MiniMap nodeColor="#3B82F6" maskColor="rgba(0,0,0,0.4)" />
        </ReactFlow>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-xl px-4 py-2 z-10" style={{ background: "var(--crm-panel)", border: "1px solid var(--crm-panel-border)" }}>
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleLoadSample}
            className="px-3 py-1.5 text-xs bg-white/5 text-slate-300 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            Load sample
          </button>
          <button
            onClick={() => openModal({ id: "journey" })}
            className="px-4 py-1.5 text-xs rounded-full font-medium transition-all hover:brightness-110"
            style={{ background: "var(--brand-color-3)", color: "white" }}
          >
            Save journey
          </button>
        </div>

        {rfNodes.length > 0 && (
          <div className="absolute top-4 right-4 rounded-xl px-4 py-3 text-xs z-10" style={{ background: "var(--crm-panel)", border: "1px solid var(--crm-panel-border)" }}>
            <div className="flex justify-between gap-4 mb-1">
              <span className="text-slate-400">Nodes</span>
              <span className="font-semibold text-white">{rfNodes.length}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Connections</span>
              <span className="font-semibold text-white">{rfEdges.length}</span>
            </div>
          </div>
        )}
      </div>

      {isConfigPopupOpen && selectedNodeId && <NodeConfigPopup nodeId={selectedNodeId} />}
    </div>
  );
}

export function JourneyCanvas() {
  return (
    <ReactFlowProvider>
      <JourneyCanvasInner />
    </ReactFlowProvider>
  );
}
