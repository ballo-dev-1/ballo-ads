import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_ENV_COOKIE,
  ADMIN_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  isAdminTokenActive,
} from "@/lib/adminAuth";
import { DEV_API_BASE, PROD_API_BASE, STAGING_API_BASE } from "@/lib/adminApi";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const ALLOWED_BASES = [
  DEV_API_BASE.replace(/\/+$/, ""),
  STAGING_API_BASE.replace(/\/+$/, ""),
  PROD_API_BASE.replace(/\/+$/, ""),
  "http://localhost:5238",
  "http://127.0.0.1:5238",
];

function getDefaultApiBaseUrl(): string {
  return (
    (typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_DEV_API_URL) ||
    DEV_API_BASE
  );
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

    const baseFromBody =
      typeof apiBaseFromBody === "string" &&
      apiBaseFromBody.trim().length > 0
        ? apiBaseFromBody.trim().replace(/\/+$/, "")
        : null;

    const baseUrl =
      baseFromBody && ALLOWED_BASES.includes(baseFromBody)
        ? baseFromBody
        : getDefaultApiBaseUrl().replace(/\/+$/, "");
    const selectedEnv =
      baseUrl === PROD_API_BASE.replace(/\/+$/, "")
        ? "prod"
        : baseUrl === STAGING_API_BASE.replace(/\/+$/, "")
          ? "staging"
          : "dev";
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
    cookieStore.set(ADMIN_ENV_COOKIE, selectedEnv, {
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
