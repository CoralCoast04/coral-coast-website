"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";
import {
  submitAppointment,
  submitMessage,
  type FormState,
} from "@/app/actions";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";

const fieldClass =
  "w-full bg-transparent border-b border-navy/25 py-3 text-navy placeholder:text-navy/40 focus:border-terracota focus:outline-none transition-colors duration-300";
const labelClass = "block text-[0.72rem] tracking-[0.2em] uppercase text-navy/50 mb-1";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn disabled:opacity-60">
      {pending ? "Enviando…" : label}
    </button>
  );
}

function Feedback({ state }: { state: FormState }) {
  if (!state) return null;
  return (
    <div
      className={`flex items-start gap-2 text-sm rounded-md p-4 ${
        state.ok
          ? "bg-salvia/15 text-salvia"
          : "bg-terracota/15 text-terracota"
      }`}
    >
      {state.ok ? (
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
      ) : (
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
      )}
      <span>{state.message}</span>
    </div>
  );
}

/* ------------------------------- Cita ---------------------------------- */
export function AppointmentForm() {
  const [state, action] = useActionState(submitAppointment, null);

  return (
    <form action={action} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className={labelClass} htmlFor="name">Nombre completo *</label>
          <input id="name" name="name" required className={fieldClass} placeholder="Tu nombre" />
        </div>
        <div>
          <label className={labelClass} htmlFor="phone">Teléfono / WhatsApp</label>
          <input id="phone" name="phone" className={fieldClass} placeholder="+1 809 000 0000" />
        </div>
        <div>
          <label className={labelClass} htmlFor="email">Correo</label>
          <input id="email" name="email" type="email" className={fieldClass} placeholder="tu@correo.com" />
        </div>
        <div>
          <label className={labelClass} htmlFor="interest">Interés</label>
          <select id="interest" name="interest" className={fieldClass}>
            <option value="">Selecciona…</option>
            <option>Chacabanas</option>
            <option>Bermudas</option>
            <option>Trajes</option>
            <option>Pantalones</option>
            <option>Diseño a la medida</option>
            <option>Ver toda la colección</option>
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="preferred_date">Fecha preferida</label>
          <input id="preferred_date" name="preferred_date" type="date" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="preferred_time">Hora preferida</label>
          <input id="preferred_time" name="preferred_time" type="time" className={fieldClass} />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="notes">Nota (opcional)</label>
        <textarea id="notes" name="notes" rows={3} className={fieldClass} placeholder="Cuéntanos qué buscas…" />
      </div>

      <Feedback state={state} />

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
        <SubmitButton label="Solicitar cita" />
        <a
          href={waLink(WA_MESSAGES.cita)}
          target="_blank"
          rel="noopener noreferrer"
          className="link-underline text-sm text-navy/70"
        >
          o agenda directo por WhatsApp →
        </a>
      </div>
    </form>
  );
}

/* ----------------------------- Contacto -------------------------------- */
export function ContactForm() {
  const [state, action] = useActionState(submitMessage, null);

  return (
    <form action={action} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className={labelClass} htmlFor="cname">Nombre *</label>
          <input id="cname" name="name" required className={fieldClass} placeholder="Tu nombre" />
        </div>
        <div>
          <label className={labelClass} htmlFor="cemail">Correo *</label>
          <input id="cemail" name="email" type="email" required className={fieldClass} placeholder="tu@correo.com" />
        </div>
        <div>
          <label className={labelClass} htmlFor="cphone">Teléfono</label>
          <input id="cphone" name="phone" className={fieldClass} placeholder="+1 809 000 0000" />
        </div>
        <div>
          <label className={labelClass} htmlFor="csubject">Asunto</label>
          <input id="csubject" name="subject" className={fieldClass} placeholder="¿En qué te ayudamos?" />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="cmessage">Mensaje *</label>
        <textarea id="cmessage" name="message" rows={4} required className={fieldClass} placeholder="Escríbenos…" />
      </div>

      <Feedback state={state} />

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
        <SubmitButton label="Enviar mensaje" />
        <a
          href={waLink(WA_MESSAGES.general)}
          target="_blank"
          rel="noopener noreferrer"
          className="link-underline text-sm text-navy/70"
        >
          o escríbenos por WhatsApp →
        </a>
      </div>
    </form>
  );
}
