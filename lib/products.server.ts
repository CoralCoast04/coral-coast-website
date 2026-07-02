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
