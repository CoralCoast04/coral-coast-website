"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Check } from "lucide-react";
import { subscribe } from "@/app/newsletter-actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="Suscribirse"
      className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-arena text-navy transition-colors duration-500 hover:bg-terracota hover:text-white disabled:opacity-60"
    >
      <ArrowRight size={18} />
    </button>
  );
}

export function NewsletterForm() {
  const [state, action] = useActionState(subscribe, null);

  return (
    <div>
      <p className="eyebrow text-arena mb-3">Novedades</p>
      <p className="text-sm text-fondo/70 mb-4 max-w-xs">
        Recibe primero nuevas colecciones, piezas limitadas y promociones.
      </p>
      {state?.ok ? (
        <p className="inline-flex items-center gap-2 text-sm text-arena">
          <Check size={16} /> {state.message}
        </p>
      ) : (
        <form action={action} className="flex items-center gap-3 max-w-xs">
          <input
            name="email"
            type="email"
            required
            placeholder="Tu correo"
            className="flex-1 bg-transparent border-b border-fondo/30 py-2 text-sm text-fondo placeholder:text-fondo/40 focus:border-arena focus:outline-none"
          />
          <Submit />
        </form>
      )}
      {state && !state.ok && (
        <p className="mt-2 text-xs text-terracota">{state.message}</p>
      )}
    </div>
  );
}
