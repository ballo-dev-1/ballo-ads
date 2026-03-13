import type { ApmAlertsResponse, DispatchControlResponse, ReliabilityAlertSeverity } from "@/lib/adminApi";

export type DashboardReliabilitySummary = {
  activeAlertsCount: number;
  pausedChannelsCount: number;
  latestIncidentSeverity: ReliabilityAlertSeverity | "ok";
  latestIncidentAt: string;
};

const severityRank: Record<ReliabilityAlertSeverity | "ok", number> = {
  critical: 5,
  high: 4,
  medium: 3,
  warning: 2,
  ok: 1,
};

export function buildDashboardReliabilitySummary(
  alerts: ApmAlertsResponse | null,
  controls: DispatchControlResponse | null,
): DashboardReliabilitySummary {
  const latestAlert = alerts?.alerts
    ? [...alerts.alerts].sort((a, b) => {
        const rankDelta = severityRank[b.severity] - severityRank[a.severity];
        if (rankDelta !== 0) return rankDelta;
        return b.observedAt.localeCompare(a.observedAt);
      })[0]
    : undefined;

  return {
    activeAlertsCount: alerts?.counters.open ?? 0,
    pausedChannelsCount: controls?.channels.filter((item) => item.isPaused).length ?? 0,
    latestIncidentSeverity: latestAlert?.severity ?? "ok",
    latestIncidentAt: latestAlert?.observedAt ?? "",
  };
}

export function dashboardApmRouteForPathname(pathname: string): string {
  return pathname.startsWith("/dev-admin") ? "/dev-admin/apm" : "/admin/apm";
}
