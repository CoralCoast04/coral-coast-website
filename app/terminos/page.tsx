import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { getContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Términos y Políticas",
  description: "Términos y condiciones y política de privacidad de Coral Coast.",
};

export default async function TerminosPage() {
  const content = await getContent();

  return (
    <div className="pt-28 md:pt-36 pb-24">
      <div className="container-luxe max-w-3xl">
        <Reveal>
          <p className="eyebrow text-salvia mb-4">Legal</p>
          <h1 className="text-4xl md:text-6xl text-navy leading-tight mb-12">
            Términos y Políticas
          </h1>
        </Reveal>

        <Reveal className="mb-14">
          <h2 className="font-serif text-2xl text-navy mb-4">Términos y condiciones</h2>
          <p className="text-navy/70 font-light leading-relaxed whitespace-pre-line">
            {content.terms_body}
          </p>
        </Reveal>

        <Reveal>
          <h2 className="font-serif text-2xl text-navy mb-4">Política de privacidad</h2>
          <p className="text-navy/70 font-light leading-relaxed whitespace-pre-line">
            {content.privacy_body}
          </p>
        </Reveal>
      </div>
    </div>
  );
}
