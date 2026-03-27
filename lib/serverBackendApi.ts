import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { ADMIN_ENV_COOKIE, ADMIN_TOKEN_COOKIE } from "@/lib/adminAuth";
import { DEV_API_BASE, PROD_API_BASE, STAGING_API_BASE } from "@/lib/adminApi";

function normalizeBase(url: string): string {
  return url.replace(/\/+$/, "");
}

export async function getAdminBackendBaseUrl(): Promise<string> {
  const cookieStore = await cookies();
  const env = cookieStore.get(ADMIN_ENV_COOKIE)?.value;
  if (env === "dev") return normalizeBase(DEV_API_BASE);
  if (env === "staging") return normalizeBase(STAGING_API_BASE);
  return normalizeBase(PROD_API_BASE);
}

export function getPublicBackendBaseUrl(request: NextRequest): string {
  const host = request.headers.get("host")?.toLowerCase() ?? "";
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return normalizeBase(DEV_API_BASE);
  }
  return normalizeBase(PROD_API_BASE);
}

export async function getAdminBearerToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_TOKEN_COOKIE)?.value ?? null;
}

export async function adminBackendFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const base = await getAdminBackendBaseUrl();
  const token = await getAdminBearerToken();
  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const url = `${base}/${path.replace(/^\/+/, "")}`;
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
}
