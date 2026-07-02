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
    default: "Coral Coast — Sastrería a la medida en lino",
    template: "%s · Coral Coast",
  },
  description:
    "Coral Coast: estudio dominicano de sastrería a la medida. Chacabanas, trajes, bermudas y pantalones en lino y lino-algodón. Atención por cita, en estudio o a domicilio. Cierre por WhatsApp.",
  openGraph: {
    title: "Coral Coast — Sastrería a la medida en lino",
    description:
      "Diseño sartorial dominicano en lino y lino-algodón. Por colección o a tu medida, atendido en estudio privado.",
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
