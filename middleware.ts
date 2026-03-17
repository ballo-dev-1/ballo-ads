import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_ENV_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_TOKEN_COOKIE,
} from "@/lib/adminAuth";
import { getAdminBasePath, getAdminEnvFromPathname } from "@/lib/adminNamespace";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const tokenEnv = request.cookies.get(ADMIN_ENV_COOKIE)?.value;
  const isAdmin = pathname.startsWith("/admin");
  const isDevAdmin = pathname.startsWith("/dev-admin");
  const isStagingAdmin = pathname.startsWith("/staging-admin");
  const basePath = getAdminBasePath(pathname);
  const expectedEnv = getAdminEnvFromPathname(pathname);
  const hasMatchingEnv = !tokenEnv || tokenEnv === expectedEnv;
  const isAuthenticatedForNamespace = Boolean(token) && hasMatchingEnv;
  const loginPath = `${basePath}/login`;
  const dashboardPath = `${basePath}/dashboard`;

  // Self-heal legacy sessions that have token but no namespace cookie.
  if (token && !tokenEnv && (isAdmin || isDevAdmin || isStagingAdmin)) {
    const response = NextResponse.next();
    response.cookies.set(ADMIN_ENV_COOKIE, expectedEnv, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  }

  // Allow access to login pages
  if (
    pathname === "/admin/login" ||
    pathname === "/dev-admin/login" ||
    pathname === "/staging-admin/login"
  ) {
    if (isAuthenticatedForNamespace) {
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    // Clear stale cross-namespace auth cookies so the user can log in cleanly.
    if (token && tokenEnv && !hasMatchingEnv) {
      const response = NextResponse.next();
      response.cookies.delete(ADMIN_TOKEN_COOKIE);
      response.cookies.delete(ADMIN_REFRESH_TOKEN_COOKIE);
      response.cookies.delete(ADMIN_ENV_COOKIE);
      return response;
    }

    return NextResponse.next();
  }

  // Redirect base admin namespaces to dashboard for authenticated users
  if (pathname === "/admin" || pathname === "/dev-admin" || pathname === "/staging-admin") {
    if (isAuthenticatedForNamespace) {
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
  }

  // Protect all admin routes
  if (isAdmin || isDevAdmin || isStagingAdmin) {
    if (!isAuthenticatedForNamespace) {
      return NextResponse.redirect(new URL(loginPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dev-admin/:path*", "/staging-admin/:path*"],
};
