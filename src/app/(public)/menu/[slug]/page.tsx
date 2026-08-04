import { notFound } from 'next/navigation';
import { shopRepository } from '@/repositories';
import { AnalyticsProvider } from '@/providers/analytics-provider';
import PublicMenuView from '@/components/public/public-menu-view';
import { publishedMenuAdapter } from '@/lib/adapters/published-menu-adapter';
import type { PublishedMenu } from '@/services/publish.service';

export const revalidate = 0;

export default async function MenuSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // One cheap DB read — slug is indexed, just need the shopId
  const shop = await shopRepository.findBySlug(slug);
  if (!shop) return notFound();

  // Fetch published menu JSON from Cloudflare CDN with cache disabled for real-time updates
  const cdnUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/published/menus/${shop.id}.json`;
  const res = await fetch(cdnUrl, {
    cache: 'no-store',
  });

  if (!res.ok) return notFound();

  const raw: PublishedMenu = await res.json();
  const viewModel = publishedMenuAdapter(raw);

  return (
    <AnalyticsProvider
      shopId={shop.id}
      menuVersion={viewModel.menuVersion}
      publishedAt={viewModel.publishedAt}
    >
      <PublicMenuView
        vendorName={viewModel.vendorName}
        vendorAddress={viewModel.vendorAddress}
        phone={viewModel.phone}
        whatsapp={viewModel.whatsapp}
        mapUrl={viewModel.mapUrl}
        items={viewModel.items}
        categories={viewModel.categories}
        offers={viewModel.offers}
        announcements={viewModel.announcements}
      />
    </AnalyticsProvider>
  );
}
