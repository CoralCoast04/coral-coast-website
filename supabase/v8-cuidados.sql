-- =============================================================================
-- Coral Coast · v8 · Cuidados de la prenda por producto
-- Ejecuta este bloque en el SQL Editor de Supabase (es idempotente).
-- =============================================================================

-- care: texto libre con los cuidados (una instrucción por línea).
-- null / vacío = el producto no muestra cuidados.
alter table public.products add column if not exists care text;
