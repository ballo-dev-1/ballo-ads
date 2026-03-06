import { cookies } from "next/headers";

export const ADMIN_TOKEN_COOKIE = "admin-token";
export const ADMIN_REFRESH_TOKEN_COOKIE = "admin-refresh-token";

/**
 * Require admin auth from cookie. Use in API route handlers.
 * Returns null if authenticated; otherwise returns a Response to return (401).
 */
export async function requireAdminAuth(): Promise<Response | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;

  if (token) {
    return null;
  }

  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
