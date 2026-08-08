'use client';

import { createClient } from '@/lib/supabase/client';

/**
 * Ensures the browser has an active Supabase anonymous session.
 *
 * Flow:
 *   1. Check for existing session via getSession()
 *   2. If none, call signInAnonymously()
 *   3. Return the authenticated user's UUID, or null if it fails
 *
 * Called on public menu mount and before every order placement.
 * The customer sees no login screen — completely invisible.
 *
 * Note: Session is persisted by @supabase/ssr in a browser cookie.
 * localStorage is NOT used for auth — only for lightweight UI state.
 */
export async function ensureAnonymousSession(): Promise<string | null> {
  const supabase = createClient();

  try {
    // Check existing session first to avoid unnecessary signInAnonymously calls
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      return session.user.id;
    }

    // No session — create an anonymous one
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error || !data.user) {
      console.error('[customer-auth] Failed to create anonymous session:', error?.message);
      return null;
    }

    return data.user.id;
  } catch (err) {
    console.error('[customer-auth] Unexpected error in ensureAnonymousSession:', err);
    return null;
  }
}

/**
 * Returns the current anonymous user's UUID from the active session,
 * or null if there is no session.
 *
 * Does NOT create a new session — use ensureAnonymousSession() for that.
 */
export async function getCustomerUserId(): Promise<string | null> {
  const supabase = createClient();

  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
