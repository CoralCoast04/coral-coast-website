"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Plus, Check, MessageCircle, ArrowLeft } from "lucide-react";
import type { Product } from "@/lib/products";
import { A_LA_MEDIDA } from "@/lib/products";
import { formatRD } from "@/lib/format";
import { useCart } from "@/lib/cart/CartContext";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";

export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const options = [
    ...(product.sizes ?? []),
    ...(product.made_to_measure ? [A_LA_MEDIDA] : []),
  ];
  const [size, setSize] = useState(options[0] ?? A_LA_MEDIDA);
  const [added, setAdded] = useState(false);
  const onSale = !!product.sale_price && product.sale_price > 0;

  function handleAdd() {
    addItem(product, size);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
      {/* Imagen */}
      <div className="relative aspect-[4/5] overflow-hidden bg-arena/20">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          priority
          sizes="(max-width:768px) 100vw, 50vw"
          className="object-cover"
        />
        {onSale && (
          <span className="absolute top-4 left-4 bg-terracota text-white text-[0.62rem] tracking-[0.18em] uppercase px-3 py-1">
            Oferta
          </span>
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
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSize(opt)}
                  className={`px-4 py-2 text-sm tracking-wide border rounded-full transition-colors duration-300 ${
                    size === opt ? "bg-navy text-white border-navy" : "border-navy/20 text-navy/70 hover:border-navy/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <button onClick={handleAdd} className="btn flex-1">
            {added ? (<><Check size={16} /> Agregado</>) : (<><Plus size={16} /> Agregar al carrito</>)}
          </button>
          <a
            href={waLink(WA_MESSAGES.pieza(product.name))}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline flex-1"
          >
            <MessageCircle size={16} /> Consultar
          </a>
        </div>
      </div>
    </div>
  );
}
