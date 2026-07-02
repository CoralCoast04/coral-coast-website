import "server-only";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";
import { DEFAULT_CONTENT, type SiteContent } from "@/lib/content-fields";

export { DEFAULT_CONTENT, CONTENT_FIELDS } from "@/lib/content-fields";
export type { SiteContent } from "@/lib/content-fields";

/** Devuelve todo el contenido (Supabase con fallback a los valores por defecto). */
export async function getContent(): Promise<SiteContent> {
  if (!isSupabaseConfigured) return { ...DEFAULT_CONTENT };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("site_content").select("key, value");
    if (error || !data) return { ...DEFAULT_CONTENT };
    const map: SiteContent = { ...DEFAULT_CONTENT };
    for (const row of data) {
      if (row.value != null && row.value !== "") map[row.key] = row.value;
    }
    return map;
  } catch {
    return { ...DEFAULT_CONTENT };
  }
}
