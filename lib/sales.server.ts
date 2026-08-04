import "server-only";
import { createServiceClient, isServiceConfigured } from "@/lib/supabase/admin";

export type Sale = {
  id: string;
  item: string;
  qty: number;
  unit_price: number;
  total: number;
  channel: string; // 'online' | 'tienda'
  note: string | null;
  sold_at: string; // YYYY-MM-DD
  order_id: string | null;
  created_at: string;
};

export type MonthlyReport = {
  year: number;
  month: number; // 1-12
  label: string;
  count: number; // piezas (suma de qty)
  entries: number; // registros de venta
  revenue: number;
  online: { count: number; revenue: number };
  tienda: { count: number; revenue: number };
  topItems: { item: string; qty: number; revenue: number }[];
};

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** Primer día del mes y del mes siguiente (ISO YYYY-MM-DD, UTC). */
export function monthRange(year: number, month: number) {
  const from = new Date(Date.UTC(year, month - 1, 1));
  const to = new Date(Date.UTC(year, month, 1));
  return { fromISO: from.toISOString().slice(0, 10), toISO: to.toISOString().slice(0, 10) };
}

/** Mes calendario anterior al de hoy (para el reporte automático de fin de mes). */
export function previousMonth(now = new Date()): { year: number; month: number } {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth(); // 0-11 (el mes actual); el anterior es m
  if (m === 0) return { year: y - 1, month: 12 };
  return { year: y, month: m };
}

/** Agrega las ventas de un mes para el reporte. Usa service role. */
export async function getMonthlyReport(
  year: number,
  month: number
): Promise<MonthlyReport | null> {
  if (!isServiceConfigured) return null;
  const { fromISO, toISO } = monthRange(year, month);
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("sales")
    .select("item, qty, total, channel, sold_at")
    .gte("sold_at", fromISO)
    .lt("sold_at", toISO);
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
    .slice(0, 8);

  return {
    year,
    month,
    label: `${MONTHS[month - 1]} ${year}`,
    count,
    entries: rows.length,
    revenue,
    online,
    tienda,
    topItems,
  };
}
