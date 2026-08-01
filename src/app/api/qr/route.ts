import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services';
import { shopRepository } from '@/repositories';

/**
 * GET /api/qr?slug={slug}
 *
 * QR codes on printed materials point here instead of directly to /menu/{slug}.
 * We record a qr_scan event server-side (100% reliable — no JS, no adblockers)
 * then immediately 302 redirect to the public menu page.
 *
 * Fire-and-forget: the redirect is returned immediately; analytics write is
 * awaited but if it fails we still redirect (never block a customer).
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Shop slug parameter is required' }, { status: 400 });
  }

  // Record qr_scan server-side — fire-and-forget wrapped in try/catch
  // so a DB hiccup never blocks the customer redirect
  try {
    const shop = await shopRepository.findBySlug(slug);
    if (shop) {
      void analyticsService.trackEvent({
        shopId: shop.id,
        eventType: 'qr_scan',
        sessionId: null,
        metadata: {
          occurredAt: new Date().toISOString(),
          source: 'qr_redirect',
        },
      });
    }
  } catch {
    // Analytics failure must never block the redirect
  }

  // 302 redirect to the public menu page
  const menuUrl = new URL(`/menu/${slug}`, request.url);
  return NextResponse.redirect(menuUrl);
}
