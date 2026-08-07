import type { Metadata } from "next";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getUserAddresses } from "@/lib/addresses.server";
import { AddressManager } from "@/components/AddressManager";

export const metadata: Metadata = {
  title: "Mis direcciones",
  robots: { index: false, follow: false },
};

export default async function MisDireccionesPage() {
  let userEmail: string | null = null;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  }

  return (
    <div className="pt-28 md:pt-36 pb-24">
      <div className="container-luxe max-w-4xl">
        {userEmail ? (
          <AddressManager addresses={await getUserAddresses()} />
        ) : (
          <div className="bg-white/60 border border-navy/10 p-8 max-w-md">
            <p className="eyebrow text-salvia mb-3">Tu cuenta</p>
            <h1 className="font-serif text-2xl text-navy mb-3">Mis direcciones</h1>
            <p className="text-navy/70 text-sm mb-5">Inicia sesión para guardar y gestionar tus direcciones de envío.</p>
            <Link href="/login" className="btn">Iniciar sesión</Link>
          </div>
        )}
      </div>
    </div>
  );
}
