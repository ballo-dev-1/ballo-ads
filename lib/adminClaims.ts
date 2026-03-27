import { cookies } from "next/headers";
import { ADMIN_TOKEN_COOKIE } from "@/lib/adminAuth";

type TokenPayload = {
  roles?: string[] | string;
  role?: string[] | string;
  Role?: string[] | string;
  Roles?: string[] | string;
  [key: string]: unknown;
};

function decodeJwtPayload(token: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(decoded) as TokenPayload;
  } catch {
    return null;
  }
}

function normalizeRoles(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((x) => String(x).toLowerCase());
  if (typeof value === "string" && value.trim().length > 0) return [value.toLowerCase()];
  return [];
}

export async function getCurrentAdminRoles(): Promise<string[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) return [];

  const payload = decodeJwtPayload(token);
  if (!payload) return [];

  const roles = [
    ...normalizeRoles(payload.roles),
    ...normalizeRoles(payload.role),
    ...normalizeRoles(payload.Role),
    ...normalizeRoles(payload.Roles),
  ];

  return [...new Set(roles)];
}
