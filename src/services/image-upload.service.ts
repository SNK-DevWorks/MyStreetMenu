import type { Sharp } from 'sharp';
import sharp from 'sharp';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import { getR2Client, getR2Bucket } from '@/lib/r2/r2';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_OUTPUT_SIZE_BYTES = 250 * 1024;     // 250 KB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

// ─── Image Type Configs ───────────────────────────────────────────────────────

const IMAGE_CONFIGS = {
  menu:  { width: 800,  height: 1000, folder: 'menu'   },
  logo:  { width: 400,  height: 400,  folder: 'logo'   },
  cover: { width: 1600, height: 900,  folder: 'cover'  },
  offer: { width: 800,  height: 400,  folder: 'offers' },
} as const;

export type ImageType = keyof typeof IMAGE_CONFIGS;
export type OutputFormat = 'webp' | 'avif';

// ─── Processing Pipeline ─────────────────────────────────────────────────────

async function compressWithGradualReduction(
  image: Sharp,
  format: OutputFormat,
  startQuality: number = 82,
): Promise<Buffer> {
  const qualities = [82, 80, 78, 76, 74, 72] as const;
  // Start from the closest quality at or below startQuality
  const startIdx = qualities.findIndex((q) => q <= startQuality);
  const qualityLevels = startIdx >= 0 ? qualities.slice(startIdx) : qualities;

  for (const quality of qualityLevels) {
    const buffer =
      format === 'avif'
        ? await image.clone().avif({ quality }).toBuffer()
        : await image.clone().webp({ quality }).toBuffer();

    if (buffer.byteLength <= MAX_OUTPUT_SIZE_BYTES) {
      return buffer;
    }
  }

  // Use minimum quality as last resort
  return format === 'avif'
    ? image.clone().avif({ quality: 72 }).toBuffer()
    : image.clone().webp({ quality: 72 }).toBuffer();
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const imageUploadService = {
  /**
   * Full pipeline: validate → resize → compress → upload to R2.
   * Returns the R2 object key to store in the database.
   */
  async processAndUploadImage(
    buffer: Buffer,
    mimeType: string,
    shopId: string,
    imageType: ImageType = 'menu',
    format: OutputFormat = 'webp',
  ): Promise<{ key: string }> {
    // 1. Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new Error(`Invalid file type: ${mimeType}. Allowed: JPEG, PNG, WebP, AVIF.`);
    }

    // 2. Validate raw file size
    if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
      throw new Error('File too large. Maximum size is 5 MB.');
    }

    const config = IMAGE_CONFIGS[imageType];

    // 3. Sharp pipeline
    const pipeline = sharp(buffer)
      .rotate() // auto-rotate from EXIF
      .resize(config.width, config.height, {
        fit: 'cover',
        position: 'entropy', // entropy-first
        withoutEnlargement: true,
      })
      .withMetadata(); // strip all metadata

    // 4. Gradual quality reduction until < 250 KB
    let outputBuffer: Buffer;
    try {
      outputBuffer = await compressWithGradualReduction(pipeline, format);
    } catch {
      // Fallback: attention-based crop if entropy fails
      const fallbackPipeline = sharp(buffer)
        .rotate()
        .resize(config.width, config.height, {
          fit: 'cover',
          position: 'attention',
          withoutEnlargement: true,
        })
        .withMetadata();
      outputBuffer = await compressWithGradualReduction(fallbackPipeline, format);
    }

    // 5. Generate unique filename with nanoid
    const ext = format === 'avif' ? 'avif' : 'webp';
    const filename = `${nanoid()}.${ext}`;
    const key = `shops/${shopId}/${config.folder}/${filename}`;

    // 6. Upload to R2
    const client = getR2Client();
    const bucket = getR2Bucket();

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: outputBuffer,
        ContentType: `image/${ext}`,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    return { key };
  },

  /**
   * Delete an image from R2 by its object key.
   * Safe to call with null/undefined — no-ops cleanly.
   */
  async deleteImage(key: string | null | undefined): Promise<void> {
    if (!key) return;

    try {
      const client = getR2Client();
      const bucket = getR2Bucket();

      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );
    } catch (error) {
      // Log but don't throw — deletion failures shouldn't block the main flow
      console.error('[imageUploadService] Failed to delete image from R2:', key, error);
    }
  },
};
