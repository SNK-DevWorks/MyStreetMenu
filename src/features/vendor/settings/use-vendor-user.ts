'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface VendorUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
}

function extractName(user: User): string {
  // Google OAuth puts the full name in user_metadata.full_name or user_metadata.name
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.email?.split('@')[0] ||
    user.email?.split('@')[0] ||
    'Vendor'
  );
}

function extractAvatar(user: User): string | null {
  return (
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    null
  );
}

export function useVendorUser() {
  const [user, setUser] = useState<VendorUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          id: authUser.id,
          name: extractName(authUser),
          email: authUser.email ?? '',
          avatarUrl: extractAvatar(authUser),
          phone: authUser.phone ?? authUser.user_metadata?.phone ?? null,
        });
      }
      setLoading(false);
    };

    loadUser();

    // Keep in sync if session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: extractName(session.user),
          email: session.user.email ?? '',
          avatarUrl: extractAvatar(session.user),
          phone: session.user.phone ?? session.user.user_metadata?.phone ?? null,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return { user, loading };
}
