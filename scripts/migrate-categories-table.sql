-- Run once in Supabase SQL Editor
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

create policy "Public read categories"
  on categories for select using (true);
create policy "Public insert categories"
  on categories for insert with check (true);
create policy "Public update categories"
  on categories for update using (true);
create policy "Public delete categories"
  on categories for delete using (true);
