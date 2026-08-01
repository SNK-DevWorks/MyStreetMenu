/**
 * One-time migration script: publish all existing public+active shops to R2.
 *
 * Run once after deploying the Publish Service to seed the CDN with all
 * existing vendors' menus. Safe to run multiple times — each run simply
 * overwrites the previous file.
 *
 * Usage:
 *   npx tsx scripts/publish-all-menus.ts
 *
 * Requires environment variables from .env.local (loaded automatically by tsx
 * if you have dotenv configured, otherwise set them in your shell).
 */

import fs from 'fs';
import path from 'path';

// Load .env.local if present
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envConfig = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { shops } from '../drizzle/schema/shops';
import { publishService } from '../src/services/publish.service';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || '',
  ssl: process.env.DATABASE_URL?.includes('localhost')
    ? false
    : { rejectUnauthorized: false },
});

const db = drizzle(pool, { schema: { shops } });

async function main() {
  console.log('🚀 Starting bulk publish for all public+active shops...\n');

  const activeShops = await db
    .select({ id: shops.id, name: shops.name, slug: shops.slug })
    .from(shops)
    .where(
      and(
        eq(shops.menuVisibility, 'public'),
        eq(shops.isActive, true),
      ),
    );

  console.log(`Found ${activeShops.length} shops to publish.\n`);

  let published = 0;
  let failed = 0;

  for (const shop of activeShops) {
    try {
      process.stdout.write(`  Publishing "${shop.name}" (${shop.slug})... `);
      await publishService.publishMenu(shop.id);
      process.stdout.write('✓\n');
      published++;
    } catch (error) {
      process.stdout.write('✗ FAILED\n');
      console.error(`    Error: ${error instanceof Error ? error.message : error}`);
      failed++;
    }
  }

  console.log(`\n──────────────────────────────────────`);
  console.log(`✓ Published: ${published}`);
  if (failed > 0) {
    console.log(`✗ Failed:    ${failed}`);
    console.log(`  Check server logs above for details.`);
  }
  console.log(`──────────────────────────────────────\n`);

  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
