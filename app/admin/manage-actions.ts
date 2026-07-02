"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

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

    let image_url = String(formData.get("image_url") || "").trim();

    // Subida de imagen (opcional)
    const file = formData.get("image") as File | null;
    if (file && file.size > 0) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${slug}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("products")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("products").getPublicUrl(path);
      image_url = pub.publicUrl;
    }

    if (!image_url)
      return { ok: false, message: "Agrega una imagen (archivo o URL)." };

    const saleRaw = String(formData.get("sale_price") || "").trim();
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
      featured: formData.get("featured") === "on",
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
