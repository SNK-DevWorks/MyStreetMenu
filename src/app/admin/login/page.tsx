"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login — replace with real auth
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    router.replace('/admin/dashboard');
  }

  return (
    <div className="auth-root">
      {/* Background */}
      <div className="auth-bg">
        <div className="auth-blob blob-purple-1" />
        <div className="auth-blob blob-purple-2" />
      </div>

      {/* Back button */}
      <Link href="/" className="back-link">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M14 9H4M4 9l4-4M4 9l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Home
      </Link>

      <main className="auth-main">
        {/* Card */}
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-badge admin-badge">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3a3 3 0 100 6 3 3 0 000-6Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="15.5" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.2" />
                <path d="M15.5 4v3M14 5.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Admin Portal
            </div>
            <h1 className="auth-title">Admin Access</h1>
            <p className="auth-subtitle">Secure sign-in for platform administrators</p>
          </div>

          {/* Security notice */}
          <div className="security-notice">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L3 4v4c0 3 2.5 5.5 5 6 2.5-.5 5-3 5-6V4L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M5.5 8l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Restricted access — authorized personnel only</span>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="field-group">
              <label htmlFor="admin-email" className="field-label">Admin email</label>
              <div className="field-wrapper">
                <div className="field-icon">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M2 7l7 4 7-4" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <input
                  id="admin-email"
                  type="email"
                  className="field-input"
                  placeholder="admin@mystreetmenu.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="field-group">
              <div className="field-label-row">
                <label htmlFor="admin-password" className="field-label">Password</label>
                <Link href="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>
              <div className="field-wrapper">
                <div className="field-icon">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="4" y="8" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="9" cy="11.5" r="1" fill="currentColor" />
                  </svg>
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  className="field-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M2 9C3.5 5.5 6.5 3 9 3s5.5 2.5 7 6c-1.5 3.5-4.5 6-7 6S3.5 12.5 2 9Z" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M3 3l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M2 9C3.5 5.5 6.5 3 9 3s5.5 2.5 7 6c-1.5 3.5-4.5 6-7 6S3.5 12.5 2 9Z" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="remember-row" htmlFor="admin-remember">
              <input id="admin-remember" type="checkbox" className="remember-checkbox" />
              <span className="remember-label">Keep me signed in</span>
            </label>

            {/* Submit */}
            <button
              id="admin-login-btn"
              type="submit"
              className="submit-btn admin-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner" />
              ) : (
                <>
                  Sign in to Admin Portal
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M4 9h10M10 5l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p className="footer-text">
              Having trouble? Contact{" "}
              <a href="mailto:support@mystreetmenu.com" className="support-link">
                support@mystreetmenu.com
              </a>
            </p>
          </div>
        </div>
      </main>

      <style>{`
        .auth-root {
          min-height: 100vh;
          background: #0d0d14;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'Geist Sans', 'Inter', sans-serif;
          padding: 40px 20px;
        }

        .auth-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .auth-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.3;
        }
        .blob-purple-1 {
          width: 450px; height: 450px;
          background: radial-gradient(circle, #8b5cf6, #6d28d9);
          top: -160px; right: -100px;
          animation: slowPulse 6s ease-in-out infinite;
        }
        .blob-purple-2 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, #06b6d4, #8b5cf6);
          bottom: -100px; left: -80px;
          animation: slowPulse 6s ease-in-out infinite reverse;
        }
        @keyframes slowPulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.4; }
        }

        .back-link {
          position: fixed;
          top: 24px;
          left: 24px;
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.5);
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
          z-index: 20;
        }
        .back-link:hover { color: rgba(255,255,255,0.9); }

        .auth-main {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
        }

        .auth-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 40px;
          backdrop-filter: blur(16px);
          box-shadow: 0 24px 80px rgba(0,0,0,0.4);
        }

        .auth-header {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .auth-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          width: fit-content;
          margin-bottom: 4px;
        }
        .admin-badge {
          background: rgba(139,92,246,0.15);
          color: #a78bfa;
          border: 1px solid rgba(139,92,246,0.25);
        }

        .auth-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: white;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .auth-subtitle {
          color: rgba(255,255,255,0.45);
          margin: 0;
          font-size: 0.95rem;
        }

        .security-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          background: rgba(139,92,246,0.08);
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 10px;
          color: #a78bfa;
          font-size: 0.8rem;
          font-weight: 500;
          margin-bottom: 24px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .field-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .field-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255,255,255,0.7);
        }
        .forgot-link {
          font-size: 0.8rem;
          color: #a78bfa;
          text-decoration: none;
          transition: color 0.2s;
        }
        .forgot-link:hover { color: #c4b5fd; }

        .field-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .field-icon {
          position: absolute;
          left: 14px;
          color: rgba(255,255,255,0.3);
          display: flex;
          pointer-events: none;
        }
        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 13px 14px 13px 44px;
          color: white;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.25); }
        .field-input:focus {
          border-color: #8b5cf6;
          background: rgba(139,92,246,0.06);
        }
        .toggle-password {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.3);
          display: flex;
          padding: 0;
          transition: color 0.2s;
        }
        .toggle-password:hover { color: rgba(255,255,255,0.7); }

        .remember-row {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .remember-checkbox {
          width: 16px;
          height: 16px;
          accent-color: #8b5cf6;
          cursor: pointer;
        }
        .remember-label {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.5);
        }

        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 15px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: filter 0.2s, transform 0.15s;
          width: 100%;
          margin-top: 4px;
        }
        .submit-btn:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .admin-submit {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          box-shadow: 0 4px 24px rgba(139,92,246,0.4);
        }

        .spinner {
          width: 20px; height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-footer {
          margin-top: 24px;
          text-align: center;
        }
        .footer-text {
          font-size: 0.825rem;
          color: rgba(255,255,255,0.35);
          margin: 0;
        }
        .support-link {
          color: #a78bfa;
          text-decoration: none;
        }
        .support-link:hover { color: #c4b5fd; }

        @media (max-width: 480px) {
          .auth-card { padding: 28px 24px; }
        }
      `}</style>
    </div>
  );
}
