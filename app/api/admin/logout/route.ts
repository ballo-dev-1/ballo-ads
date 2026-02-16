import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ADMIN_AUTH_COOKIE = 'admin-auth'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_AUTH_COOKIE)

  return NextResponse.json({ success: true }, { status: 200 })
}

