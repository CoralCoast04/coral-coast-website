"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { loginCustomer, registerCustomer, type AuthState } from "@/app/auth-actions";

const fieldClass =
  "w-full bg-transparent border-b border-navy/25 py-3 text-navy placeholder:text-navy/40 focus:border-terracota focus:outline-none transition-colors";
const labelClass = "block text-[0.72rem] tracking-[0.2em] uppercase text-navy/50 mb-1";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn w-full disabled:opacity-60">
      {pending ? "Un momento…" : label}
    </button>
  );
}

export function LoginForm({ redirectTo = "/" }: { redirectTo?: string }) {
  const [state, action] = useActionState<AuthState, FormData>(loginCustomer, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) router.push(redirectTo);
  }, [state, redirectTo, router]);

  return (
    <div className="bg-white/60 border border-navy/10 p-8 md:p-10 max-w-md mx-auto">
      <p className="eyebrow text-salvia mb-3">Bienvenido</p>
      <h1 className="font-serif text-3xl text-navy mb-6">Inicia sesión</h1>
      <form action={action} className="space-y-5">
        <div>
          <label className={labelClass} htmlFor="email">Correo</label>
          <input id="email" name="email" type="email" required className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" required className={fieldClass} />
        </div>
        {state && !state.ok && (
          <p className="flex items-center gap-2 text-sm text-terracota"><AlertCircle size={16} /> {state.message}</p>
        )}
        <Submit label="Entrar" />
      </form>
      <p className="mt-6 text-sm text-navy/60">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="link-underline text-terracota">Regístrate</Link>
      </p>
    </div>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState<AuthState, FormData>(registerCustomer, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok && !state.message) router.push("/");
  }, [state, router]);

  return (
    <div className="bg-white/60 border border-navy/10 p-8 md:p-10 max-w-md mx-auto">
      <p className="eyebrow text-salvia mb-3">Únete</p>
      <h1 className="font-serif text-3xl text-navy mb-6">Crea tu cuenta</h1>

      {state?.ok && state.message ? (
        <p className="flex items-center gap-2 text-sm text-salvia"><CheckCircle2 size={16} /> {state.message}</p>
      ) : (
        <>
          <form action={action} className="space-y-5">
            <div>
              <label className={labelClass} htmlFor="name">Nombre</label>
              <input id="name" name="name" required className={fieldClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="email">Correo</label>
              <input id="email" name="email" type="email" required className={fieldClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="password">Contraseña</label>
              <input id="password" name="password" type="password" required minLength={6} className={fieldClass} />
            </div>
            {state && !state.ok && (
              <p className="flex items-center gap-2 text-sm text-terracota"><AlertCircle size={16} /> {state.message}</p>
            )}
            <Submit label="Crear cuenta" />
          </form>
          <p className="mt-6 text-sm text-navy/60">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="link-underline text-terracota">Inicia sesión</Link>
          </p>
        </>
      )}
    </div>
  );
}
