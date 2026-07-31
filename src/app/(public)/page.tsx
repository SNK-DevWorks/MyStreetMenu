"use client";

import React from "react";
import Link from "next/link";
import { Play, Sparkles, ArrowRight, ChevronRight, Star } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen w-screen bg-[#fafafa] font-sans overflow-x-hidden flex flex-col justify-between">
      {/* Header Navigation */}
      <header className="shrink-0">
        <nav className="flex items-center justify-between px-8 sm:px-12 lg:px-16 py-5 max-w-[1440px] mx-auto w-full">
          <div className="flex items-center">
            <img
              src="https://res.cloudinary.com/dfledgwk1/image/upload/v1785408263/text-logo_wnsoav.png"
              alt="MyStreetMenu"
              className="h-9 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#demo" className="hover:text-gray-900 transition-colors">
              Demo
            </a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="/vendor/login"
              className="text-gray-600 hover:text-gray-900 transition-colors hidden sm:block font-medium"
            >
              Log in
            </Link>
            <Link
              href="/vendor/signup"
              className="bg-[#ff6b2b] text-white px-5 py-2.5 rounded-lg hover:bg-[#e85a1f] transition-colors shadow-sm cursor-pointer inline-flex items-center justify-center font-medium"
            >
              Start Free Trial
            </Link>
          </div>
        </nav>

        <div className="bg-[#f5f5f7] py-2.5 text-center text-sm text-[#1d1d1f] w-full border-y border-gray-200">
          Introducing MyStreetMenu — Free for Your First 30 Days.{" "}
          <Link
            href="/vendor/signup"
            className="text-[#ff6b2b] hover:underline inline-flex items-center gap-0.5 group font-medium"
          >
            Claim{" "}
            <ChevronRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform mt-0.5"
            />
          </Link>
        </div>
      </header>

      {/* Main Hero Content */}
      <main className="max-w-[1440px] mx-auto px-8 sm:px-12 lg:px-16 py-6 lg:py-10 grid lg:grid-cols-[1fr_1.15fr] gap-12 lg:gap-16 xl:gap-24 items-center relative flex-1 w-full min-h-0">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#fff5f0] rounded-full blur-3xl -z-10 opacity-70 pointer-events-none"></div>
        <Sparkles className="absolute top-12 left-[45%] text-[#ff6b2b] opacity-40 w-5 h-5 -z-10" />
        <Sparkles className="absolute bottom-20 left-[40%] text-[#ff6b2b] opacity-40 w-4 h-4 -z-10" />

        <div className="flex flex-col gap-5 lg:gap-6 relative z-10 justify-center">
          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.2] tracking-tight">
            Everything Your Food Business Needs,
            <br className="hidden sm:inline" />{" "}
            <span className="text-[#ff6b2b]">One Smart Menu Away.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed">
            Create a beautiful QR menu, update your menu anytime, promote today's
            specials, and track customer insights—all from one simple dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5 mt-2">
            <Link
              href="/vendor/signup"
              className="w-full sm:w-auto bg-[#ff6b2b] text-white px-7 py-3.5 rounded-xl font-semibold text-base sm:text-lg hover:bg-[#e85a1f] transition-all shadow-[0_8px_20px_-6px_rgba(255,107,43,0.5)] flex items-center justify-center gap-2 group cursor-pointer"
            >
              Start Free Trial
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/vendor/login"
              className="w-full sm:w-auto flex items-center justify-center gap-3 text-gray-700 font-medium hover:text-gray-900 transition-colors group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center group-hover:shadow-lg transition-shadow border border-gray-100 text-[#ff6b2b]">
                <Play size={18} className="fill-current ml-1" />
              </div>
              See how it works
            </Link>
          </div>

          <div className="flex items-center gap-2 mt-2 lg:mt-4 pt-4 lg:pt-6 border-t border-gray-100 text-sm font-medium text-gray-500">
            <Star size={16} className="text-[#ff6b2b] fill-[#ff6b2b] shrink-0" />
            <span>Trusted by restaurants, cafés & food vendors</span>
          </div>
        </div>

        <div className="relative z-10 w-full h-[450px] sm:h-[550px] lg:h-[650px] xl:h-[700px] flex items-center justify-center lg:justify-end mt-4 lg:mt-0">
          {/* Abstract orange background circle for the image */}
          <div className="absolute -right-8 lg:-right-12 top-1/2 -translate-y-1/2 w-[420px] h-[420px] md:w-[520px] md:h-[520px] lg:w-[620px] lg:h-[620px] xl:w-[680px] xl:h-[680px] bg-gradient-to-tr from-[#ffe5d9] to-[#fff5f0] rounded-full -z-10 hidden lg:block"></div>

          <img
            src="https://res.cloudinary.com/dfledgwk1/image/upload/v1785408237/Untitled_-_30_July_2026_at_11.16.23_anvkkz.png"
            alt="MyStreetMenu App Presentation"
            className="w-full max-w-[850px] lg:max-w-none lg:w-[125%] max-h-full h-auto object-contain drop-shadow-2xl translate-x-0 lg:translate-x-16 xl:translate-x-24 lg:scale-110 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        </div>
      </main>

      {/* Text-only Bottom Footer */}
      <footer className="shrink-0 py-4 px-8 sm:px-12 lg:px-16 border-t border-gray-200/80 bg-[#fafafa] z-20">
        <div className="max-w-[1440px] mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-gray-500">
          <div>© 2026 MyStreetMenu. All rights reserved.</div>
          <div>
            Copyright by{" "}
            <a
              href="https://snkdevworks.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#ff6b2b] hover:underline"
            >
              snkdevworks.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}


