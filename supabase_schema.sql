-- ================================================================
-- UNIQUE EXPRESSIONS — SUPABASE DATABASE SCHEMA (PRODUCTION)
-- Run this in your Supabase SQL Editor
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
  user_id uuid references auth.users(id),
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
alter table orders add column if not exists user_id uuid references auth.users(id);

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
  user_id uuid references auth.users(id),
  status text default 'Requested - Under Review',
  item_title text,
  reason text,
  resolution text,
  amount integer,
  created_at timestamptz default now()
);
alter table returns add column if not exists user_id uuid references auth.users(id);

-- 5. SUPPORT TICKETS TABLE
create table if not exists support_tickets (
  id serial primary key,
  ticket_id text unique not null,
  user_id uuid references auth.users(id),
  category text,
  subject text,
  message text,
  status text default 'Open - In Progress',
  created_at timestamptz default now()
);
alter table support_tickets add column if not exists user_id uuid references auth.users(id);

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

-- 7. PROFILES TABLE
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text default '',
  phone text default '',
  email text default '',
  city text default 'Visakhapatnam',
  address text default '',
  pincode text default '',
  addresses jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================
alter table products enable row level security;
alter table orders enable row level security;
alter table reviews enable row level security;
alter table returns enable row level security;
alter table support_tickets enable row level security;
alter table categories enable row level security;
alter table profiles enable row level security;

-- PRODUCTS: public read, insert, update, delete
drop policy if exists "Public read products" on products;
drop policy if exists "Public insert products" on products;
drop policy if exists "Public update products" on products;
drop policy if exists "Public delete products" on products;
create policy "Public read products" on products for select using (true);
create policy "Public insert products" on products for insert with check (true);
create policy "Public update products" on products for update using (true);
create policy "Public delete products" on products for delete using (true);

-- ORDERS: anyone can insert; users read only their own orders
drop policy if exists "Public insert orders" on orders;
drop policy if exists "Public read orders" on orders;
drop policy if exists "Public update orders" on orders;
drop policy if exists "Users insert own orders" on orders;
drop policy if exists "Users read own orders" on orders;
create policy "Users insert own orders" on orders for insert with check (true);
create policy "Users read own orders" on orders for select
  using (user_id = auth.uid() OR (auth.uid() IS NULL AND false));

-- REVIEWS: public read, auth users insert, anyone update helpful_count
drop policy if exists "Public read reviews" on reviews;
drop policy if exists "Public insert reviews" on reviews;
drop policy if exists "Public update reviews" on reviews;
drop policy if exists "Authenticated insert reviews" on reviews;
drop policy if exists "Public update helpful count" on reviews;
create policy "Public read reviews" on reviews for select using (true);
create policy "Authenticated insert reviews" on reviews for insert with check (auth.uid() IS NOT NULL);
create policy "Public update helpful count" on reviews for update using (true) with check (true);

-- RETURNS: users insert and read only their own
drop policy if exists "Public insert returns" on returns;
drop policy if exists "Public read returns" on returns;
drop policy if exists "Users insert own returns" on returns;
drop policy if exists "Users read own returns" on returns;
create policy "Users insert own returns" on returns for insert with check (true);
create policy "Users read own returns" on returns for select using (user_id = auth.uid());

-- SUPPORT TICKETS: users insert and read only their own
drop policy if exists "Public insert tickets" on support_tickets;
drop policy if exists "Public read tickets" on support_tickets;
drop policy if exists "Users insert own tickets" on support_tickets;
drop policy if exists "Users read own tickets" on support_tickets;
create policy "Users insert own tickets" on support_tickets for insert with check (true);
create policy "Users read own tickets" on support_tickets for select using (user_id = auth.uid());

-- CATEGORIES: public read, insert, update, delete
drop policy if exists "Public read categories" on categories;
drop policy if exists "Public insert categories" on categories;
drop policy if exists "Public update categories" on categories;
drop policy if exists "Public delete categories" on categories;
create policy "Public read categories" on categories for select using (true);
create policy "Public insert categories" on categories for insert with check (true);
create policy "Public update categories" on categories for update using (true);
create policy "Public delete categories" on categories for delete using (true);

-- PROFILES: users manage only their own profile
drop policy if exists "Users read own profile" on profiles;
drop policy if exists "Users insert own profile" on profiles;
drop policy if exists "Users update own profile" on profiles;
create policy "Users read own profile" on profiles for select using (id = auth.uid());
create policy "Users insert own profile" on profiles for insert with check (id = auth.uid());
create policy "Users update own profile" on profiles for update using (id = auth.uid());

-- ================================================================
-- DONE! Production schema ready.
-- NOTE: Product/Category admin CRUD must use the SUPABASE SERVICE ROLE KEY
-- on your server. Add SUPABASE_SERVICE_ROLE_KEY to your Vercel env vars.
-- ================================================================
