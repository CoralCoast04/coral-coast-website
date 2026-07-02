import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { ProductGrid } from "@/components/ProductGrid";
import { getProducts } from "@/lib/products.server";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Colección",
  description:
    "Explora la colección de lino de lujo de Coral Coast: mesa, cama, hogar y resort. Adquisición por cita, cierre por WhatsApp.",
};

export default async function ColeccionPage() {
  const products = await getProducts();

  return (
    <div className="pt-28 md:pt-36 pb-8">
      <div className="container-luxe">
        <Reveal className="max-w-2xl mb-14">
          <p className="eyebrow text-salvia mb-4">La colección</p>
          <h1 className="text-4xl md:text-6xl text-navy leading-tight">
            Sastrería en lino, a tu medida.
          </h1>
          <p className="mt-5 text-lg text-navy/65 font-light leading-relaxed">
            Chacabanas, bermudas, trajes y pantalones en lino y lino-algodón.
            Todo se confecciona a la medida: úsalos como punto de partida o
            diseñamos la pieza contigo. El cierre se conversa por WhatsApp.
          </p>
        </Reveal>

        <ProductGrid products={products} />

        <Reveal className="text-center mt-24 border-t border-navy/10 pt-16">
          <h2 className="font-serif text-2xl md:text-3xl text-navy">
            ¿Tienes un diseño en mente?
          </h2>
          <p className="mt-3 text-navy/60 font-light">
            Cuéntanos qué imaginas — tejido, color, corte — y lo diseñamos a tu
            gusto.
          </p>
          <a
            href={waLink(WA_MESSAGES.general)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn mt-8"
          >
            Escríbenos por WhatsApp
          </a>
        </Reveal>
      </div>
    </div>
  );
}
