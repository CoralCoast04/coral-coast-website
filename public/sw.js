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
