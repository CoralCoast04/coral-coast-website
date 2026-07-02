import Link from "next/link";
import { MessageCircle, Mail } from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="bg-navy text-fondo/90 mt-24">
      <div className="container-luxe py-16 grid gap-12 md:grid-cols-3">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-beige.svg"
            alt="Coral Coast · Dominican Design House"
            className="h-28 w-auto mb-4"
          />
          <p className="text-sm leading-relaxed text-fondo/70 max-w-xs">
            Estudio dominicano de sastrería a la medida. Chacabanas, trajes,
            bermudas y pantalones en lino y lino-algodón.
          </p>
        </div>

        <div>
          <p className="eyebrow text-arena mb-4">Navegación</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/coleccion" className="link-underline hover:text-white">Colección</Link></li>
            <li><Link href="/agenda" className="link-underline hover:text-white">Agenda tu cita</Link></li>
            <li><Link href="/sobre-nosotros" className="link-underline hover:text-white">Sobre nosotros</Link></li>
            <li><Link href="/contacto" className="link-underline hover:text-white">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-arena mb-4">Contacto</p>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href={waLink(WA_MESSAGES.general)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <MessageCircle size={16} /> +1 849 847 9200
              </a>
            </li>
            <li>
              <a
                href="mailto:hola@coralcoastrd.com"
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <Mail size={16} /> hola@coralcoastrd.com
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/coralcoastrd"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <InstagramIcon size={16} /> @coralcoastrd
              </a>
            </li>
          </ul>

          <a
            href="https://instagram.com/coralcoastrd"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-arena/50 px-5 py-2.5 text-[0.72rem] tracking-[0.16em] uppercase text-arena transition-colors duration-500 hover:bg-terracota hover:border-terracota hover:text-white"
          >
            <InstagramIcon size={16} /> Síguenos en Instagram
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-luxe py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-fondo/50">
          <p>© {new Date().getFullYear()} Coral Coast. Santo Domingo, RD.</p>
          <p>Hecho con lino y calma.</p>
        </div>
      </div>
    </footer>
  );
}
