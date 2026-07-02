"use client";

import { useState } from "react";
import { Search, Check } from "lucide-react";
import { trackOrder, type TrackedOrder } from "@/app/cart-actions";
import { formatRD } from "@/lib/format";

// Orden de los estados del pedido (para la línea de tiempo)
const STEPS = ["nuevo", "confirmado", "en confección", "listo", "entregado"] as const;
const STEP_LABEL: Record<string, string> = {
  nuevo: "Recibido",
  confirmado: "Confirmado",
  "en confección": "En confección",
  listo: "Listo",
  entregado: "Entregado",
};

export function TrackOrder({ initialCode = "" }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function lookup() {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setOrder(null);
    const res = await trackOrder(code);
    setLoading(false);
    if (res.ok && res.order) setOrder(res.order);
    else setError(res.message ?? "No encontramos el pedido.");
  }

  const stepIndex = order ? Math.max(0, STEPS.indexOf(order.status as (typeof STEPS)[number])) : -1;

  return (
    <div className="max-w-xl">
      <div className="flex gap-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && lookup()}
          placeholder="Ej. CC-7F3K9"
          className="flex-1 bg-transparent border-b border-navy/25 py-3 text-navy placeholder:text-navy/40 focus:border-terracota focus:outline-none uppercase tracking-wide"
        />
        <button onClick={lookup} disabled={loading} className="btn !px-6 disabled:opacity-60">
          <Search size={16} /> {loading ? "Buscando…" : "Rastrear"}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-terracota">{error}</p>}

      {order && (
        <div className="mt-10">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <p className="eyebrow text-salvia mb-1">Pedido</p>
              <p className="font-serif text-2xl text-navy">{order.tracking_code}</p>
            </div>
            <p className="text-sm text-navy/50">
              {new Date(order.created_at).toLocaleDateString("es-DO", { dateStyle: "long" })}
            </p>
          </div>

          {/* Línea de tiempo */}
          <ol className="relative border-l border-navy/15 ml-3 space-y-6">
            {STEPS.map((s, i) => {
              const done = i <= stepIndex;
              const current = i === stepIndex;
              return (
                <li key={s} className="ml-6">
                  <span
                    className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ${
                      done ? "bg-terracota" : "bg-navy/15"
                    }`}
                  >
                    {done && <Check size={10} className="text-white" />}
                  </span>
                  <p className={`text-sm ${current ? "text-navy font-medium" : done ? "text-navy/70" : "text-navy/40"}`}>
                    {STEP_LABEL[s]}
                  </p>
                </li>
              );
            })}
          </ol>

          {/* Resumen */}
          <div className="mt-10 border-t border-navy/10 pt-6">
            <ul className="text-sm text-navy/70 space-y-1">
              {order.items.map((it, idx) => (
                <li key={idx}>
                  {it.qty} × {it.name}
                  {it.size ? ` (${it.size})` : ""}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-navy font-medium">Total: {formatRD(order.total)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
