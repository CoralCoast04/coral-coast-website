import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { getProducts } from "@/lib/products.server";
import { getContent } from "@/lib/content";
import { formatRD, effectivePrice } from "@/lib/format";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";
import { Leaf, Scissors, Waves } from "lucide-react";

export default async function Home() {
  const [products, content] = await Promise.all([getProducts(), getContent()]);
  const featured = products.filter((p) => p.featured).slice(0, 3);

  return (
    <>
      <Hero title={content.hero_title} subtitle={content.hero_subtitle} />

      {/* Intro editorial */}
      <section className="container-luxe py-24 md:py-32">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          <Reveal className="md:col-span-5">
            <p className="eyebrow text-salvia mb-4">El estudio</p>
            <h2 className="text-3xl md:text-4xl leading-tight text-navy">
              Diseño dominicano, hecho a tu medida.
            </h2>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-6 md:col-start-7">
            <p className="text-lg text-navy/70 leading-relaxed font-light">
              Coral Coast es una casa de diseño dominicana dedicada a la ropa a
              la medida. Trabajamos el lino y otros tejidos nobles para crear
              chacabanas, trajes, bermudas y pantalones de líneas limpias y caída
              impecable. Elige una pieza de colección o la diseñamos contigo, a tu
              gusto — con la atención sin prisa de un estudio privado.
            </p>
            <Link
              href="/sobre-nosotros"
              className="link-underline inline-block mt-6 text-sm tracking-wide text-terracota"
            >
              Conoce nuestra historia →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Franja imagen ancha */}
      <Reveal as="section" className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1920&q=80"
          alt="Ambiente de lino Coral Coast"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-navy/25" />
        <div className="container-luxe relative z-10 h-full flex items-end pb-12">
          <p className="font-serif text-white text-2xl md:text-4xl max-w-2xl leading-snug">
            “Una prenda que cae bien no se nota — se siente.”
          </p>
        </div>
      </Reveal>

      {/* Destacados */}
      <section className="container-luxe py-24 md:py-32">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="eyebrow text-salvia mb-4">Selección</p>
          <h2 className="text-3xl md:text-5xl text-navy">Piezas destacadas</h2>
          <p className="mt-4 text-navy/60 font-light">
            Un vistazo a la colección. Todas las piezas se confeccionan a la
            medida — el cierre se conversa por WhatsApp.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {featured.map((p, i) => (
            <Reveal as="article" key={p.id} delay={i * 0.1} className="group">
              <Link href="/coleccion" className="block">
                <div className="relative overflow-hidden aspect-[4/5] bg-arena/20">
                  <Image
                    src={p.image_url}
                    alt={p.name}
                    fill
                    sizes="(max-width:640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                </div>
                <div className="pt-5 flex items-baseline justify-between">
                  <h3 className="font-serif text-xl text-navy">{p.name}</h3>
                  <span className="text-sm text-terracota">{formatRD(effectivePrice(p))}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="text-center mt-16">
          <Link href="/coleccion" className="btn btn-outline">
            Ver toda la colección
          </Link>
        </Reveal>
      </section>

      {/* Valores */}
      <section className="bg-arena/25 py-24 md:py-32">
        <div className="container-luxe">
          <Reveal className="text-center max-w-2xl mx-auto mb-16">
            <p className="eyebrow text-salvia mb-4">Por qué Coral Coast</p>
            <h2 className="text-3xl md:text-5xl text-navy">
              El detalle es el lujo.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: Scissors,
                title: "Hecho a tu medida",
                text: "Cada prenda se corta y ajusta a tu silueta. Sin tallas genéricas — solo tu medida.",
              },
              {
                icon: Leaf,
                title: "Tejidos nobles",
                text: "Lino y otros tejidos nobles que respiran bajo el sol y envejecen con carácter.",
              },
              {
                icon: Waves,
                title: "Estudio privado",
                text: "Te atendemos por cita, en el estudio o a domicilio. Diseño de colección o a tu gusto.",
              },
            ].map((v, i) => (
              <Reveal key={v.title} delay={i * 0.12} className="text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-arena">
                  <v.icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-2xl text-navy mb-2">{v.title}</h3>
                <p className="text-navy/65 font-light leading-relaxed">{v.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="container-luxe py-24 md:py-32">
        <Reveal className="bg-navy text-white text-center px-6 py-20 md:py-28">
          <p className="eyebrow text-arena mb-5">Atención personalizada</p>
          <h2 className="text-3xl md:text-5xl max-w-2xl mx-auto leading-tight">
            Reserva una cita en el estudio.
          </h2>
          <p className="mt-5 max-w-xl mx-auto text-white/70 font-light">
            Tomamos tus medidas, elegimos tejido y color, y diseñamos la pieza
            contigo — en el estudio o a domicilio. Cerramos por WhatsApp, a tu
            ritmo.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agenda" className="btn !bg-arena !border-arena !text-navy hover:!bg-terracota hover:!border-terracota hover:!text-white">
              Agenda tu cita
            </Link>
            <a
              href={waLink(WA_MESSAGES.cita)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline !border-white !text-white"
            >
              Escríbenos por WhatsApp
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
