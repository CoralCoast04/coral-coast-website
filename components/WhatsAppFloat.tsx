"use client";

import { MessageCircle } from "lucide-react";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";

/** Botón flotante persistente — el cierre siempre está a un toque. */
export function WhatsAppFloat() {
  return (
    <a
      href={waLink(WA_MESSAGES.general)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white shadow-lg transition-all duration-500 hover:bg-terracota hover:scale-105"
      style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
    >
      <MessageCircle size={24} />
    </a>
  );
}
