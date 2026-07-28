import { db } from '@/lib/db';

async function seed() {
  console.log('Seeding database...');
  // Add database seed logic here
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
