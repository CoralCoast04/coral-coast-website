"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
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
  const reduce = useReducedMotion();

  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax sutil: el fondo cae despacio, el contenido sube y se desvanece.
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "16%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, reduce ? 1 : 0]);

  return (
    <section
      ref={ref}
      className="relative h-[100svh] min-h-[600px] w-full overflow-hidden"
    >
      {/* Fondo con parallax (escalado para que el desplazamiento no revele bordes) */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ y: bgY, scale: 1.12 }}
      >
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
      </motion.div>

      {/* Contenido */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-luxe relative z-10 flex h-full flex-col items-start justify-center text-white"
      >
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
      </motion.div>

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
