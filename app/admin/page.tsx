import type { Metadata } from "next";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getContent } from "@/lib/content";
import { LoginForm } from "./LoginForm";
import { AdminDashboard } from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!isSupabaseConfigured) {
    return (
      <Shell>
        <div className="bg-white/60 border border-navy/10 p-8 max-w-lg">
          <h1 className="font-serif text-2xl text-navy mb-3">Panel de administración</h1>
          <p className="text-navy/70 text-sm leading-relaxed">
            Configura Supabase (variables <code>NEXT_PUBLIC_SUPABASE_URL</code> y
            <code> NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en <code>.env.local</code>)
            y ejecuta <code>supabase/schema.sql</code> para habilitar el login y la
            gestión de productos, cupones, órdenes, citas y mensajes.
          </p>
        </div>
      </Shell>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Shell>
        <div className="bg-white/60 border border-navy/10 p-8 md:p-10 max-w-md mx-auto">
          <p className="eyebrow text-salvia mb-3">Acceso privado</p>
          <h1 className="font-serif text-3xl text-navy mb-6">Panel Coral Coast</h1>
          <LoginForm />
        </div>
      </Shell>
    );
  }

  const [products, coupons, orders, appointments, messages, subscribers, content] =
    await Promise.all([
      supabase.from("products").select("*").order("featured", { ascending: false }).order("name"),
      supabase.from("coupons").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("appointments").select("*").order("created_at", { ascending: false }),
      supabase.from("messages").select("*").order("created_at", { ascending: false }),
      supabase.from("subscribers").select("*").order("created_at", { ascending: false }),
      getContent(),
    ]);

  return (
    <Shell>
      <AdminDashboard
        email={user.email ?? ""}
        products={products.data ?? []}
        coupons={coupons.data ?? []}
        orders={orders.data ?? []}
        appointments={appointments.data ?? []}
        messages={messages.data ?? []}
        subscribers={subscribers.data ?? []}
        content={content}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-28 md:pt-36 pb-24">
      <div className="container-luxe">{children}</div>
    </div>
  );
}
