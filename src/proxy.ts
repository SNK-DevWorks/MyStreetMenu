import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Routes that require authentication
const PROTECTED_VENDOR_PREFIX = '/vendor';
const PROTECTED_ADMIN_PREFIX = '/admin';

// Auth pages that should redirect to dashboard if already logged in
const VENDOR_AUTH_PAGES = ['/vendor/login', '/vendor/signup'];
const ADMIN_AUTH_PAGES = ['/admin/login'];

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // ── Root page: authenticated vendors should always land in their dashboard ─
  // This is what prevents the browser Back button from landing on the home page
  // after login (router.replace on home + router.push on login together with
  // this guard create a "can't escape the dashboard" effect for logged-in users).
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
  }

  // ── Vendor Route Protection ──────────────────────────────────
  if (pathname.startsWith(PROTECTED_VENDOR_PREFIX)) {
    const isAuthPage = VENDOR_AUTH_PAGES.some((p) => pathname.startsWith(p));

    if (!user && !isAuthPage) {
      // Not logged in → redirect to login
      const loginUrl = new URL('/vendor/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user && isAuthPage) {
      // Already logged in → redirect away from login/signup
      return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
    }
  }

  // ── Admin Route Protection ───────────────────────────────────
  if (pathname.startsWith(PROTECTED_ADMIN_PREFIX)) {
    const isAuthPage = ADMIN_AUTH_PAGES.some((p) => pathname.startsWith(p));

    if (!user && !isAuthPage) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user && isAuthPage) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
