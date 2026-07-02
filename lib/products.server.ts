import "server-only";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";
import { fallbackProducts, type Product } from "@/lib/products";

/** Devuelve la colección desde Supabase; si no está configurado, usa el respaldo. */
export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return fallbackProducts;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("featured", { ascending: false })
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) return fallbackProducts;
    return data as Product[];
  } catch {
    return fallbackProducts;
  }
}

/** Devuelve una pieza por su slug (o null si no existe). */
export async function getProduct(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured) {
    return fallbackProducts.find((p) => p.slug === slug) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return fallbackProducts.find((p) => p.slug === slug) ?? null;
    return data as Product;
  } catch {
    return fallbackProducts.find((p) => p.slug === slug) ?? null;
  }
}
