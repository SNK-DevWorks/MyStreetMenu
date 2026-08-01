import { type NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { shops } from '@/../drizzle/schema/shops';
import { publishService } from '@/services';


/**
 * POST /api/publish/shop/[shopId]
 *
 * Admin-only endpoint to manually trigger a republish for a specific shop.
 * Useful after toggling isActive, debugging a stale public menu, or
 * backfilling shops after deploying the publish system for the first time.
 *
 * Security: requires a valid CRON_SECRET bearer token.
 * (Full admin auth check can be swapped in once you have a server-side session helper.)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> },
) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { shopId } = await params;
  if (!shopId) {
    return NextResponse.json({ error: 'Missing shopId' }, { status: 400 });
  }

  // ── Verify shop exists ───────────────────────────────────────────────────
  const [shop] = await db.select().from(shops).where(eq(shops.id, shopId));
  if (!shop) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
  }

  // ── Publish ──────────────────────────────────────────────────────────────
  try {
    await publishService.publishMenu(shopId);
    return NextResponse.json({
      success: true,
      shopId,
      shopName: shop.name,
      publishedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Publish failed' },
      { status: 500 },
    );
  }
}
