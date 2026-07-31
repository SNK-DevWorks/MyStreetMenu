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
      }
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <DashboardLoading />;
  }

  return (
    <div className="max-w-[1536px] mx-auto px-4 md:px-8 pt-4 pb-12 flex flex-col items-center animate-in fade-in duration-200">
      <Card
        title={vendorName ? `Welcome back, ${vendorName}!` : "Manage Your Food Business"}
        subtitle="Manage your menu and track today's performance."
      />
      <StatsCards />
      <QuickActionsRow />
      <TodaysSpecialsSection />
      <Item items={[]} />
    </div>
  );
}

