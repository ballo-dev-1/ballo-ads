import { DEV_API_BASE, PROD_API_BASE, STAGING_API_BASE } from "@/lib/adminApi";

const LOCAL_BASES = ["http://localhost:5238", "http://127.0.0.1:5238"] as const;

export const ALLOWED_PROXY_BASES = [
  DEV_API_BASE.replace(/\/+$/, ""),
  STAGING_API_BASE.replace(/\/+$/, ""),
  PROD_API_BASE.replace(/\/+$/, ""),
  ...LOCAL_BASES,
];

export function isLocalProxyBase(base: string): boolean {
  return LOCAL_BASES.includes(base as (typeof LOCAL_BASES)[number]);
}

type ResolveProxyBaseInput = {
  baseFromHeader: string | null | undefined;
  baseFromEnvCookie: string | null | undefined;
  allowLocalBackendProxy: boolean;
};

type ResolveProxyBaseResult =
  | { ok: true; baseUrl: string }
  | { ok: false };

/**
 * Resolve and sanitize backend proxy target.
 * Local API targets are rewritten to deployed APIs unless explicitly allowed.
 */
export function resolveProxyBaseUrl(
  input: ResolveProxyBaseInput,
): ResolveProxyBaseResult {
  const baseFromHeader = (input.baseFromHeader ?? "").trim().replace(/\/+$/, "");
  const baseFromEnvCookie = (input.baseFromEnvCookie ?? "").trim().replace(/\/+$/, "");
  const requestedBase = baseFromHeader || baseFromEnvCookie;

  if (!requestedBase || !ALLOWED_PROXY_BASES.includes(requestedBase)) {
    return { ok: false };
  }

  if (!isLocalProxyBase(requestedBase) || input.allowLocalBackendProxy) {
    return { ok: true, baseUrl: requestedBase };
  }

  if (baseFromEnvCookie && !isLocalProxyBase(baseFromEnvCookie)) {
    return { ok: true, baseUrl: baseFromEnvCookie };
  }

  return { ok: true, baseUrl: PROD_API_BASE.replace(/\/+$/, "") };
}
