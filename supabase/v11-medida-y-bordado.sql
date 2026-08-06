-- =============================================================================
-- Coral Coast · v11 · Precio a la medida por producto + bordado en ventas
-- Ejecuta este bloque en el SQL Editor de Supabase (es idempotente).
-- =============================================================================

-- Precio de la versión "a la medida" (null = usa el precio base del producto).
alter table public.products add column if not exists made_to_measure_price numeric;

-- Detalle de bordado en una venta (iniciales, posición, etc.). null = sin bordado.
alter table public.sales add column if not exists bordado text;
