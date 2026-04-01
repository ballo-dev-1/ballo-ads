/**
 * Server-only: call ballo-ads-backend internal MTN review routes.
 *
 * Production: set MTN_REVIEW_BACKEND_SECRET (must match backend
 * MtnReview:BackendSharedSecret). BACKEND_BASE_URL is recommended; if omitted,
 * it falls back to NEXT_PUBLIC_PROD_API_URL (or https://api.balloads.com).
 *
 * Local next dev: if both are unset, defaults target the deployed dev API
 * (same base as lib/adminApi.ts DEV_API_BASE: NEXT_PUBLIC_DEV_API_URL or
 * https://dev-api.balloads.com) plus the usual local dev shared secret.
 *
 * Dev resiliency: when using implicit dev defaults and the dev API responds 404
 * for an internal MTN route, requests auto-retry against local API
 * http://localhost:5238 before failing.
 *
 * If you set either variable explicitly, you must set both (no mixed defaults).
 */

const SECRET_HEADER = "X-Ballo-Mtn-Review-Backend-Secret";

function normalizeBase(url?: string): string {
  return (url || "").trim().replace(/\/+$/, "");
}

/** Aligned with lib/adminApi.ts DEV_API_BASE (deployed dev API). */
function defaultDevBackendBase(): string {
  return normalizeBase(process.env.NEXT_PUBLIC_DEV_API_URL || "https://dev-api.balloads.com");
}

/** Production default aligns with admin API prod base. */
function defaultProdBackendBase(): string {
  return normalizeBase(process.env.NEXT_PUBLIC_PROD_API_URL || "https://api.balloads.com");
}

function defaultBackendBaseForRuntime(): string {
  if (process.env.NODE_ENV === "production") {
    return defaultProdBackendBase();
  }
  return defaultDevBackendBase();
}

/** Typical local + dev-droplet value; must match MtnReview:BackendSharedSecret on that API. */
const DEFAULT_DEV_MTN_SECRET = "local-dev-mtn-review-backend-secret";

function resolvedBackendConfig(): {
  base: string;
  secret: string;
  usedImplicitDevDefaults: boolean;
} {
  const baseEnv = process.env.BACKEND_BASE_URL?.trim();
  const secretEnv = process.env.MTN_REVIEW_BACKEND_SECRET?.trim();

  if (baseEnv || secretEnv) {
    const base = normalizeBase(baseEnv || defaultBackendBaseForRuntime());
    const secret = secretEnv || (process.env.NODE_ENV === "development" ? DEFAULT_DEV_MTN_SECRET : "");
    return {
      base,
      secret,
      usedImplicitDevDefaults: process.env.NODE_ENV === "development" && !baseEnv && !secretEnv,
    };
  }

  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
    return {
      base: defaultBackendBaseForRuntime(),
      secret: process.env.NODE_ENV === "development" ? DEFAULT_DEV_MTN_SECRET : "",
      usedImplicitDevDefaults: process.env.NODE_ENV === "development",
    };
  }

  return { base: "", secret: "", usedImplicitDevDefaults: false };
}

export function isMtnReviewBackendConfigured(): boolean {
  const { base, secret } = resolvedBackendConfig();
  return Boolean(base && secret);
}

function internalBase(): {
  base: string;
  secret: string;
  usedImplicitDevDefaults: boolean;
} {
  const { base, secret, usedImplicitDevDefaults } = resolvedBackendConfig();
  if (!base || !secret) {
    throw new Error(
      "MTN review backend not configured: set MTN_REVIEW_BACKEND_SECRET (and optionally BACKEND_BASE_URL)",
    );
  }
  return { base, secret, usedImplicitDevDefaults };
}

export async function mtnReviewBackendRequest(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const { base, secret, usedImplicitDevDefaults } = internalBase();
  const url = `${base}/internal/mtn-review${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init?.headers);
  headers.set(SECRET_HEADER, secret);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const primary = await fetch(url, { ...init, headers });
  if (
    primary.status !== 404 ||
    !usedImplicitDevDefaults ||
    process.env.NODE_ENV !== "development" ||
    base.startsWith("http://localhost:5238") ||
    base.startsWith("https://localhost:5238")
  ) {
    return primary;
  }

  try {
    const localUrl = `http://localhost:5238/internal/mtn-review${path.startsWith("/") ? path : `/${path}`}`;
    return await fetch(localUrl, { ...init, headers });
  } catch {
    return primary;
  }
}
