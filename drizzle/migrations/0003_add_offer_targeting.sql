-- Migration: Add offer targeting, discount, priority, and schedule columns to promotions
-- Run this against your Supabase / PostgreSQL database

ALTER TABLE promotions
  ADD COLUMN IF NOT EXISTS offer_type     TEXT,
  ADD COLUMN IF NOT EXISTS offer_value    NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS target_type    TEXT DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS target_ids     TEXT[],
  ADD COLUMN IF NOT EXISTS priority       INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS start_date     DATE,
  ADD COLUMN IF NOT EXISTS end_date       DATE,
  ADD COLUMN IF NOT EXISTS start_time     TIME,
  ADD COLUMN IF NOT EXISTS end_time       TIME;

-- Remove the old timestamp columns that were replaced by DATE + TIME
-- (safe to drop since they had no data constraints, and new columns cover the same purpose)
ALTER TABLE promotions
  DROP COLUMN IF EXISTS start_date_old,
  DROP COLUMN IF EXISTS end_date_old;

-- Optional: index on (shop_id, is_active, end_date) to speed up active offer lookups
CREATE INDEX IF NOT EXISTS idx_promotions_shop_active
  ON promotions (shop_id, is_active, end_date);
