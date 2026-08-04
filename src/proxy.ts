import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// ─── Route constants ──────────────────────────────────────────────────────────

// Strict prefix: /vendor/ so we don't accidentally match /vendor-api etc.
const VENDOR_PREFIX = '/vendor/';
const VENDOR_EXACT = '/vendor';
const ADMIN_PREFIX = '/admin/';
const ADMIN_EXACT = '/admin';

// Auth pages — no session required; authenticated users are bounced away
const VENDOR_AUTH_PAGES = ['/vendor/login', '/vendor/signup'];
const ADMIN_AUTH_PAGES = ['/admin/login'];

const VENDOR_ONBOARDING_PATH = '/vendor/onboarding';

// Public paths that never need Supabase session resolution.
// Add any fully-public routes here to avoid unnecessary cookie parsing.
const PUBLIC_PREFIXES = ['/menu', '/about', '/contact', '/privacy', '/terms'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isVendorPath(pathname: string): boolean {
  return pathname === VENDOR_EXACT || pathname.startsWith(VENDOR_PREFIX);
}

function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_EXACT || pathname.startsWith(ADMIN_PREFIX);
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

/**
 * Returns true if the user has completed onboarding.
 * Checks the explicit flag AND the legacy shop_name+phone combo.
 */
function isUserOnboarded(user: { user_metadata?: Record<string, unknown> } | null): boolean {
  if (!user) return false;
  const meta = user.user_metadata ?? {};
  return Boolean(
    meta.onboarding_completed ||
    (meta.shop_name && meta.phone)
  );
}

// ─── Proxy ────────────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Fast path: skip session resolution for public routes ─────────────────
  // This avoids unnecessary Supabase cookie parsing on pages that don't
  // require authentication at all (e.g. public menu pages, static content).
  if (isPublicPath(pathname)) {
    return NextResponse.next({ request });
  }

  // ── Resolve Supabase session ──────────────────────────────────────────────
  let response = NextResponse.next({ request });
  let user: { user_metadata?: Record<string, unknown>; role?: string } | null = null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      });
      // Always use getUser() (validates JWT server-side) — not getSession()
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      // Supabase unreachable — fail open so the app stays available
    }
  }

  const onboarded = isUserOnboarded(user);

  // ── 1. Root redirect ──────────────────────────────────────────────────────
  // Authenticated users at "/" get sent to their appropriate dashboard.
  // Role-aware: admins go to /admin/dashboard, vendors go to /vendor/* based on onboarding.
  if (user && pathname === '/') {
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    const dest = onboarded ? '/vendor/dashboard' : VENDOR_ONBOARDING_PATH;
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // ── 2. Vendor Route Protection ────────────────────────────────────────────
  if (isVendorPath(pathname)) {
    const isAuthPage = VENDOR_AUTH_PAGES.some((p) => pathname.startsWith(p));
    const isOnboardingPage = pathname.startsWith(VENDOR_ONBOARDING_PATH);

    if (!user) {
      // Unauthenticated → send to login, preserving full path + query string
      if (!isAuthPage) {
        const loginUrl = new URL('/vendor/login', request.url);
        loginUrl.searchParams.set('next', pathname + request.nextUrl.search);
        return NextResponse.redirect(loginUrl);
      }
      return response;
    }

    // Authenticated ───────────────────────────────────────────────────────────

    if (isAuthPage) {
      // Already logged in → leave auth pages, respect onboarding state
      const dest = onboarded ? '/vendor/dashboard' : VENDOR_ONBOARDING_PATH;
      return NextResponse.redirect(new URL(dest, request.url));
    }

    if (isOnboardingPage) {
      // Already onboarded → onboarding is no longer relevant
      if (onboarded) {
        return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
      }
      return response;
    }

    // Any other protected vendor page: require onboarding to be complete
    if (!onboarded) {
      return NextResponse.redirect(new URL(VENDOR_ONBOARDING_PATH, request.url));
    }
  }

  // ── 3. Admin Route Protection ─────────────────────────────────────────────
  if (isAdminPath(pathname)) {
    const isAuthPage = ADMIN_AUTH_PAGES.some((p) => pathname.startsWith(p));

    if (!user && !isAuthPage) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }

    if (user && isAuthPage) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return response;
}

// ─── Matcher ──────────────────────────────────────────────────────────────────
// Exclude Next.js internals and static assets from proxy processing.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)',
  ],
};

