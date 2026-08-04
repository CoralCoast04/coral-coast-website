// Service worker de Coral Coast.
// Fase 1: habilita la instalación como app (PWA).
// Fase 2 (próxima): aquí se agregarán los handlers de push y notificationclick.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Handler de fetch passthrough (requisito de instalabilidad en Chrome).
self.addEventListener("fetch", () => {
  // Sin caché por ahora; el panel necesita datos siempre frescos.
});

// Recibe una notificación push y la muestra.
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "Coral Coast", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Coral Coast";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: data.url || "/admin" },
    tag: data.tag || undefined,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Al tocar la notificación, abre/enfoca el panel.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/admin";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
