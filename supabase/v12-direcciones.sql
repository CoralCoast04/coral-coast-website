-- =============================================================================
-- Coral Coast · v12 · Direcciones guardadas por usuario ("Mis direcciones")
-- Ejecuta este bloque en el SQL Editor de Supabase (es idempotente).
-- =============================================================================

create table if not exists public.addresses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  label        text,          -- "Casa", "Oficina"
  recipient    text,          -- quién recibe
  phone        text,
  province     text,
  municipality text,
  address      text not null, -- calle, número, referencia
  is_default   boolean not null default false,
  created_at   timestamptz not null default now()
);
alter table public.addresses enable row level security;

-- Cada usuario gestiona únicamente sus propias direcciones.
drop policy if exists "addresses_own_all" on public.addresses;
create policy "addresses_own_all" on public.addresses for all
  to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists addresses_user_idx on public.addresses (user_id);
