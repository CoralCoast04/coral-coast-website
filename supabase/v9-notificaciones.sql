-- =============================================================================
-- Coral Coast · v9 · Notificaciones push (admin) + alertas de stock (cliente)
-- Ejecuta este bloque en el SQL Editor de Supabase (es idempotente).
-- =============================================================================

-- Suscripciones push de los administradores (un dispositivo = una fila)
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  endpoint   text unique not null,
  p256dh     text not null,
  auth       text not null,
  email      text,                 -- admin que suscribió el dispositivo
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;

-- Solo admins gestionan sus suscripciones. El envío usa la service role (bypassa RLS).
drop policy if exists "push_admin_all" on public.push_subscriptions;
create policy "push_admin_all" on public.push_subscriptions for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

-- Alertas de stock: el cliente pide que le avisen cuando una pieza vuelva
create table if not exists public.stock_alerts (
  id          uuid primary key default gen_random_uuid(),
  product_id  text not null,
  size        text,                -- talla específica (null = cualquiera)
  email       text not null,
  created_at  timestamptz not null default now(),
  notified_at timestamptz          -- se marca al enviar el aviso
);
alter table public.stock_alerts enable row level security;

-- Cualquiera puede inscribirse; solo admin/servicio lee y actualiza.
drop policy if exists "stock_alerts_public_insert" on public.stock_alerts;
create policy "stock_alerts_public_insert"
  on public.stock_alerts for insert to anon, authenticated with check (true);

drop policy if exists "stock_alerts_admin_read" on public.stock_alerts;
create policy "stock_alerts_admin_read"
  on public.stock_alerts for select to authenticated using (public.is_admin());

create index if not exists stock_alerts_pending_idx
  on public.stock_alerts (product_id) where notified_at is null;
