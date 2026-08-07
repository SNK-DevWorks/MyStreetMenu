import { db } from '@/lib/db';
import { shopTokenCounters } from '../../../drizzle/schema/shop-token-counters';
import { sql } from 'drizzle-orm';

/**
 * Generates a daily sequential token for an order (e.g. "A01", "A02"...).
 *
 * Race-condition safe via PostgreSQL atomic UPSERT:
 *   INSERT … ON CONFLICT DO UPDATE SET counter = counter + 1
 *
 * Two simultaneous orders on the same shop will always get
 * different counters — no application-level locks needed.
 *
 * Tokens reset to A01 at midnight (keyed by date).
 */
export async function generateToken(shopId: string): Promise<string> {
  const today = new Date().toISOString().slice(0, 10); // "2026-08-07"

  const [row] = await db
    .insert(shopTokenCounters)
    .values({ shopId, date: today, counter: 1 })
    .onConflictDoUpdate({
      target: [shopTokenCounters.shopId, shopTokenCounters.date],
      set: {
        counter: sql`${shopTokenCounters.counter} + 1`,
      },
    })
    .returning({ counter: shopTokenCounters.counter });

  const num = String(row.counter).padStart(2, '0'); // "01", "02" ... "99"
  return `A${num}`;                                  // "A01", "A02" ... "A99"
}
