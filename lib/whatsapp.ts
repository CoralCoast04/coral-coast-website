// Número en formato internacional sin signos ni espacios (República Dominicana +1 849)
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP?.replace(/\D/g, "") || "18498479200";

/**
 * Construye un enlace wa.me con mensaje pre-cargado.
 * El cierre de venta ocurre por WhatsApp — no hay carrito.
 */
export function waLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const WA_MESSAGES = {
  general:
    "Hola Coral Coast 🌾 Me encantaría conocer más sobre sus piezas de lino.",
  cita:
    "Hola Coral Coast 🌾 Quisiera agendar una cita para conocer la colección.",
  pieza: (nombre: string) =>
    `Hola Coral Coast 🌾 Me interesa la pieza "${nombre}". ¿Me cuentan más?`,
};

type OrderLine = {
  name: string;
  qty: number;
  unit_price: number;
  size?: string;
};

function rd(n: number): string {
  if (n <= 0) return "A consultar";
  return "RD$ " + n.toLocaleString("es-DO");
}

/** Arma el mensaje de pedido completo para cerrar por WhatsApp. */
export function buildOrderMessage(opts: {
  items: OrderLine[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string | null;
  name?: string | null;
  phone?: string | null;
  trackingCode?: string | null;
}): string {
  const lines: string[] = [];
  lines.push("Hola Coral Coast 🌾 Quiero hacer este pedido:");
  lines.push("");
  opts.items.forEach((i) => {
    const size = i.size ? ` (${i.size})` : "";
    lines.push(`• ${i.qty} × ${i.name}${size} — ${rd(i.unit_price * i.qty)}`);
  });
  lines.push("");
  lines.push(`Subtotal: ${rd(opts.subtotal)}`);
  if (opts.discount > 0) {
    lines.push(
      `Descuento${opts.couponCode ? ` (${opts.couponCode})` : ""}: -${rd(
        opts.discount
      )}`
    );
  }
  lines.push(`Total: ${rd(opts.total)}`);
  if (opts.trackingCode) {
    lines.push("");
    lines.push(`N.º de pedido: ${opts.trackingCode}`);
  }
  if (opts.name || opts.phone) {
    lines.push("");
    if (opts.name) lines.push(`Nombre: ${opts.name}`);
    if (opts.phone) lines.push(`Teléfono: ${opts.phone}`);
  }
  lines.push("");
  lines.push("¿Cómo continuamos?");
  return lines.join("\n");
}
