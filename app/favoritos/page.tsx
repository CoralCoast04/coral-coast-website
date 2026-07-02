import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { ProductGrid } from "@/components/ProductGrid";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getProducts } from "@/lib/products.server";
import { getWishlistIds } from "@/app/wishlist-actions";

export const metadata: Metadata = { title: "Favoritos", robots: { index: false } };

export default async function FavoritosPage() {
  let loggedIn = false;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    loggedIn = !!user;
  }

  return (
    <div className="pt-28 md:pt-36 pb-24">
      <div className="container-luxe">
        <Reveal className="mb-12 text-center">
          <p className="eyebrow text-salvia mb-4">Tu selección</p>
          <h1 className="text-4xl md:text-6xl text-navy leading-tight">Favoritos</h1>
        </Reveal>

        {!loggedIn ? (
          <div className="text-center max-w-md mx-auto">
            <Heart size={40} strokeWidth={1.2} className="mx-auto text-terracota mb-5" />
            <p className="text-navy/65 font-light mb-8">
              Inicia sesión para guardar tus piezas favoritas y verlas desde cualquier dispositivo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login?redirect=/favoritos" className="btn">Iniciar sesión</Link>
              <Link href="/registro" className="btn btn-outline">Crear cuenta</Link>
            </div>
          </div>
        ) : (
          <FavoritesList />
        )}
      </div>
    </div>
  );
}

async function FavoritesList() {
  const [ids, products] = await Promise.all([getWishlistIds(), getProducts()]);
  const set = new Set(ids);
  const favs = products.filter((p) => set.has(p.id));

  if (favs.length === 0) {
    return (
      <div className="text-center max-w-md mx-auto">
        <Heart size={40} strokeWidth={1.2} className="mx-auto text-navy/30 mb-5" />
        <p className="text-navy/60 font-light mb-8">Aún no has guardado piezas. Explora la colección y toca el corazón.</p>
        <Link href="/coleccion" className="btn">Ver la colección</Link>
      </div>
    );
  }

  return <ProductGrid products={favs} />;
}
