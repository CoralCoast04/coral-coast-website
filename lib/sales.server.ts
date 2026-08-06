import "server-only";
import { createServiceClient, isServiceConfigured } from "@/lib/supabase/admin";
import type { SalesReport } from "@/lib/sales";

export type { Sale, SalesReport } from "@/lib/sales";

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const MONTHS_SHORT = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function fmtDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

/** Etiqueta legible del rango: "15 mar 2024" o "1 dic 2022 – 31 dic 2022". */
export function rangeLabel(fromISO: string, toISO: string): string {
  return fromISO === toISO ? fmtDay(fromISO) : `${fmtDay(fromISO)} – ${fmtDay(toISO)}`;
}

/** Primer día del mes y del mes siguiente (ISO, UTC). */
export function monthRange(year: number, month: number) {
  const from = new Date(Date.UTC(year, month - 1, 1));
  const last = new Date(Date.UTC(year, month, 0)); // último día del mes
  return {
    fromISO: from.toISOString().slice(0, 10),
    toISO: last.toISOString().slice(0, 10),
    label: `${MONTHS[month - 1]} ${year}`,
  };
}

/** Mes calendario anterior al de hoy (para el reporte automático de fin de mes). */
export function previousMonth(now = new Date()): { year: number; month: number } {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth(); // 0-11 = mes actual; el anterior es m
  if (m === 0) return { year: y - 1, month: 12 };
  return { year: y, month: m };
}

/** Agrega las ventas de un rango (fechas inclusivas). Usa service role. */
export async function getRangeReport(
  fromISO: string,
  toISO: string,
  label?: string
): Promise<SalesReport | null> {
  if (!isServiceConfigured) return null;
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("sales")
    .select("item, qty, total, channel, sold_at")
    .gte("sold_at", fromISO)
    .lte("sold_at", toISO);
  if (error) return null;

  const rows = data ?? [];
  let count = 0;
  let revenue = 0;
  const online = { count: 0, revenue: 0 };
  const tienda = { count: 0, revenue: 0 };
  const itemMap = new Map<string, { qty: number; revenue: number }>();

  for (const r of rows) {
    const qty = Number(r.qty) || 0;
    const tot = Number(r.total) || 0;
    count += qty;
    revenue += tot;
    const bucket = r.channel === "online" ? online : tienda;
    bucket.count += qty;
    bucket.revenue += tot;
    const cur = itemMap.get(r.item) ?? { qty: 0, revenue: 0 };
    cur.qty += qty;
    cur.revenue += tot;
    itemMap.set(r.item, cur);
  }

  const topItems = [...itemMap.entries()]
    .map(([item, v]) => ({ item, qty: v.qty, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 12);

  return {
    fromISO,
    toISO,
    label: label ?? rangeLabel(fromISO, toISO),
    count,
    entries: rows.length,
    revenue,
    online,
    tienda,
    topItems,
  };
}

/** Reporte de un mes calendario (lo usa el cron mensual). */
export async function getMonthlyReport(
  year: number,
  month: number
): Promise<SalesReport | null> {
  const { fromISO, toISO, label } = monthRange(year, month);
  return getRangeReport(fromISO, toISO, label);
}
