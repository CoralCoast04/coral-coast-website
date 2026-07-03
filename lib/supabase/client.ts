"use client";

import { createBrowserClient } from "@supabase/ssr";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** Cliente de Supabase para componentes de cliente (navegador). */
export function createClient() {
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}

/**
 * Sube un archivo directo del navegador a Supabase Storage (bucket 'products')
 * y devuelve su URL pública. Evita el límite de tamaño de las Server Actions
 * de Vercel — soporta fotos y videos grandes.
 */
export async function uploadToStorage(file: File, prefix: string): Promise<string> {
  const supabase = createClient();
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const safePrefix = prefix.replace(/[^a-z0-9/-]/gi, "-");
  const path = `${safePrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("products")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return supabase.storage.from("products").getPublicUrl(path).data.publicUrl;
}
