'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Menu,
  X,
  Search,
  Bell,
  ExternalLink
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
  },
  {
    name: 'Vendors',
    href: '/admin/vendors',
  },
  {
    name: 'Subscriptions',
    href: '/admin/subscriptions',
  },
  {
    name: 'Settings',
    href: '/admin/settings',
  },
];

const AUTH_PATHS = ['/admin/login'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Bypass layout for auth pages
  if (AUTH_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#fdf8f3] text-gray-800 font-sans flex flex-col antialiased">
      {/* Global font override */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; margin: 0; background-color: #fdf8f3; }
      `}} />

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#fdf8f3] border-b border-gray-200/90 h-[76px] px-4 md:px-6 flex items-center justify-between w-full">
        {/* Header Left: Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-200/60 transition-colors"
            aria-label="Toggle Sidebar"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin/dashboard" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/text-logo.png" alt="MyStreetMenu" className="h-10 w-auto object-contain" />
          </Link>
        </div>

        {/* Header Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative flex items-center w-full h-[42px] rounded-xl border border-gray-200 bg-white px-3 focus-within:border-purple-600 focus-within:ring-1 focus-within:ring-purple-600 transition-all shadow-xs">
            <Search className="w-4 h-4 text-gray-400 mr-2.5" />
            <input
              type="text"
              placeholder="Search vendors, subscriptions..."
              className="w-full text-xs text-gray-800 placeholder-gray-400 outline-none bg-transparent font-medium"
            />
          </div>
        </div>

        {/* Header Right: Actions & User Info */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors border border-gray-200"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200/50 rounded-xl transition-colors">
            <Bell className="w-5 h-5" strokeWidth={1.75} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-600 rounded-full" />
          </button>

          <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
            <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              A
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-[13px] font-bold text-[#1f114a] leading-none">Admin User</span>
              <span className="text-[11px] font-medium text-gray-500 mt-0.5">super@mystreetmenu.com</span>
            </div>
          </div>
        </div>
      </header>

      {/* BODY WITH SIDEBAR & CONTENT */}
      <div className="flex-1 flex w-full">
        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* SIDEBAR (POSITIONED FLUSH LEFT) */}
        <aside
          className={`fixed lg:sticky top-[76px] z-30 h-[calc(100vh-76px)] w-56 bg-[#fdf8f3] border-r border-gray-200/90 flex flex-col justify-between p-3 transition-transform duration-200 ease-in-out lg:translate-x-0 shrink-0 ${
            mobileMenuOpen ? 'translate-x-0 bg-white' : '-translate-x-full'
          }`}
        >
          {/* Navigation Items */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-purple-100/90 text-purple-700 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                  }`}
                >
                  <span className="text-[14px]">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Bottom / Sign Out */}
          <div className="pt-3 border-t border-gray-200/90">
            <Link
              href="/admin/login"
              className="flex items-center px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <span>Sign Out</span>
            </Link>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 md:p-6 min-w-0 bg-[#fdf8f3]">
          {children}
        </main>
      </div>
    </div>
  );
}
