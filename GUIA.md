# Guía para correr Coral Coast (sitio + admin)

Esta guía te lleva de cero a tener el sitio funcionando y el panel `/admin`
conectado a Supabase (para editar productos, precios, ofertas, cupones y ver
órdenes/citas/mensajes).

---

## Parte 1 — Correr el sitio (sin base de datos)

El sitio funciona de inmediato con datos de ejemplo, aunque Supabase no esté
conectado (catálogo y cupones demo).

1. Abre **PowerShell**.
2. Entra a la carpeta del proyecto:
   ```powershell
   cd "C:\Users\DELL\OneDrive\Desktop\Coral Coast Website"
   ```
3. La primera vez, instala dependencias (si no lo has hecho):
   ```powershell
   npm install
   ```
4. Arranca el sitio:
   ```powershell
   npm run dev
   ```
5. Cuando veas **`Ready`**, abre en el navegador: **http://localhost:3000**
6. Para detener: `Ctrl + C` en la terminal.

> Cupones demo para probar el carrito: **CORAL10** (10%) y **BIENVENIDO**
> (RD$1,000 desde RD$5,000).

---

## Parte 2 — Conectar Supabase (activar el admin real)

Esto habilita el login del panel y que edites todo sin tocar código.

### 2.1 Crear el proyecto
1. Entra a **https://supabase.com** y crea una cuenta (gratis).
2. Clic en **New project**.
3. Completa:
   - **Name:** Coral Coast
   - **Database Password:** crea una contraseña fuerte y **guárdala**.
   - **Region:** elige la más cercana (ej. *East US (North Virginia)*).
4. Clic en **Create new project** y espera ~2 minutos a que se aprovisione.

### 2.2 Crear las tablas (ejecutar el schema)
1. En el menú izquierdo, ve a **SQL Editor**.
2. Clic en **+ New query**.
3. Abre en tu proyecto el archivo **`supabase/schema.sql`**, copia **todo** su
   contenido y pégalo en el editor.
4. Clic en **Run** (o `Ctrl+Enter`).
   - Esto crea las tablas (products, coupons, orders, appointments, messages),
     las políticas de seguridad, el bucket de fotos y carga la colección y los
     cupones de ejemplo.
   - Debe decir *Success. No rows returned* (es normal).

### 2.3 Copiar las llaves de API
1. Ve a **Project Settings** (ícono de engranaje, abajo a la izquierda) →
   **API**.
2. Copia estos dos valores:
   - **Project URL** (algo como `https://abcd1234.supabase.co`)
   - **API Keys → `anon` `public`** (una cadena larga que empieza con `eyJ...`)

### 2.4 Pegar las llaves en el proyecto
1. En la carpeta del proyecto, abre el archivo **`.env.local`**.
2. Complétalo así (pega tus valores reales):
   ```env
   NEXT_PUBLIC_WHATSAPP=18498479200

   NEXT_PUBLIC_SUPABASE_URL=https://abcd1234.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...tu-clave-completa...
   ```
3. Guarda el archivo.

> ⚠️ El archivo `.env.local` es privado y no se sube a GitHub (ya está
> configurado para ignorarse). La clave `anon` es segura para el navegador;
> **nunca** pongas aquí la clave `service_role`.

### 2.5 Crear tu usuario de administrador
1. En Supabase, ve a **Authentication** → **Users**.
2. Clic en **Add user** → **Create new user**.
3. Escribe tu **email** y una **contraseña**.
4. Activa la opción **Auto Confirm User** (para poder entrar de una vez).
5. Clic en **Create user**.

### 2.6 Reiniciar el sitio
Los cambios de `.env.local` requieren reiniciar:
1. En la terminal donde corre el sitio, presiona `Ctrl + C`.
2. Vuelve a arrancar:
   ```powershell
   npm run dev
   ```

---

## Parte 3 — Entrar al panel de administración

1. Abre **http://localhost:3000/admin**
2. Inicia sesión con el email y contraseña que creaste en el paso 2.5.
3. Ya puedes:
   - **Productos:** crear, editar, eliminar; subir fotos; poner precio y oferta;
     marcar destacados.
   - **Cupones:** crear códigos de descuento (% o monto fijo, mínimo, vencimiento).
   - **Órdenes:** ver los pedidos que llegan por el carrito y cambiar su estado.
   - **Citas** y **Mensajes:** ver lo que envían los clientes.

---

## Preguntas frecuentes

**¿El admin muestra "Configura Supabase"?**
Faltan las llaves o el reinicio. Revisa el paso 2.4 y reinicia (2.6).

**No puedo iniciar sesión.**
Verifica que creaste el usuario con **Auto Confirm User** activado (paso 2.5) y
que las llaves en `.env.local` son correctas.

**Las fotos no suben.**
El bucket `products` se crea con el schema (paso 2.2). Si falla, vuelve a
ejecutar `supabase/schema.sql`.

**Veo errores 404 raros tras compilar.**
Detén el sitio, borra la carpeta `.next` y arranca de nuevo:
```powershell
Remove-Item -Recurse -Force .next; npm run dev
```

**¿Cómo cambio el número de WhatsApp?**
Edita `NEXT_PUBLIC_WHATSAPP` en `.env.local` (solo dígitos) y reinicia.

---

## Siguiente paso (cuando publiquemos)

Para que el sitio esté en línea (no solo en tu computadora) lo subimos a
**Vercel** y conectamos el dominio `coralcoastrd.com`. Las mismas dos llaves de
Supabase se configuran allá. Te guío cuando lleguemos a eso.
