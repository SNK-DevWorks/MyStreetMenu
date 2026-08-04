-- Migration: Add banner_image column to promotions table
-- Run this in your Supabase SQL editor or via drizzle-kit push

ALTER TABLE promotions
  ADD COLUMN IF NOT EXISTS banner_image TEXT;

COMMENT ON COLUMN promotions.banner_image IS
  'R2 object key for the optional offer banner image. e.g. shops/{shopId}/offers/{nanoid}.webp';
