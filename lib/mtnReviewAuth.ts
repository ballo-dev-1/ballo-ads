import { cookies } from "next/headers";

/** HttpOnly session for MTN review portal (demo: any non-empty login). */
export const MTN_REVIEW_SESSION_COOKIE = "mtn-review-session";
export const MTN_REVIEW_SESSION_VALUE = "1";
export const MTN_REVIEW_USER_COOKIE = "mtn-review-user";
export const MTN_REVIEW_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type MtnReviewSessionUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

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

export async function getMtnReviewSessionUser(): Promise<MtnReviewSessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(MTN_REVIEW_USER_COOKIE)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<MtnReviewSessionUser>;
    if (
      typeof parsed.id === "number" &&
      typeof parsed.firstName === "string" &&
      typeof parsed.lastName === "string" &&
      typeof parsed.email === "string"
    ) {
      return {
        id: parsed.id,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: parsed.email,
      };
    }
  } catch {
    return null;
  }

  return null;
}
