import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_TOKEN_COOKIE } from "@/lib/adminAuth";
import { DEV_API_BASE, PROD_API_BASE } from "@/lib/adminApi";

const ALLOWED_BASES = [
  DEV_API_BASE.replace(/\/+$/, ""),
  PROD_API_BASE.replace(/\/+$/, ""),
  "http://localhost:5238",
  "http://127.0.0.1:5238",
];

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

  if (!baseFromHeader || !ALLOWED_BASES.includes(baseFromHeader)) {
    return NextResponse.json(
      { error: "Invalid or missing X-Api-Base header" },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const search = request.nextUrl.searchParams.toString();
  const url = `${baseFromHeader}/${path.replace(/^\/+/, "")}${search ? `?${search}` : ""}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  let res: Response;
  try {
    res = await fetch(url, {
      method: request.method,
      headers,
      ...(body !== undefined && body !== "" && { body }),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Backend unreachable", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 },
    );
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
