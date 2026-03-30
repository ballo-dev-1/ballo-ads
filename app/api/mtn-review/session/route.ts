import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  MTN_REVIEW_SESSION_COOKIE,
  MTN_REVIEW_SESSION_VALUE,
} from "@/lib/mtnReviewAuth";

export async function GET() {
  const v = (await cookies()).get(MTN_REVIEW_SESSION_COOKIE)?.value;
  return NextResponse.json({ authenticated: v === MTN_REVIEW_SESSION_VALUE });
}

/** End MTN review session (same as POST /logout would do). */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(MTN_REVIEW_SESSION_COOKIE);
  return res;
}
