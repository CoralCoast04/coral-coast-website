"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2, Tag, MessageCircle } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { effectivePrice, formatRD } from "@/lib/format";
import { validateCoupon, createOrder } from "@/app/cart-actions";
import { waLink, buildOrderMessage } from "@/lib/whatsapp";

const ease = [0.22, 1, 0.36, 1] as const;

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    setQty,
    removeItem,
    clear,
    coupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discount,
    total,
  } = useCart();

  const [code, setCode] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  async function handleApplyCoupon() {
    if (!code.trim()) return;
    setChecking(true);
    setCouponMsg(null);
    const res = await validateCoupon(code, subtotal);
    setChecking(false);
    if (res.ok && res.coupon) {
      applyCoupon(res.coupon);
      setCouponMsg({ ok: true, text: res.message });
      setCode("");
    } else {
      setCouponMsg({ ok: false, text: res.message });
    }
  }

  async function handleCheckout() {
    if (items.length === 0) return;
    setSending(true);

    const orderItems = items.map((i) => ({
      id: i.id,
      name: i.name,
      qty: i.qty,
      unit_price: effectivePrice(i),
      size: i.size,
    }));

    // Guardar la orden (devuelve el código de seguimiento; no bloquea si falla)
    const res = await createOrder({
      items: orderItems,
      subtotal,
      discount,
      total,
      coupon_code: coupon?.code ?? null,
      customer_name: name.trim() || null,
      customer_phone: phone.trim() || null,
      customer_email: email.trim() || null,
    });

    const message = buildOrderMessage({
      items: orderItems,
      subtotal,
      discount,
      total,
      couponCode: coupon?.code,
      name: name.trim() || null,
      phone: phone.trim() || null,
      trackingCode: res.tracking_code ?? null,
    });

    window.open(waLink(message), "_blank", "noopener");
    setSending(false);
    clear();
    closeCart();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-[60] bg-navy/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={closeCart}
          />

          {/* Panel */}
          <motion.aside
            className="fixed right-0 top-0 z-[61] h-full w-full max-w-md bg-fondo shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease }}
          >
            <header className="flex items-center justify-between px-6 py-5 border-b border-navy/10">
              <h2 className="font-serif text-2xl text-navy">Tu selección</h2>
              <button onClick={closeCart} aria-label="Cerrar" className="text-navy hover:text-terracota transition-colors">
                <X size={24} />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-3">
                <p className="text-navy/60">Tu selección está vacía.</p>
                <button onClick={closeCart} className="link-underline text-sm text-terracota">
                  Explorar la colección →
                </button>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                  {items.map((i) => (
                    <div key={i.key} className="flex gap-4">
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-arena/20">
                        <Image src={i.image_url} alt={i.name} fill className="object-cover" sizes="80px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2">
                          <h3 className="font-serif text-lg text-navy leading-tight">{i.name}</h3>
                          <button onClick={() => removeItem(i.key)} aria-label="Quitar" className="text-navy/40 hover:text-terracota transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-[0.7rem] tracking-[0.14em] uppercase text-navy/45 mt-0.5">Talla: {i.size}</p>
                        <p className="text-sm text-terracota mt-1">{formatRD(effectivePrice(i))}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <button onClick={() => setQty(i.key, i.qty - 1)} className="h-7 w-7 flex items-center justify-center border border-navy/20 hover:border-navy/50 transition-colors" aria-label="Menos">
                            <Minus size={13} />
                          </button>
                          <span className="text-sm text-navy w-5 text-center">{i.qty}</span>
                          <button onClick={() => setQty(i.key, i.qty + 1)} className="h-7 w-7 flex items-center justify-center border border-navy/20 hover:border-navy/50 transition-colors" aria-label="Más">
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pie: cupón, datos y totales */}
                <div className="border-t border-navy/10 px-6 py-5 space-y-4 bg-white/40">
                  {/* Cupón */}
                  {coupon ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-2 text-salvia">
                        <Tag size={15} /> Cupón {coupon.code} aplicado
                      </span>
                      <button onClick={() => { removeCoupon(); setCouponMsg(null); }} className="text-navy/40 hover:text-terracota transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                          placeholder="Código de cupón"
                          className="flex-1 bg-transparent border-b border-navy/25 py-2 text-sm text-navy placeholder:text-navy/40 focus:border-terracota focus:outline-none uppercase"
                        />
                        <button onClick={handleApplyCoupon} disabled={checking} className="text-sm tracking-wide text-navy hover:text-terracota transition-colors disabled:opacity-50">
                          {checking ? "…" : "Aplicar"}
                        </button>
                      </div>
                      {couponMsg && (
                        <p className={`mt-1 text-xs ${couponMsg.ok ? "text-salvia" : "text-terracota"}`}>{couponMsg.text}</p>
                      )}
                    </div>
                  )}

                  {/* Datos opcionales */}
                  <div className="grid grid-cols-2 gap-3">
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="bg-transparent border-b border-navy/25 py-2 text-sm text-navy placeholder:text-navy/40 focus:border-terracota focus:outline-none" />
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" className="bg-transparent border-b border-navy/25 py-2 text-sm text-navy placeholder:text-navy/40 focus:border-terracota focus:outline-none" />
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Correo (para confirmación)" className="col-span-2 bg-transparent border-b border-navy/25 py-2 text-sm text-navy placeholder:text-navy/40 focus:border-terracota focus:outline-none" />
                  </div>

                  {/* Totales */}
                  <div className="space-y-1 text-sm pt-1">
                    <div className="flex justify-between text-navy/70">
                      <span>Subtotal</span>
                      <span>{formatRD(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-salvia">
                        <span>Descuento</span>
                        <span>−{formatRD(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-navy font-medium text-base pt-1">
                      <span>Total</span>
                      <span>{formatRD(total)}</span>
                    </div>
                  </div>

                  <button onClick={handleCheckout} disabled={sending} className="btn w-full disabled:opacity-60">
                    <MessageCircle size={16} /> {sending ? "Preparando…" : "Finalizar por WhatsApp"}
                  </button>
                  <p className="text-[0.7rem] text-navy/45 text-center leading-relaxed">
                    Las piezas se confeccionan a la medida. El pedido se coordina y
                    confirma por WhatsApp — sin pago en línea.
                  </p>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
