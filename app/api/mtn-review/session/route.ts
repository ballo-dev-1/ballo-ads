import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getMtnReviewSessionUser,
  MTN_REVIEW_SESSION_COOKIE,
  MTN_REVIEW_SESSION_VALUE,
  MTN_REVIEW_USER_COOKIE,
} from "@/lib/mtnReviewAuth";

export async function GET() {
  const v = (await cookies()).get(MTN_REVIEW_SESSION_COOKIE)?.value;
  const authenticated = v === MTN_REVIEW_SESSION_VALUE;
  const reviewer = authenticated ? await getMtnReviewSessionUser() : null;
  return NextResponse.json({ authenticated, reviewer });
}

/** End MTN review session (same as POST /logout would do). */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(MTN_REVIEW_SESSION_COOKIE);
  res.cookies.delete(MTN_REVIEW_USER_COOKIE);
  return res;
}
