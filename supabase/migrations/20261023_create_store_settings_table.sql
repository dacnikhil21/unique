-- ==============================================================================
-- UNIQUE EXPRESSIONS — CREATE STORE SETTINGS TABLE & RLS POLICIES
-- Migration File: supabase/migrations/20261023_create_store_settings_table.sql
-- Date: 2026-10-23
--
-- How to review and run:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/sfcxpvvqxldhdkvfyhgj
-- 2. Navigate to "SQL Editor".
-- 3. Click "New Query", paste this script, and click "Run".
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.store_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Seed default settings if table is empty
INSERT INTO public.store_settings (key, value)
VALUES
  ('storeName', '"UNIQUE EXPRESSIONS"'::jsonb),
  ('ownerName', '"G MOUNIKA DURGA"'::jsonb),
  ('phone', '"7799747575"'::jsonb),
  ('whatsapp', '"7799747575"'::jsonb),
  ('gstin', '"37BVTPG7761F1Z1"'::jsonb),
  ('email', '"uniqueexpressions.in@gmail.com"'::jsonb),
  ('freeShippingMin', '499'::jsonb),
  ('shippingFee', '50'::jsonb),
  ('giftWrapFee', '30'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

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

-- Policies: Public can read settings; only admins can modify
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
