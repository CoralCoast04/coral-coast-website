import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description:
    "La historia de Coral Coast: lino de lujo nacido en la costa dominicana. Menos, pero mejor.",
};

export default function SobreNosotrosPage() {
  return (
    <div className="pt-28 md:pt-36">
      {/* Encabezado */}
      <section className="container-luxe pb-16">
        <Reveal className="max-w-3xl">
          <p className="eyebrow text-salvia mb-4">Nuestra historia</p>
          <h1 className="text-4xl md:text-6xl text-navy leading-[1.1]">
            Nacidos junto al mar, hechos con calma.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-navy/65 font-light leading-relaxed">
            Coral Coast es un estudio de diseño dominicano dedicado a la ropa a la
            medida. Confeccionamos chacabanas, trajes, bermudas y pantalones en
            lino y lino-algodón, con la precisión de la sastrería y la frescura
            del Caribe. Por colección o diseñado a tu gusto.
          </p>
        </Reveal>
      </section>

      {/* Imagen ancha */}
      <Reveal as="section" className="relative h-[55vh] min-h-[380px] w-full overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&w=1920&q=80"
          alt="Costa dominicana"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </Reveal>

      {/* Manifiesto */}
      <section className="container-luxe py-24 md:py-32 grid md:grid-cols-12 gap-10">
        <Reveal className="md:col-span-4">
          <h2 className="text-3xl md:text-4xl text-navy leading-tight">
            Menos, pero mejor.
          </h2>
        </Reveal>
        <Reveal delay={0.12} className="md:col-span-7 md:col-start-6 space-y-5 text-navy/70 font-light text-lg leading-relaxed">
          <p>
            No producimos por temporada ni por tendencia. Confeccionamos prendas
            hechas para durar: chacabanas de ocasión, trajes de lino para bodas
            al aire libre, bermudas y pantalones que caen impecables bajo el sol.
            Cada una, cortada a tu medida.
          </p>
          <p>
            Trabajamos por cita, en estudio privado o a domicilio, porque creemos
            en la atención sin prisa. Tomamos tus medidas, elegimos tejido y
            corte contigo, y el cierre ocurre por WhatsApp — directo y sin
            fricción.
          </p>
        </Reveal>
      </section>

      {/* Valores paleta */}
      <section className="bg-arena/25 py-24 md:py-32">
        <div className="container-luxe">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <p className="eyebrow text-salvia mb-4">Lo que nos guía</p>
            <h2 className="text-3xl md:text-5xl text-navy">Nuestros principios</h2>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { t: "Serenidad", d: "El lujo que no grita. Materiales honestos, paletas tranquilas." },
              { t: "Durabilidad", d: "Piezas para quedarse. Calidad por encima de cantidad." },
              { t: "Cercanía", d: "Atención humana, por cita y por WhatsApp. Sin intermediarios." },
            ].map((v, i) => (
              <Reveal key={v.t} delay={i * 0.1} className="bg-fondo p-8 text-center">
                <h3 className="font-serif text-2xl text-navy mb-3">{v.t}</h3>
                <p className="text-navy/65 font-light leading-relaxed">{v.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-luxe py-24 text-center">
        <Reveal>
          <h2 className="font-serif text-3xl md:text-4xl text-navy">
            ¿Lista para conocer la colección?
          </h2>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agenda" className="btn">Agenda tu cita</Link>
            <Link href="/coleccion" className="btn btn-outline">Ver la colección</Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
