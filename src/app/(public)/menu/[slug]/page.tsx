import { notFound } from 'next/navigation';
import { shopRepository } from '@/repositories';
import { AnalyticsProvider } from '@/providers/analytics-provider';
import PublicMenuView from '@/components/public/public-menu-view';
import { publishedMenuAdapter } from '@/lib/adapters/published-menu-adapter';
import type { PublishedMenu } from '@/services/publish.service';

export default async function MenuSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // One cheap DB read — slug is indexed, just need the shopId
  const shop = await shopRepository.findBySlug(slug);
  if (!shop) return notFound();

  // Fetch published menu JSON from Cloudflare CDN
  // CDN JSON is the source of truth for public availability — no publishStatus check needed
  const cdnUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/published/menus/${shop.id}.json`;
  const res = await fetch(cdnUrl, {
    // 5-minute Next.js ISR cache — vendor menu changes already trigger a publish,
    // so the CDN JSON is always fresh. This cache is just a safety net.
    next: { revalidate: 300 },
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
      />
    </AnalyticsProvider>
  );
}
