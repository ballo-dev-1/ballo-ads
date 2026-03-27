export type NotificationSeverity = "info" | "warning" | "high" | "critical";
export type NotificationCategory =
  | "moderation"
  | "finance"
  | "operations"
  | "security"
  | "campaigns"
  | "compliance";

export type NotificationEventType =
  | "campaign_approval_request"
  | "campaign_approval_decision"
  | "campaign_activated"
  | "campaign_cancelled"
  | "sender_id_approval_request"
  | "sender_id_approval_decision"
  | "low_balance_alert"
  | "purchase_order_failed"
  | "purchase_order_expiring"
  | "purchase_order_expired"
  | "api_key_rotated"
  | "api_key_revoked"
  | "manual_credit_allocation"
  | "dispatch_control_changed"
  | "scheduler_job_control_changed"
  | "backoffice_user_created"
  | "backoffice_user_roles_changed"
  | "backoffice_role_permissions_changed"
  | "reliability_alert";

export type NotificationTemplate = {
  type: NotificationEventType;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  message: string;
  link?: string;
  dedupeKey?: string;
  cooldownSeconds?: number;
  targetRoles: string[];
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

type EventPayload = Record<string, string | number | boolean | null | undefined>;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function buildNotificationFromEvent(
  type: NotificationEventType,
  payload: EventPayload = {},
): NotificationTemplate {
  const companyId = asNumber(payload.companyId);
  const campaignId = asNumber(payload.campaignId);
  const senderId = asString(payload.senderId, "Sender ID");
  const companyName = asString(payload.companyName, "Company");
  const campaignName = asString(payload.campaignName, "Campaign");
  const actorName = asString(payload.actorName, "An admin");
  const status = asString(payload.status, "updated");
  const jobId = asString(payload.jobId, "unknown job");
  const amount = asString(payload.amount, "0");
  const channel = asString(payload.channel, "all");

  switch (type) {
    case "campaign_approval_request":
      return {
        type,
        category: "moderation",
        severity: "high",
        title: "Campaign approval required",
        message: `${companyName}: "${campaignName}" is pending moderation approval.`,
        link: `/admin/companies/${companyId}/campaigns/${campaignId}`,
        dedupeKey: `campaign-approval-request:${campaignId}`,
        cooldownSeconds: 900,
        targetRoles: ["admin", "super_admin"],
        entityType: "campaign",
        entityId: String(campaignId),
      };
    case "campaign_approval_decision":
      return {
        type,
        category: "moderation",
        severity: status === "rejected" ? "high" : "info",
        title: `Campaign ${status}`,
        message: `${actorName} ${status} "${campaignName}" for ${companyName}.`,
        link: `/admin/companies/${companyId}/campaigns/${campaignId}`,
        dedupeKey: `campaign-approval-decision:${campaignId}:${status}`,
        targetRoles: ["admin", "super_admin", "operations"],
        entityType: "campaign",
        entityId: String(campaignId),
      };
    case "campaign_activated":
    case "campaign_cancelled":
      return {
        type,
        category: "campaigns",
        severity: type === "campaign_cancelled" ? "warning" : "info",
        title: type === "campaign_cancelled" ? "Campaign cancelled" : "Campaign activated",
        message: `"${campaignName}" for ${companyName} was ${type === "campaign_cancelled" ? "cancelled" : "activated"}.`,
        link: `/admin/companies/${companyId}/campaigns/${campaignId}`,
        dedupeKey: `${type}:${campaignId}`,
        targetRoles: ["admin", "super_admin", "operations"],
        entityType: "campaign",
        entityId: String(campaignId),
      };
    case "sender_id_approval_request":
      return {
        type,
        category: "moderation",
        severity: "high",
        title: "Sender ID approval required",
        message: `${companyName} sender ID "${senderId}" requires approval.`,
        link: `/admin/companies/${companyId}`,
        dedupeKey: `sender-id-approval-request:${companyId}:${senderId}`,
        cooldownSeconds: 1800,
        targetRoles: ["admin", "super_admin"],
        entityType: "sender_id",
        entityId: senderId,
      };
    case "sender_id_approval_decision":
      return {
        type,
        category: "moderation",
        severity: status === "rejected" ? "high" : "info",
        title: `Sender ID ${status}`,
        message: `${actorName} ${status} sender ID "${senderId}" for ${companyName}.`,
        link: `/admin/companies/${companyId}`,
        dedupeKey: `sender-id-approval-decision:${companyId}:${senderId}:${status}`,
        targetRoles: ["admin", "super_admin", "operations"],
        entityType: "sender_id",
        entityId: senderId,
      };
    case "low_balance_alert":
      return {
        type,
        category: "finance",
        severity: "warning",
        title: "Low credit balance",
        message: `${companyName} has low ${channel.toUpperCase()} balance.`,
        link: `/admin/purchase-orders`,
        dedupeKey: `low-balance:${companyId}:${channel}`,
        cooldownSeconds: 3600,
        targetRoles: ["admin", "super_admin", "finance"],
      };
    case "purchase_order_failed":
      return {
        type,
        category: "finance",
        severity: "critical",
        title: "Purchase order payment failed",
        message: `Payment failed for ${companyName}. Amount: ${amount}.`,
        link: `/admin/purchase-orders`,
        dedupeKey: `purchase-order-failed:${companyId}:${amount}`,
        cooldownSeconds: 600,
        targetRoles: ["admin", "super_admin", "finance"],
      };
    case "purchase_order_expiring":
    case "purchase_order_expired":
      return {
        type,
        category: "finance",
        severity: type === "purchase_order_expired" ? "warning" : "info",
        title: type === "purchase_order_expired" ? "Purchase order expired" : "Purchase order expiring",
        message: `${companyName} has a purchase order ${type === "purchase_order_expired" ? "expired" : "expiring soon"}.`,
        link: `/admin/purchase-orders`,
        dedupeKey: `${type}:${companyId}`,
        cooldownSeconds: 3600,
        targetRoles: ["admin", "super_admin", "finance"],
      };
    case "api_key_rotated":
    case "api_key_revoked":
      return {
        type,
        category: "security",
        severity: "warning",
        title: type === "api_key_rotated" ? "API key rotated" : "API key revoked",
        message: `${companyName} API key was ${type === "api_key_rotated" ? "rotated" : "revoked"} by ${actorName}.`,
        link: `/admin/api-management`,
        dedupeKey: `${type}:${companyId}`,
        targetRoles: ["admin", "super_admin", "security"],
      };
    case "manual_credit_allocation":
      return {
        type,
        category: "finance",
        severity: "info",
        title: "Manual credit allocation",
        message: `${actorName} allocated manual credits to ${companyName}.`,
        link: `/admin/api-management`,
        dedupeKey: `${type}:${companyId}:${amount}`,
        targetRoles: ["admin", "super_admin", "finance"],
      };
    case "dispatch_control_changed":
      return {
        type,
        category: "operations",
        severity: "critical",
        title: "Dispatch control changed",
        message: `${actorName} changed dispatch control for ${channel}.`,
        link: `/admin/apm`,
        dedupeKey: `${type}:${channel}:${status}`,
        targetRoles: ["admin", "super_admin", "operations"],
      };
    case "scheduler_job_control_changed":
      return {
        type,
        category: "operations",
        severity: "high",
        title: "Scheduler job control changed",
        message: `${actorName} set ${jobId} to ${status}.`,
        link: `/admin/apm`,
        dedupeKey: `${type}:${jobId}:${status}`,
        targetRoles: ["admin", "super_admin", "operations"],
      };
    case "backoffice_user_created":
      return {
        type,
        category: "security",
        severity: "high",
        title: "Backoffice user created",
        message: `${actorName} created a backoffice user account.`,
        link: `/admin/backoffice-users`,
        dedupeKey: `${type}:${asString(payload.email, "unknown")}`,
        targetRoles: ["super_admin"],
      };
    case "backoffice_user_roles_changed":
    case "backoffice_role_permissions_changed":
      return {
        type,
        category: "security",
        severity: "high",
        title: type === "backoffice_user_roles_changed" ? "Backoffice user roles changed" : "Role permissions changed",
        message: `${actorName} updated access control settings.`,
        link: `/admin/backoffice-users`,
        dedupeKey: `${type}:${asString(payload.subjectId, "unknown")}:${status}`,
        targetRoles: ["super_admin"],
      };
    case "reliability_alert":
      return {
        type,
        category: "operations",
        severity: "critical",
        title: asString(payload.title, "Reliability alert"),
        message: asString(payload.message, "A reliability incident requires attention."),
        link: asString(payload.link, "/admin/apm"),
        dedupeKey: asString(payload.dedupeKey, `reliability:${asString(payload.alertKey, "unknown")}`),
        cooldownSeconds: 900,
        targetRoles: ["admin", "super_admin", "operations"],
      };
    default:
      return {
        type: "reliability_alert",
        category: "operations",
        severity: "warning",
        title: "Notification",
        message: "An event occurred.",
        targetRoles: ["admin", "super_admin"],
      };
  }
}

export function shouldDispatchPushForSeverity(severity: NotificationSeverity): boolean {
  return severity === "critical" || severity === "high";
}

export function shouldSkipDueToCooldown(
  existingCreatedAt: Date | null,
  cooldownSeconds?: number | null,
  now = new Date(),
): boolean {
  if (!existingCreatedAt || !cooldownSeconds || cooldownSeconds <= 0) return false;
  return now.getTime() - existingCreatedAt.getTime() < cooldownSeconds * 1000;
}
