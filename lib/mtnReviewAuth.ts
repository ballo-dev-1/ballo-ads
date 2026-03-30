import { cookies } from "next/headers";

/** HttpOnly session for MTN review portal (demo: any non-empty login). */
export const MTN_REVIEW_SESSION_COOKIE = "mtn-review-session";
export const MTN_REVIEW_SESSION_VALUE = "1";
export const MTN_REVIEW_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function mtnReviewCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MTN_REVIEW_COOKIE_MAX_AGE,
  };
}

/** Returns null if authenticated; otherwise a 401 Response. */
export async function requireMtnReviewSession(): Promise<Response | null> {
  const cookieStore = await cookies();
  const v = cookieStore.get(MTN_REVIEW_SESSION_COOKIE)?.value;
  if (v === MTN_REVIEW_SESSION_VALUE) {
    return null;
  }
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
