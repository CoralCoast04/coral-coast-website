"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, AlertCircle, Pencil, Trash2, Plus, X } from "lucide-react";
import { formatRD } from "@/lib/format";
import { signOut } from "./actions";
import {
  saveProduct,
  deleteProduct,
  saveCoupon,
  deleteCoupon,
  updateOrderStatus,
  saveContent,
  type ActionState,
} from "./manage-actions";
import { CONTENT_FIELDS, CONTENT_GROUPS } from "@/lib/content-fields";

/* ------------------------------- Tipos --------------------------------- */
type Product = {
  id: string; slug: string; name: string; category: string; description: string;
  price: number; sale_price: number | null; fabric: string | null; color: string | null;
  image_url: string; featured: boolean; sizes: string[] | null; made_to_measure: boolean;
  media: { type: "image" | "video"; url: string }[] | null;
};
type Coupon = {
  id: string; code: string; discount_type: string; discount_value: number;
  active: boolean; min_subtotal: number; expires_at: string | null;
};
type Order = {
  id: string; created_at: string; items: { name: string; qty: number; unit_price: number; size?: string }[];
  subtotal: number; discount: number; total: number; coupon_code: string | null;
  customer_name: string | null; customer_phone: string | null; customer_email: string | null;
  tracking_code: string | null; status: string;
  delivery_method: string | null; address: string | null;
  pickup_date: string | null; pickup_time: string | null; has_gift: boolean | null;
};
type Subscriber = { id: string; email: string; source: string | null; created_at: string };
type Appointment = {
  id: string; created_at: string; name: string; email: string | null; phone: string | null;
  preferred_date: string | null; preferred_time: string | null; interest: string | null; notes: string | null;
};
type Message = {
  id: string; created_at: string; name: string; email: string; phone: string | null;
  subject: string | null; message: string;
};

const field =
  "w-full bg-transparent border border-navy/20 rounded px-3 py-2 text-sm text-navy focus:border-terracota focus:outline-none";
const label = "block text-[0.68rem] tracking-[0.16em] uppercase text-navy/50 mb-1";

function fmtDate(d: string) {
  return new Date(d).toLocaleString("es-DO", { dateStyle: "medium", timeStyle: "short" });
}

function Feedback({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <div className={`flex items-center gap-2 text-sm rounded p-3 ${state.ok ? "bg-salvia/15 text-salvia" : "bg-terracota/15 text-terracota"}`}>
      {state.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      <span>{state.message}</span>
    </div>
  );
}

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="btn disabled:opacity-60">{pending ? "Guardando…" : label}</button>;
}

const TABS = ["Productos", "Cupones", "Órdenes", "Contenido", "Suscriptores", "Citas", "Mensajes"] as const;

