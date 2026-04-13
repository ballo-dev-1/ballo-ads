import type { CompanyLeanResponse } from "@/lib/adminApi";

export type SortKey =
  | "createdAt"
  | "updatedAt"
  | "name"
  | "email"
  | "industry"
  | "verified"
  | "lifecycle"
  | "senderId";

export type SortDir = "asc" | "desc";

export type SortableCompany = Pick<
  CompanyLeanResponse,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "name"
  | "email"
  | "industry"
  | "isCompanyVerified"
  | "isActive"
  | "senderId"
>;

export function toComparableTimestamp(value?: string): number {
  if (!value) return Number.NEGATIVE_INFINITY;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
}

export function defaultSortDirForKey(key: SortKey): SortDir {
  if (key === "createdAt" || key === "updatedAt") return "desc";
  return "asc";
}

/** Raw ascending comparison (before applying sortDir). */
export function compareCompaniesAsc(
  a: SortableCompany,
  b: SortableCompany,
  sortBy: SortKey,
): number {
  let cmp = 0;
  switch (sortBy) {
    case "createdAt":
      cmp = toComparableTimestamp(a.createdAt) - toComparableTimestamp(b.createdAt);
      break;
    case "updatedAt":
      cmp = toComparableTimestamp(a.updatedAt) - toComparableTimestamp(b.updatedAt);
      break;
    case "name":
      cmp = (a.name || "").localeCompare(b.name || "");
      break;
    case "email":
      cmp = (a.email || "").localeCompare(b.email || "");
      break;
    case "industry":
      cmp = (a.industry || "").localeCompare(b.industry || "");
      break;
    case "verified":
      cmp = Number(a.isCompanyVerified) - Number(b.isCompanyVerified);
      break;
    case "lifecycle":
      cmp = Number(a.isActive) - Number(b.isActive);
      break;
    case "senderId":
      cmp = (a.senderId || "").localeCompare(b.senderId || "");
      break;
  }
  // When the primary field ties for every row (e.g. all same lifecycle), cmp stays 0 for
  // both asc and desc — the list never moves but the arrow still toggles. Always break
  // ties by id so direction changes are visible whenever ids differ.
  if (cmp === 0) cmp = a.id - b.id;
  return cmp;
}

export function compareCompanies(
  a: SortableCompany,
  b: SortableCompany,
  sortBy: SortKey,
  sortDir: SortDir,
): number {
  const cmp = compareCompaniesAsc(a, b, sortBy);
  return sortDir === "asc" ? cmp : -cmp;
}
