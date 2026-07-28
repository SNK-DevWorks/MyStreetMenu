'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TodaysSpecialsSection from '@/features/vendor/dashboard/todays-specials-section';
import OffersSection from '@/features/vendor/promotions/offers-section';
import AnnouncementsSection from '@/features/vendor/promotions/announcements-section';
import PromotionsLoading from '@/app/vendor/promotions/loading';

function PromotionsPageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [tab]);

  if (isLoading) {
    return <PromotionsLoading />;
  }

  if (tab === 'offers') {
    return <OffersSection />;
  }

  if (tab === 'announcements') {
    return <AnnouncementsSection />;
  }

  return (
    <div className="animate-in fade-in duration-200">
      <TodaysSpecialsSection />
    </div>
  );
}

export default function VendorPromotionsPage() {
  return (
    <Suspense fallback={<PromotionsLoading />}>
      <PromotionsPageContent />
    </Suspense>
  );
}

