"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Check, Search, X } from "lucide-react";
import type { Product } from "@/lib/products";
import { A_LA_MEDIDA } from "@/lib/products";
import { formatRD } from "@/lib/format";
import { useCart } from "@/lib/cart/CartContext";

const ease = [0.22, 1, 0.36, 1] as const;

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function ProductGrid({ products }: { products: Product[] }) {
  const [active, setActive] = useState<string>("Todo");
  const [query, setQuery] = useState("");

  const categories = useMemo(
    () => ["Todo", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))],
    [products]
  );

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return products.filter((p) => {
      const byCat = active === "Todo" || p.category === active;
      const byQuery =
        !q ||
        norm(`${p.name} ${p.description} ${p.category} ${p.fabric ?? ""} ${p.color ?? ""}`).includes(q);
      return byCat && byQuery;
    });
  }, [active, query, products]);

  return (
    <div>
      {/* Búsqueda */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-navy/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar piezas, tejidos, colores…"
            className="w-full bg-transparent border-b border-navy/25 py-3 pl-7 pr-7 text-navy placeholder:text-navy/40 focus:border-terracota focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Limpiar" className="absolute right-0 top-1/2 -translate-y-1/2 text-navy/40 hover:text-terracota">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-4 py-1.5 rounded-full text-[0.75rem] tracking-wide transition-all duration-500 border ${
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

      {filtered.length === 0 ? (
        <p className="text-center text-navy/50 py-16">
          No encontramos piezas para “{query}”.
        </p>
      ) : (
        <motion.ul
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} p={p} index={i} />
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.6, ease, delay: (index % 4) * 0.05 }}
      className="group flex flex-col"
    >
      <Link href={`/coleccion/${p.slug}`} className="relative overflow-hidden bg-arena/20 aspect-[4/5] block">
        <Image
          src={p.image_url}
          alt={p.name}
          fill
          sizes="(max-width:768px) 50vw, (max-width:1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-[1100ms] group-hover:scale-105"
          style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
        />
        {onSale && (
          <span className="absolute top-2 left-2 bg-terracota text-white text-[0.58rem] tracking-[0.16em] uppercase px-2 py-0.5">
            Oferta
          </span>
        )}
      </Link>

      <div className="pt-3 flex flex-col flex-1">
        <Link href={`/coleccion/${p.slug}`}>
          <h3 className="font-serif text-base md:text-lg text-navy leading-tight">{p.name}</h3>
        </Link>
        <p className="mt-1 text-[0.7rem] tracking-[0.16em] uppercase text-salvia">{p.category}</p>

        <div className="mt-1.5 flex items-center gap-2 text-sm flex-wrap">
          {onSale ? (
            <>
              <span className="text-terracota">{formatRD(p.sale_price)}</span>
              <span className="text-navy/40 line-through text-xs">{formatRD(p.price)}</span>
            </>
          ) : (
            <span className="text-terracota">{formatRD(p.price)}</span>
          )}
        </div>

        {options.length > 1 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => setSize(opt)}
                className={`px-2 py-0.5 text-[0.66rem] tracking-wide border rounded-full transition-colors duration-300 ${
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

        <button onClick={handleAdd} className="btn !py-2.5 !text-[0.7rem] w-full mt-3">
          {added ? (
            <>
              <Check size={14} /> Agregado
            </>
          ) : (
            <>
              <Plus size={14} /> Agregar
            </>
          )}
        </button>
      </div>
    </motion.li>
  );
}
