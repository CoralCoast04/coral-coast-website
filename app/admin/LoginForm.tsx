"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn w-full disabled:opacity-60">
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(signIn, null);

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="block text-[0.72rem] tracking-[0.2em] uppercase text-navy/50 mb-1" htmlFor="email">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full bg-transparent border-b border-navy/25 py-3 text-navy focus:border-terracota focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-[0.72rem] tracking-[0.2em] uppercase text-navy/50 mb-1" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full bg-transparent border-b border-navy/25 py-3 text-navy focus:border-terracota focus:outline-none"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-terracota">{state.error}</p>
      )}
      <Submit />
    </form>
  );
}
