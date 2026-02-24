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
  } catch (error: unknown) {
    console.error('Login error:', error)

    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get(ADMIN_AUTH_COOKIE)?.value

  if (authCookie === 'authenticated') {
    return NextResponse.json(
      { authenticated: true },
      { status: 200 }
    )
  }

  return NextResponse.json(
    { authenticated: false },
    { status: 401 }
  )
}

