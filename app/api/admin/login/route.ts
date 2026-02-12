import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const ADMIN_AUTH_COOKIE = 'admin-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/d06724d6-1c98-4e9f-af90-8e5018ac5160', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'pre-fix',
        hypothesisId: 'H4',
        location: 'app/api/admin/login/route.ts:POST:before',
        message: 'admin login POST incoming (prisma)',
        data: {
          hasEmail: !!email,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

    // Local Prisma-based admin user lookup
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const cookieStore = await cookies()
    cookieStore.set(ADMIN_AUTH_COOKIE, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Login error:', error)

    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/d06724d6-1c98-4e9f-af90-8e5018ac5160', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'pre-fix',
        hypothesisId: 'H5',
        location: 'app/api/admin/login/route.ts:POST:catch',
        message: 'admin login POST error (prisma)',
        data: {
          errorMessage: typeof error?.message === 'string' ? error.message : 'unknown',
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get(ADMIN_AUTH_COOKIE)?.value

  if (authCookie === 'authenticated') {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/d06724d6-1c98-4e9f-af90-8e5018ac5160', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'pre-fix',
        hypothesisId: 'H6',
        location: 'app/api/admin/login/route.ts:GET:authenticated',
        message: 'admin login GET authenticated (prisma)',
        data: {},
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

    return NextResponse.json(
      { authenticated: true },
      { status: 200 }
    )
  }

  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/d06724d6-1c98-4e9f-af90-8e5018ac5160', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H7',
      location: 'app/api/admin/login/route.ts:GET:unauthenticated',
      message: 'admin login GET unauthenticated (prisma)',
      data: {},
      timestamp: Date.now(),
    }),
  }).catch(() => {})
  // #endregion

  return NextResponse.json(
    { authenticated: false },
    { status: 401 }
  )
}

