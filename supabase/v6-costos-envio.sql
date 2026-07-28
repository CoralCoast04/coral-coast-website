-- =============================================================================
-- Coral Coast · v6 · Costos de envío por provincia + envío gratis
-- Ejecuta este bloque en el SQL Editor de Supabase (es idempotente).
-- =============================================================================

create table if not exists public.shipping_rates (
  province   text primary key,
  cost       numeric not null default 0,    -- costo de envío en RD$
  active     boolean not null default true,  -- si se ofrece envío a esa provincia
  updated_at timestamptz not null default now()
);
alter table public.shipping_rates enable row level security;

-- Lectura pública (para mostrar el costo en el carrito), escritura solo admin
drop policy if exists "shipping_public_read" on public.shipping_rates;
create policy "shipping_public_read"
  on public.shipping_rates for select to anon, authenticated using (true);

drop policy if exists "shipping_admin_write" on public.shipping_rates;
create policy "shipping_admin_write" on public.shipping_rates for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

-- Semilla: las 32 provincias de RD (costo 0 hasta que lo definas en el admin)
insert into public.shipping_rates (province, cost, active) values
  ('Distrito Nacional', 0, true), ('Santo Domingo', 0, true), ('Santiago', 0, true),
  ('La Altagracia', 0, true), ('San Cristóbal', 0, true), ('Puerto Plata', 0, true),
  ('La Vega', 0, true), ('San Pedro de Macorís', 0, true), ('Duarte', 0, true),
  ('La Romana', 0, true), ('Espaillat', 0, true), ('Azua', 0, true),
  ('Barahona', 0, true), ('Monseñor Nouel', 0, true), ('Valverde', 0, true),
  ('Sánchez Ramírez', 0, true), ('Peravia', 0, true), ('Monte Plata', 0, true),
  ('Hato Mayor', 0, true), ('Bahoruco', 0, true), ('Independencia', 0, true),
  ('El Seibo', 0, true), ('Dajabón', 0, true), ('María Trinidad Sánchez', 0, true),
  ('Samaná', 0, true), ('Monte Cristi', 0, true), ('San Juan', 0, true),
  ('Santiago Rodríguez', 0, true), ('Hermanas Mirabal', 0, true), ('Elías Piña', 0, true),
  ('San José de Ocoa', 0, true), ('Pedernales', 0, true)
on conflict (province) do nothing;

-- Umbral de envío gratis (0 = desactivado), guardado en site_content
insert into public.site_content (key, value) values ('free_shipping_threshold', '0')
on conflict (key) do nothing;

-- Envío y provincia en las órdenes
alter table public.orders add column if not exists shipping numeric not null default 0;
alter table public.orders add column if not exists province text;
