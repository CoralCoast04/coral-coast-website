"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { CONTENT_FIELDS } from "@/lib/content";

export type ActionState = { ok: boolean; message: string } | null;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function num(v: FormDataEntryValue | null): number {
  const n = parseFloat(String(v ?? "").replace(/[^\d.]/g, ""));
  return isNaN(n) ? 0 : n;
}

async function requireAdmin() {
  if (!isSupabaseConfigured) throw new Error("Supabase no configurado.");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado.");
  // Si is_admin() aún no existe (schema v3 sin correr), no bloqueamos.
  const { data: admin, error } = await supabase.rpc("is_admin");
  if (!error && !admin) throw new Error("No autorizado.");
  return supabase;
}

/* ------------------------------ PRODUCTOS ------------------------------ */
export async function saveProduct(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await requireAdmin();

    const id = String(formData.get("id") || "").trim();
    const name = String(formData.get("name") || "").trim();
    if (!name) return { ok: false, message: "El nombre es obligatorio." };

    const slug =
      String(formData.get("slug") || "").trim() || slugify(name);

    // Galería: media existente retenida (JSON) + archivos nuevos (imágenes/videos)
    let media: { type: "image" | "video"; url: string }[] = [];
    try {
      const parsed = JSON.parse(String(formData.get("media_json") || "[]"));
      if (Array.isArray(parsed)) media = parsed;
    } catch {
      /* ignore */
    }

    const files = (formData.getAll("media_files") as File[]).filter(
      (f) => f && f.size > 0
    );
    for (const f of files) {
      const ext = f.name.split(".").pop() || "bin";
      const path = `${slug}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("products")
        .upload(path, f, { upsert: true, contentType: f.type });
      if (upErr) throw upErr;
      const url = supabase.storage.from("products").getPublicUrl(path).data.publicUrl;
      media.push({ type: f.type.startsWith("video") ? "video" : "image", url });
    }

    // Portada = primera imagen de la galería (o URL existente)
    const firstImage = media.find((m) => m.type === "image");
    let image_url = firstImage?.url || String(formData.get("image_url") || "").trim();
    if (!media.length && image_url) media = [{ type: "image", url: image_url }];
    if (!image_url && media[0]) image_url = media[0].url;
    if (!image_url)
      return { ok: false, message: "Agrega al menos una imagen." };

    const saleRaw = String(formData.get("sale_price") || "").trim();
    const sizes = String(formData.get("sizes") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const record = {
      slug,
      name,
      category: String(formData.get("category") || "Chacabanas"),
      description: String(formData.get("description") || "").trim(),
      price: num(formData.get("price")),
      sale_price: saleRaw ? num(formData.get("sale_price")) : null,
      fabric: String(formData.get("fabric") || "").trim() || null,
      color: String(formData.get("color") || "").trim() || null,
      image_url,
      media,
      featured: formData.get("featured") === "on",
      sizes,
      made_to_measure: formData.get("made_to_measure") === "on",
    };

    const query = id
      ? supabase.from("products").update(record).eq("id", id)
      : supabase.from("products").insert(record);
    const { error } = await query;
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/coleccion");
    revalidatePath("/");
    return { ok: true, message: id ? "Producto actualizado." : "Producto creado." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al guardar." };
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await requireAdmin();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/coleccion");
  revalidatePath("/");
}

/* ------------------------------- CUPONES ------------------------------- */
export async function saveCoupon(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await requireAdmin();

    const id = String(formData.get("id") || "").trim();
    const code = String(formData.get("code") || "").trim().toUpperCase();
    if (!code) return { ok: false, message: "El código es obligatorio." };

    const expires = String(formData.get("expires_at") || "").trim();
    const record = {
      code,
      discount_type: String(formData.get("discount_type") || "percent"),
      discount_value: num(formData.get("discount_value")),
      active: formData.get("active") === "on",
      min_subtotal: num(formData.get("min_subtotal")),
      expires_at: expires ? new Date(expires).toISOString() : null,
    };

    const query = id
      ? supabase.from("coupons").update(record).eq("id", id)
      : supabase.from("coupons").insert(record);
    const { error } = await query;
    if (error) throw error;

    revalidatePath("/admin");
    return { ok: true, message: id ? "Cupón actualizado." : "Cupón creado." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al guardar." };
  }
}

export async function deleteCoupon(id: string): Promise<void> {
  const supabase = await requireAdmin();
  await supabase.from("coupons").delete().eq("id", id);
  revalidatePath("/admin");
}

/* ------------------------------- ÓRDENES ------------------------------- */
export async function updateOrderStatus(
  id: string,
  status: string
): Promise<void> {
  const supabase = await requireAdmin();
  await supabase.from("orders").update({ status }).eq("id", id);
  revalidatePath("/admin");
}

/* ------------------------------ CONTENIDO ------------------------------ */
export async function saveContent(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await requireAdmin();

    const rows = [];
    for (const f of CONTENT_FIELDS) {
      let value = String(formData.get(f.key) ?? "");

      // Campos de imagen: si suben un archivo, lo guardamos en Storage.
      if (f.type === "image") {
        const file = formData.get(`${f.key}__file`) as File | null;
        if (file && file.size > 0) {
          const ext = file.name.split(".").pop() || "jpg";
          const path = `site/${f.key}-${Date.now()}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from("products")
            .upload(path, file, { upsert: true, contentType: file.type });
          if (upErr) throw upErr;
          value = supabase.storage.from("products").getPublicUrl(path).data.publicUrl;
        }
      }

      rows.push({ key: f.key, value, updated_at: new Date().toISOString() });
    }

    const { error } = await supabase
      .from("site_content")
      .upsert(rows, { onConflict: "key" });
    if (error) throw error;

    revalidatePath("/", "layout");
    return { ok: true, message: "Contenido actualizado." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al guardar." };
  }
}
