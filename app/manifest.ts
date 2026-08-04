import type { MetadataRoute } from "next";

/** Manifiesto de la PWA — hace el sitio instalable como app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Coral Coast — Panel",
    short_name: "Coral Coast",
    description:
      "Panel de Coral Coast: órdenes, citas, inventario y contenido de la tienda.",
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    background_color: "#0d2b3e",
    theme_color: "#0d2b3e",
    lang: "es",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
