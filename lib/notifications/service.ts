import { adminBackendFetch } from "@/lib/serverBackendApi";
import { sendPushToTopic } from "@/lib/firebase/admin";
import {
  buildNotificationFromEvent,
  shouldDispatchPushForSeverity,
  shouldSkipDueToCooldown,
  type NotificationEventType,
  type NotificationSeverity,
} from "@/lib/notifications/catalog";

export type CreateNotificationInput = {
  title: string;
  message: string;
  type: string;
  category: string;
  severity: NotificationSeverity;
  link?: string;
  entityType?: string;
  entityId?: string;
  dedupeKey?: string;
  cooldownSeconds?: number;
  targetRoles?: string[];
  metadata?: Record<string, unknown>;
  source?: string;
};

export async function createNotification(input: CreateNotificationInput) {
  if (input.dedupeKey && input.cooldownSeconds) {
    // Backward-compatible local cooldown check using backend list endpoint.
    const checkRes = await adminBackendFetch(`Backoffice/notifications?limit=50`);
    if (checkRes.ok) {
      const existing = (await checkRes.json()) as Array<{
        dedupeKey?: string | null;
        createdAt?: string;
      }>;
      const latest = existing.find((x) => x.dedupeKey === input.dedupeKey);
      const latestCreatedAt = latest?.createdAt ? new Date(latest.createdAt) : null;
      if (shouldSkipDueToCooldown(latestCreatedAt, input.cooldownSeconds)) {
        return { skipped: true as const, reason: "cooldown" as const };
      }
    }
  }

  const createRes = await adminBackendFetch("Backoffice/notifications", {
    method: "POST",
    body: JSON.stringify({
      title: input.title,
      message: input.message,
      type: input.type,
      category: input.category,
      severity: input.severity,
      link: input.link,
      entityType: input.entityType,
      entityId: input.entityId,
      dedupeKey: input.dedupeKey,
      cooldownSeconds: input.cooldownSeconds,
      targetRoles: input.targetRoles ?? [],
      metadataJson: JSON.stringify(input.metadata ?? {}),
      source: input.source,
    }),
  });
  if (!createRes.ok) {
    throw new Error(`Failed to persist notification: ${createRes.status}`);
  }
  const inserted = (await createRes.json()) as {
    id: number | string;
    createdAt?: string;
  };
  const created = {
    id: String(inserted?.id ?? ""),
    title: input.title,
    message: input.message,
    type: input.type,
    category: input.category,
    severity: input.severity,
    read: false,
    link: input.link ?? null,
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
    dedupeKey: input.dedupeKey ?? null,
    cooldownSeconds: input.cooldownSeconds ?? null,
    targetRoles: input.targetRoles ?? [],
    metadata: input.metadata ?? null,
    source: input.source ?? null,
    createdAt: inserted?.createdAt ? new Date(inserted.createdAt) : new Date(),
  };

  if (shouldDispatchPushForSeverity(input.severity)) {
    try {
      await sendPushToTopic({
        title: input.title,
        body: input.message,
        link: input.link,
      });
    } catch (error) {
      console.warn("Failed to dispatch push notification", error);
    }
  }

  return { skipped: false as const, notification: created };
}

export async function createNotificationFromEvent(
  eventType: NotificationEventType,
  payload: Record<string, string | number | boolean | null | undefined>,
  options?: { source?: string },
) {
  const template = buildNotificationFromEvent(eventType, payload);
  return createNotification({
    title: template.title,
    message: template.message,
    type: template.type,
    category: template.category,
    severity: template.severity,
    link: template.link,
    entityType: template.entityType,
    entityId: template.entityId,
    dedupeKey: template.dedupeKey,
    cooldownSeconds: template.cooldownSeconds,
    targetRoles: template.targetRoles,
    metadata: template.metadata,
    source: options?.source ?? "backoffice",
  });
}
