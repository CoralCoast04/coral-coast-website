"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";

const POSTER =
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1920&q=80";

/**
 * Hero con video lifestyle a pantalla completa.
 * Coloca tu video en /public/hero.mp4 — mientras no exista, se ve el póster.
 */
export function Hero({
  eyebrow = "Casa de diseño dominicana · Hecho en RD",
  title = "El Caribe, hecho a tu medida.",
  subtitle = "Chacabanas, trajes, bermudas y pantalones en lino y otros tejidos nobles. Piezas de colección o diseñadas a tu medida.",
  image = POSTER,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  image?: string;
}) {
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section className="relative h-[100svh] min-h-[600px] w-full overflow-hidden">
      {/* Video de fondo */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={image}
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* Velo para legibilidad (más oscuro arriba para la navbar) */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy/65 via-navy/35 to-navy/75" />

      {/* Contenido */}
      <div className="container-luxe relative z-10 flex h-full flex-col items-start justify-center text-white">
        <motion.p
          className="eyebrow text-arena mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.2 }}
        >
          {eyebrow}
        </motion.p>

        <motion.h1
          className="max-w-3xl text-4xl leading-[1.1] sm:text-6xl md:text-7xl font-light"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease, delay: 0.35 }}
        >
          {title}
        </motion.h1>

        <motion.p
          className="mt-6 max-w-xl text-base sm:text-lg text-white/85 font-light leading-relaxed"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease, delay: 0.5 }}
        >
          {subtitle}
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease, delay: 0.65 }}
        >
          <Link href="/coleccion" className="btn">
            Ver la colección
          </Link>
          <a
            href={waLink(WA_MESSAGES.cita)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline !border-white !text-white hover:!border-terracota"
          >
            Agenda por WhatsApp
          </a>
        </motion.div>
      </div>

      {/* Indicador de scroll */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-xs tracking-[0.3em] uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        <span className="animate-pulse">Desliza</span>
      </motion.div>
    </section>
  );
}
