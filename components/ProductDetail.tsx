"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus, Check, MessageCircle, ArrowLeft, ChevronLeft, ChevronRight, ShoppingBag, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import type { Product } from "@/lib/products";
import {
  A_LA_MEDIDA, productMedia, sizeStock, tracksStock, canAddSize, isSoldOut, LOW_STOCK,
} from "@/lib/products";
import { formatRD } from "@/lib/format";
import { useCart } from "@/lib/cart/CartContext";
import { WishlistHeart } from "@/components/WishlistHeart";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";
import { subscribeStockAlert } from "@/app/cart-actions";

export function ProductDetail({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const options = [
    ...(product.sizes ?? []),
    ...(product.made_to_measure ? [A_LA_MEDIDA] : []),
  ];
  const [size, setSize] = useState(
    options.find((o) => canAddSize(product, o)) ?? options[0] ?? A_LA_MEDIDA
  );
  const [added, setAdded] = useState(false);
  const onSale = !!product.sale_price && product.sale_price > 0;

  const [alertEmail, setAlertEmail] = useState("");
  const [alertMsg, setAlertMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [alertSending, setAlertSending] = useState(false);

  const tracks = tracksStock(product);
  const soldOut = isSoldOut(product);
  const selStock = size === A_LA_MEDIDA ? null : sizeStock(product, size);
  const canAdd = canAddSize(product, size);

  const reduce = useReducedMotion();
  const media = productMedia(product);
  const [active, setActive] = useState(0);
  const current = media[active] ?? media[0];

  const go = (dir: number) =>
    setActive((a) => (a + dir + media.length) % media.length);

  function handleAdd() {
    if (!canAdd) return;
    addItem(product, size);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  function handleBuyNow() {
    if (!canAdd) return;
    addItem(product, size);
    openCart();
  }

  async function handleAlert() {
    if (alertSending) return;
    setAlertSending(true);
    const res = await subscribeStockAlert({
      productId: product.id,
      size: size === A_LA_MEDIDA ? null : size,
      email: alertEmail,
    });
    setAlertSending(false);
    setAlertMsg({ ok: res.ok, text: res.message });
    if (res.ok) setAlertEmail("");
  }

  return (
    <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
      {/* Galería */}
      <div className="space-y-3">
        <div className="group relative aspect-[4/5] overflow-hidden bg-arena/20">
          <AnimatePresence initial={false}>
            <motion.div
              key={active}
              className="absolute inset-0"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {current?.type === "video" ? (
                <video src={current.url} controls playsInline className="h-full w-full object-cover" />
              ) : (
                <Image
                  src={current?.url ?? product.image_url}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width:768px) 100vw, 50vw"
                  className="object-cover"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {onSale && (
            <span className="absolute top-4 left-4 z-10 bg-terracota text-white text-[0.62rem] tracking-[0.18em] uppercase px-3 py-1">
              Oferta
            </span>
          )}
          <WishlistHeart productId={product.id} size={20} className="absolute top-4 right-4 z-10 h-10 w-10" />

          {/* Flechas para deslizar entre fotos */}
          {media.length > 1 && (
            <>
              <button
                onClick={() => go(-1)}
                aria-label="Foto anterior"
                className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-navy shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white hover:scale-105"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Foto siguiente"
                className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-navy shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white hover:scale-105"
              >
                <ChevronRight size={18} />
              </button>
              {/* Contador de fotos */}
              <span className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-navy/60 px-2.5 py-0.5 text-[0.68rem] tracking-wide text-white backdrop-blur-sm">
                {active + 1} / {media.length}
              </span>
            </>
          )}
        </div>

        {media.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {media.map((m, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative h-16 w-14 overflow-hidden bg-arena/20 border transition-colors ${i === active ? "border-navy" : "border-transparent hover:border-navy/30"}`}
                aria-label={`Ver ${m.type === "video" ? "video" : "foto"} ${i + 1}`}
              >
                {m.type === "video" ? (
                  <video src={m.url} muted className="h-full w-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt="" className="h-full w-full object-cover" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="md:pt-6">
        <Link href="/coleccion" className="inline-flex items-center gap-2 text-sm text-navy/50 hover:text-terracota transition-colors mb-6">
          <ArrowLeft size={15} /> Volver a la colección
        </Link>

        <p className="eyebrow text-salvia mb-3">{product.category}</p>
        <h1 className="font-serif text-4xl md:text-5xl text-navy leading-tight">{product.name}</h1>

        <div className="mt-4 flex items-center gap-3 text-lg">
          {size === A_LA_MEDIDA && product.made_to_measure_price ? (
            <>
              <span className="text-terracota">{formatRD(product.made_to_measure_price)}</span>
              <span className="text-xs tracking-[0.16em] uppercase text-navy/45">A la medida</span>
            </>
          ) : onSale ? (
            <>
              <span className="text-terracota">{formatRD(product.sale_price)}</span>
              <span className="text-navy/40 line-through text-base">{formatRD(product.price)}</span>
            </>
          ) : (
            <span className="text-terracota">{formatRD(product.price)}</span>
          )}
        </div>

        <dl className="mt-6 space-y-1 text-sm text-navy/60">
          {product.fabric && (
            <div className="flex gap-2"><dt className="text-navy/40">Tejido:</dt><dd>{product.fabric}</dd></div>
          )}
          {product.color && (
            <div className="flex gap-2"><dt className="text-navy/40">Color:</dt><dd>{product.color}</dd></div>
          )}
          {product.made_to_measure && (
            <div className="flex gap-2"><dt className="text-navy/40">Confección:</dt><dd>Disponible a la medida</dd></div>
          )}
        </dl>

        {/* Secciones desplegables */}
        <div className="mt-6">
          {product.description && (
            <InfoSection title="Descripción" defaultOpen>
              <p className="text-navy/70 font-light leading-relaxed">{product.description}</p>
            </InfoSection>
          )}
          {product.care && product.care.trim() && (
            <InfoSection title="Cuidados de la prenda">
              <ul className="space-y-1 text-sm text-navy/65">
                {product.care
                  .split(/\r?\n/)
                  .map((l) => l.trim())
                  .filter(Boolean)
                  .map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-terracota shrink-0">·</span>
                      <span>{line}</span>
                    </li>
                  ))}
              </ul>
            </InfoSection>
          )}
        </div>

        {/* Tallas */}
        {options.length > 1 && (
          <div className="mt-8">
            <p className="text-[0.72rem] tracking-[0.2em] uppercase text-navy/50 mb-3">Talla</p>
            <div className="flex flex-wrap gap-2">
              {options.map((opt) => {
                const available = canAddSize(product, opt);
                return (
                  <button
                    key={opt}
                    onClick={() => available && setSize(opt)}
                    disabled={!available}
                    title={!available ? "Agotada — consúltala por WhatsApp" : undefined}
                    className={`px-4 py-2 text-sm tracking-wide border rounded-full transition-colors duration-300 ${
                      size === opt
                        ? "bg-navy text-white border-navy"
                        : !available
                          ? "border-navy/10 text-navy/30 line-through cursor-not-allowed"
                          : "border-navy/20 text-navy/70 hover:border-navy/50"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Aviso de stock de la talla elegida */}
            {tracks && size !== A_LA_MEDIDA && (
              <p className={`mt-3 text-sm ${selStock === 0 ? "text-terracota" : selStock! <= LOW_STOCK ? "text-terracota" : "text-salvia"}`}>
                {selStock === 0
                  ? "Agotada en esta talla."
                  : selStock! <= LOW_STOCK
                    ? `¡Últimas ${selStock}!`
                    : "Disponible"}
              </p>
            )}
          </div>
        )}

        {/* Acciones */}
        {canAdd ? (
          <div className="mt-10 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleBuyNow} className="btn flex-1">
                <ShoppingBag size={16} /> Comprar ahora
              </button>
              <button onClick={handleAdd} className="btn btn-outline flex-1">
                {added ? (<><Check size={16} /> Agregado</>) : (<><Plus size={16} /> Agregar al carrito</>)}
              </button>
            </div>
            <a
              href={waLink(WA_MESSAGES.pieza(product.name))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-sm text-navy/55 hover:text-terracota transition-colors"
            >
              <MessageCircle size={15} /> Consultar por WhatsApp
            </a>
          </div>
        ) : (
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button disabled className="btn flex-1 !bg-navy/30 !border-navy/30 cursor-not-allowed">
              Agotada
            </button>
            <a
              href={waLink(WA_MESSAGES.stock(product.name, size === A_LA_MEDIDA ? undefined : size))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline flex-1"
            >
              <MessageCircle size={16} /> Consultar producción
            </a>
          </div>
        )}

        {soldOut && product.made_to_measure && (
          <p className="mt-3 text-sm text-navy/55">
            Agotada por ahora — podemos confeccionarla <strong>a tu medida</strong>. Elige “A la medida” o escríbenos.
          </p>
        )}

        {/* (secciones desplegables definidas con InfoSection, ver abajo) */}

        {/* Avísame cuando vuelva (talla agotada) */}
        {tracks && size !== A_LA_MEDIDA && selStock === 0 && (
          <div className="mt-6 border-t border-navy/10 pt-5">
            <p className="text-[0.72rem] tracking-[0.2em] uppercase text-navy/50 mb-2">Avísame cuando vuelva</p>
            <p className="text-sm text-navy/55 mb-3">
              Déjanos tu correo y te avisamos apenas la talla {size} esté disponible.
            </p>
            <div className="flex gap-2">
              <input
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAlert()}
                type="email"
                placeholder="tu@correo.com"
                className="flex-1 bg-transparent border-b border-navy/25 py-2 text-sm text-navy placeholder:text-navy/40 focus:border-terracota focus:outline-none"
              />
              <button
                onClick={handleAlert}
                disabled={alertSending}
                className="text-sm tracking-wide text-navy hover:text-terracota transition-colors disabled:opacity-50"
              >
                {alertSending ? "…" : "Avísame"}
              </button>
            </div>
            {alertMsg && (
              <p className={`mt-2 text-xs ${alertMsg.ok ? "text-salvia" : "text-terracota"}`}>
                {alertMsg.text}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* Sección desplegable (acordeón) — el cliente abre/cierra a su gusto. */
function InfoSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-navy/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-[0.72rem] tracking-[0.2em] uppercase text-navy/60 group-hover:text-navy transition-colors">
          {title}
        </span>
        <ChevronDown
          size={16}
          className={`text-navy/40 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
