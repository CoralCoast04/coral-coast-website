/** Formatea un monto en pesos dominicanos. 0 o null → "A consultar". */
export function formatRD(amount: number | null | undefined): string {
  if (amount == null || amount <= 0) return "A consultar";
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Precio efectivo (usa oferta si existe). */
export function effectivePrice(p: {
  price: number;
  sale_price?: number | null;
}): number {
  return p.sale_price && p.sale_price > 0 ? p.sale_price : p.price;
}
