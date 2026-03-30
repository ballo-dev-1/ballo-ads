import { NextRequest, NextResponse } from "next/server";
import {
  MTN_REVIEW_SESSION_COOKIE,
  MTN_REVIEW_SESSION_VALUE,
  mtnReviewCookieOptions,
} from "@/lib/mtnReviewAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password =
      typeof body.password === "string" ? body.password.trim() : "";
    const username =
      typeof body.username === "string" ? body.username.trim() : "";
    if (!password || !username) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
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
