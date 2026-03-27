export const DEFAULT_BACKOFFICE_TOPIC = "backoffice-admins";

export function normalizeTopicName(input?: string | null, fallback = DEFAULT_BACKOFFICE_TOPIC): string {
  const sanitized = (input ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_.~%]+/g, "");

  return sanitized.length > 0 ? sanitized : fallback;
}
