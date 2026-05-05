import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_GATE_COOKIE, ADMIN_GATE_VALUE } from '@/lib/adminAuth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authCookie = request.cookies.get(ADMIN_GATE_COOKIE)?.value

  // Allow access to login page
  if (pathname === '/admin/login') {
    // If already authenticated, redirect to dashboard
    if (authCookie === ADMIN_GATE_VALUE) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Redirect /admin to /admin/dashboard for authenticated users
  if (pathname === '/admin') {
    if (authCookie === ADMIN_GATE_VALUE) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  // Protect all other /admin routes
  if (pathname.startsWith('/admin')) {
    if (authCookie !== ADMIN_GATE_VALUE) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}

