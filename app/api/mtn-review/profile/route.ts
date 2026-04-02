import { NextRequest, NextResponse } from "next/server";
import {
  getMtnReviewSessionUser,
  MTN_REVIEW_USER_COOKIE,
  mtnReviewCookieOptions,
  requireMtnReviewSession,
} from "@/lib/mtnReviewAuth";
import { mtnReviewBackendRequest } from "@/lib/mtnReviewBackendServer";

export async function GET(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const unauthorized = await requireMtnReviewSession();
  if (unauthorized) return unauthorized;

  const reviewer = await getMtnReviewSessionUser();
  if (!reviewer) {
    return NextResponse.json({ error: "Reviewer session unavailable." }, { status: 401 });
  }

  try {
    const backend = await mtnReviewBackendRequest(
      `/auth/profile/${reviewer.id}`,
      { method: "GET" },
      { host },
    );
    const data = await backend.json().catch(() => ({}));
    if (!backend.ok) {
      return NextResponse.json(
        { error: typeof (data as { error?: unknown }).error === "string" ? (data as { error: string }).error : "Failed to load profile." },
        { status: backend.status },
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}

export async function PATCH(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const unauthorized = await requireMtnReviewSession();
  if (unauthorized) return unauthorized;

  const reviewer = await getMtnReviewSessionUser();
  if (!reviewer) {
    return NextResponse.json({ error: "Reviewer session unavailable." }, { status: 401 });
  }

  let body: { firstName?: unknown; lastName?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
  if (!firstName || !lastName) {
    return NextResponse.json({ error: "First name and last name are required." }, { status: 400 });
  }

  try {
    const backend = await mtnReviewBackendRequest(
      `/auth/profile/${reviewer.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ firstName, lastName }),
      },
      { host },
    );
    const data = await backend.json().catch(() => ({}));
    if (!backend.ok) {
      return NextResponse.json(
        { error: typeof (data as { error?: unknown }).error === "string" ? (data as { error: string }).error : "Failed to update profile." },
        { status: backend.status },
      );
    }

    const res = NextResponse.json(data);
    const nextReviewer = ((data as { reviewer?: unknown }).reviewer ?? {}) as Record<string, unknown>;
    const nextFirstName = typeof nextReviewer.firstName === "string" ? nextReviewer.firstName : reviewer.firstName;
    const nextLastName = typeof nextReviewer.lastName === "string" ? nextReviewer.lastName : reviewer.lastName;
    res.cookies.set(
      MTN_REVIEW_USER_COOKIE,
      JSON.stringify({
        ...reviewer,
        firstName: nextFirstName,
        lastName: nextLastName,
      }),
      mtnReviewCookieOptions(),
    );
    return res;
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
