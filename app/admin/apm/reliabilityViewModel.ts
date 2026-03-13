import type { ApmAlertsResponse, DispatchControlResponse } from "@/lib/adminApi";

export type EmergencyControlMatrix = {
  environment: string;
  global: {
    isPaused: boolean;
    updatedAt: string;
  };
  channels: Array<{
    channel: string;
    isPaused: boolean;
  }>;
};

export type ReliabilityAlertSummary = {
  openCount: number;
  headlineSeverity: "critical" | "high" | "medium" | "warning" | "ok";
  topAlerts: ApmAlertsResponse["alerts"];
};

const severityRank: Record<ReliabilityAlertSummary["headlineSeverity"], number> = {
  critical: 5,
  high: 4,
  medium: 3,
  warning: 2,
  ok: 1,
};

export function buildEmergencyControlMatrix(
  state: DispatchControlResponse,
): EmergencyControlMatrix {
  return {
    environment: state.environment,
    global: {
      isPaused: state.isGloballyPaused,
      updatedAt: state.updatedAt,
    },
    channels: [...state.channels].sort((a, b) =>
      a.channel.localeCompare(b.channel),
    ),
  };
}

export function summarizeReliabilityAlerts(
  data: ApmAlertsResponse,
): ReliabilityAlertSummary {
  const topAlerts = [...data.alerts].sort((a, b) => {
    const severityDelta = severityRank[b.severity] - severityRank[a.severity];
    if (severityDelta !== 0) return severityDelta;
    return b.observedAt.localeCompare(a.observedAt);
  });

  const headlineSeverity =
    topAlerts.length > 0 ? topAlerts[0].severity : "ok";

  return {
    openCount: data.counters.open,
    headlineSeverity,
    topAlerts: topAlerts.slice(0, 5),
  };
}

export function applyChannelPauseToggle(
  state: DispatchControlResponse,
  channel: string,
  isPaused: boolean,
): DispatchControlResponse {
  return {
    ...state,
    channels: state.channels.map((item) =>
      item.channel === channel ? { ...item, isPaused } : item,
    ),
  };
}
