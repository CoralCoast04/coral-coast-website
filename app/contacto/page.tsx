import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "@/components/forms";
import { MessageCircle, Mail, MapPin, Clock, ExternalLink } from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";
import { getContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escríbenos. Coral Coast — casa de diseño dominicana. WhatsApp, correo, Instagram y ubicación del estudio.",
};

export default async function ContactoPage() {
  const content = await getContent();
  const mapsHref =
    content.studio_maps_url ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(content.studio_address)}`;
  const isEmbed = content.studio_maps_url.includes("/embed");

  return (
    <div className="pt-28 md:pt-36">
      <div className="container-luxe grid lg:grid-cols-2 gap-16 pb-20">
        <div>
          <Reveal>
            <p className="eyebrow text-salvia mb-4">Conversemos</p>
            <h1 className="text-4xl md:text-6xl text-navy leading-tight">Contacto.</h1>
            <p className="mt-5 text-lg text-navy/65 font-light leading-relaxed">
              {content.contacto_text}
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10 space-y-5">
            <a href={waLink(WA_MESSAGES.general)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-navy/80 hover:text-terracota transition-colors">
              <MessageCircle size={20} className="text-terracota" strokeWidth={1.5} />
              <span>+1 849 847 9200</span>
            </a>
            <a href="mailto:hola@coralcoastrd.com" className="flex items-center gap-3 text-navy/80 hover:text-terracota transition-colors">
              <Mail size={20} className="text-terracota" strokeWidth={1.5} />
              <span>hola@coralcoastrd.com</span>
            </a>
            <a href="https://instagram.com/coralcoastrd" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-navy/80 hover:text-terracota transition-colors">
              <InstagramIcon size={20} className="text-terracota" />
              <span>@coralcoastrd</span>
            </a>
            <div className="flex items-start gap-3 text-navy/80">
              <MapPin size={20} className="text-terracota shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>{content.studio_address}</span>
            </div>
            <div className="flex items-center gap-3 text-navy/80">
              <Clock size={20} className="text-terracota shrink-0" strokeWidth={1.5} />
              <span>{content.studio_hours}</span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="bg-white/60 backdrop-blur-sm border border-navy/10 p-8 md:p-10">
            <h2 className="font-serif text-2xl text-navy mb-6">Envíanos un mensaje</h2>
            <ContactForm />
          </div>
        </Reveal>
      </div>

      {/* Ubicación del estudio */}
      <section className="container-luxe pb-24">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-salvia mb-3">El estudio</p>
            <h2 className="font-serif text-3xl md:text-4xl text-navy">Visítanos por cita</h2>
            <p className="mt-2 text-navy/60">{content.studio_address} · {content.studio_hours}</p>
          </div>
          <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            <ExternalLink size={16} /> Ver en Google Maps
          </a>
        </Reveal>

        {isEmbed && (
          <Reveal className="overflow-hidden border border-navy/10">
            <iframe
              src={content.studio_maps_url}
              title="Ubicación del estudio Coral Coast"
              className="w-full h-[380px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        )}
      </section>
    </div>
  );
}
