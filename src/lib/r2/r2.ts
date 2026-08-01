import { S3Client } from '@aws-sdk/client-s3';

let _client: S3Client | null = null;

/**
 * Returns a lazily-initialized singleton S3Client for Cloudflare R2.
 *
 * R2_ENDPOINT must be the S3 API endpoint:
 *   https://<ACCOUNT_ID>.r2.cloudflarestorage.com
 *
 * NOT the public CDN URL (https://pub-xxx.r2.dev).
 * NOT a custom domain (https://cdn.mystreetmenu.com).
 * Those are for serving objects — this endpoint is for the S3 API.
 */
export function getR2Client(): S3Client {
  if (_client) return _client;

  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Missing R2 credentials. Required: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY',
    );
  }

  _client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return _client;
}

export function getR2Bucket(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error('Missing R2_BUCKET_NAME environment variable.');
  return bucket;
}
