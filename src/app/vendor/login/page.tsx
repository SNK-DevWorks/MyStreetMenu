"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, RotateCcw, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PendingSignup {
  email: string;
  sentAt: number; // epoch ms from Date.now()
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "msm_pending_signup";
const COOLDOWN_SECONDS = 60;
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Calculate remaining cooldown in seconds from a sentAt timestamp. */
function calcCooldown(sentAt: number): number {
  return Math.max(0, COOLDOWN_SECONDS - Math.floor((Date.now() - sentAt) / 1000));
}

/** Read and validate pending signup from sessionStorage. Returns null if absent or stale. */
function readPending(): PendingSignup | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: PendingSignup = JSON.parse(raw);
    if (!parsed.email || !parsed.sentAt) return null;
    // Treat as stale if older than 24 hours
    if (Date.now() - parsed.sentAt > STALE_THRESHOLD_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Write pending signup to sessionStorage. */
function writePending(data: PendingSignup) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage unavailable (private mode) — gracefully ignore
  }
}

/** Clear pending signup from sessionStorage. */
function clearPending() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Return a webmail quick-open URL for a given email address, or null if unknown. */
function getWebmailUrl(email: string): { label: string; url: string } | null {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (domain === "gmail.com" || domain === "googlemail.com")
    return { label: "Open Gmail", url: "https://mail.google.com" };
  if (["outlook.com", "hotmail.com", "live.com", "msn.com"].includes(domain))
    return { label: "Open Outlook", url: "https://outlook.live.com" };
  if (["yahoo.com", "yahoo.in", "ymail.com"].includes(domain))
    return { label: "Open Yahoo Mail", url: "https://mail.yahoo.com" };
  if (domain === "icloud.com" || domain === "me.com")
    return { label: "Open iCloud Mail", url: "https://www.icloud.com/mail" };
  return null;
}

// ─── Google icon ─────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

interface VendorAuthCardProps {
  initialMode?: "login" | "signup";
}