export function AdminDashboard(props: {
  email: string;
  products: Product[];
  coupons: Coupon[];
  orders: Order[];
  appointments: Appointment[];
  messages: Message[];
  subscribers: Subscriber[];
  content: Record<string, string>;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Productos");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="eyebrow text-salvia mb-1">Panel</p>
          <h1 className="font-serif text-3xl text-navy">Coral Coast</h1>
          <p className="text-xs text-navy/50 mt-1">{props.email}</p>
        </div>
        <form action={signOut}>
          <button className="btn btn-outline !py-2.5 !px-5 !text-[0.72rem]">Salir</button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-10 border-b border-navy/10">
        {TABS.map((t) => {
          const counts: Record<string, number> = {
            Productos: props.products.length, Cupones: props.coupons.length,
            Órdenes: props.orders.length, Contenido: CONTENT_FIELDS.length,
            Suscriptores: props.subscribers.length,
            Citas: props.appointments.length, Mensajes: props.messages.length,
          };
          return (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm tracking-wide -mb-px border-b-2 transition-colors ${tab === t ? "border-terracota text-navy" : "border-transparent text-navy/50 hover:text-navy"}`}>
              {t} <span className="text-navy/30">({counts[t]})</span>
            </button>
          );
        })}
      </div>

      {tab === "Productos" && <ProductManager products={props.products} />}
      {tab === "Cupones" && <CouponManager coupons={props.coupons} />}
      {tab === "Órdenes" && <OrdersPanel orders={props.orders} />}
      {tab === "Contenido" && <ContentPanel content={props.content} />}
      {tab === "Suscriptores" && <SubscribersPanel subscribers={props.subscribers} />}
      {tab === "Citas" && <AppointmentsPanel appointments={props.appointments} />}
      {tab === "Mensajes" && <MessagesPanel messages={props.messages} />}
    </div>
  );
}

/* ============================== PRODUCTOS ============================== */
function ProductManager({ products }: { products: Product[] }) {
  const [state, action] = useActionState(saveProduct, null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) { setShowForm(false); setEditing(null); formRef.current?.reset(); }
  }, [state]);

  function openNew() { setEditing(null); setShowForm(true); }
  function openEdit(p: Product) { setEditing(p); setShowForm(true); }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-serif text-2xl text-navy">Productos</h2>
        {!showForm && <button onClick={openNew} className="btn !py-2.5 !px-5 !text-[0.72rem]"><Plus size={15} /> Nuevo</button>}
      </div>

      {showForm && (
        <form ref={formRef} action={action} className="bg-white/50 border border-navy/10 p-6 mb-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-xl text-navy">{editing ? "Editar producto" : "Nuevo producto"}</h3>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="text-navy/40 hover:text-terracota"><X size={18} /></button>
          </div>
          <input type="hidden" name="id" value={editing?.id ?? ""} />
          <input type="hidden" name="image_url" value={editing?.image_url ?? ""} />
          <MediaManager
            key={editing?.id ?? "new"}
            initial={
              (editing?.media && editing.media.length
                ? editing.media
                : editing?.image_url
                  ? [{ type: "image" as const, url: editing.image_url }]
                  : []) as Media[]
            }
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className={label}>Nombre *</label><input name="name" required defaultValue={editing?.name} className={field} /></div>
            <div><label className={label}>Categoría</label>
              <input name="category" list="cat-list" required defaultValue={editing?.category ?? ""} placeholder="Escribe o elige…" className={field} />
              <datalist id="cat-list">
                {Array.from(new Set(products.map((p) => p.category).filter(Boolean))).map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div><label className={label}>Precio (RD$)</label><input name="price" type="number" min="0" defaultValue={editing?.price ?? 0} className={field} /></div>
            <div><label className={label}>Oferta (RD$, opcional)</label><input name="sale_price" type="number" min="0" defaultValue={editing?.sale_price ?? ""} className={field} /></div>
            <div><label className={label}>Tejido</label><input name="fabric" defaultValue={editing?.fabric ?? ""} placeholder="Lino / Lino texturizado / otro" className={field} /></div>
            <div><label className={label}>Color</label><input name="color" defaultValue={editing?.color ?? ""} className={field} /></div>
            <div className="sm:col-span-2"><label className={label}>Tallas (separadas por coma)</label><input name="sizes" defaultValue={(editing?.sizes ?? []).join(", ")} placeholder="S, M, L, XL   —   deja vacío si es solo a la medida" className={field} /></div>
          </div>
          <div><label className={label}>Descripción</label><textarea name="description" rows={2} defaultValue={editing?.description} className={field} /></div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-navy/70">
              <input type="checkbox" name="featured" defaultChecked={editing?.featured} /> Destacado en Inicio
            </label>
            <label className="flex items-center gap-2 text-sm text-navy/70">
              <input type="checkbox" name="made_to_measure" defaultChecked={editing ? editing.made_to_measure : true} /> Disponible a la medida
            </label>
          </div>

          <Feedback state={state} />
          <SubmitBtn label={editing ? "Guardar cambios" : "Crear producto"} />
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white/40 border border-navy/10 overflow-hidden">
            <div className="relative aspect-[4/5] bg-arena/20">
              <Image src={p.image_url} alt={p.name} fill className="object-cover" sizes="240px" />
              {p.sale_price && <span className="absolute top-2 left-2 bg-terracota text-white text-[0.6rem] uppercase px-2 py-0.5">Oferta</span>}
            </div>
            <div className="p-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-serif text-lg text-navy leading-tight">{p.name}</h3>
                  <p className="text-xs text-salvia uppercase tracking-wider">{p.category}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p)} className="p-1.5 text-navy/50 hover:text-terracota" aria-label="Editar"><Pencil size={15} /></button>
                  <DeleteButton onDelete={() => startTransition(() => deleteProduct(p.id))} disabled={pending} />
                </div>
              </div>
              <p className="text-sm mt-1">
                <span className="text-terracota">{formatRD(p.sale_price ?? p.price)}</span>
                {p.sale_price && <span className="text-navy/40 line-through ml-2">{formatRD(p.price)}</span>}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =============================== CUPONES =============================== */
function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const [state, action] = useActionState(saveCoupon, null);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => { if (state?.ok) { setShowForm(false); setEditing(null); formRef.current?.reset(); } }, [state]);

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-serif text-2xl text-navy">Cupones</h2>
        {!showForm && <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn !py-2.5 !px-5 !text-[0.72rem]"><Plus size={15} /> Nuevo</button>}
      </div>

      {showForm && (
        <form ref={formRef} action={action} className="bg-white/50 border border-navy/10 p-6 mb-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-xl text-navy">{editing ? "Editar cupón" : "Nuevo cupón"}</h3>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="text-navy/40 hover:text-terracota"><X size={18} /></button>
          </div>
          <input type="hidden" name="id" value={editing?.id ?? ""} />
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className={label}>Código *</label><input name="code" required defaultValue={editing?.code} className={`${field} uppercase`} placeholder="VERANO10" /></div>
            <div><label className={label}>Tipo</label>
              <select name="discount_type" defaultValue={editing?.discount_type ?? "percent"} className={field}>
                <option value="percent">Porcentaje (%)</option><option value="fixed">Monto fijo (RD$)</option>
              </select>
            </div>
            <div><label className={label}>Valor</label><input name="discount_value" type="number" min="0" required defaultValue={editing?.discount_value} className={field} /></div>
            <div><label className={label}>Subtotal mínimo (RD$)</label><input name="min_subtotal" type="number" min="0" defaultValue={editing?.min_subtotal ?? 0} className={field} /></div>
            <div><label className={label}>Vence (opcional)</label><input name="expires_at" type="date" defaultValue={editing?.expires_at ? editing.expires_at.slice(0, 10) : ""} className={field} /></div>
            <label className="flex items-center gap-2 text-sm text-navy/70 self-end pb-2">
              <input type="checkbox" name="active" defaultChecked={editing ? editing.active : true} /> Activo
            </label>
          </div>
          <Feedback state={state} />
          <SubmitBtn label={editing ? "Guardar" : "Crear cupón"} />
        </form>
      )}

      <div className="border border-navy/10 bg-white/40 divide-y divide-navy/10">
        {coupons.length === 0 && <p className="p-4 text-sm text-navy/50">Sin cupones.</p>}
        {coupons.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-4 gap-4">
            <div>
              <span className="font-medium text-navy tracking-wide">{c.code}</span>
              <span className={`ml-3 text-xs px-2 py-0.5 rounded-full ${c.active ? "bg-salvia/20 text-salvia" : "bg-navy/10 text-navy/50"}`}>{c.active ? "Activo" : "Inactivo"}</span>
              <p className="text-sm text-navy/60 mt-1">
                {c.discount_type === "percent" ? `${c.discount_value}% de descuento` : `${formatRD(c.discount_value)} de descuento`}
                {c.min_subtotal > 0 && ` · desde ${formatRD(c.min_subtotal)}`}
                {c.expires_at && ` · vence ${new Date(c.expires_at).toLocaleDateString("es-DO")}`}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => { setEditing(c); setShowForm(true); }} className="p-1.5 text-navy/50 hover:text-terracota" aria-label="Editar"><Pencil size={15} /></button>
              <DeleteButton onDelete={() => startTransition(() => deleteCoupon(c.id))} disabled={pending} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =============================== ÓRDENES =============================== */
function OrdersPanel({ orders }: { orders: Order[] }) {
  const [pending, startTransition] = useTransition();
  const STATUSES = ["nuevo", "confirmado", "en confección", "listo", "entregado"];
  return (
    <div>
      <h2 className="font-serif text-2xl text-navy mb-5">Órdenes</h2>
      {orders.length === 0 ? <p className="text-sm text-navy/50">Sin órdenes todavía.</p> : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="border border-navy/10 bg-white/40 p-5">
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div>
                  {o.tracking_code && <p className="font-serif text-terracota">{o.tracking_code}</p>}
                  <p className="text-navy font-medium">{o.customer_name || "Sin nombre"}{o.customer_phone && <span className="text-navy/50 font-normal"> · {o.customer_phone}</span>}</p>
                  {o.customer_email && <p className="text-xs text-navy/50">{o.customer_email}</p>}
                  <p className="text-xs text-navy/40">{fmtDate(o.created_at)}</p>
                </div>
                <select defaultValue={o.status} disabled={pending}
                  onChange={(e) => startTransition(() => updateOrderStatus(o.id, e.target.value))}
                  className="border border-navy/20 rounded px-2 py-1 text-sm text-navy bg-transparent">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <ul className="mt-3 text-sm text-navy/70 space-y-1">
                {o.items.map((it, idx) => <li key={idx}>{it.qty} × {it.name} — {formatRD(it.unit_price * it.qty)}</li>)}
              </ul>
              <div className="mt-3 text-sm flex gap-4 flex-wrap">
                <span className="text-navy/60">Subtotal: {formatRD(o.subtotal)}</span>
                {o.discount > 0 && <span className="text-salvia">Descuento{o.coupon_code ? ` (${o.coupon_code})` : ""}: −{formatRD(o.discount)}</span>}
                <span className="text-navy font-medium">Total: {formatRD(o.total)}</span>
              </div>
              <div className="mt-2 text-sm flex gap-3 flex-wrap items-center">
                {o.delivery_method === "retiro" ? (
                  <span className="text-navy/70">🏬 Retiro{o.pickup_date ? ` · ${o.pickup_date}${o.pickup_time ? " " + o.pickup_time : ""}` : ""}</span>
                ) : o.delivery_method === "envio" ? (
                  <span className="text-navy/70">🚚 Envío{o.address ? ` · ${o.address}` : ""}</span>
                ) : null}
                {o.has_gift && <span className="px-2 py-0.5 rounded-full bg-terracota/15 text-terracota text-xs">🎁 Regalo</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================ CITAS / MENSAJES ========================= */
function AppointmentsPanel({ appointments }: { appointments: Appointment[] }) {
  return (
    <div>
      <h2 className="font-serif text-2xl text-navy mb-5">Citas</h2>
      {appointments.length === 0 ? <p className="text-sm text-navy/50">Sin citas todavía.</p> : (
        <div className="overflow-x-auto border border-navy/10 bg-white/40">
          <table className="w-full text-sm">
            <thead className="bg-navy/5 text-navy/60 text-left text-xs uppercase tracking-wider">
              <tr><th className="p-3">Recibida</th><th className="p-3">Nombre</th><th className="p-3">Contacto</th><th className="p-3">Preferencia</th><th className="p-3">Interés</th><th className="p-3">Nota</th></tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id} className="border-t border-navy/10 align-top">
                  <td className="p-3 text-navy/50 whitespace-nowrap">{fmtDate(a.created_at)}</td>
                  <td className="p-3 text-navy">{a.name}</td>
                  <td className="p-3 text-navy/70">{a.phone && <div>{a.phone}</div>}{a.email && <div>{a.email}</div>}</td>
                  <td className="p-3 text-navy/70 whitespace-nowrap">{a.preferred_date ?? "—"} {a.preferred_time ?? ""}</td>
                  <td className="p-3 text-navy/70">{a.interest ?? "—"}</td>
                  <td className="p-3 text-navy/60 max-w-xs">{a.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MessagesPanel({ messages }: { messages: Message[] }) {
  return (
    <div>
      <h2 className="font-serif text-2xl text-navy mb-5">Mensajes</h2>
      {messages.length === 0 ? <p className="text-sm text-navy/50">Sin mensajes todavía.</p> : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="border border-navy/10 bg-white/40 p-5">
              <div className="flex items-baseline justify-between gap-4">
                <div><span className="font-medium text-navy">{m.name}</span><span className="text-navy/50 text-sm"> · {m.email}</span>{m.phone && <span className="text-navy/50 text-sm"> · {m.phone}</span>}</div>
                <span className="text-xs text-navy/40 whitespace-nowrap">{fmtDate(m.created_at)}</span>
              </div>
              {m.subject && <p className="mt-1 text-sm text-terracota">{m.subject}</p>}
              <p className="mt-2 text-navy/70 text-sm leading-relaxed">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== CONTENIDO ============================== */
function ContentPanel({ content }: { content: Record<string, string> }) {
  const [state, action] = useActionState(saveContent, null);
  const [openGroup, setOpenGroup] = useState<string>(CONTENT_GROUPS[0]);

  return (
    <div>
      <h2 className="font-serif text-2xl text-navy mb-2">Textos e imágenes del sitio</h2>
      <p className="text-sm text-navy/50 mb-6">
        Edita cualquier texto o imagen de la web. Abre una sección, cambia lo que
        quieras y guarda — se refleja en el sitio al instante. (Un solo botón guarda todo.)
      </p>

      <form action={action} className="space-y-3 max-w-3xl">
        {CONTENT_GROUPS.map((group) => {
          const fields = CONTENT_FIELDS.filter((f) => f.group === group);
          const open = openGroup === group;
          return (
            <div key={group} className="border border-navy/10 bg-white/40">
              <button
                type="button"
                onClick={() => setOpenGroup(open ? "" : group)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-serif text-lg text-navy">{group}</span>
                <span className={`text-navy/40 transition-transform ${open ? "rotate-90" : ""}`}>›</span>
              </button>
              {open && (
                <div className="px-5 pb-6 space-y-5 border-t border-navy/10 pt-5">
                  {fields.map((f) => (
                    <div key={f.key}>
                      <label className={label}>{f.label}</label>
                      {f.type === "textarea" ? (
                        <textarea name={f.key} rows={3} defaultValue={content[f.key] ?? ""} className={field} />
                      ) : f.type === "image" ? (
                        <div className="space-y-2">
                          {content[f.key] && (
                            <div className="relative h-28 w-44 overflow-hidden bg-arena/20 border border-navy/10">
                              <Image src={content[f.key]} alt="" fill className="object-cover" sizes="176px" />
                            </div>
                          )}
                          <input type="file" name={`${f.key}__file`} accept="image/*" className="block text-sm text-navy/70" />
                          <input name={f.key} defaultValue={content[f.key] ?? ""} placeholder="…o pega una URL de imagen" className={field} />
                        </div>
                      ) : (
                        <input name={f.key} defaultValue={content[f.key] ?? ""} className={field} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-3">
          <Feedback state={state} />
          <div className="mt-3">
            <SubmitBtn label="Guardar cambios" />
          </div>
        </div>
      </form>
    </div>
  );
}

/* ============================= SUSCRIPTORES ============================ */
function SubscribersPanel({ subscribers }: { subscribers: Subscriber[] }) {
  const [copied, setCopied] = useState(false);
  function copyAll() {
    navigator.clipboard.writeText(subscribers.map((s) => s.email).join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-serif text-2xl text-navy">Suscriptores</h2>
        {subscribers.length > 0 && (
          <button onClick={copyAll} className="btn btn-outline !py-2.5 !px-5 !text-[0.72rem]">
            {copied ? "¡Copiado!" : "Copiar correos"}
          </button>
        )}
      </div>
      {subscribers.length === 0 ? (
        <p className="text-sm text-navy/50">Aún no hay suscriptores.</p>
      ) : (
        <div className="border border-navy/10 bg-white/40 divide-y divide-navy/10">
          {subscribers.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 text-sm">
              <span className="text-navy">{s.email}</span>
              <span className="text-xs text-navy/40">{fmtDate(s.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------- Galería producto ------------------------- */
type Media = { type: "image" | "video"; url: string };
function MediaManager({ initial }: { initial: Media[] }) {
  const [media, setMedia] = useState<Media[]>(initial);
  const [url, setUrl] = useState("");

  function addUrl() {
    const u = url.trim();
    if (!u) return;
    const isVideo = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(u);
    setMedia((m) => [...m, { type: isVideo ? "video" : "image", url: u }]);
    setUrl("");
  }
  const firstImageIdx = media.findIndex((m) => m.type === "image");

  return (
    <div>
      <label className={label}>Galería (fotos y videos)</label>
      <input type="hidden" name="media_json" value={JSON.stringify(media)} />
      {media.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {media.map((m, i) => (
            <div key={i} className="relative h-24 w-20 overflow-hidden bg-arena/20 border border-navy/10">
              {m.type === "video" ? (
                <video src={m.url} className="h-full w-full object-cover" muted />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" className="h-full w-full object-cover" />
              )}
              {i === firstImageIdx && (
                <span className="absolute bottom-0 inset-x-0 bg-navy/70 text-white text-[0.55rem] text-center py-0.5">Portada</span>
              )}
              <button type="button" onClick={() => setMedia((arr) => arr.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5 text-navy hover:text-terracota">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      <input type="file" name="media_files" multiple accept="image/*,video/*" className="text-sm text-navy/70 block" />
      <div className="flex gap-2 mt-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…o pega una URL de imagen/video" className={field} />
        <button type="button" onClick={addUrl} className="text-sm text-navy hover:text-terracota shrink-0 whitespace-nowrap">Añadir URL</button>
      </div>
      <p className="text-[0.68rem] text-navy/40 mt-1">La primera imagen es la portada. Puedes subir varias fotos y también videos.</p>
    </div>
  );
}

/* ------------------------------ Helpers -------------------------------- */
function DeleteButton({ onDelete, disabled }: { onDelete: () => void; disabled?: boolean }) {
  const [confirm, setConfirm] = useState(false);
  if (confirm) {
    return (
      <span className="flex items-center gap-1">
        <button onClick={onDelete} disabled={disabled} className="text-[0.7rem] text-terracota">Eliminar</button>
        <button onClick={() => setConfirm(false)} className="text-[0.7rem] text-navy/40">No</button>
      </span>
    );
  }
  return <button onClick={() => setConfirm(true)} className="p-1.5 text-navy/50 hover:text-terracota" aria-label="Eliminar"><Trash2 size={15} /></button>;
}
