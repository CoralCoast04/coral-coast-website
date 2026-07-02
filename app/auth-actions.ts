"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type AuthState = { ok: boolean; message: string } | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerCustomer(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (!isSupabaseConfigured)
    return { ok: false, message: "El registro no está disponible aún." };

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!name) return { ok: false, message: "Ingresa tu nombre." };
  if (!EMAIL_RE.test(email)) return { ok: false, message: "Correo no válido." };
  if (password.length < 6)
    return { ok: false, message: "La contraseña debe tener al menos 6 caracteres." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    if (error.code === "user_already_exists" || error.message.includes("already"))
      return { ok: false, message: "Ese correo ya está registrado. Inicia sesión." };
    return { ok: false, message: "No pudimos crear tu cuenta. Intenta de nuevo." };
  }

  // Si hay sesión, quedó dentro; si no, requiere confirmar el correo.
  if (data.session) {
    revalidatePath("/", "layout");
    return { ok: true, message: "" };
  }
  return {
    ok: true,
    message: "Te enviamos un correo para confirmar tu cuenta.",
  };
}

export async function loginCustomer(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (!isSupabaseConfigured)
    return { ok: false, message: "El inicio de sesión no está disponible aún." };

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email || !password)
    return { ok: false, message: "Ingresa correo y contraseña." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "email_not_confirmed")
      return { ok: false, message: "Confirma tu correo antes de entrar." };
    return { ok: false, message: "Credenciales inválidas." };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "" };
}

export async function logoutCustomer(): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/");
}
