'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BurgerCardTemplate from '@/features/vendor/qr/card-template/burger-card-template';
import BurgerPosterTemplate from '@/features/vendor/qr/poster/custom-poster';

function QrContent() {
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab');

    const [publicMenuUrl, setPublicMenuUrl] = useState(() => {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/menu/my-street-menu-demo`;
        }
        return 'http://localhost:3000/menu/my-street-menu-demo';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPublicMenuUrl(`${window.location.origin}/menu/my-street-menu-demo`);
        }
    }, []);

    return (
        <div
            className="w-full flex flex-col items-start md:ml-28 lg:ml-44 justify-start py-2 mt-1 min-h-[calc(100vh-200px)]"
            style={{ animation: 'qrFadeIn .25s ease both' }}
        >
            {tab === 'poster' ? (
                <BurgerPosterTemplate
                    vendorName="Vendor Name"
                    vendorAddress="Vendor Address"
                    publicMenuUrl={publicMenuUrl}
                    accentColor="#f77512"
                />
            ) : (
                <BurgerCardTemplate
                    vendorName="Vendor Name"
                    vendorAddress="Vendor Address"
                    publicMenuUrl={publicMenuUrl}
                    accentColor="#f77512"
                />
            )}

            <style>{`
        @keyframes qrFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}

export default function QrSection() {
    return (
        <Suspense fallback={null}>
            <QrContent />
        </Suspense>
    );
}
