'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/card';
import StatsCards from '@/features/vendor/dashboard/stats-cards';
import QuickActionsRow from '@/features/vendor/dashboard/quick-actions';
import TodaysSpecialsSection from '@/features/vendor/dashboard/todays-specials-section';
import Item from '@/components/shared/item';
import DashboardLoading from '@/app/vendor/dashboard/loading';

export default function VendorDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardLoading />;
  }

  return (
    <div className="max-w-[1536px] mx-auto px-4 md:px-8 pt-4 pb-12 flex flex-col items-center animate-in fade-in duration-200">
      <Card />
      <StatsCards />
      <QuickActionsRow />
      <TodaysSpecialsSection />
      <Item />
    </div>
  );
}
