-- Run once in Supabase SQL Editor (after initial schema)
alter table products add column if not exists stock_qty integer default 12;

update products set stock_qty = 12 where stock_qty is null;
