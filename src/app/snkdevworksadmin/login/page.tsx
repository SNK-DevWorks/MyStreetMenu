"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      // Check if user has admin role
      const user = data?.user;
      const isAdmin =
        user?.role === 'admin' ||
        user?.user_metadata?.role === 'admin' ||
        user?.app_metadata?.role === 'admin';

      if (!isAdmin) {
        // Sign out if non-admin attempts admin login
        await supabase.auth.signOut();
        setErrorMsg("Access denied. Authorized admin personnel only.");
        setIsLoading(false);
        return;
      }

      router.replace('/admin/dashboard');
      router.refresh();
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#08080a] text-zinc-100 flex flex-col items-center justify-center p-4 relative font-sans antialiased selection:bg-zinc-800 selection:text-white">
      
      {/* Top subtle ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-gradient-to-b from-zinc-800/20 via-zinc-900/5 to-transparent blur-3xl pointer-events-none" />

      {/* Back to Home Link */}
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      <main className="w-full max-w-[380px] relative z-10">
        
        {/* Card */}
        <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
          
          {/* Subtle top edge glow */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-700/60 to-transparent" />

          {/* Header */}
          <div className="flex flex-col items-start gap-1 mb-6">
            <h1 className="text-lg font-semibold text-white tracking-tight">Admin Access</h1>
            <p className="text-xs text-zinc-400">Sign in to manage MyStreetMenu</p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="block text-xs font-medium text-zinc-300">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                placeholder="admin@mystreetmenu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900/70 border border-zinc-800 focus:border-zinc-600 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none transition-all"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="block text-xs font-medium text-zinc-300">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900/70 border border-zinc-800 focus:border-zinc-600 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none transition-all"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 disabled:opacity-40 text-black rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 mt-4 shadow-xs active:scale-[0.99]"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

        </div>

      </main>

    </div>
  );
}
