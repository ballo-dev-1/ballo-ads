import { NextRequest, NextResponse } from "next/server";
import {
  MTN_REVIEW_SESSION_COOKIE,
  MTN_REVIEW_SESSION_VALUE,
  mtnReviewCookieOptions,
} from "@/lib/mtnReviewAuth";
import { mtnReviewBackendRequest } from "@/lib/mtnReviewBackendServer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    });
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

    const res = NextResponse.json({ ok: true });
    res.cookies.set(
      MTN_REVIEW_SESSION_COOKIE,
      MTN_REVIEW_SESSION_VALUE,
      mtnReviewCookieOptions(),
    );
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
