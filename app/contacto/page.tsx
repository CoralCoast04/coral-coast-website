import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "@/components/forms";
import { MessageCircle, Mail, MapPin } from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escríbenos. Coral Coast — lino de lujo dominicano. WhatsApp, correo e Instagram.",
};

export default function ContactoPage() {
  return (
    <div className="pt-28 md:pt-36">
      <div className="container-luxe grid lg:grid-cols-2 gap-16 pb-24">
        <div>
          <Reveal>
            <p className="eyebrow text-salvia mb-4">Conversemos</p>
            <h1 className="text-4xl md:text-6xl text-navy leading-tight">
              Contacto.
            </h1>
            <p className="mt-5 text-lg text-navy/65 font-light leading-relaxed">
              ¿Preguntas sobre una pieza, un pedido especial o una colaboración?
              Escríbenos y te respondemos con gusto.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10 space-y-5">
            <a
              href={waLink(WA_MESSAGES.general)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-navy/80 hover:text-terracota transition-colors"
            >
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
            <div className="flex items-center gap-3 text-navy/80">
              <MapPin size={20} className="text-terracota" strokeWidth={1.5} />
              <span>Santo Domingo, República Dominicana</span>
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
    </div>
  );
}
