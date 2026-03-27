import {
  buildReliabilityNotificationPayload,
  type ReliabilityAlert,
} from "@/lib/adminApi";

export type NotificationRecordInput = {
  title: string;
  message: string;
  type: string;
  category: string;
  severity: "info" | "warning" | "high" | "critical";
  read: boolean;
  link: string;
  dedupeKey: string;
  cooldownSeconds: number;
  targetRoles: string[];
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  source: string;
};

export function dedupeReliabilityAlerts(alerts: ReliabilityAlert[]): ReliabilityAlert[] {
  const byKey = new Map<string, ReliabilityAlert>();
  for (const alert of alerts) {
    const existing = byKey.get(alert.alertKey);
    if (!existing || alert.observedAt >= existing.observedAt) {
      byKey.set(alert.alertKey, alert);
    }
  }
  return [...byKey.values()];
}

export function toNotificationRecordInput(alert: ReliabilityAlert): NotificationRecordInput {
  const payload = buildReliabilityNotificationPayload(alert);
  return {
    title: payload.title,
    message: payload.message,
    type: payload.type,
    category: "operations",
    severity: payload.severity === "critical" ? "critical" : payload.severity === "high" ? "high" : "warning",
    read: false,
    link: `${payload.link}?alert=${encodeURIComponent(alert.alertKey)}`,
    dedupeKey: payload.dedupeKey,
    cooldownSeconds: 900,
    targetRoles: ["admin", "super_admin", "operations"],
    entityType: "reliability_alert",
    entityId: alert.alertKey,
    metadata: payload.metadata,
    source: "reliability-ingestion",
  };
}
