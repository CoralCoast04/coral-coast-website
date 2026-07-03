import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { CartProvider } from "@/lib/cart/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { WishlistProvider } from "@/lib/wishlist/WishlistContext";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getWishlistIds } from "@/app/wishlist-actions";
import { getContent } from "@/lib/content";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://coralcoastrd.com"),
  title: {
    default: "Coral Coast — Casa de diseño dominicana",
    template: "%s · Coral Coast",
  },
  description:
    "Coral Coast: casa de diseño dominicana. Chacabanas, trajes, bermudas y pantalones en lino y otros tejidos nobles. De colección o a tu medida. Atención por cita, en estudio o a domicilio. Cierre por WhatsApp.",
  openGraph: {
    title: "Coral Coast — Casa de diseño dominicana",
    description:
      "Moda dominicana en lino y otros tejidos nobles. Por colección o a tu medida, desde nuestro estudio privado.",
    url: "https://coralcoastrd.com",
    siteName: "Coral Coast",
    type: "website",
    locale: "es_DO",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Sesión del cliente (para navbar y wishlist)
  let userEmail: string | null = null;
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userEmail = user?.email ?? null;
    } catch {
      /* ignore */
    }
  }
  const wishlistIds = userEmail ? await getWishlistIds() : [];
  const content = await getContent();

  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-fondo text-navy">
        <CartProvider>
          <WishlistProvider initialIds={wishlistIds} isLoggedIn={!!userEmail}>
            <Navbar userEmail={userEmail} />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsAppFloat />
            <CartDrawer
              giftWrapImage={content.gift_wrap_image}
              giftNote={content.gift_note}
              studioAddress={content.studio_address}
              studioHours={content.studio_hours}
            />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
