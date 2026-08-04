"use client";

import { useEffect } from "react";

/** Registra el service worker que hace la web instalable como app. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* si falla, la web sigue funcionando normal */
      });
    }
  }, []);
  return null;
}
