'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/card';
import StatsCards from '@/features/vendor/dashboard/stats-cards';
import QuickActionsRow from '@/features/vendor/dashboard/quick-actions';
import TodaysSpecialsSection from '@/features/vendor/dashboard/todays-specials-section';
import Item from '@/components/shared/item';
import DashboardLoading from '@/app/vendor/dashboard/loading';
import { createClient } from '@/lib/supabase/client';

export default function VendorDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [vendorName, setVendorName] = useState('');
  const [showWelcomeCard, setShowWelcomeCard] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name =
          user.user_metadata?.shop_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          '';
        setVendorName(name);

        // Check if welcome card has already been seen in this session
        const hasSeenWelcome = sessionStorage.getItem('msm_welcome_seen');
        if (!hasSeenWelcome) {
          setShowWelcomeCard(true);

          // Auto-hide card smoothly after 15 seconds
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              setShowWelcomeCard(false);
              sessionStorage.setItem('msm_welcome_seen', 'true');
            }, 500);
          }, 15000);
        }
      }
      setIsLoading(false);
    });
  }, []);

  const handleDismissWelcome = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setShowWelcomeCard(false);
      sessionStorage.setItem('msm_welcome_seen', 'true');
    }, 500);
  };

  if (isLoading) {
    return <DashboardLoading />;
  }

  return (
    <div className="max-w-[1536px] mx-auto px-4 md:px-8 pt-4 pb-12 flex flex-col items-center animate-in fade-in duration-200">
      
      {/* Welcome Card — Only visible on login/signup for 15 seconds */}
      {showWelcomeCard && (
        <div
          className={`w-full flex justify-center transition-all duration-500 ease-in-out ${
            isFadingOut
              ? 'opacity-0 max-h-0 -translate-y-4 overflow-hidden mb-0'
              : 'opacity-100 max-h-[400px] translate-y-0 mb-2'
          }`}
        >
          <Card
            title={vendorName ? `Welcome back, ${vendorName}!` : 'Manage Your Food Business'}
            subtitle="Manage your menu and track today's performance."
            onClose={handleDismissWelcome}
          />
        </div>
      )}

      <StatsCards />
      <QuickActionsRow />
      <TodaysSpecialsSection className="mt-24 sm:mt-32" />
      <Item items={[]} />
    </div>
  );
}
