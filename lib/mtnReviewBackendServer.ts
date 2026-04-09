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

function normalizeHost(rawHost: string | null | undefined): string | null {
  if (!rawHost) return null;
  // Some proxies may pass a comma-separated list; only the first host matters.
  const firstHost = rawHost.split(",")[0]?.trim().toLowerCase();
  if (!firstHost) return null;
  return firstHost.replace(/:\d+$/, "");
}

export type MtnReviewEnv = "dev" | "staging" | "prod";

function inferMtnReviewEnvFromHost(
  host: string | null | undefined,
): MtnReviewEnv | null {
  const normalizedHost = normalizeHost(host);

  if (
    normalizedHost === "dev.balloads.com" ||
    normalizedHost === "dev.localhost"
  ) {
    return "dev";
  }
  if (
    normalizedHost === "staging.balloads.com" ||
    normalizedHost === "staging.localhost"
  ) {
    return "staging";
  }
  if (
    normalizedHost === "balloads.com" ||
    normalizedHost === "www.balloads.com" ||
    normalizedHost?.endsWith(".balloads.com")
  ) {
    return "prod";
  }
  return null;
}

function devSiteApiBaseFromBase(base: string): string | null {
  try {
    const u = new URL(base);
    if (u.hostname !== "dev-api.balloads.com") return null;
    return "https://dev.balloads.com/api";
  } catch {
    return null;
  }
}

function devApiBaseFromDevSiteBase(base: string): string | null {
  try {
    const u = new URL(base);
    if (u.hostname !== "dev.balloads.com") return null;
    if (!u.pathname.startsWith("/api")) return null;
    return "https://dev-api.balloads.com";
  } catch {
    return null;
  }
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

function baseForEnv(env: MtnReviewEnv): string {
  if (env === "dev") return defaultDevBackendBase();
  if (env === "staging")
    return normalizeBase(
      process.env.NEXT_PUBLIC_STAGING_API_URL || "https://staging-api.balloads.com",
    );
  return defaultProdBackendBase();
}

function secretForEnv(env: MtnReviewEnv): string {
  const envSecret =
    env === "dev"
      ? process.env.MTN_REVIEW_BACKEND_SECRET_DEV
      : env === "staging"
        ? process.env.MTN_REVIEW_BACKEND_SECRET_STAGING
        : process.env.MTN_REVIEW_BACKEND_SECRET_PROD;

  // Backwards compatible fallback: if env-specific secrets aren't set,
  // use the generic MTN_REVIEW_BACKEND_SECRET for all envs.
  const genericSecret = process.env.MTN_REVIEW_BACKEND_SECRET;

  const resolved = (envSecret || genericSecret || "").trim();
  if (resolved) return resolved;

  // Preserve legacy implicit dev secret behavior when the env is effectively dev.
  if (env === "dev" && process.env.NODE_ENV === "development") return DEFAULT_DEV_MTN_SECRET;
  return "";
}

function resolvedBackendConfigForHost(host: string | null | undefined): {
  base: string;
  secret: string;
  usedImplicitDevDefaults: boolean;
} {
  const env = inferMtnReviewEnvFromHost(host);
  if (!env) {
    return resolvedBackendConfig();
  }
  return {
    base: baseForEnv(env),
    secret: secretForEnv(env),
    usedImplicitDevDefaults: false,
  };
}

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

export function isMtnReviewBackendConfigured(host?: string | null): boolean {
  const config = host ? resolvedBackendConfigForHost(host) : resolvedBackendConfig();
  const { base, secret } = config;
  return Boolean(base && secret);
}

function internalBase(host?: string | null): {
  base: string;
  secret: string;
  usedImplicitDevDefaults: boolean;
} {
  const { base, secret, usedImplicitDevDefaults } = host
    ? resolvedBackendConfigForHost(host)
    : resolvedBackendConfig();
  if (!base || !secret) {
    throw new Error(
      "MTN review backend not configured: set MTN_REVIEW_BACKEND_SECRET (and optionally BACKEND_BASE_URL) or per-env MTN_REVIEW_BACKEND_SECRET_* variables",
    );
  }
  return { base, secret, usedImplicitDevDefaults };
}

export async function mtnReviewBackendRequest(
  path: string,
  init?: RequestInit,
  opts?: { host?: string | null },
): Promise<Response> {
  const forwardedHost = opts?.host ?? null;
  const { base, secret, usedImplicitDevDefaults } = internalBase(forwardedHost);
  const inferredEnv = inferMtnReviewEnvFromHost(forwardedHost);
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
    if (inferredEnv !== "dev") return primary;

    const fallbackBases = [devSiteApiBaseFromBase(base), devApiBaseFromDevSiteBase(base)]
      .filter((candidate): candidate is string => Boolean(candidate));

    for (const fallbackBase of fallbackBases) {
      try {
        const fallbackUrl = `${fallbackBase}/internal/mtn-review${path.startsWith("/") ? path : `/${path}`}`;
        return await fetch(fallbackUrl, { ...init, headers });
      } catch {
        // try next candidate
      }
    }
    return primary;
  }

  try {
    const localUrl = `http://localhost:5238/internal/mtn-review${path.startsWith("/") ? path : `/${path}`}`;
    return await fetch(localUrl, { ...init, headers });
  } catch {
    return primary;
  }
}

export function mtnReviewBackendConfigForHost(host?: string | null): {
  env: MtnReviewEnv;
  base: string;
  secret: string;
  usedImplicitDevDefaults: boolean;
} {
  const inferred = inferMtnReviewEnvFromHost(host);
  const env = inferred || (process.env.NODE_ENV === "production" ? "prod" : "dev");
  const config = resolvedBackendConfigForHost(host);
  return { env, ...config };
}
