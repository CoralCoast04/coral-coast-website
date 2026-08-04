"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, BellOff } from "lucide-react";
import { savePushSubscription, sendTestPush } from "@/app/admin/notify-actions";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type Status = "checking" | "idle" | "on" | "working" | "denied" | "unsupported" | "error";

/** Botón para que el admin active las notificaciones push en este dispositivo. */
export function EnableNotifications() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    if (
      !VAPID ||
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setStatus(sub ? "on" : "idle"))
      .catch(() => setStatus("idle"));
  }, []);

  async function enable() {
    if (!VAPID) return;
    setStatus("working");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus("denied");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID),
        });
      }
      const json = sub.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        setStatus("error");
        return;
      }
      const res = await savePushSubscription({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      });
      if (res.ok) {
        setStatus("on");
        await sendTestPush();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "unsupported" || status === "checking") return null;

  const base =
    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors";

  if (status === "on") {
    return (
      <span className={`${base} border-salvia/40 bg-salvia/10 text-salvia`}>
        <BellRing size={15} /> Notificaciones activas en este dispositivo
      </span>
    );
  }
  if (status === "denied") {
    return (
      <span className={`${base} border-navy/15 text-navy/50`}>
        <BellOff size={15} /> Notificaciones bloqueadas — actívalas en los ajustes del navegador
      </span>
    );
  }
  return (
    <button
      onClick={enable}
      disabled={status === "working"}
      className={`${base} border-navy/25 text-navy hover:border-terracota hover:text-terracota disabled:opacity-60`}
    >
      <Bell size={15} /> {status === "working" ? "Activando…" : "Activar notificaciones"}
    </button>
  );
}
