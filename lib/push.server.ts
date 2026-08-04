import "server-only";
import webpush from "web-push";
import { createServiceClient, isServiceConfigured } from "@/lib/supabase/admin";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const SUBJECT = process.env.VAPID_SUBJECT || "mailto:hola@coralcoastrd.com";

export const isPushConfigured = Boolean(
  PUBLIC_KEY && PRIVATE_KEY && isServiceConfigured
);

if (PUBLIC_KEY && PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY);
  } catch {
    /* claves inválidas — se ignora, no se envía */
  }
}

export type PushMessage = {
  title: string;
  body: string;
  url?: string; // a dónde lleva al tocar la notificación
};

/**
 * Envía una notificación push a todos los dispositivos de admin suscritos.
 * No-op si faltan las claves VAPID o la service role. Nunca lanza: las
 * notificaciones no deben bloquear la acción principal (orden, cita, etc.).
 */
export async function sendPushToAdmins(msg: PushMessage): Promise<void> {
  if (!isPushConfigured) return;
  try {
    const supabase = createServiceClient();
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth");
    if (!subs || subs.length === 0) return;

    const payload = JSON.stringify({
      title: msg.title,
      body: msg.body,
      url: msg.url || "/admin",
    });

    const deadIds: string[] = [];
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload
          );
        } catch (err: unknown) {
          // 404/410 = suscripción caducada → la limpiamos
          const code = (err as { statusCode?: number })?.statusCode;
          if (code === 404 || code === 410) deadIds.push(s.id);
        }
      })
    );

    if (deadIds.length) {
      await supabase.from("push_subscriptions").delete().in("id", deadIds);
    }
  } catch {
    /* silencioso: nunca romper la acción principal por una notificación */
  }
}
