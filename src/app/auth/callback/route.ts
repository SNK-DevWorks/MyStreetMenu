import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const nextParam = requestUrl.searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      const isOnboarded = Boolean(
        user?.user_metadata?.onboarding_completed ||
        (user?.user_metadata?.shop_name && user?.user_metadata?.phone)
      );

      const target = nextParam && nextParam !== '/vendor/onboarding'
        ? nextParam
        : (isOnboarded ? '/vendor/dashboard' : '/vendor/onboarding');

      return NextResponse.redirect(new URL(target, requestUrl.origin));
    }
  }

  // Something went wrong — redirect to login with error
  return NextResponse.redirect(new URL('/vendor/login?error=auth_failed', requestUrl.origin));
}

