// scripts/generate-pwa-icons.mjs
// Run: node scripts/generate-pwa-icons.mjs
// Generates all required PWA icon sizes from public/favicon.png using sharp

import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const INPUT = join(ROOT, 'public', 'favicon.png');
const OUTPUT_DIR = join(ROOT, 'public', 'icons');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`📁 Created directory: public/icons/`);
}

console.log(`🎨 Generating PWA icons from favicon.png...\n`);

await Promise.all(
  SIZES.map(async (size) => {
    const output = join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    await sharp(INPUT)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(output);
    console.log(`  ✅ icon-${size}x${size}.png`);
  })
);

console.log(`\n✨ Done! All PWA icons generated in public/icons/`);