export default function VendorAuthCard({ initialMode = "login" }: VendorAuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // ── Mode ────────────────────────────────────────────────────────────────────
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsLogin(initialMode === "login");
  }, [initialMode]);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ── Pending verification state ──────────────────────────────────────────────
  // pendingSignup holds the email + sentAt timestamp; synced to sessionStorage.
  const [pendingSignup, setPendingSignup] = useState<PendingSignup | null>(null);
  const [showConfirmScreen, setShowConfirmScreen] = useState(false);
  const [isLinkExpired, setIsLinkExpired] = useState(false);

  // ── Cooldown (calculated dynamically from sentAt, not stored directly) ──────
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // ── Loading & error ─────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // ── Double-submit guard (synchronous ref — not affected by React render batching)
  const isSubmittingRef = useRef(false);

  // ── Capture intended destination at signup time ─────────────────────────────
  const pendingDestRef = useRef<string | null>(null);

  // ─── On Mount: restore pending state & handle URL error params ────────────
  useEffect(() => {
    const nextParam = searchParams.get("next");
    const errorParam = searchParams.get("error");
    const emailParam = searchParams.get("email");

    // Restore pending signup from sessionStorage (survives page refresh)
    const saved = readPending();
    if (saved) {
      setPendingSignup(saved);
      setEmail(saved.email);
      setCooldownRemaining(calcCooldown(saved.sentAt));
      setShowConfirmScreen(true);
    }

    // Handle expired verification link redirect from auth/callback
    if (errorParam === "link_expired") {
      setIsLinkExpired(true);
      setShowConfirmScreen(true);
      if (emailParam) setEmail(emailParam);
      window.history.replaceState(null, "", "/vendor/login");
    }

    // Handle generic auth failure
    if (errorParam === "auth_failed") {
      setErrorMsg("Your confirmation link has expired or is invalid. Please sign up again or request a new link.");
      window.history.replaceState(null, "", "/vendor/login");
    }

    // Check existing session — redirect if already logged in
    const checkSession = async () => {
      // [DIAG] Remove before release
      console.log('[login] checkSession', Date.now(), { nextParam });
      const { data: { session } } = await supabase.auth.getSession();
      // [DIAG] Remove before release
      console.log('[login] checkSession result', Date.now(), { hasSession: !!session?.user });
      if (session?.user) {
        const dest = getDestinationUrl(session.user, nextParam);
        // [DIAG] Remove before release
        console.log('[login] redirecting to', Date.now(), dest);
        router.replace(dest);
      }
    };
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Cooldown Countdown Interval ─────────────────────────────────────────
  useEffect(() => {
    if (!pendingSignup || cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      const remaining = calcCooldown(pendingSignup.sentAt);
      setCooldownRemaining(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [pendingSignup, cooldownRemaining]);

  // ─── Real-time session listener (user confirms email in another tab) ──────
  useEffect(() => {
    if (!showConfirmScreen) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          // Verification complete — clear pending state and redirect
          clearPending();
          setPendingSignup(null);
          const dest = pendingDestRef.current ?? getDestinationUrl(session.user, null);
          router.replace(dest);
          router.refresh();
        }
      }
    );

    // Fallback: immediate check in case session arrived before subscription set up
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        clearPending();
        setPendingSignup(null);
        const dest = pendingDestRef.current ?? getDestinationUrl(session.user, null);
        router.replace(dest);
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showConfirmScreen]);

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /** Translate raw Supabase error messages into friendly user-facing text. */
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
    if (m.includes("rate limit") || m.includes("too many requests") || m.includes("security purposes") || m.includes("email rate limit") || m.includes("429")) {
      // A 429 means a verification email was already dispatched recently.
      // Return a sentinel so callers can gracefully transition to the pending screen.
      return "__SHOW_PENDING__";
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
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };

  /** Determine post-login / post-verification destination. */
  const getDestinationUrl = (user: { user_metadata?: Record<string, unknown> }, nextParam: string | null) => {
    if (nextParam && nextParam !== "/vendor/onboarding") return nextParam;
    const isOnboarded = Boolean(
      user?.user_metadata?.onboarding_completed ||
      (user?.user_metadata?.shop_name && user?.user_metadata?.phone)
    );
    return isOnboarded ? "/vendor/dashboard" : "/vendor/onboarding";
  };

  /**
   * Activate the "Verification Pending" screen and persist state to sessionStorage.
   * Called after a successful signUp() or a graceful 429 fallback.
   */
  const activatePendingScreen = useCallback((targetEmail: string) => {
    const sentAt = Date.now();
    const pending: PendingSignup = { email: targetEmail, sentAt };
    writePending(pending);
    setPendingSignup(pending);
    setCooldownRemaining(COOLDOWN_SECONDS);
    pendingDestRef.current = "/vendor/onboarding"; // new users always start here
    setShowConfirmScreen(true);
    setIsLinkExpired(false);
    setResendMsg("A confirmation link has been sent to your email!");
    setIsLoading(false);
  }, []);

  // ── Mode toggle ────────────────────────────────────────────────────────────
  const handleToggleMode = () => {
    const nextIsLogin = !isLogin;
    setIsLogin(nextIsLogin);
    setErrorMsg("");
    setResendMsg("");
    setShowConfirmScreen(false);
    window.history.replaceState(null, "", nextIsLogin ? "/vendor/login" : "/vendor/signup");
  };

  // ── "Use another email" escape hatch ──────────────────────────────────────
  const handleUseAnotherEmail = () => {
    clearPending();
    setPendingSignup(null);
    setCooldownRemaining(0);
    setShowConfirmScreen(false);
    setIsLinkExpired(false);
    setErrorMsg("");
    setResendMsg("");
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setIsLogin(false);
    window.history.replaceState(null, "", "/vendor/signup");
  };

  // ── Login / Signup Submit Handler ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setResendMsg("");

    // Synchronous guard: drop rapid double-click / Enter-key spam before re-render
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsLoading(true);

    try {
      if (isLogin) {
        // ── Login flow ──────────────────────────────────────────────────────
        const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          setErrorMsg(translateAuthError(error.message));
          return;
        }

        // Clear any pending verification state on successful login
        clearPending();
        setPendingSignup(null);

        if (typeof window !== "undefined") sessionStorage.removeItem("msm_welcome_seen");
        const dest = getDestinationUrl(authData?.user, searchParams.get("next"));
        router.push(dest);
        router.refresh();
      } else {
        // ── Signup flow ─────────────────────────────────────────────────────
        //
        // IDEMPOTENCY RULE: If this email is already in a pending verification
        // flow, NEVER call signUp() again — just surface the pending screen.
        // The cooldown timer separately controls when resend() is allowed.
        if (pendingSignup?.email === email) {
          setShowConfirmScreen(true);
          setIsLinkExpired(false);
          return;
        }

        const fullName = `${firstName} ${lastName}`.trim();
        const origin = typeof window !== "undefined" ? window.location.origin : "";
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
          const translated = translateAuthError(error.message);
          if (translated === "__SHOW_PENDING__") {
            // 429 / rate-limit: a verification email was already dispatched.
            // Gracefully surface the pending screen instead of an error banner.
            activatePendingScreen(email);
          } else {
            setErrorMsg(translated);
          }
          return;
        }

        // Empty identities → email already exists as a confirmed account
        if (data?.user && data.user.identities && data.user.identities.length === 0) {
          setErrorMsg("An account with this email already exists. Please switch to Log In.");
          return;
        }

        if (data.user && !data.session) {
          // Unconfirmed user — email confirmation required
          activatePendingScreen(email);
          return;
        }

        // Auto-confirmed (email confirmation disabled in project settings)
        if (typeof window !== "undefined") sessionStorage.removeItem("msm_welcome_seen");
        const dest = data.user ? getDestinationUrl(data.user, null) : "/vendor/onboarding";
        router.push(dest);
        router.refresh();
      }
    } finally {
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  };

  // ── Resend Confirmation Link ──────────────────────────────────────────────
  const handleResendConfirmLink = async () => {
    if (cooldownRemaining > 0) return; // UI enforces this, but guard defensively too
    setErrorMsg("");
    setResendMsg("");
    setIsLoading(true);

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const signupNext = searchParams.get("next") || "/vendor/onboarding";
      const redirectUrl = `${origin}/auth/callback?next=${encodeURIComponent(signupNext)}`;

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: redirectUrl },
      });

      if (error) {
        const translated = translateAuthError(error.message);
        if (translated === "__SHOW_PENDING__") {
          // Still rate-limited — reset the cooldown from now so the UI stays coherent
          const sentAt = Date.now();
          const updated: PendingSignup = { email, sentAt };
          writePending(updated);
          setPendingSignup(updated);
          setCooldownRemaining(COOLDOWN_SECONDS);
          setResendMsg(`You can resend again in ${COOLDOWN_SECONDS} seconds.`);
        } else {
          setErrorMsg(translated);
        }
      } else {
        // Success — update sentAt so the 60s cooldown restarts from this moment
        const sentAt = Date.now();
        const updated: PendingSignup = { email, sentAt };
        writePending(updated);
        setPendingSignup(updated);
        setCooldownRemaining(COOLDOWN_SECONDS);
        setResendMsg("A new confirmation link has been sent to your email!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const nextParam = searchParams.get("next") || "";
    const redirectUrl = `${origin}/auth/callback${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ""}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    });
    if (error) {
      setErrorMsg(error.message);
      setIsGoogleLoading(false);
    }
  };

  // ─── Webmail quick link for the current email ─────────────────────────────
  const webmail = getWebmailUrl(email);

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen bg-[#FFF0E5] flex items-center justify-center p-4 sm:p-6 md:p-12 relative"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Top-Left Brand Text Logo */}
      <Link
        href="/"
        className="fixed top-4 left-4 sm:top-6 sm:left-8 z-30 flex items-center transition-transform hover:scale-105"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/text-logo.png" alt="MyStreetMenu" className="h-8 sm:h-10 w-auto object-contain drop-shadow-xs" />
      </Link>

      {/* Main Card */}
      <div className="w-full max-w-[440px] md:max-w-[1040px] bg-white rounded-3xl md:rounded-[2.5rem] shadow-[0_12px_36px_rgba(255,90,0,0.06)] md:shadow-[0_20px_40px_rgba(255,90,0,0.05)] flex flex-col md:flex-row overflow-hidden min-h-0 md:min-h-[640px] my-auto">

        {/* Left Side: Form Area */}
        <div className="w-full md:w-[45%] p-5 sm:p-8 md:p-14 flex flex-col justify-center relative z-10 bg-white">

          {/* ═══════════ VERIFICATION PENDING / EXPIRED LINK SCREEN ═══════════ */}
          {showConfirmScreen ? (
            <div className="space-y-5 sm:space-y-6">

              {/* Mail icon */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#FFF0E5] rounded-2xl flex items-center justify-center">
                <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-[#FF5A00]" strokeWidth={1.75} />
              </div>

              {/* Heading — differs for expired vs. pending */}
              <div>
                {isLinkExpired ? (
                  <>
                    <h1 className="text-[24px] sm:text-[32px] leading-tight font-bold text-[#1D1D1F] tracking-tight mb-2">
                      Verification link expired.
                    </h1>
                    <p className="text-[#86868B] text-[14px] sm:text-[15px] leading-relaxed">
                      Your confirmation link is no longer valid. Request a new one below or sign up with a different email address.
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-[24px] sm:text-[32px] leading-tight font-bold text-[#1D1D1F] tracking-tight mb-2">
                      Check your email.
                    </h1>
                    <p className="text-[#86868B] text-[14px] sm:text-[15px] leading-relaxed">
                      We sent a confirmation link to{" "}
                      <span className="font-semibold text-[#1D1D1F]">{email}</span>.{" "}
                      Click the link to finish setting up your account.
                    </p>
                  </>
                )}
              </div>

              {/* Error alert */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-600 text-[13px] sm:text-[14px] font-medium leading-relaxed">
                  {errorMsg}
                </div>
              )}

              {/* Resend success banner */}
              {resendMsg && !errorMsg && (
                <div className="p-3.5 rounded-xl bg-green-50 border border-green-200/80 text-green-700 text-[13px] sm:text-[14px] font-medium leading-relaxed">
                  {resendMsg}
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-3">
                {/* Open webmail — only shown when domain is recognised */}
                {webmail && (
                  <a
                    href={webmail.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#FF5A00] hover:bg-[#E65100] active:scale-[0.98] text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-[15px] sm:text-[16px] font-semibold transition-all duration-200 shadow-md shadow-[#FF5A00]/25 flex items-center justify-center gap-2"
                  >
                    {webmail.label}
                  </a>
                )}

                {/* Resend link (disabled with countdown while cooldown is active) */}
                <button
                  type="button"
                  onClick={handleResendConfirmLink}
                  disabled={isLoading || cooldownRemaining > 0}
                  className="w-full bg-[#F5F5F7] hover:bg-[#EAEAEA] active:scale-[0.98] text-[#1D1D1F] py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-[15px] sm:text-[16px] font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-[#FF5A00] border-t-transparent rounded-full animate-spin" />
                  ) : cooldownRemaining > 0 ? (
                    <span className="flex items-center gap-2 text-[#86868B]">
                      <RotateCcw size={15} />
                      Resend link in {cooldownRemaining}s
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <RotateCcw size={15} />
                      Resend link
                    </span>
                  )}
                </button>

                {/* Use another email — clears pending state and returns to form */}
                <button
                  type="button"
                  onClick={handleUseAnotherEmail}
                  className="w-full flex items-center justify-center gap-2 text-[#86868B] hover:text-[#1D1D1F] font-medium transition-colors cursor-pointer text-[14px] sm:text-[15px] py-1"
                >
                  <ArrowLeft size={14} />
                  Use another email
                </button>
              </div>

              {/* Troubleshooting guidance */}
              <div className="pt-1 border-t border-[#F5F5F7]">
                <p className="text-[12px] sm:text-[13px] text-[#86868B] font-medium mb-2">Didn&apos;t receive the email?</p>
                <ul className="text-[12px] sm:text-[13px] text-[#86868B] space-y-1 list-disc list-inside leading-relaxed">
                  <li>Check your Spam or Promotions folder.</li>
                  <li>Make sure you entered the correct email address.</li>
                  <li>Wait {COOLDOWN_SECONDS} seconds before requesting another link.</li>
                </ul>
              </div>

            </div>
          ) : (
            /* ═══════════ MAIN LOGIN / SIGNUP SCREEN ═══════════ */
            <>
              <h1 className="text-[26px] sm:text-[36px] md:text-[40px] leading-tight font-bold text-[#1D1D1F] tracking-tight mb-1.5">
                {isLogin ? "Sign In" : "Create Account"}
              </h1>
              <p className="text-[#86868B] text-[14px] sm:text-[16px] md:text-[17px] mb-5 sm:mb-8">
                {isLogin ? "Welcome back to MyStreetMenu." : "Welcome to MyStreetMenu."}
              </p>

              {/* Error alert */}
              {errorMsg && (
                <div className="mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-red-50 border border-red-200/80 text-red-600 text-[13px] sm:text-[14px] font-medium leading-relaxed">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* First Name & Last Name (signup only) */}
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

                {/* Forgot Password (login only) */}
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

                {/* Submit */}
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

                {/* Google Sign-In */}
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
                  <a href="#" className="text-[#FF5A00] hover:underline">Terms of Service</a>{" "}
                  and{" "}
                  <a href="#" className="text-[#FF5A00] hover:underline">Privacy Policy</a>.
                </p>
              </form>

              {/* Mode toggle */}
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

        {/* Right Side: Image (hidden on mobile) */}
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
