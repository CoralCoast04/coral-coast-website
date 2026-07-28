import "server-only";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";
import type { ShippingRate } from "@/lib/shipping";

/** Tarifas de envío por provincia desde Supabase (vacío si no está configurado). */
export async function getShippingRates(): Promise<ShippingRate[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("shipping_rates")
      .select("province, cost, active");
    if (error || !data) return [];
    return data.map((r) => ({
      province: r.province,
      cost: Number(r.cost),
      active: r.active,
    }));
  } catch {
    return [];
  }
}
