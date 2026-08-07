import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // web-push es una librería de Node: se deja como externa del servidor
  // (no se empaqueta), lo que evita errores de resolución en dev.
  serverExternalPackages: ["web-push"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
