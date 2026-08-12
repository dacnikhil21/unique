-- ================================================================
-- ADMIN ACCESS FIX — Run this in Supabase SQL Editor
-- Allows the admin account to read ALL data while
-- keeping customer data private from other users
-- ================================================================

-- ── PROFILES: admin reads all, users read own ──────────────────
drop policy if exists "Users read own profile" on profiles;
drop policy if exists "Admin read all profiles" on profiles;
create policy "Users read own profile" on profiles for select
  using (
    id = auth.uid()
    OR (auth.jwt() ->> 'email') = 'uestore.online@gmail.com'
  );

-- ── ORDERS: admin reads all, users read own ────────────────────
drop policy if exists "Users read own orders" on orders;
drop policy if exists "Admin read all orders" on orders;
create policy "Users read own orders" on orders for select
  using (
    user_id = auth.uid()
    OR (auth.jwt() ->> 'email') = 'uestore.online@gmail.com'
  );

-- Admin can update order status
drop policy if exists "Admin update orders" on orders;
create policy "Admin update orders" on orders for update
  using ((auth.jwt() ->> 'email') = 'uestore.online@gmail.com');

-- ── RETURNS: admin reads all, users read own ───────────────────
drop policy if exists "Users read own returns" on returns;
drop policy if exists "Admin read all returns" on returns;
create policy "Users read own returns" on returns for select
  using (
    user_id = auth.uid()
    OR (auth.jwt() ->> 'email') = 'uestore.online@gmail.com'
  );

-- ── TICKETS: admin reads all, users read own ───────────────────
drop policy if exists "Users read own tickets" on support_tickets;
drop policy if exists "Admin read all tickets" on support_tickets;
create policy "Users read own tickets" on support_tickets for select
  using (
    user_id = auth.uid()
    OR (auth.jwt() ->> 'email') = 'uestore.online@gmail.com'
  );

-- ── PRODUCTS: admin can insert/update/delete ───────────────────
drop policy if exists "Admin insert products" on products;
drop policy if exists "Admin update products" on products;
drop policy if exists "Admin delete products" on products;
create policy "Admin insert products" on products for insert
  with check ((auth.jwt() ->> 'email') = 'uestore.online@gmail.com');
create policy "Admin update products" on products for update
  using ((auth.jwt() ->> 'email') = 'uestore.online@gmail.com');
create policy "Admin delete products" on products for delete
  using ((auth.jwt() ->> 'email') = 'uestore.online@gmail.com');

-- ── CATEGORIES: admin can insert/update/delete ─────────────────
drop policy if exists "Admin insert categories" on categories;
drop policy if exists "Admin update categories" on categories;
drop policy if exists "Admin delete categories" on categories;
create policy "Admin insert categories" on categories for insert
  with check ((auth.jwt() ->> 'email') = 'uestore.online@gmail.com');
create policy "Admin update categories" on categories for update
  using ((auth.jwt() ->> 'email') = 'uestore.online@gmail.com');
create policy "Admin delete categories" on categories for delete
  using ((auth.jwt() ->> 'email') = 'uestore.online@gmail.com');

-- ── DONE ───────────────────────────────────────────────────────
-- Admin (uestore.online@gmail.com) can now read all customers,
-- orders, tickets, returns and manage products/categories.
-- Regular customers can only see their own data.
-- ================================================================
