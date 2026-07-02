import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { CartProvider } from "@/lib/cart/CartContext";
import { CartDrawer } from "@/components/CartDrawer";

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
  metadataBase: new URL("https://www.coralcoastrd.com"),
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
    url: "https://www.coralcoastrd.com",
    siteName: "Coral Coast",
    type: "website",
    locale: "es_DO",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-fondo text-navy">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppFloat />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
