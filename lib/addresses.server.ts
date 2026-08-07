import "server-only";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";
import type { Address } from "@/lib/addresses";

/** Direcciones del usuario logueado (predeterminada primero). */
export async function getUserAddresses(): Promise<Address[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from("addresses")
      .select("id, label, recipient, phone, province, municipality, address, is_default")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as Address[];
  } catch {
    return [];
  }
}
