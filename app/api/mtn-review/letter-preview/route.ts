import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE } from "@/lib/adminAuth";
import { requireMtnReviewSession } from "@/lib/mtnReviewAuth";
import {
  isMtnReviewBackendConfigured,
  mtnReviewBackendRequest,
} from "@/lib/mtnReviewBackendServer";

/**
 * Proxies to ballo-ads-backend POST internal/mtn-review/letter-preview (Brutus + HTML).
 * Auth: admin session OR MTN review portal session.
 */
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const adminOk = Boolean(cookieStore.get(ADMIN_TOKEN_COOKIE)?.value);
  if (!adminOk) {
    const unauthorized = await requireMtnReviewSession();
    if (unauthorized) return unauthorized;
  }

  if (!isMtnReviewBackendConfigured()) {
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

  const o = body as Record<string, unknown>;
  if (typeof o.companyId !== "number") {
    return NextResponse.json({ error: "companyId required" }, { status: 400 });
  }

  try {
    const res = await mtnReviewBackendRequest("/letter-preview", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Proxy failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
