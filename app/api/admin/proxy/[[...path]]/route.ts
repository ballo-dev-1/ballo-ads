import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_ENV_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_TOKEN_COOKIE,
  isAdminTokenActive,
} from "@/lib/adminAuth";
import { DEV_API_BASE, PROD_API_BASE, STAGING_API_BASE } from "@/lib/adminApi";
import { resolveProxyBaseUrl } from "@/lib/adminProxyBase";

function getFallbackBase(primaryBase: string): string | null {
  if (primaryBase === DEV_API_BASE.replace(/\/+$/, "")) {
    return PROD_API_BASE.replace(/\/+$/, "");
  }
  if (primaryBase === STAGING_API_BASE.replace(/\/+$/, "")) {
    return PROD_API_BASE.replace(/\/+$/, "");
  }
  if (primaryBase === PROD_API_BASE.replace(/\/+$/, "")) {
    return DEV_API_BASE.replace(/\/+$/, "");
  }
  return null;
}

function getBaseFromEnvCookie(envCookie: string | undefined): string | null {
  if (!envCookie) return null;
  if (envCookie === "dev") return DEV_API_BASE.replace(/\/+$/, "");
  if (envCookie === "staging") return STAGING_API_BASE.replace(/\/+$/, "");
  if (envCookie === "prod") return PROD_API_BASE.replace(/\/+$/, "");
  return null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return proxy(request, context, undefined);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const body = await request.text();
  return proxy(request, context, body || undefined);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const body = await request.text();
  return proxy(request, context, body || undefined);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const body = await request.text();
  return proxy(request, context, body || undefined);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return proxy(request, context, undefined);
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
  body: string | undefined,
) {
  const { path: pathSegments } = await context.params;
  const path = pathSegments?.length ? pathSegments.join("/") : "";
  const baseFromHeader = request.headers
    .get("X-Api-Base")
    ?.trim()
    .replace(/\/+$/, "");
  const cookieStore = await cookies();
  const baseFromEnvCookie = getBaseFromEnvCookie(
    cookieStore.get(ADMIN_ENV_COOKIE)?.value,
  );
  const allowLocalBackendProxy =
    (process.env.ALLOW_LOCAL_BACKEND_PROXY ?? "").trim().toLowerCase() ===
    "true";
  const resolvedBase = resolveProxyBaseUrl({
    baseFromHeader,
    baseFromEnvCookie,
    allowLocalBackendProxy,
  });

  if (!resolvedBase.ok) {
    return NextResponse.json(
      { error: "Invalid or missing X-Api-Base header" },
      { status: 400 },
    );
  }
  const baseFromRequest = resolvedBase.baseUrl;

  const token = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdminTokenActive(token)) {
    cookieStore.delete(ADMIN_TOKEN_COOKIE);
    cookieStore.delete(ADMIN_REFRESH_TOKEN_COOKIE);
    cookieStore.delete(ADMIN_ENV_COOKIE);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const search = request.nextUrl.searchParams.toString();
  const url = `${baseFromRequest}/${path.replace(/^\/+/, "")}${search ? `?${search}` : ""}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  let res: Response;
  const isAnalyticsPath = path.startsWith("Backoffice/analytics/");
  const isApmPath = path.startsWith("Backoffice/apm/");
  const isDispatchControlsPath = path.startsWith("Backoffice/dispatch-controls");
  const shouldFallbackPath = isAnalyticsPath || isApmPath || isDispatchControlsPath;
  const canFallback = request.method === "GET" && shouldFallbackPath;
  try {
    res = await fetch(url, {
      method: request.method,
      headers,
      ...(body !== undefined && body !== "" && { body }),
    });
  } catch (err) {
    if (!canFallback) {
      return NextResponse.json(
        { error: "Backend unreachable", details: err instanceof Error ? err.message : "Unknown error" },
        { status: 502 },
      );
    }

    const fallbackBase = getFallbackBase(baseFromRequest);
    if (!fallbackBase) {
      return NextResponse.json(
        { error: "Backend unreachable", details: err instanceof Error ? err.message : "Unknown error" },
        { status: 502 },
      );
    }

    const fallbackUrl = `${fallbackBase}/${path.replace(/^\/+/, "")}${search ? `?${search}` : ""}`;
    try {
      res = await fetch(fallbackUrl, {
        method: request.method,
        headers,
        ...(body !== undefined && body !== "" && { body }),
      });
    } catch (fallbackErr) {
      return NextResponse.json(
        {
          error: "Backend unreachable",
          details: fallbackErr instanceof Error ? fallbackErr.message : "Unknown error",
          fallbackTried: true,
        },
        { status: 502 },
      );
    }
  }

  if (canFallback && res.status === 404) {
    const fallbackBase = getFallbackBase(baseFromRequest);
    if (fallbackBase) {
      const fallbackUrl = `${fallbackBase}/${path.replace(/^\/+/, "")}${search ? `?${search}` : ""}`;
      try {
        const fallbackRes = await fetch(fallbackUrl, {
          method: request.method,
          headers,
          ...(body !== undefined && body !== "" && { body }),
        });
        if (fallbackRes.ok) {
          res = fallbackRes;
        }
      } catch {
        // Keep primary 404 response when fallback is unreachable.
      }
    }
  }

  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    return NextResponse.json(data, { status: res.status });
  } catch {
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "text/plain",
      },
    });
  }
}
