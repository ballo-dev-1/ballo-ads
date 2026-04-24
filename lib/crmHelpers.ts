import { formatDistanceToNow } from "date-fns";

export function formatRelativeTime(value: string | null | undefined) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function getHealthColor(score: number) {
  if (score >= 70) return "text-emerald-400";
  if (score >= 40) return "text-amber-400";
  return "text-rose-400";
}

export function getHealthTier(score: number) {
  if (score >= 70) return "Healthy";
  if (score >= 40) return "At risk";
  return "Critical";
}
