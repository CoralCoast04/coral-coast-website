"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type AuthState = { error: string } | null;

export async function signIn(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (!isSupabaseConfigured) {
    return { error: "Supabase no está configurado todavía." };
  }

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Ingresa correo y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Diagnóstico temporal: mostramos el mensaje/código real de Supabase.
    return { error: `Error: ${error.message} (código: ${error.code ?? error.status ?? "?"})` };
  }

  revalidatePath("/admin");
  return null;
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured) return;
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/admin");
}
