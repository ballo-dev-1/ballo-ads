import { cookies } from 'next/headers'

const ADMIN_AUTH_COOKIE = 'admin-auth'

/**
 * Require admin auth from cookie. Use in API route handlers.
 * Returns null if authenticated; otherwise returns a Response to return (401).
 */
export async function requireAdminAuth(): Promise<Response | null> {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get(ADMIN_AUTH_COOKIE)?.value

  if (authCookie === 'authenticated') {
    return null
  }

  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}
