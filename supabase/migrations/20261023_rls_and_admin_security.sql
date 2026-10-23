-- ==============================================================================
-- UNIQUE EXPRESSIONS — DATABASE SECURITY & ROW LEVEL SECURITY (RLS) MIGRATION
-- Migration File: supabase/migrations/20261023_rls_and_admin_security.sql
-- Date: 2026-10-23
--
-- This script hardens all database tables with strict Row-Level Security (RLS)
-- and PostgreSQL triggers to protect against client-side privilege escalation.
--
-- DO NOT RUN AUTOMATICALLY ON PRODUCTION WITHOUT PRIOR REVIEW.
-- How to review and run:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/sfcxpvvqxldhdkvfyhgj
-- 2. Navigate to "SQL Editor" on the left menu.
-- 3. Click "New Query", paste the entire contents of this file, and click "Run".
-- ==============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. HELPER: Admin Identity Check Function
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean AS $$
BEGIN
  RETURN (
    (auth.jwt() ->> 'email') IN ('uestore.online@gmail.com', 'uniqueexpressions.in@gmail.com')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- ──────────────────────────────────────────────────────────────────────────────
-- 2. SCHEMA EXPANSION: Coupons & Store Settings Tables
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coupons (
  id serial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  min_order_amount numeric DEFAULT 0 CHECK (min_order_amount >= 0),
  max_discount numeric,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  usage_limit integer,
  times_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.store_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Ensure profiles table has role column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'customer';


-- ──────────────────────────────────────────────────────────────────────────────
-- 3. SECURITY TRIGGER: Prevent Customer Role Escalation on Profiles
-- ──────────────────────────────────────────────────────────────────────────────
-- Customers can update their own name, phone, city, address, but CANNOT elevate their role to admin.
CREATE OR REPLACE FUNCTION public.check_profile_role_protection()
RETURNS trigger AS $$
BEGIN
  IF (NEW.role IS DISTINCT FROM OLD.role) THEN
    IF NOT public.is_admin_user() THEN
      RAISE EXCEPTION 'Unauthorized: Only store administrators can modify profile roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_role_protection();

-- On INSERT, enforce that non-admins cannot set their role to anything other than 'customer'
CREATE OR REPLACE FUNCTION public.check_profile_insert_role_protection()
RETURNS trigger AS $$
BEGIN
  IF (NEW.role IS NOT NULL AND NEW.role != 'customer') THEN
    IF NOT public.is_admin_user() THEN
      NEW.role := 'customer';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_insert_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_insert_role
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_insert_role_protection();


-- ──────────────────────────────────────────────────────────────────────────────
-- 4. ENABLE RLS ON ALL TABLES
-- ──────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;


-- ──────────────────────────────────────────────────────────────────────────────
-- 5. RLS POLICIES: PRODUCTS
-- Public can browse; only Admin can insert, update, or delete.
-- ──────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "Public insert products" ON public.products;
DROP POLICY IF EXISTS "Public update products" ON public.products;
DROP POLICY IF EXISTS "Public delete products" ON public.products;
DROP POLICY IF EXISTS "Admin insert products" ON public.products;
DROP POLICY IF EXISTS "Admin update products" ON public.products;
DROP POLICY IF EXISTS "Admin delete products" ON public.products;

CREATE POLICY "Public read products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Admin insert products" ON public.products
  FOR INSERT WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin update products" ON public.products
  FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "Admin delete products" ON public.products
  FOR DELETE USING (public.is_admin_user());


-- ──────────────────────────────────────────────────────────────────────────────
-- 6. RLS POLICIES: CATEGORIES
-- Public can browse; only Admin can insert, update, or delete.
-- ──────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
DROP POLICY IF EXISTS "Public insert categories" ON public.categories;
DROP POLICY IF EXISTS "Public update categories" ON public.categories;
DROP POLICY IF EXISTS "Public delete categories" ON public.categories;
DROP POLICY IF EXISTS "Admin insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admin update categories" ON public.categories;
DROP POLICY IF EXISTS "Admin delete categories" ON public.categories;

CREATE POLICY "Public read categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admin insert categories" ON public.categories
  FOR INSERT WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin update categories" ON public.categories
  FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "Admin delete categories" ON public.categories
  FOR DELETE USING (public.is_admin_user());


-- ──────────────────────────────────────────────────────────────────────────────
-- 7. RLS POLICIES: STORE SETTINGS
-- Public can view storefront settings; only Admin can mutate.
-- ──────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Admin insert store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Admin update store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Admin delete store settings" ON public.store_settings;

CREATE POLICY "Public read store settings" ON public.store_settings
  FOR SELECT USING (true);

CREATE POLICY "Admin insert store settings" ON public.store_settings
  FOR INSERT WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin update store settings" ON public.store_settings
  FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "Admin delete store settings" ON public.store_settings
  FOR DELETE USING (public.is_admin_user());


-- ──────────────────────────────────────────────────────────────────────────────
-- 8. RLS POLICIES: COUPONS
-- Public/storefront can query active coupons to apply discounts; Admin can manage all.
-- ──────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admin insert coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admin update coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admin delete coupons" ON public.coupons;

CREATE POLICY "Public read coupons" ON public.coupons
  FOR SELECT USING (true);

CREATE POLICY "Admin insert coupons" ON public.coupons
  FOR INSERT WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin update coupons" ON public.coupons
  FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "Admin delete coupons" ON public.coupons
  FOR DELETE USING (public.is_admin_user());


-- ──────────────────────────────────────────────────────────────────────────────
-- 9. RLS POLICIES: ORDERS
-- Customers/Guests can create orders.
-- Customers can view only their own orders (user_id = auth.uid()).
-- Admin can view and update all orders.
-- ──────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Users insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users read own orders" ON public.orders;
DROP POLICY IF EXISTS "Admin read all orders" ON public.orders;
DROP POLICY IF EXISTS "Admin update orders" ON public.orders;

CREATE POLICY "Anyone can insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users and admin read orders" ON public.orders
  FOR SELECT USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR public.is_admin_user()
  );

CREATE POLICY "Admin update orders" ON public.orders
  FOR UPDATE USING (public.is_admin_user());


-- ──────────────────────────────────────────────────────────────────────────────
-- 10. RLS POLICIES: PROFILES
-- Users manage only their own profile; Admin can view all customer profiles.
-- ──────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin update all profiles" ON public.profiles;

CREATE POLICY "Users and admin read profiles" ON public.profiles
  FOR SELECT USING (
    id = auth.uid()
    OR public.is_admin_user()
  );

CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid() OR public.is_admin_user());

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid() OR public.is_admin_user());


-- ──────────────────────────────────────────────────────────────────────────────
-- 11. RLS POLICIES: RETURNS & SUPPORT TICKETS
-- Users manage own tickets/returns; Admin can inspect and resolve all.
-- ──────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users insert own returns" ON public.returns;
DROP POLICY IF EXISTS "Users and admin read returns" ON public.returns;
DROP POLICY IF EXISTS "Admin update returns" ON public.returns;

CREATE POLICY "Users insert own returns" ON public.returns
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users and admin read returns" ON public.returns
  FOR SELECT USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR public.is_admin_user()
  );

CREATE POLICY "Admin update returns" ON public.returns
  FOR UPDATE USING (public.is_admin_user());

DROP POLICY IF EXISTS "Users insert own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users and admin read tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admin update tickets" ON public.support_tickets;

CREATE POLICY "Users insert own tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users and admin read tickets" ON public.support_tickets
  FOR SELECT USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR public.is_admin_user()
  );

CREATE POLICY "Admin update tickets" ON public.support_tickets
  FOR UPDATE USING (public.is_admin_user());
