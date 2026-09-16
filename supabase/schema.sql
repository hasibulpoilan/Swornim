-- Swornim products + admin RLS
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- Project: gmonlxwjckffyzollmxi

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10, 2),
  category text not null,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_visible_sort_   idx on public.products (is_visible, sort_order);

alter table public.products enable row level security;

-- Public can read visible products only
drop policy if exists "Public read visible products" on public.products;
create policy "Public read visible products"
  on public.products
  for select
  to anon, authenticated
  using (is_visible = true);

-- Logged-in admin can read all (incl. hidden)
drop policy if exists "Admin read all products" on public.products;
create policy "Admin read all products"
  on public.products
  for select
  to authenticated
  using (true);

-- Admin insert / update / delete
drop policy if exists "Admin insert products" on public.products;
create policy "Admin insert products"
  on public.products
  for insert
  to authenticated
  with check (true);

drop policy if exists "Admin update products" on public.products;
create policy "Admin update products"
  on public.products
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admin delete products" on public.products;
create policy "Admin delete products"
  on public.products
  for delete
  to authenticated
  using (true);

-- Seed current menu (safe to re-run only if empty)
insert into public.products (name, price, category, sort_order)
select * from (values
  ('Veg Corn Sandwich', 50::numeric, 'Sandwiches & Burgers', 1),
  ('Cheese Veg Corn Sandwich', 65::numeric, 'Sandwiches & Burgers', 2),
  ('Special Veg Cheese Corn Sandwich', 80::numeric, 'Sandwiches & Burgers', 3),
  ('Chicken Sandwich', 100::numeric, 'Sandwiches & Burgers', 4),
  ('Veg Burger', 75::numeric, 'Sandwiches & Burgers', 5),
  ('Cones & Bars', null::numeric, 'Mother Dairy (Singles)', 6),
  ('Ice Candy', null::numeric, 'Mother Dairy (Singles)', 7),
  ('Traditional Kulfi', null::numeric, 'Mother Dairy (Singles)', 8),
  ('Single Cups', null::numeric, 'Mother Dairy (Singles)', 9),
  ('Novelty Ice Creams', null::numeric, 'Mother Dairy (Singles)', 10),
  ('Classic Tubs', null::numeric, 'Mother Dairy (Family)', 11),
  ('Treat Tubs', null::numeric, 'Mother Dairy (Family)', 12),
  ('Ultimate Tubs', null::numeric, 'Mother Dairy (Family)', 13),
  ('Dietz (Sugar Free Options)', null::numeric, 'Mother Dairy (Family)', 14),
  ('Super Saver Packs', null::numeric, 'Mother Dairy (Family)', 15)
) as v(name, price, category, sort_order)
where not exists (select 1 from public.products limit 1);