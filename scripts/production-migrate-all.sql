-- UNIQUE EXPRESSIONS - Safe to run even if tables/policies already exist
-- Paste this whole file in Supabase SQL Editor and click Run.

-- 1. Stock quantity on products (new column only)
alter table products add column if not exists stock_qty integer default 12;
update products set stock_qty = 12 where stock_qty is null;

-- 2. Categories table
create table if not exists categories (
  id text primary key,
  name text not null,
  description text,
  image text,
  subcategories jsonb default '[]',
  is_featured boolean default true,
  is_visible boolean default true,
  sort_order integer default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table categories enable row level security;

-- Drop old policies first (avoids policy already exists error)
drop policy if exists "Public read categories" on categories;
drop policy if exists "Public insert categories" on categories;
drop policy if exists "Public update categories" on categories;
drop policy if exists "Public delete categories" on categories;

create policy "Public read categories" on categories for select using (true);
create policy "Public insert categories" on categories for insert with check (true);
create policy "Public update categories" on categories for update using (true);
create policy "Public delete categories" on categories for delete using (true);

-- Done. You should see Success. No rows returned.
