import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { AppointmentForm } from "@/components/forms";
import { CalendarClock, MapPin, Sparkles } from "lucide-react";
import { getContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Agenda tu cita",
  description:
    "Reserva una cita privada en el estudio de Coral Coast. Atención personalizada, cierre por WhatsApp.",
};

export default async function AgendaPage() {
  const content = await getContent();
  return (
    <div className="pt-28 md:pt-36">
      <div className="container-luxe grid lg:grid-cols-2 gap-16 pb-24">
        {/* Columna texto + form */}
        <div>
          <Reveal>
            <p className="eyebrow text-salvia mb-4">Cita privada</p>
            <h1 className="text-4xl md:text-6xl text-navy leading-tight">
              {content.agenda_title}
            </h1>
            <p className="mt-5 text-lg text-navy/65 font-light leading-relaxed">
              {content.agenda_text}
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10 space-y-5">
            {[
              { icon: Sparkles, text: "Toma de medidas y asesoría de diseño uno a uno." },
              { icon: CalendarClock, text: "Horarios flexibles, de lunes a sábado." },
              { icon: MapPin, text: "En el estudio o a domicilio en Santo Domingo." },
            ].map((r) => (
              <div key={r.text} className="flex items-start gap-3 text-navy/75">
                <r.icon size={20} className="mt-0.5 text-terracota shrink-0" strokeWidth={1.5} />
                <span className="text-sm leading-relaxed">{r.text}</span>
              </div>
            ))}
          </Reveal>

          <Reveal delay={0.2} className="mt-12">
            <AppointmentForm />
          </Reveal>
        </div>

        {/* Columna imagen */}
        <Reveal delay={0.15} className="relative hidden lg:block">
          <div className="sticky top-32 aspect-[3/4] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80"
              alt="Showroom Coral Coast"
              fill
              className="object-cover"
              sizes="50vw"
            />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
