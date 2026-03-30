/**
 * Server-only: call ballo-ads-backend internal MTN review routes.
 *
 * Production: set BACKEND_BASE_URL and MTN_REVIEW_BACKEND_SECRET (must match
 * backend MtnReview:BackendSharedSecret).
 *
 * Local next dev: if both are unset, defaults target the deployed dev API
 * (same base as lib/adminApi.ts DEV_API_BASE: NEXT_PUBLIC_DEV_API_URL or
 * https://dev-api.balloads.com) plus the usual local dev shared secret. Override
 * BACKEND_BASE_URL to http://localhost:5238 when testing against a local API only.
 * If you set either variable explicitly, you must set both (no mixed defaults).
 */

const SECRET_HEADER = "X-Ballo-Mtn-Review-Backend-Secret";

/** Aligned with lib/adminApi.ts DEV_API_BASE (deployed dev API). */
function defaultDevBackendBase(): string {
  const url = process.env.NEXT_PUBLIC_DEV_API_URL?.trim();
  return (url || "https://dev-api.balloads.com").replace(/\/+$/, "");
}

/** Typical local + dev-droplet value; must match MtnReview:BackendSharedSecret on that API. */
const DEFAULT_DEV_MTN_SECRET = "local-dev-mtn-review-backend-secret";

function resolvedBackendConfig(): { base: string; secret: string } {
  const baseEnv = process.env.BACKEND_BASE_URL?.trim();
  const secretEnv = process.env.MTN_REVIEW_BACKEND_SECRET?.trim();

  if (baseEnv || secretEnv) {
    return {
      base: (baseEnv ?? "").replace(/\/+$/, ""),
      secret: secretEnv ?? "",
    };
  }

  if (process.env.NODE_ENV === "development") {
    return { base: defaultDevBackendBase(), secret: DEFAULT_DEV_MTN_SECRET };
  }

  return { base: "", secret: "" };
}

export function isMtnReviewBackendConfigured(): boolean {
  const { base, secret } = resolvedBackendConfig();
  return Boolean(base && secret);
}

function internalBase(): { base: string; secret: string } {
  const { base, secret } = resolvedBackendConfig();
  if (!base || !secret) {
    throw new Error(
      "BACKEND_BASE_URL and MTN_REVIEW_BACKEND_SECRET must both be set (or omit both in next dev for local defaults)",
    );
  }
  return { base, secret };
}

export async function mtnReviewBackendRequest(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const { base, secret } = internalBase();
  const url = `${base}/internal/mtn-review${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init?.headers);
  headers.set(SECRET_HEADER, secret);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, { ...init, headers });
}
