import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

/**
 * Protected route patterns that require authentication.
 */
const PROTECTED_ROUTE_PATTERNS = [
  /^\/dashboard/,
  /^\/check-in/,
  /^\/contract\/.*/,
  /^\/profile/,
];

/**
 * Auth pages where authenticated users should be redirected away.
 */
const AUTH_PAGES = ["/login", "/signup"];

/**
 * Checks if a pathname matches any protected route pattern.
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

/**
 * Checks if a pathname is an auth page.
 */
function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.includes(pathname);
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Refresh session - this is required to keep the session alive
  // and get the latest user data
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // If user is authenticated and on an auth page, redirect to dashboard
  if (user && isAuthPage(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // If user is not authenticated and on a protected route, redirect to login
  if (!user && isProtectedRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Preserve the intended destination for post-auth redirect
    url.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     * - API routes (they handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)",
  ],
};
