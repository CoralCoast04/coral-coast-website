import "server-only";
import { createClient as createSbClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** ¿Está la service role configurada? (necesaria para push y alertas de stock) */
export const isServiceConfigured = Boolean(url && serviceKey);

/**
 * Cliente de Supabase con service role — bypassa RLS. SOLO en el servidor.
 * Se usa para enviar push a los admins desde acciones públicas (nueva orden/cita)
 * y para leer/marcar las alertas de stock. Nunca lo expongas al cliente.
 */
export function createServiceClient() {
  return createSbClient(url!, serviceKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
