"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type AddressState = { ok: boolean; message: string } | null;

function str(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s || null;
}

async function requireUser() {
  if (!isSupabaseConfigured) throw new Error("No disponible.");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Inicia sesión.");
  return { supabase, user };
}

/** Crea o actualiza una dirección del usuario. */
export async function saveAddress(
  _prev: AddressState,
  formData: FormData
): Promise<AddressState> {
  try {
    const { supabase, user } = await requireUser();
    const id = String(formData.get("id") || "").trim();
    const address = str(formData.get("address"));
    if (!address) return { ok: false, message: "La dirección es obligatoria." };

    let isDefault = formData.get("is_default") === "on";
    const payload = {
      user_id: user.id,
      label: str(formData.get("label")),
      recipient: str(formData.get("recipient")),
      phone: str(formData.get("phone")),
      province: str(formData.get("province")),
      municipality: str(formData.get("municipality")),
      address,
      is_default: isDefault,
    };

    // La primera dirección se marca como predeterminada automáticamente.
    if (!id) {
      const { count } = await supabase
        .from("addresses")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (!count) isDefault = payload.is_default = true;
    }

    // Si esta será la predeterminada, quitamos la marca de las demás.
    if (isDefault) {
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    }

    if (id) {
      const { error } = await supabase
        .from("addresses")
        .update(payload)
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("addresses").insert(payload);
      if (error) throw error;
    }

    revalidatePath("/mis-direcciones");
    revalidatePath("/", "layout");
    return { ok: true, message: "Dirección guardada." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al guardar." };
  }
}

export async function deleteAddress(id: string): Promise<void> {
  const { supabase, user } = await requireUser();
  await supabase.from("addresses").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/mis-direcciones");
  revalidatePath("/", "layout");
}

export async function setDefaultAddress(id: string): Promise<void> {
  const { supabase, user } = await requireUser();
  await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/mis-direcciones");
  revalidatePath("/", "layout");
}
