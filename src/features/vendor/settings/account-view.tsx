'use client';

import React, { useState } from 'react';
import type { VendorUser } from './use-vendor-user';

interface AccountViewProps {
  user: VendorUser | null;
  loading?: boolean;
}

export const AccountView: React.FC<AccountViewProps> = ({ user, loading }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Pre-fill once user data arrives
  React.useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setEmail(user.email ?? '');
    }
  }, [user]);

  const isGoogleUser = !!(user?.avatarUrl);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative bg-white">
      <div className="max-w-2xl mx-auto space-y-7">

        {/* Personal Details */}
        <div className="space-y-5">
          <h3 className="text-[16px] font-bold text-[#1a1a1a]">Personal Details</h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-gray-700">Full Name</label>
            {loading ? (
              <div className="h-10 rounded-lg bg-gray-200 animate-pulse" />
            ) : (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-800 text-[14px] placeholder:text-gray-400 placeholder:opacity-100 focus:outline-none focus:border-[#f67412] focus:ring-2 focus:ring-[#f67412]/20 transition-all bg-[#fdf8f3] focus:bg-white"
              />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-gray-700">Email Address</label>
            {loading ? (
              <div className="h-10 rounded-lg bg-gray-200 animate-pulse" />
            ) : (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                readOnly={isGoogleUser}
                title={isGoogleUser ? 'Email is managed by your Google account' : undefined}
                className={`w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-800 text-[14px] placeholder:text-gray-400 placeholder:opacity-100 focus:outline-none transition-all ${
                  isGoogleUser
                    ? 'bg-gray-100 cursor-not-allowed text-gray-500'
                    : 'bg-[#fdf8f3] focus:border-[#f67412] focus:ring-2 focus:ring-[#f67412]/20 focus:bg-white'
                }`}
              />
            )}
            {isGoogleUser && (
              <p className="text-[12px] text-gray-400 mt-1">
                Email is managed by your Google account and cannot be changed here.
              </p>
            )}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Change Password — hidden for Google OAuth users */}
        {isGoogleUser ? (
          <div className="p-5 bg-[#fdf8f3] border border-orange-200/60 rounded-xl">
            <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-1">Password</h3>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              You signed in with Google. Password management is handled by your Google account. To change it, visit your{' '}
              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#f67412] hover:underline font-semibold"
              >
                Google Account Security
              </a>{' '}
              settings.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <h3 className="text-[16px] font-bold text-[#1a1a1a]">Change Password</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700">Current Password</label>
              <input
                type="password"
                placeholder="Enter your current password"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-800 text-[14px] placeholder:text-gray-400 placeholder:opacity-100 focus:outline-none focus:border-[#f67412] focus:ring-2 focus:ring-[#f67412]/20 transition-all bg-[#fdf8f3] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-800 text-[14px] placeholder:text-gray-400 placeholder:opacity-100 focus:outline-none focus:border-[#f67412] focus:ring-2 focus:ring-[#f67412]/20 transition-all bg-[#fdf8f3] focus:bg-white"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-800 text-[14px] placeholder:text-gray-400 placeholder:opacity-100 focus:outline-none focus:border-[#f67412] focus:ring-2 focus:ring-[#f67412]/20 transition-all bg-[#fdf8f3] focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Update Button */}
        <div className="pt-6 pb-8">
          <button className="w-full bg-[#f67412] text-white font-bold py-3.5 rounded-xl hover:bg-[#d96610] active:scale-[0.99] transition-all shadow-md">
            Update Account Details
          </button>
        </div>
      </div>
    </div>
  );
};
