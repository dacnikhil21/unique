-- ================================================================
-- UNIQUE EXPRESSIONS — SUPABASE DATABASE SCHEMA
-- Run this ONCE in your Supabase SQL Editor
-- Project: sfcxpvvqxldhdkvfyhgj
-- ================================================================

-- 1. PRODUCTS TABLE
create table if not exists products (
  id serial primary key,
  title text not null,
  category text not null,
  image text,
  price integer not null,
  original_price integer,
  discount integer default 0,
  rating decimal(3,1) default 4.5,
  reviews_count integer default 0,
  description text,
  in_stock boolean default true,
  stock_qty integer default 12,
  created_at timestamptz default now()
);

-- 2. ORDERS TABLE
create table if not exists orders (
  id serial primary key,
  order_id text unique not null,
  customer_name text,
  phone text,
  address text,
  items jsonb not null,
  total_amount integer,
  subtotal integer,
  discount_amount integer default 0,
  shipping_fee integer default 0,
  status text default 'Order Confirmed',
  step_index integer default 0,
  payment_method text,
  gstin text default '37BVTPG7761F1Z1',
  created_at timestamptz default now()
);

-- 3. REVIEWS TABLE
create table if not exists reviews (
  id bigint primary key,
  product_id integer,
  product_title text,
  category text,
  user_name text,
  city text,
  rating integer check (rating between 1 and 5),
  title text,
  comment text,
  verified boolean default true,
  helpful_count integer default 0,
  created_at timestamptz default now()
);

-- 4. RETURNS TABLE
create table if not exists returns (
  id serial primary key,
  return_id text unique not null,
  order_id text,
  status text default 'Requested - Under Review',
  item_title text,
  reason text,
  resolution text,
  amount integer,
  created_at timestamptz default now()
);

-- 5. SUPPORT TICKETS TABLE
create table if not exists support_tickets (
  id serial primary key,
  ticket_id text unique not null,
  category text,
  subject text,
  message text,
  status text default 'Open - In Progress',
  created_at timestamptz default now()
);

-- 6. CATEGORIES TABLE
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

-- ================================================================
-- ROW LEVEL SECURITY — Enable RLS on all tables
-- ================================================================
alter table products enable row level security;
alter table orders enable row level security;
alter table reviews enable row level security;
alter table returns enable row level security;
alter table support_tickets enable row level security;
alter table categories enable row level security;

-- ================================================================
-- RLS POLICIES — Allow anonymous access (no login required)
-- ================================================================

-- Products: public read only
drop policy if exists "Public read products" on products;
create policy "Public read products"
  on products for select using (true);

-- Products: admin CRUD (anon key — no auth layer yet)
drop policy if exists "Public insert products" on products;
drop policy if exists "Public update products" on products;
drop policy if exists "Public delete products" on products;
create policy "Public insert products"
  on products for insert with check (true);
create policy "Public update products"
  on products for update using (true);
create policy "Public delete products"
  on products for delete using (true);

-- Orders: anyone can insert + read (no auth for now)
drop policy if exists "Public insert orders" on orders;
drop policy if exists "Public read orders" on orders;
drop policy if exists "Public update orders" on orders;
create policy "Public insert orders"
  on orders for insert with check (true);
create policy "Public read orders"
  on orders for select using (true);
create policy "Public update orders"
  on orders for update using (true);

-- Reviews: anyone can read, insert, update helpful count
drop policy if exists "Public read reviews" on reviews;
drop policy if exists "Public insert reviews" on reviews;
drop policy if exists "Public update reviews" on reviews;
create policy "Public read reviews"
  on reviews for select using (true);
create policy "Public insert reviews"
  on reviews for insert with check (true);
create policy "Public update reviews"
  on reviews for update using (true);

-- Returns: anyone can insert + read
drop policy if exists "Public insert returns" on returns;
drop policy if exists "Public read returns" on returns;
create policy "Public insert returns"
  on returns for insert with check (true);
create policy "Public read returns"
  on returns for select using (true);

-- Support Tickets: anyone can insert + read
drop policy if exists "Public insert tickets" on support_tickets;
drop policy if exists "Public read tickets" on support_tickets;
create policy "Public insert tickets"
  on support_tickets for insert with check (true);
create policy "Public read tickets"
  on support_tickets for select using (true);

-- Categories: public CRUD (admin PIN protects UI)
drop policy if exists "Public read categories" on categories;
drop policy if exists "Public insert categories" on categories;
drop policy if exists "Public update categories" on categories;
drop policy if exists "Public delete categories" on categories;
create policy "Public read categories"
  on categories for select using (true);
create policy "Public insert categories"
  on categories for insert with check (true);
create policy "Public update categories"
  on categories for update using (true);
create policy "Public delete categories"
  on categories for delete using (true);

-- ================================================================
-- DONE! Your schema is ready.
-- The app will auto-seed products and reviews on first load.
-- ================================================================
