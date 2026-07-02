"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

/** Ids de producto en la wishlist del usuario actual (vacío si no hay sesión). */
export async function getWishlistIds(): Promise<string[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from("wishlists")
      .select("product_id")
      .eq("user_id", user.id);
    return (data ?? []).map((r) => r.product_id as string);
  } catch {
    return [];
  }
}

export type ToggleResult = { ok: boolean; added?: boolean; needLogin?: boolean };

/** Agrega o quita una pieza de la wishlist. */
export async function toggleWishlist(productId: string): Promise<ToggleResult> {
  if (!isSupabaseConfigured) return { ok: false, needLogin: true };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, needLogin: true };

    const { data: existing } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (existing) {
      await supabase.from("wishlists").delete().eq("id", existing.id);
      return { ok: true, added: false };
    }
    await supabase
      .from("wishlists")
      .insert({ user_id: user.id, product_id: productId });
    return { ok: true, added: true };
  } catch {
    return { ok: false };
  }
}
