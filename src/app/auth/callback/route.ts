import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Validates a redirect target to prevent open-redirect attacks.
 * Only allows same-origin relative paths.
 */
function isSafeRedirectPath(path: string | null): path is string {
  if (!path) return false;
  // Must start with / and not be a protocol-relative URL (//...)
  return path.startsWith('/') && !path.startsWith('//');
}

/**
 * Determines whether a user has completed onboarding.
 * Checks both the explicit flag and the legacy shop_name+phone combo.
 */
function isUserOnboarded(user: { user_metadata?: Record<string, unknown> } | null): boolean {
  if (!user) return false;
  const meta = user.user_metadata ?? {};
  return Boolean(
    meta.onboarding_completed ||
    (meta.shop_name && meta.phone)
  );
}

/**
 * Attempts to fetch the authenticated user with exponential back-off retries.
 * This is necessary on PWA/mobile where cookie propagation after
 * exchangeCodeForSession() can lag by hundreds of milliseconds.
 */
async function getUserWithRetry(supabase: Awaited<ReturnType<typeof createClient>>, maxAttempts = 4) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (user && !error) return user;
    if (attempt < maxAttempts) {
      // Exponential back-off: 150ms, 300ms, 600ms …
      await new Promise((r) => setTimeout(r, 150 * Math.pow(2, attempt - 1)));
    }
  }
  return null;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const nextParam = requestUrl.searchParams.get('next');
  const origin = requestUrl.origin;

  // ── 1. Handle the OAuth / magic-link code exchange ──────────────────────────
  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[auth/callback] Code exchange failed:', exchangeError.message);
      return NextResponse.redirect(
        new URL('/vendor/login?error=auth_failed', origin)
      );
    }

    // ── 2. Fetch user (with retry for PWA cookie propagation lag) ────────────
    const user = await getUserWithRetry(supabase);

    if (!user) {
      // Couldn't confirm user even after retries — send back to login
      return NextResponse.redirect(
        new URL('/vendor/login?error=auth_failed', origin)
      );
    }

    const onboarded = isUserOnboarded(user);

    // ── 3. Determine redirect destination ────────────────────────────────────
    //
    // Priority order:
    //   a) If user has NOT completed onboarding → always go to onboarding
    //      (regardless of any `next` param — a fresh user cannot skip setup)
    //   b) If user IS onboarded AND a safe `next` param exists → honour it
    //   c) Otherwise → go to dashboard
    let destination: string;

    if (!onboarded) {
      destination = VENDOR_ONBOARDING_PATH;
    } else if (isSafeRedirectPath(nextParam) && nextParam !== VENDOR_ONBOARDING_PATH) {
      destination = nextParam;
    } else {
      destination = '/vendor/dashboard';
    }

    return NextResponse.redirect(new URL(destination, origin));
  }

  // ── 4. No code param — something went wrong ───────────────────────────────
  return NextResponse.redirect(
    new URL('/vendor/login?error=auth_failed', origin)
  );
}

const VENDOR_ONBOARDING_PATH = '/vendor/onboarding';
