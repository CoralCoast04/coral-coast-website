-- =============================================================================
-- Coral Coast · v7 · Inventario por talla (almacén)
-- Ejecuta este bloque en el SQL Editor de Supabase (es idempotente).
-- =============================================================================

-- stock: { "S": 3, "M": 0, "L": 5 } — unidades por talla.
-- {} (vacío) = el producto no lleva control de stock (siempre disponible).
alter table public.products add column if not exists stock jsonb not null default '{}'::jsonb;
