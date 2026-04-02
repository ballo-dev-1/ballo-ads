import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_ENV_COOKIE,
  ADMIN_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  isAdminTokenActive,
} from "@/lib/adminAuth";
import { DEV_API_BASE, PROD_API_BASE, STAGING_API_BASE } from "@/lib/adminApi";
import { getAdminEnv } from "@/lib/adminNamespace";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const ALLOWED_BASES = [
  DEV_API_BASE.replace(/\/+$/, ""),
  STAGING_API_BASE.replace(/\/+$/, ""),
  PROD_API_BASE.replace(/\/+$/, ""),
  "http://localhost:5238",
  "http://127.0.0.1:5238",
];

function getRequestHost(request: NextRequest): string | null {
  return request.headers.get("x-forwarded-host") ?? request.headers.get("host");
}

function getSessionEnv(request: NextRequest) {
  return getAdminEnv({
    pathname: request.nextUrl.pathname,
    host: getRequestHost(request),
  });
}

function getDefaultApiBaseUrl(request: NextRequest): string {
  const resolvedEnv = getSessionEnv(request);
  if (resolvedEnv === "dev") return DEV_API_BASE;
  if (resolvedEnv === "staging") return STAGING_API_BASE;
  return PROD_API_BASE;
}

/** Only use client-provided apiBase if it matches this admin UI session (avoids prod token + staging cookie mismatch). */
function resolveLoginApiBase(request: NextRequest, apiBaseFromBody: unknown): string {
  const sessionEnv = getSessionEnv(request);
  const defaultBase = getDefaultApiBaseUrl(request).replace(/\/+$/, "");
  const devBase = DEV_API_BASE.replace(/\/+$/, "");
  const stagingBase = STAGING_API_BASE.replace(/\/+$/, "");
  const prodBase = PROD_API_BASE.replace(/\/+$/, "");

  const trimmed =
    typeof apiBaseFromBody === "string" && apiBaseFromBody.trim().length > 0
      ? apiBaseFromBody.trim().replace(/\/+$/, "")
      : null;

  if (!trimmed || !ALLOWED_BASES.includes(trimmed)) {
    return defaultBase;
  }

  const isLocalBackend =
    trimmed === "http://localhost:5238" || trimmed === "http://127.0.0.1:5238";

  if (sessionEnv === "prod" && trimmed === prodBase) return trimmed;
  if (sessionEnv === "staging" && trimmed === stagingBase) return trimmed;
  if (sessionEnv === "dev" && (trimmed === devBase || isLocalBackend)) return trimmed;

  return defaultBase;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, apiBase: apiBaseFromBody } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const baseUrl = resolveLoginApiBase(request, apiBaseFromBody);
    const sessionEnv = getSessionEnv(request);

    const res = await fetch(`${baseUrl}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message =
        (data && typeof data.message === "string" && data.message) ||
        (data && typeof data.detail === "string" && data.detail) ||
        (data && typeof data.title === "string" && data.title) ||
        "Invalid email or password";
      return NextResponse.json({ error: message }, { status: 401 });
    }

    const token = data.token;
    const refreshToken = data.refreshToken;
    if (!token) {
      return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }

    // Enforce strict backoffice-only login: credentials must be able to access
    // a protected Backoffice endpoint before we mint admin session cookies.
    try {
      const verifyRes = await fetch(`${baseUrl}/Backoffice/permissions`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!verifyRes.ok) {
        return NextResponse.json(
          { error: "Backoffice credentials required." },
          { status: 403 },
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Unable to verify backoffice access. Try again." },
        { status: 502 },
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    if (refreshToken) {
      cookieStore.set(ADMIN_REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });
    }
    cookieStore.set(ADMIN_ENV_COOKIE, sessionEnv, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;
  const tokenEnv = cookieStore.get(ADMIN_ENV_COOKIE)?.value;

  // If namespace cookie is missing, middleware will self-heal it on next admin route hit.
  if (token && isAdminTokenActive(token)) {
    return NextResponse.json(
      { authenticated: true, env: tokenEnv ?? null },
      { status: 200 },
    );
  }

  if (token && !isAdminTokenActive(token)) {
    cookieStore.delete(ADMIN_TOKEN_COOKIE);
    cookieStore.delete(ADMIN_REFRESH_TOKEN_COOKIE);
    cookieStore.delete(ADMIN_ENV_COOKIE);
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
