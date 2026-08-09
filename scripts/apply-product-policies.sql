-- Apply product admin policies (safe to re-run)
drop policy if exists "Public insert products" on products;
drop policy if exists "Public update products" on products;
drop policy if exists "Public delete products" on products;

create policy "Public insert products"
  on products for insert with check (true);

create policy "Public update products"
  on products for update using (true);

create policy "Public delete products"
  on products for delete using (true);
