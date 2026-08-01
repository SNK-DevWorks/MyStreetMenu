import { type NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { shops } from '../../../../../drizzle/schema/shops';
import { publishService } from '@/services';

/**
 * GET /api/publish/cron
 *
 * Republishes all active + public shops in sequence.
 * Called once daily by an external scheduler (Vercel Cron, Cloudflare Workers Cron, etc.)
 * to flush time-sensitive data: isTodaysSpecial items and promotions with endDate.
 *
 * Security: requires Authorization: Bearer <CRON_SECRET>
 *
 * Vercel Cron setup (vercel.json):
 * {
 *   "crons": [{ "path": "/api/publish/cron", "schedule": "0 18 * * *" }]
 * }
 * (0 18 UTC = midnight IST)
 */
export async function GET(request: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Fetch all public + active shops ───────────────────────────────────────
  const activeShops = await db
    .select({ id: shops.id, name: shops.name })
    .from(shops)
    .where(
      and(
        eq(shops.menuVisibility, 'public'),
        eq(shops.isActive, true),
      ),
    );

  let published = 0;
  let errors = 0;
  const failedShops: string[] = [];

  // ── Publish each shop sequentially to avoid overwhelming R2 ──────────────
  for (const shop of activeShops) {
    try {
      await publishService.publishMenu(shop.id);
      published++;
    } catch {
      errors++;
      failedShops.push(shop.id);
      // Continue — one failure should not halt the entire cron run
    }
  }

  console.info(`[cron] Publish complete: ${published} succeeded, ${errors} failed`);

  return NextResponse.json({
    success: true,
    total: activeShops.length,
    published,
    errors,
    failedShops: failedShops.length > 0 ? failedShops : undefined,
    ranAt: new Date().toISOString(),
  });
}
