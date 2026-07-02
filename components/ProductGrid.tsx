"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Product } from "@/lib/products";
import { CATEGORIES } from "@/lib/products";
import { formatRD } from "@/lib/format";
import { useCart } from "@/lib/cart/CartContext";

const ease = [0.22, 1, 0.36, 1] as const;

export function ProductGrid({ products }: { products: Product[] }) {
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>("Todo");
  const { addItem } = useCart();

  const filtered = useMemo(
    () =>
      active === "Todo"
        ? products
        : products.filter((p) => p.category === active),
    [active, products]
  );

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-5 py-2 rounded-full text-[0.78rem] tracking-wide transition-all duration-500 border ${
              active === cat
                ? "bg-navy text-white border-navy"
                : "bg-transparent text-navy border-navy/20 hover:border-navy/50"
            }`}
            style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.ul
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((p, i) => {
            const onSale = !!p.sale_price && p.sale_price > 0;
            return (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.7, ease, delay: (i % 3) * 0.06 }}
                className="group"
              >
                <div className="relative overflow-hidden bg-arena/20 aspect-[4/5]">
                  <Image
                    src={p.image_url}
                    alt={p.name}
                    fill
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[1100ms] group-hover:scale-105"
                    style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
                  />
                  {onSale && (
                    <span className="absolute top-3 left-3 bg-terracota text-white text-[0.62rem] tracking-[0.18em] uppercase px-3 py-1">
                      Oferta
                    </span>
                  )}
                  <div className="absolute inset-0 bg-navy/0 transition-colors duration-700 group-hover:bg-navy/10" />
                  {/* CTA agregar al carrito */}
                  <button
                    onClick={() => addItem(p)}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] btn !py-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500"
                  >
                    <Plus size={16} /> Agregar
                  </button>
                </div>

                <div className="pt-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-serif text-xl text-navy">{p.name}</h3>
                    <span className="text-[0.7rem] tracking-[0.2em] uppercase text-salvia">
                      {p.category}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-navy/60 leading-relaxed">
                    {p.description}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-sm">
                    {onSale ? (
                      <>
                        <span className="text-terracota">{formatRD(p.sale_price)}</span>
                        <span className="text-navy/40 line-through">{formatRD(p.price)}</span>
                      </>
                    ) : (
                      <span className="text-terracota">{formatRD(p.price)}</span>
                    )}
                    {p.fabric && <span className="text-navy/45">· {p.fabric}</span>}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
