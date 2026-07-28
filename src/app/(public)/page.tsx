"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="home-root">
      {/* Animated background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <main className="home-main">
        {/* Logo / Brand */}
        <div className="brand">
          <div className="brand-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="url(#brandGrad)" />
              <path
                d="M10 14h20M10 20h20M10 26h12"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="brandGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f97316" />
                  <stop offset="1" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="brand-name">MyStreetMenu</span>
        </div>

        {/* Hero Text */}
        <div className="hero-text">
          <h1 className="hero-title">
            Welcome to <span className="gradient-text">MyStreetMenu</span>
          </h1>
          <p className="hero-sub">
            Your digital menu platform — choose your portal to get started
          </p>
        </div>

        {/* Portal Cards */}
        <div className="portal-grid">
          {/* Vendor Card */}
          <Link href="/vendor/login" className="portal-card vendor-card">
            <div className="card-glow vendor-glow" />
            <div className="card-icon vendor-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="rgba(249,115,22,0.15)" />
                <path d="M14 20h20l-2 12H16L14 20Z" stroke="#f97316" strokeWidth="2" strokeLinejoin="round" />
                <path d="M10 20h28" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
                <path d="M17 20l2-6h10l2 6" stroke="#f97316" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="19" cy="35" r="1.5" fill="#f97316" />
                <circle cx="29" cy="35" r="1.5" fill="#f97316" />
              </svg>
            </div>
            <h2 className="card-title">Vendor Portal</h2>
            <p className="card-desc">
              Manage your menu, orders, promotions and QR codes for your street food stall or restaurant
            </p>
            <div className="card-btn vendor-btn">
              <span>Login as Vendor</span>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 9h10M10 5l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>

          {/* Admin Card */}
          <Link href="/admin/login" className="portal-card admin-card">
            <div className="card-glow admin-glow" />
            <div className="card-icon admin-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="rgba(139,92,246,0.15)" />
                <path d="M24 14a4 4 0 100 8 4 4 0 000-8Z" stroke="#8b5cf6" strokeWidth="2" />
                <path d="M14 34c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
                <circle cx="33" cy="18" r="3" fill="rgba(139,92,246,0.3)" stroke="#8b5cf6" strokeWidth="1.5" />
                <path d="M33 15v6M30 18h6" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="card-title">Admin Portal</h2>
            <p className="card-desc">
              Oversee all vendors, manage subscriptions, view analytics and control platform settings
            </p>
            <div className="card-btn admin-btn">
              <span>Login as Admin</span>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 9h10M10 5l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
        </div>

        <p className="footer-note">© 2026 MyStreetMenu · Built for street food vendors</p>
      </main>

      <style>{`
        .home-root {
          min-height: 100vh;
          background: #0d0d14;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'Geist Sans', 'Inter', sans-serif;
        }

        /* Animated blobs */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
          animation: blobFloat 8s ease-in-out infinite;
        }
        .blob-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #f97316, #ec4899);
          top: -150px; left: -100px;
          animation-delay: 0s;
        }
        .blob-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #8b5cf6, #06b6d4);
          bottom: -120px; right: -80px;
          animation-delay: -3s;
        }
        .blob-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #10b981, #3b82f6);
          top: 50%; left: 55%;
          animation-delay: -6s;
        }
        @keyframes blobFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }

        /* Main */
        .home-main {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
          padding: 40px 20px;
          max-width: 900px;
          width: 100%;
        }

        /* Brand */
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .brand-name {
          font-size: 1.4rem;
          font-weight: 700;
          color: white;
          letter-spacing: -0.02em;
        }

        /* Hero */
        .hero-text {
          text-align: center;
        }
        .hero-title {
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 800;
          color: white;
          letter-spacing: -0.03em;
          margin: 0 0 12px;
          line-height: 1.15;
        }
        .gradient-text {
          background: linear-gradient(135deg, #f97316, #ec4899, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.55);
          margin: 0;
        }

        /* Portal Grid */
        .portal-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          width: 100%;
        }

        /* Cards */
        .portal-card {
          position: relative;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-decoration: none;
          overflow: hidden;
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          backdrop-filter: blur(12px);
        }
        .portal-card:hover {
          transform: translateY(-6px);
        }
        .vendor-card:hover {
          border-color: rgba(249,115,22,0.4);
          box-shadow: 0 20px 60px rgba(249,115,22,0.15);
        }
        .admin-card:hover {
          border-color: rgba(139,92,246,0.4);
          box-shadow: 0 20px 60px rgba(139,92,246,0.15);
        }

        /* Glow effect */
        .card-glow {
          position: absolute;
          width: 200px; height: 200px;
          border-radius: 50%;
          top: -80px; right: -60px;
          filter: blur(50px);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .portal-card:hover .card-glow { opacity: 0.3; }
        .vendor-glow { background: #f97316; }
        .admin-glow { background: #8b5cf6; }

        .card-icon { width: 48px; height: 48px; }

        .card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .card-desc {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.5);
          line-height: 1.6;
          margin: 0;
          flex: 1;
        }

        /* Buttons */
        .card-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 20px;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          width: fit-content;
          transition: gap 0.2s ease, filter 0.2s ease;
          margin-top: 8px;
        }
        .portal-card:hover .card-btn { gap: 12px; }

        .vendor-btn {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          box-shadow: 0 4px 20px rgba(249,115,22,0.35);
        }
        .vendor-btn:hover { filter: brightness(1.1); }

        .admin-btn {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          box-shadow: 0 4px 20px rgba(139,92,246,0.35);
        }
        .admin-btn:hover { filter: brightness(1.1); }

        /* Footer */
        .footer-note {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.25);
          margin: 0;
        }

        @media (max-width: 640px) {
          .portal-grid { grid-template-columns: 1fr; }
          .portal-card { padding: 28px 24px; }
        }
      `}</style>
    </div>
  );
}
