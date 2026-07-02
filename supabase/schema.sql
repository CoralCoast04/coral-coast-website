-- =============================================================================
-- Coral Coast · Esquema de Supabase
-- Ejecuta este archivo en el SQL Editor de tu proyecto Supabase.
-- Es idempotente: puedes correrlo varias veces sin romper nada.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- PRODUCTS (catálogo de la colección)
-- -----------------------------------------------------------------------------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  category    text not null,             -- Chacabanas | Bermudas | Trajes | Pantalones
  description text not null,
  price       numeric not null default 0,  -- precio base en RD$ (0 = "A consultar")
  sale_price  numeric,                      -- precio de oferta en RD$ (null = sin oferta)
  fabric      text,                          -- Lino | Lino-algodón
  color       text,
  image_url   text not null,
  featured    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Migración suave desde versiones previas (si existía price_label)
alter table public.products add column if not exists price numeric not null default 0;
alter table public.products add column if not exists sale_price numeric;
alter table public.products add column if not exists fabric text;

-- -----------------------------------------------------------------------------
-- COUPONS (códigos de descuento aplicables en el carrito)
-- -----------------------------------------------------------------------------
create table if not exists public.coupons (
  id             uuid primary key default gen_random_uuid(),
  code           text unique not null,
  discount_type  text not null default 'percent',  -- 'percent' | 'fixed'
  discount_value numeric not null,                  -- % o monto RD$
  active         boolean not null default true,
  min_subtotal   numeric not null default 0,        -- subtotal mínimo para aplicar
  expires_at     timestamptz,                        -- null = sin vencimiento
  created_at     timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- ORDERS (pedidos que se cierran por WhatsApp)
-- -----------------------------------------------------------------------------
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  items          jsonb not null,           -- [{id,name,qty,unit_price}]
  subtotal       numeric not null,
  discount       numeric not null default 0,
  total          numeric not null,
  coupon_code    text,
  customer_name  text,
  customer_phone text,
  status         text not null default 'nuevo',  -- nuevo | contactado | cerrado
  created_at     timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- APPOINTMENTS (solicitudes de "Agenda tu cita")
-- -----------------------------------------------------------------------------
create table if not exists public.appointments (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  email          text,
  phone          text,
  preferred_date date,
  preferred_time time,
  interest       text,
  notes          text,
  created_at     timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- MESSAGES (formulario de contacto)
-- -----------------------------------------------------------------------------
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  subject    text,
  message    text not null,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.products     enable row level security;
alter table public.coupons      enable row level security;
alter table public.orders       enable row level security;
alter table public.appointments enable row level security;
alter table public.messages     enable row level security;

-- PRODUCTS: lectura pública, escritura solo admin ------------------------------
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products for select to anon, authenticated using (true);

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write"
  on public.products for all to authenticated using (true) with check (true);

-- COUPONS: lectura pública (para validar), escritura solo admin -----------------
drop policy if exists "coupons_public_read" on public.coupons;
create policy "coupons_public_read"
  on public.coupons for select to anon, authenticated using (true);

drop policy if exists "coupons_admin_write" on public.coupons;
create policy "coupons_admin_write"
  on public.coupons for all to authenticated using (true) with check (true);

-- ORDERS: cualquiera puede crear; solo admin lee/actualiza ---------------------
drop policy if exists "orders_public_insert" on public.orders;
create policy "orders_public_insert"
  on public.orders for insert to anon, authenticated with check (true);

drop policy if exists "orders_admin_read" on public.orders;
create policy "orders_admin_read"
  on public.orders for select to authenticated using (true);

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update"
  on public.orders for update to authenticated using (true) with check (true);

-- APPOINTMENTS ----------------------------------------------------------------
drop policy if exists "appointments_public_insert" on public.appointments;
create policy "appointments_public_insert"
  on public.appointments for insert to anon, authenticated with check (true);

drop policy if exists "appointments_admin_read" on public.appointments;
create policy "appointments_admin_read"
  on public.appointments for select to authenticated using (true);

-- MESSAGES --------------------------------------------------------------------
drop policy if exists "messages_public_insert" on public.messages;
create policy "messages_public_insert"
  on public.messages for insert to anon, authenticated with check (true);

drop policy if exists "messages_admin_read" on public.messages;
create policy "messages_admin_read"
  on public.messages for select to authenticated using (true);

-- =============================================================================
-- STORAGE · bucket público para fotos de producto
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'products');

drop policy if exists "product_images_admin_write" on storage.objects;
create policy "product_images_admin_write"
  on storage.objects for all to authenticated
  using (bucket_id = 'products') with check (bucket_id = 'products');

-- =============================================================================
-- SEED · colección inicial
-- =============================================================================
insert into public.products (slug, name, category, description, price, sale_price, fabric, color, image_url, featured) values
  ('chacabana-clasica-lino', 'Chacabana Clásica', 'Chacabanas', 'Chacabana de lino puro con alforzas verticales y botones de coco. El clásico dominicano, cortado a tu medida.', 6500, null, 'Lino', 'Marfil', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80', true),
  ('chacabana-manga-corta', 'Chacabana Manga Corta', 'Chacabanas', 'Versión fresca en lino-algodón para el día. Caída ligera, hombros precisos, comodidad de clima cálido.', 5200, null, 'Lino-algodón', 'Blanco', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80', false),
  ('chacabana-bordada-salvia', 'Chacabana Bordada', 'Chacabanas', 'Bordado sobrio a tono, tejido en lino salvia. Elegancia serena para la ocasión especial.', 7800, 6900, 'Lino', 'Salvia', 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?auto=format&fit=crop&w=1200&q=80', true),
  ('bermuda-lino-arena', 'Bermuda de Lino', 'Bermudas', 'Bermuda sastre de lino en tono arena. Pretina limpia y largo a la rodilla — del estudio a la costa.', 3900, null, 'Lino', 'Arena', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1200&q=80', true),
  ('bermuda-lino-algodon-navy', 'Bermuda Lino-Algodón', 'Bermudas', 'Estructura sutil y color navy profundo. La bermuda que sube el nivel de un look de verano.', 4200, null, 'Lino-algodón', 'Navy', 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=80', false),
  ('traje-lino-navy', 'Traje de Lino', 'Trajes', 'Traje de dos piezas en lino navy, entretela ligera y corte natural. Sastrería tropical hecha a mano.', 18500, null, 'Lino', 'Navy', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80', true),
  ('traje-lino-algodon-arena', 'Traje Lino-Algodón', 'Trajes', 'Tono arena y textura viva para bodas y eventos de día. Ligereza y caída impecables bajo el sol.', 16900, 14900, 'Lino-algodón', 'Arena', 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?auto=format&fit=crop&w=1200&q=80', false),
  ('pantalon-lino-blanco', 'Pantalón de Lino', 'Pantalones', 'Pantalón de lino de talle clásico con pinzas. Fresco, versátil, hecho a tu silueta.', 4500, null, 'Lino', 'Blanco', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=80', false)
on conflict (slug) do nothing;

-- Cupones de ejemplo
insert into public.coupons (code, discount_type, discount_value, active, min_subtotal) values
  ('CORAL10', 'percent', 10, true, 0),
  ('BIENVENIDO', 'fixed', 1000, true, 5000)
on conflict (code) do nothing;
