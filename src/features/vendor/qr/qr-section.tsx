'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import BurgerCardTemplate from '@/features/vendor/qr/card-template/burger-card-template';
import BurgerPosterTemplate from '@/features/vendor/qr/poster/custom-poster';
import QrLoading from '@/app/vendor/qr/loading';
import { useVendor } from '@/context/vendor-context';

function QrContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const tab = searchParams.get('tab');

  const { vendorName, publicMenuUrl, loading } = useVendor();

  const isOnQrPage = pathname.startsWith('/vendor/qr');
  if (!isOnQrPage) return null;

  if (loading) {
    return <QrLoading />;
  }

  return (
    <div
      className="w-full flex flex-col items-start md:ml-28 lg:ml-44 justify-start py-2 mt-1 min-h-[calc(100vh-200px)]"
      style={{ animation: 'qrFadeIn .2s ease both' }}
    >
      {tab === 'poster' ? (
        <BurgerPosterTemplate
          vendorName={vendorName}
          publicMenuUrl={publicMenuUrl}
          accentColor="#f77512"
        />
      ) : (
        <BurgerCardTemplate
          vendorName={vendorName}
          publicMenuUrl={publicMenuUrl}
          accentColor="#f77512"
        />
      )}

      <style>{`
        @keyframes qrFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function QrSection() {
  return (
    <Suspense fallback={<QrLoading />}>
      <QrContent />
    </Suspense>
  );
}
