import { cookies } from "next/headers";

export const ADMIN_TOKEN_COOKIE = "admin-token";
export const ADMIN_REFRESH_TOKEN_COOKIE = "admin-refresh-token";
export const ADMIN_ENV_COOKIE = "admin-env";

/** Middleware gate cookie — must be set alongside JWT cookies after login (see `/api/admin/login`). */
export const ADMIN_GATE_COOKIE = "admin-auth";
export const ADMIN_GATE_VALUE = "authenticated";

type JwtPayload = {
  exp?: number;
  nbf?: number;
  [key: string]: unknown;
};

function decodeBase64Url(input: string): string | null {
  try {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    if (typeof atob === "function") {
      return atob(padded);
    }
    return Buffer.from(padded, "base64").toString("utf8");
  } catch {
    return null;
  }
}

/**
 * Quick local JWT sanity check for middleware/routes:
 * - invalid structure => invalid token
 * - expired token (`exp`) => invalid token
 * - not-yet-valid token (`nbf`) => invalid token
 *
 * If `exp` is missing, we treat it as active and let backend enforce validity.
 */
export function isAdminTokenActive(token: string): boolean {
  const parts = token.split(".");
  if (parts.length < 2) return false;

  const payloadText = decodeBase64Url(parts[1]);
  if (!payloadText) return false;

  let payload: JwtPayload;
  try {
    payload = JSON.parse(payloadText) as JwtPayload;
  } catch {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = typeof payload.exp === "number" ? payload.exp : null;
  const nbf = typeof payload.nbf === "number" ? payload.nbf : null;

  if (nbf !== null && now < nbf) return false;
  if (exp !== null && now >= exp) return false;
  return true;
}

/**
 * Require admin auth from cookie. Use in API route handlers.
 * Returns null if authenticated; otherwise returns a Response to return (401).
 */
export async function requireAdminAuth(): Promise<Response | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;

  if (token && isAdminTokenActive(token)) {
    return null;
  }

  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
