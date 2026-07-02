"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { sendWelcome } from "@/lib/email";

export type SubscribeState = { ok: boolean; message: string } | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Suscribe un correo a novedades/promos y envía bienvenida. */
export async function subscribe(
  _prev: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email))
    return { ok: false, message: "Ingresa un correo válido." };

  if (!isSupabaseConfigured) {
    await sendWelcome(email);
    return { ok: true, message: "¡Listo! Te avisaremos de las novedades." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("subscribers")
      .insert({ email, source: "web" });

    // 23505 = correo ya suscrito → lo tratamos como éxito silencioso.
    if (error && error.code !== "23505") throw error;
    if (!error) await sendWelcome(email);

    return { ok: true, message: "¡Listo! Te avisaremos de las novedades." };
  } catch {
    return { ok: false, message: "No pudimos suscribirte. Intenta de nuevo." };
  }
}
