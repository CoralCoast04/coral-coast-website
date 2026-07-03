# Coral Coast 🌾

Sitio web de **Coral Coast** ([coralcoastrd.com](https://coralcoastrd.com)), estudio dominicano de
**sastrería a la medida** en lino y lino-algodón: chacabanas, trajes, bermudas y pantalones.
Estética _quiet luxury_ minimalista · carrito con cupones · cierre por WhatsApp (sin pago en línea).

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind v4 · Framer Motion · Supabase.

## Paleta y tipografía

| Token | Color | Uso |
|-------|-------|-----|
| `fondo` | `#F0F4F6` | fondo general |
| `arena` | `#E6C9A8` | acentos cálidos |
| `navy` | `#0D2B3E` | texto y botones |
| `terracota` | `#D97A5E` | hover y acento |
| `acero` | `#7DA8BF` | azul acero |
| `salvia` | `#7C8F7A` | detalles |

Títulos en **Cormorant Garamond**, cuerpo en **Inter**. Botones con hover `navy → terracota` (clase `.btn`).

## Empezar

```bash
npm install
npm run dev        # http://localhost:3000
```

El sitio funciona de inmediato con una **colección de respaldo** (datos estáticos) aunque Supabase no esté configurado.

## Configurar Supabase (formularios, catálogo y panel admin)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecuta [`supabase/schema.sql`](supabase/schema.sql) (crea tablas, RLS y siembra la colección).
3. Copia tus claves en `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
4. Crea un usuario admin en **Authentication → Users** (email + contraseña).
5. Entra a `/admin` para gestionar productos (fotos, precios, ofertas), cupones y órdenes, y ver citas/mensajes.

El script crea también el bucket de **Storage** `products` (fotos) y cupones de ejemplo (`CORAL10` = 10%, `BIENVENIDO` = RD$1,000 desde RD$5,000).

## Carrito y cupones

No hay pago en línea: el cliente arma su selección, aplica un cupón (validado contra Supabase) y **finaliza por WhatsApp** con el pedido completo. La orden se guarda en la tabla `orders` para verla en el panel. Sin Supabase, el carrito funciona con cupones demo (`CORAL10`, `BIENVENIDO`).

## WhatsApp

El número de cierre se controla con `NEXT_PUBLIC_WHATSAPP` (solo dígitos, formato internacional).
Actual: `+1 849 847 9200`.

## Video del hero

Coloca tu video lifestyle en `public/hero.mp4`. Mientras no exista, se muestra un póster de respaldo.

## Páginas

- `/` — Inicio (hero con video, destacados, valores)
- `/coleccion` — Colección con filtros, precios/ofertas y agregar al carrito
- `/agenda` — Agenda tu cita (→ Supabase)
- `/sobre-nosotros` — Historia y principios
- `/contacto` — Contacto (→ Supabase)
- `/admin` — Panel privado (login Supabase): productos, cupones, órdenes, citas, mensajes
