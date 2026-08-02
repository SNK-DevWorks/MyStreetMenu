import { type NextRequest, NextResponse } from 'next/server';
import { lt } from 'drizzle-orm';
import { db } from '@/lib/db';
import { analyticsEvents } from '../../../../../drizzle/schema/analytics-events';
import { dailyUniqueVisitors } from '../../../../../drizzle/schema/daily-unique-visitors';

/**
 * GET / POST /api/analytics/cleanup
 *
 * Deletes raw analytics events and daily_unique_visitors rows older than 30 days.
 * Aggregate tables (daily_shop_stats, daily_item_stats) are NEVER deleted —
 * they are the permanent historical record.
 *
 * Called weekly via Vercel Cron (see vercel.json).
 * Security: supports both Authorization: Bearer <CRON_SECRET> and x-cron-secret header.
 */
async function handleCleanup(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronHeader = request.headers.get('x-cron-secret');
  const cronSecret = process.env.CRON_SECRET;

  const isAuthorized =
    cronSecret &&
    (authHeader === `Bearer ${cronSecret}` || cronHeader === cronSecret);

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  try {
    // Delete raw events older than 30 days
    await db
      .delete(analyticsEvents)
      .where(lt(analyticsEvents.createdAt, cutoff));

    // Delete unique visitor records older than 30 days
    await db
      .delete(dailyUniqueVisitors)
      .where(lt(dailyUniqueVisitors.firstSeenAt, cutoff));

    return NextResponse.json({
      ok: true,
      cutoffDate: cutoff.toISOString().slice(0, 10),
      message: 'Raw analytics and unique visitor records older than 30 days cleaned up successfully.',
    });
  } catch (error) {
    console.error('[analytics/cleanup] Failed:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return handleCleanup(request);
}

export async function POST(request: NextRequest) {
  return handleCleanup(request);
}
