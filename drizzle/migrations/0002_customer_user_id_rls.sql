-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: Add customer_user_id + Enable RLS on orders
--
-- Run this in your Supabase SQL Editor or via your migration tool.
--
-- What this does:
--   1. Adds customer_user_id (nullable UUID) referencing auth.users
--   2. Enables Row Level Security on public.orders
--   3. Creates customer SELECT policy (anonymous session, own orders only)
--   4. Creates vendor SELECT policy (authenticated, own shop orders only)
--   5. Creates vendor UPDATE policy (authenticated, own shop orders only)
--
-- Security design:
--   - Customers use Supabase Anonymous Auth (is_anonymous = true)
--   - Vendors use normal Supabase Auth (is_anonymous = false)
--   - The is_anonymous JWT claim (documented by Supabase) prevents cross-role access
--   - Vendor shop ownership verified via shops.user_id = auth.uid()
--     (matches actual schema: shops.user_id → users.id)
-- ──────────────────────────────────────────────────────────────────────────────

-- 1. Add customer_user_id column
--    Nullable: preserves all existing orders (legacy compatibility).
--    New orders require a non-null value — enforced in order.service.ts.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_user_id UUID
  REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. Customer SELECT policy
--    Anonymous customers can only read their own orders.
--    Uses auth.uid() (their anonymous user UUID) matched against customer_user_id.
--    The is_anonymous claim ensures permanent vendor accounts cannot use this policy.
DROP POLICY IF EXISTS "customers_view_own_orders" ON public.orders;
CREATE POLICY "customers_view_own_orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    customer_user_id = auth.uid()
    AND (auth.jwt() ->> 'is_anonymous')::boolean = true
  );

-- 4. Vendor SELECT policy
--    Authenticated (non-anonymous) vendors can read orders for their own shop.
--    shop_id is matched against shops owned by the vendor (shops.user_id = auth.uid()).
DROP POLICY IF EXISTS "vendors_view_shop_orders" ON public.orders;
CREATE POLICY "vendors_view_shop_orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    shop_id IN (
      SELECT id FROM public.shops
      WHERE user_id = auth.uid()
    )
    AND (auth.jwt() ->> 'is_anonymous')::boolean = false
  );

-- 5. Vendor UPDATE policy
--    Vendors can update status only for orders in their own shop.
DROP POLICY IF EXISTS "vendors_update_shop_orders" ON public.orders;
CREATE POLICY "vendors_update_shop_orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (
    shop_id IN (
      SELECT id FROM public.shops
      WHERE user_id = auth.uid()
    )
    AND (auth.jwt() ->> 'is_anonymous')::boolean = false
  );

-- ── Notes ─────────────────────────────────────────────────────────────────────
-- Service-role key (used in server actions via Drizzle) bypasses RLS by default.
-- The Drizzle DB client uses the service-role key → it can INSERT/SELECT freely.
-- RLS applies to the Supabase JS client (anon key) used for:
--   a) Realtime subscriptions (customer channel)
--   b) Any direct Supabase client queries on the public menu page
-- This is the intended split: server actions use service-role, browser uses anon.
