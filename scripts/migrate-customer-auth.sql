-- UNIQUE EXPRESSIONS - Customer login (run once in Supabase SQL Editor)
-- Also enable Email auth in Supabase Dashboard: Authentication -> Providers -> Email

-- Customer profiles linked to Supabase Auth users
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  phone text,
  email text,
  city text default 'Visakhapatnam',
  address text,
  pincode text,
  addresses jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists profiles_phone_idx on profiles(phone);
create index if not exists profiles_email_idx on profiles(email);

alter table profiles enable row level security;

drop policy if exists "Users read own profile" on profiles;
drop policy if exists "Users insert own profile" on profiles;
drop policy if exists "Users update own profile" on profiles;

create policy "Users read own profile" on profiles for select using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

-- Link orders to logged-in customers (guest orders keep user_id null)
alter table orders add column if not exists user_id uuid references auth.users(id);

create index if not exists orders_user_id_idx on orders(user_id);

-- Auto-create profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone, email, city)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.email, new.raw_user_meta_data->>'email', ''),
    coalesce(new.raw_user_meta_data->>'city', 'Visakhapatnam')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Done. In Supabase Dashboard also set:
-- Authentication -> URL Configuration -> Site URL = your website URL
-- Authentication -> Providers -> Email -> Confirm email = OFF (for instant login) OR ON (user must verify)

-- Phone or email login lookup (safe RPC for sign-in)
create or replace function public.lookup_auth_email(login_id text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  digits text;
  found text;
begin
  if login_id like '%@%' then
    return lower(trim(login_id));
  end if;
  digits := regexp_replace(login_id, '[^0-9]', '', 'g');
  if length(digits) = 10 then
    digits := '91' || digits;
  end if;
  select u.email into found
  from auth.users u
  inner join profiles p on p.id = u.id
  where p.phone = digits or replace(p.phone, '+', '') = digits
  limit 1;
  if found is not null then
    return lower(found);
  end if;
  return digits || '@customers.uniqueexpressions.in';
end;
$$;

grant execute on function public.lookup_auth_email(text) to anon, authenticated;
