"use client";

import { createBrowserClient } from "@supabase/ssr";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** Cliente de Supabase para componentes de cliente (navegador). */
export function createClient() {
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}
