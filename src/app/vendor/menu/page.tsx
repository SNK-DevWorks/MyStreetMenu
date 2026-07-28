'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MenuManagement from '@/features/vendor/menu/menu-management';
import MenuPreview from '@/features/vendor/menu/menu-preview';
import MenuLoading from '@/app/vendor/menu/loading';

function MenuPageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  if (tab === 'preview') {
    return <MenuPreview />;
  }

  return <MenuManagement />;
}

export default function VendorMenuPage() {
  return (
    <Suspense fallback={<MenuLoading />}>
      <MenuPageContent />
    </Suspense>
  );
}
