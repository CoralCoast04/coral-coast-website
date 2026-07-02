"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Check } from "lucide-react";
import type { Product } from "@/lib/products";
import { A_LA_MEDIDA } from "@/lib/products";
import { formatRD } from "@/lib/format";
import { useCart } from "@/lib/cart/CartContext";

const ease = [0.22, 1, 0.36, 1] as const;

export function ProductGrid({ products }: { products: Product[] }) {
  const [active, setActive] = useState<string>("Todo");

  // Categorías derivadas de los productos (ilimitadas, en orden de aparición).
  const categories = useMemo(
    () => ["Todo", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))],
    [products]
  );

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
        {categories.map((cat) => (
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
          {filtered.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}

function ProductCard({ p, index }: { p: Product; index: number }) {
  const { addItem } = useCart();
  const options = [...(p.sizes ?? []), ...(p.made_to_measure ? [A_LA_MEDIDA] : [])];
  const [size, setSize] = useState(options[0] ?? A_LA_MEDIDA);
  const [added, setAdded] = useState(false);
  const onSale = !!p.sale_price && p.sale_price > 0;

  function handleAdd() {
    addItem(p, size);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.7, ease, delay: (index % 3) * 0.06 }}
      className="group flex flex-col"
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
      </div>

      <div className="pt-5 flex flex-col flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-xl text-navy">{p.name}</h3>
          <span className="text-[0.7rem] tracking-[0.2em] uppercase text-salvia">
            {p.category}
          </span>
        </div>
        <p className="mt-2 text-sm text-navy/60 leading-relaxed">{p.description}</p>

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

        {/* Selector de talla */}
        {options.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => setSize(opt)}
                className={`px-3 py-1 text-[0.72rem] tracking-wide border rounded-full transition-colors duration-300 ${
                  size === opt
                    ? "bg-navy text-white border-navy"
                    : "border-navy/20 text-navy/70 hover:border-navy/50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        <button onClick={handleAdd} className="btn !py-3 w-full mt-5">
          {added ? (
            <>
              <Check size={16} /> Agregado
            </>
          ) : (
            <>
              <Plus size={16} /> Agregar
            </>
          )}
        </button>
      </div>
    </motion.li>
  );
}
