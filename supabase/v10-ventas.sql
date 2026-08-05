-- =============================================================================
-- Coral Coast · v10 · Registro de ventas + reporte mensual
-- Ejecuta este bloque en el SQL Editor de Supabase (es idempotente).
-- =============================================================================

-- Requisito: función is_admin() (por si el esquema base aún no se ha corrido).
create table if not exists public.admins ( email text primary key );
alter table public.admins enable row level security;
drop policy if exists "admins_self_read" on public.admins;
create policy "admins_self_read" on public.admins for select to authenticated using (true);
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select (not exists (select 1 from public.admins))
      or exists (select 1 from public.admins a
        where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- Ventas registradas (online y tienda física)
create table if not exists public.sales (
  id          uuid primary key default gen_random_uuid(),
  item        text not null,                 -- pieza vendida
  qty         integer not null default 1,
  unit_price  numeric not null default 0,    -- precio unitario en RD$
  total       numeric not null default 0,    -- qty * unit_price
  channel     text not null default 'tienda', -- 'online' | 'tienda'
  note        text,
  sold_at     date not null default current_date,
  order_id    uuid,                          -- vínculo opcional a una orden online
  created_at  timestamptz not null default now()
);
alter table public.sales enable row level security;

-- Solo admin gestiona las ventas.
drop policy if exists "sales_admin_all" on public.sales;
create policy "sales_admin_all" on public.sales for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

create index if not exists sales_sold_at_idx on public.sales (sold_at);
