"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { sendPushToAdmins } from "@/lib/push.server";

async function requireAdmin() {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: admin, error } = await supabase.rpc("is_admin");
  if (!error && admin === false) return null;
  return { supabase, user };
}

export type PushSub = { endpoint: string; keys: { p256dh: string; auth: string } };

/** Guarda (o actualiza) la suscripción push del dispositivo del admin. */
export async function savePushSubscription(sub: PushSub): Promise<{ ok: boolean }> {
  try {
    const ctx = await requireAdmin();
    if (!ctx) return { ok: false };
    const { error } = await ctx.supabase.from("push_subscriptions").upsert(
      {
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        email: ctx.user.email ?? null,
      },
      { onConflict: "endpoint" }
    );
    return { ok: !error };
  } catch {
    return { ok: false };
  }
}

/** Envía una notificación de prueba a los dispositivos del admin. */
export async function sendTestPush(): Promise<{ ok: boolean }> {
  const ctx = await requireAdmin();
  if (!ctx) return { ok: false };
  await sendPushToAdmins({
    title: "Coral Coast",
    body: "Notificaciones activadas ✓",
    url: "/admin",
  });
  return { ok: true };
}
