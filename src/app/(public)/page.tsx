"use client";

import React from "react";
import Link from "next/link";
import { Play, Sparkles, ArrowRight, ChevronRight, Star } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#fafafa] font-sans overflow-x-hidden lg:overflow-hidden flex flex-col justify-between">
      {/* Header Navigation */}
      <header className="shrink-0">
        <nav className="flex items-center justify-between px-4 sm:px-8 lg:px-16 py-3 sm:py-4 max-w-[1440px] mx-auto w-full">
          <div className="flex items-center">
            <img
              src="https://res.cloudinary.com/dfledgwk1/image/upload/v1785408263/text-logo_wnsoav.png"
              alt="MyStreetMenu"
              className="h-8 sm:h-9 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
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

          <div className="flex items-center gap-3 sm:gap-6 text-sm font-medium">
            <Link
              href="/vendor/login"
              className="text-gray-600 hover:text-gray-900 transition-colors text-xs sm:text-sm font-semibold px-2 py-1"
            >
              Log in
            </Link>
            <Link
              href="/vendor/signup"
              className="bg-[#ff6b2b] text-white text-xs sm:text-sm px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:bg-[#e85a1f] transition-colors shadow-sm cursor-pointer inline-flex items-center justify-center font-bold whitespace-nowrap"
            >
              Start Free Trial
            </Link>
          </div>
        </nav>

        <div className="bg-[#f5f5f7] py-1.5 px-3 text-center text-xs sm:text-sm text-[#1d1d1f] w-full border-y border-gray-200 flex items-center justify-center gap-1 flex-wrap">
          <span>Introducing MyStreetMenu — Free for Your First 30 Days.</span>
          <Link
            href="/vendor/signup"
            className="text-[#ff6b2b] hover:underline inline-flex items-center gap-0.5 group font-semibold"
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
      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-2 sm:py-4 lg:py-6 grid lg:grid-cols-[1fr_1.15fr] gap-6 sm:gap-10 lg:gap-16 xl:gap-24 items-center relative flex-1 w-full min-h-0">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] lg:w-[800px] h-[350px] sm:h-[600px] lg:h-[800px] bg-[#fff5f0] rounded-full blur-3xl -z-10 opacity-70 pointer-events-none"></div>
        <Sparkles className="absolute top-4 left-[20%] sm:left-[45%] text-[#ff6b2b] opacity-40 w-4 sm:w-5 h-4 sm:h-5 -z-10" />
        <Sparkles className="absolute bottom-12 right-[15%] sm:left-[40%] text-[#ff6b2b] opacity-40 w-3 sm:w-4 h-3 sm:h-4 -z-10" />

        <div className="order-2 lg:order-1 flex flex-col gap-4 sm:gap-6 relative z-20 -mt-16 sm:-mt-24 lg:mt-0 justify-center text-left">
          {/* Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-[1.15] tracking-tight drop-shadow-sm">
            Everything Your Food Business Needs,{" "}
            <span className="text-[#ff6b2b] block sm:inline">One Smart Menu Away.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-xl leading-relaxed font-normal">
            Create a beautiful QR menu, update your menu anytime, promote today's
            specials, and track customer insights—all from one simple dashboard.
          </p>

          <div className="flex flex-row items-center gap-2.5 sm:gap-4 mt-0.5 sm:mt-1">
            <Link
              href="/vendor/signup"
              className="flex-1 sm:flex-none bg-[#ff6b2b] text-white px-4 sm:px-7 py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-base hover:bg-[#e85a1f] transition-all shadow-[0_8px_20px_-6px_rgba(255,107,43,0.5)] flex items-center justify-center gap-1.5 sm:gap-2 group cursor-pointer text-center whitespace-nowrap"
            >
              <span>Start Free Trial</span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform shrink-0"
              />
            </Link>
            <Link
              href="/vendor/login"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2.5 text-gray-700 font-semibold hover:text-gray-900 transition-colors group cursor-pointer py-2.5 sm:py-0 border sm:border-0 border-gray-200 rounded-xl sm:rounded-none bg-white sm:bg-transparent text-xs sm:text-sm whitespace-nowrap"
            >
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-white shadow-xs sm:shadow-md flex items-center justify-center group-hover:shadow-lg transition-shadow border border-gray-100 text-[#ff6b2b] shrink-0">
                <Play size={13} className="fill-current ml-0.5" />
              </div>
              <span className="text-xs sm:text-sm">See how it works</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 mt-0.5 sm:mt-1 lg:mt-3 pt-2 sm:pt-3 lg:pt-5 border-t border-gray-100 text-xs sm:text-sm font-semibold text-gray-500">
            <Star size={15} className="text-[#ff6b2b] fill-[#ff6b2b] shrink-0" />
            <span>Trusted by restaurants, cafés & food vendors</span>
          </div>
        </div>

        {/* Hero Image Container */}
        <div className="order-1 lg:order-2 relative z-10 w-full h-[320px] sm:h-[480px] md:h-[560px] lg:h-[680px] xl:h-[740px] flex items-center justify-center lg:justify-end mt-0 lg:mt-0">
          {/* Abstract orange background circle */}
          <div className="absolute -right-8 lg:-right-12 top-1/2 -translate-y-1/2 w-[340px] h-[340px] md:w-[520px] md:h-[520px] lg:w-[640px] lg:h-[640px] xl:w-[720px] xl:h-[720px] bg-gradient-to-tr from-[#ffe5d9] to-[#fff5f0] rounded-full -z-10 hidden lg:block"></div>

          <img
            src="https://res.cloudinary.com/dfledgwk1/image/upload/v1785741599/roothero_szkc68.png"
            alt="MyStreetMenu App Presentation"
            className="w-full max-w-full lg:max-w-none lg:w-[125%] h-full object-contain drop-shadow-xl lg:drop-shadow-2xl translate-x-0 lg:translate-x-12 xl:translate-x-20 scale-110 sm:scale-100 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        </div>
      </main>

      {/* Text-only Bottom Footer */}
      <footer className="shrink-0 py-2 sm:py-2.5 px-3 sm:px-8 lg:px-16 border-t border-gray-200/80 bg-[#fafafa] z-20">
        <div className="max-w-[1440px] mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-0.5 sm:gap-2 text-center sm:text-left text-[10px] sm:text-xs text-gray-500">
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


