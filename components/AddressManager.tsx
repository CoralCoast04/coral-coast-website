"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, AlertCircle, Pencil, Trash2, Plus, X, Star } from "lucide-react";
import { DR_PROVINCES } from "@/lib/shipping";
import type { Address } from "@/lib/addresses";
import { saveAddress, deleteAddress, setDefaultAddress, type AddressState } from "@/app/address-actions";

const field =
  "w-full bg-transparent border border-navy/20 rounded px-3 py-2 text-sm text-navy focus:border-terracota focus:outline-none";
const label = "block text-[0.68rem] tracking-[0.16em] uppercase text-navy/50 mb-1";

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="btn disabled:opacity-60">{pending ? "Guardando…" : label}</button>;
}

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const [state, action] = useActionState<AddressState, FormData>(saveAddress, null);
  const [editing, setEditing] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) { setShowForm(false); setEditing(null); formRef.current?.reset(); }
  }, [state]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="eyebrow text-salvia mb-1">Tu cuenta</p>
          <h1 className="font-serif text-3xl md:text-4xl text-navy">Mis direcciones</h1>
        </div>
        {!showForm && (
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn !py-2.5 !px-5 !text-[0.72rem]">
            <Plus size={15} /> Nueva
          </button>
        )}
      </div>

      {showForm && (
        <form ref={formRef} action={action} className="bg-white/60 border border-navy/10 p-6 mb-8 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-xl text-navy">{editing ? "Editar dirección" : "Nueva dirección"}</h2>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="text-navy/40 hover:text-terracota"><X size={18} /></button>
          </div>
          <input type="hidden" name="id" value={editing?.id ?? ""} />
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className={label}>Etiqueta</label><input name="label" defaultValue={editing?.label ?? ""} placeholder="Casa, Oficina…" className={field} /></div>
            <div><label className={label}>Quién recibe</label><input name="recipient" defaultValue={editing?.recipient ?? ""} className={field} /></div>
            <div><label className={label}>Teléfono</label><input name="phone" defaultValue={editing?.phone ?? ""} className={field} /></div>
            <div><label className={label}>Provincia</label>
              <select name="province" defaultValue={editing?.province ?? ""} className={field}>
                <option value="">Provincia…</option>
                {DR_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2"><label className={label}>Municipio / sector</label><input name="municipality" defaultValue={editing?.municipality ?? ""} className={field} /></div>
            <div className="sm:col-span-2"><label className={label}>Dirección *</label><textarea name="address" required rows={2} defaultValue={editing?.address ?? ""} placeholder="Calle, número, referencia…" className={field} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm text-navy/70">
            <input type="checkbox" name="is_default" defaultChecked={editing?.is_default ?? false} /> Usar como dirección predeterminada
          </label>
          {state && (
            <div className={`flex items-center gap-2 text-sm rounded p-3 ${state.ok ? "bg-salvia/15 text-salvia" : "bg-terracota/15 text-terracota"}`}>
              {state.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}<span>{state.message}</span>
            </div>
          )}
          <SubmitBtn label={editing ? "Guardar cambios" : "Guardar dirección"} />
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <p className="text-navy/55 text-sm">Aún no tienes direcciones guardadas. Agrega una para agilizar tus pedidos.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div key={a.id} className="border border-navy/10 bg-white/40 p-5 relative">
              {a.is_default && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[0.6rem] uppercase tracking-wider text-salvia">
                  <Star size={12} className="fill-salvia" /> Predeterminada
                </span>
              )}
              {a.label && <p className="font-serif text-lg text-navy">{a.label}</p>}
              {a.recipient && <p className="text-sm text-navy/70">{a.recipient}</p>}
              <p className="text-sm text-navy/70 mt-1 leading-relaxed">{a.address}</p>
              <p className="text-xs text-navy/45 mt-1">{[a.municipality, a.province].filter(Boolean).join(", ")}{a.phone ? ` · ${a.phone}` : ""}</p>
              <div className="flex items-center gap-3 mt-4 text-sm">
                {!a.is_default && (
                  <button onClick={() => startTransition(() => setDefaultAddress(a.id))} disabled={pending} className="text-navy/60 hover:text-terracota">Hacer predeterminada</button>
                )}
                <button onClick={() => { setEditing(a); setShowForm(true); }} className="inline-flex items-center gap-1 text-navy/60 hover:text-terracota"><Pencil size={14} /> Editar</button>
                <button onClick={() => startTransition(() => deleteAddress(a.id))} disabled={pending} className="inline-flex items-center gap-1 text-navy/50 hover:text-terracota ml-auto"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
