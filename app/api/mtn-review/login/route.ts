import { NextRequest, NextResponse } from "next/server";
import {
  MTN_REVIEW_SESSION_COOKIE,
  MTN_REVIEW_SESSION_VALUE,
  MTN_REVIEW_USER_COOKIE,
  mtnReviewCookieOptions,
} from "@/lib/mtnReviewAuth";
import { mtnReviewBackendRequest } from "@/lib/mtnReviewBackendServer";

export async function POST(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const password =
      typeof body.password === "string" ? body.password.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim() : "";
    if (!password || !email) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const backend = await mtnReviewBackendRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, { host });
    const data = await backend.json().catch(() => ({}));
    if (!backend.ok) {
      const fallback = backend.status === 403
        ? "Account pending approval."
        : "Invalid credentials.";
      const error = typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : fallback;
      return NextResponse.json({ error }, { status: backend.status });
    }

    const reviewer = ((data as { reviewer?: unknown }).reviewer ?? {}) as Record<string, unknown>;
    const reviewerId = Number(reviewer.id ?? 0);
    const firstName = typeof reviewer.firstName === "string" ? reviewer.firstName : "";
    const lastName = typeof reviewer.lastName === "string" ? reviewer.lastName : "";
    const reviewerEmail = typeof reviewer.email === "string" ? reviewer.email : "";
    if (reviewerId <= 0 || !firstName || !lastName || !reviewerEmail) {
      return NextResponse.json({ error: "Invalid reviewer profile payload." }, { status: 502 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(
      MTN_REVIEW_SESSION_COOKIE,
      MTN_REVIEW_SESSION_VALUE,
      mtnReviewCookieOptions(),
    );
    res.cookies.set(
      MTN_REVIEW_USER_COOKIE,
      JSON.stringify({
        id: reviewerId,
        firstName,
        lastName,
        email: reviewerEmail,
      }),
      mtnReviewCookieOptions(),
    );
    return res;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "MTN review login is currently unavailable.";
    const status = /not configured/i.test(message) ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
