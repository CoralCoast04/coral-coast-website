"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2, Tag, MessageCircle, Gift, Truck, Store, ArrowLeft, MapPin } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { effectivePrice, formatRD } from "@/lib/format";
import { validateCoupon, createOrder } from "@/app/cart-actions";
import { waLink, buildOrderMessage } from "@/lib/whatsapp";
import { DR_PROVINCES, quoteShipping, type ShippingRate } from "@/lib/shipping";
import type { Address } from "@/lib/addresses";

const ease = [0.22, 1, 0.36, 1] as const;
const TIME_SLOTS = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

type Props = {
  giftWrapImage?: string;
  giftNote?: string;
  studioAddress?: string;
  studioHours?: string;
  shippingRates?: ShippingRate[];
  freeShippingThreshold?: number;
  userName?: string | null;
  userEmail?: string | null;
  addresses?: Address[];
};

export function CartDrawer({
  giftWrapImage, giftNote, studioAddress, studioHours,
  shippingRates = [], freeShippingThreshold = 0,
  userName = null, userEmail = null, addresses = [],
}: Props) {
  const {
    items, savedItems, isOpen, closeCart, setQty, removeItem, toggleGift,
    saveForLater, moveToCart, removeSaved, clear,
    coupon, applyCoupon, removeCoupon, subtotal, discount, total,
  } = useCart();

  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [code, setCode] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [name, setName] = useState(userName ?? "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(userEmail ?? "");
  const [delivery, setDelivery] = useState<"envio" | "retiro">("envio");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultAddr = addresses.find((a) => a.is_default) ?? addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddr?.id ?? "new");

  // Al abrir, si hay dirección guardada, precargar la predeterminada.
  useEffect(() => {
    if (isOpen && defaultAddr && selectedAddressId !== "new") {
      setProvince(defaultAddr.province ?? "");
      setAddress(defaultAddr.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Volver al paso "carrito" cada vez que se cierra.
  useEffect(() => { if (!isOpen) setStep("cart"); }, [isOpen]);

  function selectAddress(id: string) {
    setSelectedAddressId(id);
    if (id === "new") {
      setAddress("");
      setProvince("");
    } else {
      const a = addresses.find((x) => x.id === id);
      if (a) { setProvince(a.province ?? ""); setAddress(a.address); }
    }
  }

  const giftCount = items.filter((i) => i.gift).length;
  const today = new Date().toISOString().slice(0, 10);

  // Envío por provincia
  const activeRates = shippingRates.filter((r) => r.active);
  const rateMap = new Map(activeRates.map((r) => [r.province, r]));
  const provinceOptions = DR_PROVINCES.filter((p) => rateMap.has(p));
  const offersShipping = delivery === "envio" && provinceOptions.length > 0;
  const quote = quoteShipping(province ? rateMap.get(province) : null, subtotal, freeShippingThreshold);
  const shippingCost = offersShipping && quote.known ? quote.cost : 0;
  const grandTotal = total + shippingCost;
  const missingForFree =
    freeShippingThreshold > 0 && subtotal < freeShippingThreshold ? freeShippingThreshold - subtotal : 0;

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
    setError(null);
    if (delivery === "retiro" && (!pickupDate || !pickupTime)) {
      setError("Elige fecha y hora para tu retiro en el estudio.");
      return;
    }
    if (offersShipping && !province) {
      setError("Elige tu provincia para calcular el envío.");
      return;
    }
    if (delivery === "envio" && !address.trim()) {
      setError("Indica la dirección de envío.");
      return;
    }
    setSending(true);

    const orderItems = items.map((i) => ({
      id: i.id, name: i.name, qty: i.qty, unit_price: effectivePrice(i), size: i.size, gift: i.gift,
    }));

    const res = await createOrder({
      items: orderItems,
      subtotal, discount,
      shipping: delivery === "envio" ? shippingCost : 0,
      province: delivery === "envio" ? province || null : null,
      total: grandTotal,
      coupon_code: coupon?.code ?? null,
      customer_name: name.trim() || null,
      customer_phone: phone.trim() || null,
      customer_email: email.trim() || null,
      delivery_method: delivery,
      address: delivery === "envio" ? address.trim() || null : null,
      pickup_date: delivery === "retiro" ? pickupDate || null : null,
      pickup_time: delivery === "retiro" ? pickupTime || null : null,
    });

    const message = buildOrderMessage({
      items: orderItems,
      subtotal, discount,
      shipping: delivery === "envio" ? shippingCost : undefined,
      province: delivery === "envio" ? province || null : null,
      total: grandTotal,
      couponCode: coupon?.code,
      name: name.trim() || null,
      phone: phone.trim() || null,
      trackingCode: res.tracking_code ?? null,
      delivery,
      address: delivery === "envio" ? address.trim() || null : null,
      pickupDate: delivery === "retiro" ? pickupDate || null : null,
      pickupTime: delivery === "retiro" ? pickupTime || null : null,
    });

    window.open(waLink(message), "_blank", "noopener");
    setSending(false);
    clear();
    closeCart();
  }

  const inputBase = "bg-transparent border-b border-navy/25 py-2 text-sm text-navy placeholder:text-navy/40 focus:border-terracota focus:outline-none";
  const empty = items.length === 0 && savedItems.length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-navy/40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }} onClick={closeCart}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[61] h-full w-full max-w-md bg-fondo shadow-2xl flex flex-col"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease }}
          >
            <header className="flex items-center justify-between px-6 py-5 border-b border-navy/10 shrink-0">
              <div className="flex items-center gap-3">
                {step === "checkout" && (
                  <button onClick={() => setStep("cart")} aria-label="Volver" className="text-navy hover:text-terracota transition-colors">
                    <ArrowLeft size={22} />
                  </button>
                )}
                <h2 className="font-serif text-2xl text-navy">{step === "cart" ? "Tu selección" : "Finalizar compra"}</h2>
              </div>
              <button onClick={closeCart} aria-label="Cerrar" className="text-navy hover:text-terracota transition-colors">
                <X size={24} />
              </button>
            </header>

            {empty ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-3">
                <p className="text-navy/60">Tu selección está vacía.</p>
                <button onClick={closeCart} className="link-underline text-sm text-terracota">Explorar la colección →</button>
              </div>
            ) : step === "cart" ? (
              /* ---------------------------- PASO 1: CARRITO --------------------------- */
              <>
                <div className="flex-1 overflow-y-auto">
                  <div className="px-6 py-4 space-y-5">
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
                            <button onClick={() => setQty(i.key, i.qty - 1)} className="h-7 w-7 flex items-center justify-center border border-navy/20 hover:border-navy/50 transition-colors" aria-label="Menos"><Minus size={13} /></button>
                            <span className="text-sm text-navy w-5 text-center">{i.qty}</span>
                            <button onClick={() => setQty(i.key, i.qty + 1)} className="h-7 w-7 flex items-center justify-center border border-navy/20 hover:border-navy/50 transition-colors" aria-label="Más"><Plus size={13} /></button>
                            <button
                              onClick={() => toggleGift(i.key)}
                              className={`ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[0.68rem] transition-colors ${i.gift ? "bg-terracota/15 border-terracota text-terracota" : "border-navy/20 text-navy/60 hover:border-navy/50"}`}
                            >
                              <Gift size={13} /> Regalo
                            </button>
                          </div>
                          <button onClick={() => saveForLater(i.key)} className="mt-2 text-[0.72rem] text-navy/55 hover:text-terracota transition-colors">
                            Guardar para después
                          </button>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <p className="text-sm text-navy/50 text-center py-4">Tu carrito está vacío. Tienes piezas guardadas abajo.</p>
                    )}
                  </div>

                  {/* Guardado para después */}
                  {savedItems.length > 0 && (
                    <div className="border-t border-navy/10 px-6 py-4">
                      <p className="text-[0.72rem] tracking-[0.2em] uppercase text-navy/50 mb-3">Guardado para después</p>
                      <div className="space-y-4">
                        {savedItems.map((i) => (
                          <div key={i.key} className="flex gap-3 items-center">
                            <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-arena/20">
                              <Image src={i.image_url} alt={i.name} fill className="object-cover" sizes="56px" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-serif text-base text-navy leading-tight truncate">{i.name}</h4>
                              <p className="text-[0.68rem] uppercase tracking-wider text-navy/45">Talla: {i.size}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <button onClick={() => moveToCart(i.key)} className="text-[0.72rem] text-terracota hover:underline">Mover al carrito</button>
                                <button onClick={() => removeSaved(i.key)} className="text-[0.72rem] text-navy/45 hover:text-terracota">Quitar</button>
                              </div>
                            </div>
                            <span className="text-sm text-terracota shrink-0">{formatRD(effectivePrice(i))}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer del carrito */}
                {items.length > 0 && (
                  <div className="border-t border-navy/10 px-6 py-5 space-y-3 bg-white/40 shrink-0">
                    <div className="flex justify-between text-navy font-medium">
                      <span>Subtotal</span><span>{formatRD(subtotal)}</span>
                    </div>
                    <button onClick={() => setStep("checkout")} className="btn w-full">Finalizar compra</button>
                  </div>
                )}
              </>
            ) : (
              /* --------------------------- PASO 2: CHECKOUT --------------------------- */
              <div className="flex-1 overflow-y-auto">
                <div className="px-6 py-5 space-y-5">
                  {/* Resumen de piezas */}
                  <div className="space-y-2">
                    {items.map((i) => (
                      <div key={i.key} className="flex justify-between text-sm text-navy/70">
                        <span className="truncate pr-2">{i.qty} × {i.name} <span className="text-navy/40">({i.size})</span></span>
                        <span className="shrink-0">{formatRD(effectivePrice(i) * i.qty)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Regalo */}
                  {giftCount > 0 && (
                    <div className="flex gap-3 items-center bg-arena/20 p-3 rounded">
                      {giftWrapImage && (
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded">
                          <Image src={giftWrapImage} alt="Envoltura de regalo" fill className="object-cover" sizes="64px" />
                        </div>
                      )}
                      <p className="text-xs text-navy/70 leading-relaxed">{giftNote || "Envolvemos tus piezas de regalo en nuestro empaque especial."}</p>
                    </div>
                  )}

                  {/* Cupón */}
                  {coupon ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-2 text-salvia"><Tag size={15} /> Cupón {coupon.code} aplicado</span>
                      <button onClick={() => { removeCoupon(); setCouponMsg(null); }} className="text-navy/40 hover:text-terracota transition-colors"><X size={16} /></button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()} placeholder="Código de cupón" className={`flex-1 ${inputBase} uppercase`} />
                        <button onClick={handleApplyCoupon} disabled={checking} className="text-sm tracking-wide text-navy hover:text-terracota transition-colors disabled:opacity-50">{checking ? "…" : "Aplicar"}</button>
                      </div>
                      {couponMsg && <p className={`mt-1 text-xs ${couponMsg.ok ? "text-salvia" : "text-terracota"}`}>{couponMsg.text}</p>}
                    </div>
                  )}

                  {/* Datos */}
                  <div>
                    {userEmail && (
                      <p className="text-xs text-navy/55 mb-2">Comprando como <span className="text-navy">{userName || userEmail}</span>. Puedes editar los datos si el pedido es para otra persona.</p>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className={inputBase} />
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" className={inputBase} />
                      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Correo (para confirmación)" className={`col-span-2 ${inputBase}`} />
                    </div>
                  </div>

                  {/* Entrega */}
                  <div>
                    <p className="text-[0.72rem] tracking-[0.2em] uppercase text-navy/50 mb-2">Entrega</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setDelivery("envio")} className={`flex items-center justify-center gap-2 py-2.5 text-sm border rounded transition-colors ${delivery === "envio" ? "bg-navy text-white border-navy" : "border-navy/20 text-navy/70"}`}><Truck size={15} /> Envío</button>
                      <button onClick={() => setDelivery("retiro")} className={`flex items-center justify-center gap-2 py-2.5 text-sm border rounded transition-colors ${delivery === "retiro" ? "bg-navy text-white border-navy" : "border-navy/20 text-navy/70"}`}><Store size={15} /> Retiro</button>
                    </div>

                    {delivery === "envio" ? (
                      <div className="mt-3 space-y-3">
                        {/* Direcciones guardadas */}
                        {addresses.length > 0 && (
                          <div className="space-y-2">
                            {addresses.map((a) => (
                              <label key={a.id} className={`flex items-start gap-2 p-3 border rounded cursor-pointer transition-colors ${selectedAddressId === a.id ? "border-terracota bg-terracota/5" : "border-navy/15"}`}>
                                <input type="radio" name="addr" checked={selectedAddressId === a.id} onChange={() => selectAddress(a.id)} className="mt-1" />
                                <span className="text-sm text-navy/80 leading-snug">
                                  {a.label && <span className="font-medium text-navy">{a.label} · </span>}
                                  {a.address}
                                  <span className="block text-xs text-navy/45">{[a.municipality, a.province].filter(Boolean).join(", ")}</span>
                                </span>
                              </label>
                            ))}
                            <label className={`flex items-center gap-2 p-3 border rounded cursor-pointer transition-colors ${selectedAddressId === "new" ? "border-terracota bg-terracota/5" : "border-navy/15"}`}>
                              <input type="radio" name="addr" checked={selectedAddressId === "new"} onChange={() => selectAddress("new")} />
                              <span className="text-sm text-navy/70 inline-flex items-center gap-1"><MapPin size={14} /> Usar otra dirección</span>
                            </label>
                          </div>
                        )}

                        {/* Formulario manual (sin direcciones guardadas, o "otra dirección") */}
                        {(addresses.length === 0 || selectedAddressId === "new") && (
                          <>
                            {provinceOptions.length > 0 ? (
                              <select value={province} onChange={(e) => setProvince(e.target.value)} className={`w-full ${inputBase}`}>
                                <option value="">Provincia…</option>
                                {provinceOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                              </select>
                            ) : (
                              <p className="text-xs text-navy/55">Coordinamos el costo de envío contigo por WhatsApp.</p>
                            )}
                            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} placeholder="Dirección de envío" className={`w-full ${inputBase}`} />
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="mt-3 space-y-3">
                        <p className="text-xs text-navy/55">Agenda tu visita al estudio{studioAddress ? ` · ${studioAddress}` : ""}{studioHours ? ` · ${studioHours}` : ""}.</p>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="date" min={today} value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className={inputBase} />
                          <select value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className={inputBase}>
                            <option value="">Hora…</option>
                            {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Totales */}
                  <div className="space-y-1 text-sm pt-1 border-t border-navy/10">
                    <div className="flex justify-between text-navy/70 pt-3"><span>Subtotal</span><span>{formatRD(subtotal)}</span></div>
                    {discount > 0 && <div className="flex justify-between text-salvia"><span>Descuento</span><span>−{formatRD(discount)}</span></div>}
                    {delivery === "envio" && offersShipping && (
                      <div className="flex justify-between text-navy/70">
                        <span>Envío{province ? ` · ${province}` : ""}</span>
                        <span>{!province ? "Elige provincia" : quote.free ? "Gratis" : formatRD(shippingCost)}</span>
                      </div>
                    )}
                    {delivery === "envio" && missingForFree > 0 && (
                      <p className="text-[0.72rem] text-salvia pt-0.5">Te faltan {formatRD(missingForFree)} para envío gratis.</p>
                    )}
                    <div className="flex justify-between text-navy font-medium text-base pt-1"><span>Total</span><span>{formatRD(grandTotal)}</span></div>
                  </div>

                  {error && <p className="text-xs text-terracota">{error}</p>}

                  <button onClick={handleCheckout} disabled={sending} className="btn w-full disabled:opacity-60">
                    <MessageCircle size={16} /> {sending ? "Preparando…" : "Finalizar por WhatsApp"}
                  </button>
                  <p className="text-[0.7rem] text-navy/45 text-center leading-relaxed">El pedido se coordina y confirma por WhatsApp — sin pago en línea.</p>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
