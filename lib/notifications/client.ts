import type { NotificationEventType } from "@/lib/notifications/catalog";

export async function notifyBackofficeEvent(
  eventType: NotificationEventType,
  payload: Record<string, string | number | boolean | null | undefined>,
): Promise<void> {
  try {
    await fetch("/api/admin/notifications", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType, payload }),
    });
  } catch {
    // Notification ingestion should never block user workflows.
  }
}
