// Envíos por provincia (client-safe: sin dependencias de servidor).

/** Las 32 provincias de la República Dominicana, en orden de uso frecuente. */
export const DR_PROVINCES = [
  "Distrito Nacional", "Santo Domingo", "Santiago", "La Altagracia", "San Cristóbal",
  "Puerto Plata", "La Vega", "San Pedro de Macorís", "Duarte", "La Romana",
  "Espaillat", "Azua", "Barahona", "Monseñor Nouel", "Valverde",
  "Sánchez Ramírez", "Peravia", "Monte Plata", "Hato Mayor", "Bahoruco",
  "Independencia", "El Seibo", "Dajabón", "María Trinidad Sánchez", "Samaná",
  "Monte Cristi", "San Juan", "Santiago Rodríguez", "Hermanas Mirabal", "Elías Piña",
  "San José de Ocoa", "Pedernales",
] as const;

export type ShippingRate = {
  province: string;
  cost: number; // costo en RD$
  active: boolean; // si se ofrece envío a esa provincia
};

export type ShippingQuote = {
  cost: number; // costo a cobrar (0 si es gratis)
  free: boolean; // true si aplicó el envío gratis por monto
  known: boolean; // false si no hay tarifa para la provincia elegida
};

/**
 * Calcula el costo de envío efectivo para una provincia.
 * Si `freeThreshold` > 0 y el monto de la compra lo alcanza, el envío es gratis.
 */
export function quoteShipping(
  rate: ShippingRate | null | undefined,
  goodsTotal: number,
  freeThreshold: number
): ShippingQuote {
  if (!rate || !rate.active) return { cost: 0, free: false, known: false };
  const free = freeThreshold > 0 && goodsTotal >= freeThreshold;
  return { cost: free ? 0 : Math.max(0, rate.cost), free, known: true };
}
