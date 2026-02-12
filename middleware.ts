import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_AUTH_COOKIE = 'admin-auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authCookie = request.cookies.get(ADMIN_AUTH_COOKIE)?.value

  // Allow access to login page
  if (pathname === '/admin/login') {
    // If already authenticated, redirect to dashboard
    if (authCookie === 'authenticated') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Redirect /admin to /admin/dashboard for authenticated users
  if (pathname === '/admin') {
    if (authCookie === 'authenticated') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  // Protect all other /admin routes
  if (pathname.startsWith('/admin')) {
    if (authCookie !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}

