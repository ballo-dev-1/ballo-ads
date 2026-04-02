import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE } from "@/lib/adminAuth";
import {
  isMtnReviewBackendConfigured,
  mtnReviewBackendRequest,
} from "@/lib/mtnReviewBackendServer";

/**
 * Admin-only: Brutus-backed preview (no DB row). Backend POST internal/mtn-review/letter-samples-preview.
 */
export async function POST(req: Request) {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const cookieStore = await cookies();
  if (!cookieStore.get(ADMIN_TOKEN_COOKIE)?.value) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isMtnReviewBackendConfigured(host)) {
    return NextResponse.json(
      { error: "Backend MTN review integration not configured" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const res = await mtnReviewBackendRequest(
      "/letter-samples-preview",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      { host },
    );
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Proxy failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
