"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus, Check, MessageCircle, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/products";
import {
  A_LA_MEDIDA, productMedia, sizeStock, tracksStock, canAddSize, isSoldOut, LOW_STOCK,
} from "@/lib/products";
import { formatRD } from "@/lib/format";
import { useCart } from "@/lib/cart/CartContext";
import { WishlistHeart } from "@/components/WishlistHeart";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";

export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const options = [
    ...(product.sizes ?? []),
    ...(product.made_to_measure ? [A_LA_MEDIDA] : []),
  ];
  const [size, setSize] = useState(
    options.find((o) => canAddSize(product, o)) ?? options[0] ?? A_LA_MEDIDA
  );
  const [added, setAdded] = useState(false);
  const onSale = !!product.sale_price && product.sale_price > 0;

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
          {onSale ? (
            <>
              <span className="text-terracota">{formatRD(product.sale_price)}</span>
              <span className="text-navy/40 line-through text-base">{formatRD(product.price)}</span>
            </>
          ) : (
            <span className="text-terracota">{formatRD(product.price)}</span>
          )}
        </div>

        <p className="mt-6 text-navy/70 font-light leading-relaxed">{product.description}</p>

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
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          {canAdd ? (
            <button onClick={handleAdd} className="btn flex-1">
              {added ? (<><Check size={16} /> Agregado</>) : (<><Plus size={16} /> Agregar al carrito</>)}
            </button>
          ) : (
            <button disabled className="btn flex-1 !bg-navy/30 !border-navy/30 cursor-not-allowed">
              Agotada
            </button>
          )}
          <a
            href={waLink(
              canAdd ? WA_MESSAGES.pieza(product.name) : WA_MESSAGES.stock(product.name, size === A_LA_MEDIDA ? undefined : size)
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline flex-1"
          >
            <MessageCircle size={16} /> {canAdd ? "Consultar" : "Consultar producción"}
          </a>
        </div>

        {soldOut && product.made_to_measure && (
          <p className="mt-3 text-sm text-navy/55">
            Agotada por ahora — podemos confeccionarla <strong>a tu medida</strong>. Elige “A la medida” o escríbenos.
          </p>
        )}
      </div>
    </div>
  );
}
