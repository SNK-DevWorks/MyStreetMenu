"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Google "G" SVG Icon
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

interface VendorAuthCardProps {
  initialMode?: "login" | "signup";
}

export default function VendorAuthCard({ initialMode = "login" }: VendorAuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsLogin(initialMode === "login");
  }, [initialMode]);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Confirmation Link screen state
  const [showConfirmScreen, setShowConfirmScreen] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  // Capture the intended destination at the point the confirm screen is shown,
  // so we don't re-compute it with stale searchParams later.
  const pendingDestRef = useRef<string | null>(null);

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Helper: translate raw Supabase error messages into friendly user text
  const translateAuthError = (raw: string): string => {
    const m = raw.toLowerCase();
    if (m.includes("already registered") || m.includes("already in use") || m.includes("already exists") || m.includes("user_already_exists")) {
      return "An account with this email already exists. Please sign in instead.";
    }
    if (m.includes("invalid login credentials") || m.includes("invalid credentials")) {
      return "Incorrect email or password. Please try again.";
    }
    if (m.includes("email not confirmed")) {
      return "Please confirm your email first. Check your inbox for the confirmation link.";
    }
    if (m.includes("rate limit") || m.includes("too many requests") || m.includes("security purposes") || m.includes("email rate limit")) {
      // Extract seconds if present, e.g. "you can only request this after 54 seconds"
      const secondsMatch = raw.match(/(\d+)\s*second/i);
      if (secondsMatch) {
        return `Too many attempts. Please wait ${secondsMatch[1]} seconds and try again.`;
      }
      return "Too many attempts. Please wait a moment and try again.";
    }
    if (m.includes("invalid format") || m.includes("unable to validate email")) {
      return "Please enter a valid email address.";
    }
    if (m.includes("password should be at least") || m.includes("password must be at least") || m.includes("requires a valid password")) {
      return "Password must be at least 6 characters long.";
    }
    if (m.includes("weak password")) {
      return "Your password is too weak. Please choose a stronger password (min. 6 characters).";
    }
    if (m.includes("signup is disabled")) {
      return "New signups are temporarily disabled. Please try again later.";
    }
    if (m.includes("network") || m.includes("fetch") || m.includes("failed to fetch")) {
      return "Network error. Please check your internet connection and try again.";
    }
    // Fallback: return the raw message but capitalised cleanly
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };

  // Helper to determine destination path based on vendor onboarding status
  const getDestinationUrl = (user: { user_metadata?: Record<string, unknown> }, nextParam: string | null) => {
    if (nextParam && nextParam !== "/vendor/onboarding") {
      return nextParam;
    }
    const isOnboarded = Boolean(
      user?.user_metadata?.onboarding_completed ||
      (user?.user_metadata?.shop_name && user?.user_metadata?.phone)
    );
    return isOnboarded ? "/vendor/dashboard" : "/vendor/onboarding";
  };

  // Check initial session on mount: if user is already logged in, redirect to destination
  // Also read ?error=auth_failed from the callback route and show a friendly message
  useEffect(() => {
    // Capture search params values at mount time to avoid stale-closure issues
    const nextParam = searchParams.get('next');
    const errorParam = searchParams.get('error');

    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const dest = getDestinationUrl(session.user, nextParam);
        router.replace(dest);
        return;
      }
      // Show friendly message if redirected back from a failed auth callback
      if (errorParam === 'auth_failed') {
        setErrorMsg('Your confirmation link has expired or is invalid. Please sign up again or request a new link.');
        // Clean the param from URL without reload
        window.history.replaceState(null, '', '/vendor/login');
      }
    };
    checkInitialSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount — searchParams values captured above

  // Mode switch handler
  const handleToggleMode = () => {
    const nextIsLogin = !isLogin;
    setIsLogin(nextIsLogin);
    setErrorMsg("");
    setShowConfirmScreen(false);
    setResendMsg("");
    window.history.replaceState(null, "", nextIsLogin ? "/vendor/login" : "/vendor/signup");
  };

  // ─── Listen for email confirmation in real-time ──────────────────────────────
  // Using onAuthStateChange instead of polling so we react instantly (critical for
  // mobile PWA where the user may confirm email in a different tab and switch back).
  useEffect(() => {
    if (!showConfirmScreen) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const dest = pendingDestRef.current ?? getDestinationUrl(session.user, null);
          router.replace(dest);
          router.refresh();
        }
      }
    );

    // Fallback: do one immediate check in case the session arrived before the
    // subscription was set up (e.g. user was very fast)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const dest = pendingDestRef.current ?? getDestinationUrl(session.user, null);
        router.replace(dest);
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showConfirmScreen]); // Only re-subscribe if the confirm screen visibility changes

  // Login / Signup Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    if (isLogin) {
      // Login flow
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(translateAuthError(error.message));
        setIsLoading(false);
        return;
      }

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('msm_welcome_seen');
      }
      const dest = getDestinationUrl(authData?.user, searchParams.get('next'));
      router.push(dest);
      router.refresh();
    } else {
      // Signup flow
      const fullName = `${firstName} ${lastName}`.trim();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const signupNext = searchParams.get("next") || "/vendor/onboarding";
      const redirectUrl = `${origin}/auth/callback?next=${encodeURIComponent(signupNext)}`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: fullName || firstName },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        setErrorMsg(translateAuthError(error.message));
        setIsLoading(false);
        return;
      }

      // Check if Supabase returned a user with empty identities (indicates email already exists)
      if (data?.user && data.user.identities && data.user.identities.length === 0) {
        setErrorMsg("An account with this email already exists. Please switch to Log In.");
        setIsLoading(false);
        return;
      }

      if (data.user && !data.session) {
        // Needs email confirmation via link
        // Capture the intended destination before showing the confirm screen
        pendingDestRef.current = '/vendor/onboarding'; // new users always go to onboarding
        setShowConfirmScreen(true);
        setResendMsg("A confirmation link has been sent to your email!");
        setIsLoading(false);
        return;
      }

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('msm_welcome_seen');
      }
      const dest = data.user ? getDestinationUrl(data.user, null) : '/vendor/onboarding';
      router.push(dest);
      router.refresh();
    }
  };

  // Resend Confirmation Link Handler
  const handleResendConfirmLink = async () => {
    setErrorMsg("");
    setResendMsg("");
    setIsLoading(true);

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const signupNext = searchParams.get("next") || "/vendor/onboarding";
    const redirectUrl = `${origin}/auth/callback?next=${encodeURIComponent(signupNext)}`;

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setResendMsg("A new confirmation link has been sent to your email!");
    }
  };

  // Google OAuth flow
  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const nextParam = searchParams.get("next") || "";
    const redirectUrl = `${origin}/auth/callback${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
    if (error) {
      setErrorMsg(error.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#FFF0E5] flex items-center justify-center p-4 sm:p-6 md:p-12 relative"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Top-Left Brand Text Logo Link to Home */}
      <Link
        href="/"
        className="fixed top-4 left-4 sm:top-6 sm:left-8 z-30 flex items-center transition-transform hover:scale-105"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/text-logo.png" alt="MyStreetMenu" className="h-8 sm:h-10 w-auto object-contain drop-shadow-xs" />
      </Link>

      {/* Main Card Container */}
      <div className="w-full max-w-[440px] md:max-w-[1040px] bg-white rounded-3xl md:rounded-[2.5rem] shadow-[0_12px_36px_rgba(255,90,0,0.06)] md:shadow-[0_20px_40px_rgba(255,90,0,0.05)] flex flex-col md:flex-row overflow-hidden min-h-0 md:min-h-[640px] my-auto">

        {/* Left Side: Form Area */}
        <div className="w-full md:w-[45%] p-5 sm:p-8 md:p-14 flex flex-col justify-center relative z-10 bg-white">

          {/* ═══════════ CONFIRM EMAIL SCREEN (APPLE STYLE) ═══════════ */}
          {showConfirmScreen ? (
            <div className="space-y-5 sm:space-y-6">
              <div>
                <h1 className="text-[26px] sm:text-[36px] leading-tight font-bold text-[#1D1D1F] tracking-tight mb-2.5">
                  Check your email.
                </h1>
                <p className="text-[#86868B] text-[14px] sm:text-[16px] leading-relaxed">
                  We sent a confirmation link to{" "}
                  <span className="font-semibold text-[#1D1D1F]">{email}</span>. Click the link to complete setting up your account.
                </p>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-red-50 border border-red-200/80 text-red-600 text-[13px] sm:text-[14px] font-medium leading-relaxed">
                  {errorMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                <button
                  type="button"
                  onClick={handleResendConfirmLink}
                  disabled={isLoading}
                  className="w-full bg-[#FF5A00] hover:bg-[#E65100] active:scale-[0.98] text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-[15px] sm:text-[17px] font-semibold transition-all duration-200 shadow-md shadow-[#FF5A00]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Resend Link"
                  )}
                </button>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmScreen(false)}
                    className="text-[#86868B] hover:text-[#1D1D1F] font-medium transition-colors cursor-pointer text-[14px] sm:text-[15px]"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ═══════════ MAIN LOGIN / SIGNUP SCREEN ═══════════ */
            <>
              {/* Header */}
              <h1 className="text-[26px] sm:text-[36px] md:text-[40px] leading-tight font-bold text-[#1D1D1F] tracking-tight mb-1.5">
                {isLogin ? "Sign In" : "Create Account"}
              </h1>
              <p className="text-[#86868B] text-[14px] sm:text-[16px] md:text-[17px] mb-5 sm:mb-8">
                {isLogin
                  ? "Welcome back to MyStreetMenu."
                  : "Welcome to MyStreetMenu."}
              </p>

              {/* Error Alert */}
              {errorMsg && (
                <div className="mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-red-50 border border-red-200/80 text-red-600 text-[13px] sm:text-[14px] font-medium leading-relaxed">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* First Name & Last Name (Signup mode only) */}
                {!isLogin && (
                  <div className="flex gap-2.5 sm:gap-4">
                    <input
                      type="text"
                      name="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      required
                      className="w-1/2 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F5F5F7] border border-transparent text-[15px] sm:text-[17px] text-[#1D1D1F] focus:outline-none focus:border-[#FF5A00] focus:bg-white focus:ring-4 focus:ring-[#FF5A00]/10 transition-all duration-300 placeholder-[#86868B]"
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      required
                      className="w-1/2 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F5F5F7] border border-transparent text-[15px] sm:text-[17px] text-[#1D1D1F] focus:outline-none focus:border-[#FF5A00] focus:bg-white focus:ring-4 focus:ring-[#FF5A00]/10 transition-all duration-300 placeholder-[#86868B]"
                    />
                  </div>
                )}

                {/* Email */}
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  suppressHydrationWarning
                  className="w-full p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F5F5F7] border border-transparent text-[15px] sm:text-[17px] text-[#1D1D1F] focus:outline-none focus:border-[#FF5A00] focus:bg-white focus:ring-4 focus:ring-[#FF5A00]/10 transition-all duration-300 placeholder-[#86868B]"
                />

                {/* Password */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    minLength={6}
                    className="w-full p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F5F5F7] border border-transparent text-[15px] sm:text-[17px] text-[#1D1D1F] focus:outline-none focus:border-[#FF5A00] focus:bg-white focus:ring-4 focus:ring-[#FF5A00]/10 transition-all duration-300 placeholder-[#86868B] pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#FF5A00] transition-colors focus:outline-none p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Forgot Password Link for Login */}
                {isLogin && (
                  <div className="flex justify-end pt-0.5">
                    <Link
                      href="/forgot-password"
                      className="text-[13px] sm:text-[14px] font-medium text-[#FF5A00] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-1 sm:pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#FF5A00] hover:bg-[#E65100] active:scale-[0.98] text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-[15px] sm:text-[17px] font-semibold transition-all duration-200 shadow-md shadow-[#FF5A00]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isLogin ? (
                      "Sign In"
                    ) : (
                      "Continue"
                    )}
                  </button>
                </div>

                {/* Google Sign-In Button */}
                <div className="pt-0.5 sm:pt-1">
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isGoogleLoading}
                    className="w-full bg-[#F5F5F7] hover:bg-[#EAEAEA] active:scale-[0.98] text-[#1D1D1F] py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-[14px] sm:text-[15px] font-semibold transition-all duration-200 flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer border border-transparent hover:border-gray-300 disabled:opacity-75"
                  >
                    {isGoogleLoading ? (
                      <span className="w-5 h-5 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <GoogleIcon />
                        <span>{isLogin ? "Sign in with Google" : "Sign up with Google"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Terms & Privacy */}
                <p className="text-[12px] sm:text-[13px] text-[#86868B] mt-3 sm:mt-4 text-center leading-relaxed">
                  By proceeding, you agree to our{" "}
                  <a href="#" className="text-[#FF5A00] hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-[#FF5A00] hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </form>

              {/* Minimalist Toggle */}
              <div className="mt-5 sm:mt-8 pt-2 sm:pt-4 text-center">
                <p className="text-[14px] sm:text-[15px] text-[#86868B]">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={handleToggleMode}
                    className="text-[#FF5A00] hover:text-[#E65100] font-medium transition-colors hover:underline cursor-pointer"
                  >
                    {isLogin ? "Sign up now" : "Sign in"}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Right Side: Image Area (Hidden on mobile) */}
        <div className="hidden md:block md:w-[55%] relative min-h-full overflow-hidden bg-[#F5F5F7]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071&auto=format&fit=crop"
            alt="Premium Street Food"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </div>

      </div>
    </div>
  );
}
