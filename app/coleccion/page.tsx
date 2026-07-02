import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { ProductGrid } from "@/components/ProductGrid";
import { getProducts } from "@/lib/products.server";
import { getContent } from "@/lib/content";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Colección",
  description:
    "Explora la colección de lino de lujo de Coral Coast: mesa, cama, hogar y resort. Adquisición por cita, cierre por WhatsApp.",
};

export default async function ColeccionPage() {
  const [products, content] = await Promise.all([getProducts(), getContent()]);

  return (
    <div className="pt-28 md:pt-36 pb-8">
      <div className="container-luxe">
        <Reveal className="max-w-2xl mb-14">
          <p className="eyebrow text-salvia mb-4">La colección</p>
          <h1 className="text-4xl md:text-6xl text-navy leading-tight">
            {content.coleccion_title}
          </h1>
          <p className="mt-5 text-lg text-navy/65 font-light leading-relaxed">
            {content.coleccion_text}
          </p>
        </Reveal>

        <ProductGrid products={products} />

        <Reveal className="text-center mt-24 border-t border-navy/10 pt-16">
          <h2 className="font-serif text-2xl md:text-3xl text-navy">
            {content.coleccion_cta_title}
          </h2>
          <p className="mt-3 text-navy/60 font-light">
            {content.coleccion_cta_text}
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
