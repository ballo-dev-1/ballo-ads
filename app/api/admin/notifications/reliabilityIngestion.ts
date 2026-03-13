import {
  buildReliabilityNotificationPayload,
  type ReliabilityAlert,
} from "@/lib/adminApi";

export type NotificationRecordInput = {
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string;
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
    read: false,
    link: `${payload.link}?alert=${encodeURIComponent(alert.alertKey)}`,
  };
}
