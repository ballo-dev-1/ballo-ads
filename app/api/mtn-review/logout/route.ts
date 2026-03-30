import { NextResponse } from "next/server";
import { MTN_REVIEW_SESSION_COOKIE } from "@/lib/mtnReviewAuth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(MTN_REVIEW_SESSION_COOKIE);
  return res;
}
