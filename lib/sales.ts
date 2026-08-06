// Tipos de ventas y reportes (client-safe: sin dependencias de servidor).

export type Sale = {
  id: string;
  item: string;
  qty: number;
  unit_price: number;
  total: number;
  channel: string; // 'online' | 'tienda'
  note: string | null;
  bordado: string | null;
  sold_at: string; // YYYY-MM-DD
  order_id: string | null;
  created_at: string;
};

export type SalesReport = {
  fromISO: string;
  toISO: string; // inclusivo
  label: string;
  count: number; // piezas (suma de qty)
  entries: number; // registros de venta
  revenue: number;
  online: { count: number; revenue: number };
  tienda: { count: number; revenue: number };
  topItems: { item: string; qty: number; revenue: number }[];
};
