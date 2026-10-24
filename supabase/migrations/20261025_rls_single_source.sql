-- ==============================================================================
-- UNIQUE EXPRESSIONS — ROW LEVEL SECURITY: SINGLE SOURCE OF TRUTH
-- Migration File: supabase/migrations/20261025_rls_single_source.sql
--
-- WHY THIS FILE EXISTS
--   Several older SQL files (supabase_schema.sql, supabase_admin_fix.sql,
--   scripts/*.sql, 20261023_rls_and_admin_security.sql) each created their own
--   policies with different rules and different admin emails. Whichever ran last
--   won, so admin saves were blocked in some places and open to everyone in others.
--
--   This file REPLACES ALL of them. After running it, this file is the only
--   definition of who can read/write what. Do not run the older files again.
--
-- WHAT IT CHANGES
--   * Policies (rules) only. It does NOT delete, update or truncate any data rows.
--   * It removes every existing policy on the store tables and recreates one clean set.
--   * Admins are listed in ONE table: public.admin_users (add/remove admins there).
--
-- HOW TO RUN
--   Supabase Dashboard → SQL Editor → New query → paste this whole file → Run.
--   It runs inside a transaction: if any statement fails, nothing is changed.
--
-- HOW TO VERIFY AFTER RUNNING
--   select tablename, policyname, cmd from pg_policies where schemaname = 'public' order by 1, 3;
-- ==============================================================================

BEGIN;

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. ADMIN LIST (data, not hardcoded inside every policy)
--    To add an admin:    insert into public.admin_users(email) values ('new@admin.com');
--    To remove an admin: delete from public.admin_users where email = 'old@admin.com';
--    The email must match the email the person signs in with in Supabase Auth.
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_users (
  email      text PRIMARY KEY CHECK (email = lower(email)),
  created_at timestamptz DEFAULT now()
);

INSERT INTO public.admin_users (email) VALUES
  ('uestore.online@gmail.com'),
  ('uniqueexpressions.in@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- RLS on with NO policies = nobody can read or change this list through the
-- website/API. Only the SQL Editor (and the function below) can see it.
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;


-- ──────────────────────────────────────────────────────────────────────────────
-- 2. THE ONE ADMIN CHECK used by every policy and by the website's admin guard
--    * Reads the signed-in user's email from their login token (JWT).
--    * app_metadata.role = 'admin' is also accepted (only settable server-side).
--    * user_metadata is deliberately NOT trusted: customers can edit it themselves.
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.admin_users a
      WHERE a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
    OR coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_user() TO anon, authenticated;


-- ──────────────────────────────────────────────────────────────────────────────
-- 3. MAKE SURE THE SETTINGS / COUPON TABLES EXIST (no-op if they already do)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.store_settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coupons (
  id               serial PRIMARY KEY,
  code             text UNIQUE NOT NULL,
  discount_type    text NOT NULL DEFAULT 'percentage',
  discount_value   numeric NOT NULL DEFAULT 0,
  min_order_amount numeric DEFAULT 0,
  max_discount     numeric,
  expires_at       timestamptz,
  is_active        boolean DEFAULT true,
  usage_limit      integer,
  times_used       integer DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);


-- ──────────────────────────────────────────────────────────────────────────────
-- 4. REMOVE EVERY EXISTING POLICY ON THE STORE TABLES
--    (rules only — table data is untouched)
-- ──────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('products', 'categories', 'store_settings', 'coupons', 'orders',
                        'profiles', 'reviews', 'returns', 'support_tickets')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;


-- ──────────────────────────────────────────────────────────────────────────────
-- 5. RLS ON FOR EVERY STORE TABLE
-- ──────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;


-- ──────────────────────────────────────────────────────────────────────────────
-- 6. CATALOG & SITE CONTENT: everyone reads, only admins write
--    products, categories (incl. hero slides / featured collections rows),
--    store_settings, coupons
-- ──────────────────────────────────────────────────────────────────────────────
CREATE POLICY "read: everyone"  ON public.products FOR SELECT USING (true);
CREATE POLICY "insert: admin"   ON public.products FOR INSERT WITH CHECK (public.is_admin_user());
CREATE POLICY "update: admin"   ON public.products FOR UPDATE USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
CREATE POLICY "delete: admin"   ON public.products FOR DELETE USING (public.is_admin_user());

CREATE POLICY "read: everyone"  ON public.categories FOR SELECT USING (true);
CREATE POLICY "insert: admin"   ON public.categories FOR INSERT WITH CHECK (public.is_admin_user());
CREATE POLICY "update: admin"   ON public.categories FOR UPDATE USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
CREATE POLICY "delete: admin"   ON public.categories FOR DELETE USING (public.is_admin_user());

CREATE POLICY "read: everyone"  ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "insert: admin"   ON public.store_settings FOR INSERT WITH CHECK (public.is_admin_user());
CREATE POLICY "update: admin"   ON public.store_settings FOR UPDATE USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
CREATE POLICY "delete: admin"   ON public.store_settings FOR DELETE USING (public.is_admin_user());

CREATE POLICY "read: everyone"  ON public.coupons FOR SELECT USING (true);
CREATE POLICY "insert: admin"   ON public.coupons FOR INSERT WITH CHECK (public.is_admin_user());
CREATE POLICY "update: admin"   ON public.coupons FOR UPDATE USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
CREATE POLICY "delete: admin"   ON public.coupons FOR DELETE USING (public.is_admin_user());
-- Coupon usage counters at checkout go through increment_coupon_usage /
-- decrement_coupon_usage (SECURITY DEFINER), so customers never need write access.


-- ──────────────────────────────────────────────────────────────────────────────
-- 7. ORDERS
--    * Anyone can place an order (guests + checkout server).
--    * Customers read only their own orders; admins read all.
--    * Only admins change order status.
--    Stock changes go through decrement/restore_product_stock (SECURITY DEFINER).
-- ──────────────────────────────────────────────────────────────────────────────
CREATE POLICY "insert: everyone"      ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "read: owner or admin"  ON public.orders FOR SELECT USING ((auth.uid() IS NOT NULL AND user_id = auth.uid()) OR public.is_admin_user());
CREATE POLICY "update: admin"         ON public.orders FOR UPDATE USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
CREATE POLICY "delete: admin"         ON public.orders FOR DELETE USING (public.is_admin_user());


-- ──────────────────────────────────────────────────────────────────────────────
-- 8. PROFILES: each customer manages their own; admins can see/manage all
--    (role escalation is additionally blocked by trg_protect_profile_role)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE POLICY "read: owner or admin"   ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_admin_user());
CREATE POLICY "insert: owner or admin" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid() OR public.is_admin_user());
CREATE POLICY "update: owner or admin" ON public.profiles FOR UPDATE USING (id = auth.uid() OR public.is_admin_user()) WITH CHECK (id = auth.uid() OR public.is_admin_user());


-- ──────────────────────────────────────────────────────────────────────────────
-- 9. REVIEWS
--    * Everyone reads. Signed-in users post. Only admins edit/delete (moderation).
--    * "Helpful" votes go through increment_review_helpful() below, so the public
--      no longer needs UPDATE rights on reviews (previously anyone could edit any review).
-- ──────────────────────────────────────────────────────────────────────────────
CREATE POLICY "read: everyone"      ON public.reviews FOR SELECT USING (true);
CREATE POLICY "insert: signed-in"   ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "update: admin"       ON public.reviews FOR UPDATE USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());
CREATE POLICY "delete: admin"       ON public.reviews FOR DELETE USING (public.is_admin_user());

CREATE OR REPLACE FUNCTION public.increment_review_helpful(p_review_id bigint)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.reviews
     SET helpful_count = coalesce(helpful_count, 0) + 1
   WHERE id = p_review_id
  RETURNING helpful_count;
$$;

GRANT EXECUTE ON FUNCTION public.increment_review_helpful(bigint) TO anon, authenticated;


-- ──────────────────────────────────────────────────────────────────────────────
-- 10. RETURNS & SUPPORT TICKETS
--     Anyone can submit; owners read their own; admins read and resolve all.
-- ──────────────────────────────────────────────────────────────────────────────
CREATE POLICY "insert: everyone"     ON public.returns FOR INSERT WITH CHECK (true);
CREATE POLICY "read: owner or admin" ON public.returns FOR SELECT USING ((auth.uid() IS NOT NULL AND user_id = auth.uid()) OR public.is_admin_user());
CREATE POLICY "update: admin"        ON public.returns FOR UPDATE USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

CREATE POLICY "insert: everyone"     ON public.support_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "read: owner or admin" ON public.support_tickets FOR SELECT USING ((auth.uid() IS NOT NULL AND user_id = auth.uid()) OR public.is_admin_user());
CREATE POLICY "update: admin"        ON public.support_tickets FOR UPDATE USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

COMMIT;
