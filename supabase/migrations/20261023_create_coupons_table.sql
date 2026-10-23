-- ==============================================================================
-- UNIQUE EXPRESSIONS — CREATE COUPONS TABLE & RLS POLICIES
-- Migration File: supabase/migrations/20261023_create_coupons_table.sql
-- Date: 2026-10-23
--
-- How to review and run:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/sfcxpvvqxldhdkvfyhgj
-- 2. Navigate to "SQL Editor".
-- 3. Click "New Query", paste this script, and click "Run".
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.coupons (
  id serial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'percent', 'fixed', 'shipping')),
  discount_value numeric NOT NULL CHECK (discount_value >= 0),
  min_order_amount numeric DEFAULT 0 CHECK (min_order_amount >= 0),
  max_discount numeric,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  usage_limit integer,
  times_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed initial store coupons if empty
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount, is_active)
VALUES
  ('WELCOME100', 'fixed', 100, 499, true),
  ('FREESHIP', 'shipping', 0, 499, true),
  ('FESTIVE20', 'percentage', 20, 999, true),
  ('UNIQUE10', 'percentage', 10, 399, true)
ON CONFLICT (code) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

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

-- Policies
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
