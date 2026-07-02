"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";
import { useCart } from "@/lib/cart/CartContext";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/coleccion", label: "Colección" },
  { href: "/agenda", label: "Agenda tu cita" },
  { href: "/sobre-nosotros", label: "Sobre nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export function Navbar() {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const onHome = pathname === "/";
  // En Inicio, antes de hacer scroll, la barra flota sobre el hero (texto claro).
  const transparent = onHome && !scrolled;

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        transparent
          ? "bg-transparent"
          : "bg-fondo/85 backdrop-blur-md border-b border-navy/10"
      }`}
    >
      <nav className="container-luxe flex items-center justify-between py-4 md:py-5">
        <Link href="/" aria-label="Coral Coast — Inicio" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={transparent ? "/logo-horizontal-beige.svg" : "/logo-horizontal-navy.svg"}
            alt="Coral Coast · Dominican Design House"
            className="h-12 md:h-16 w-auto transition-all duration-500"
          />
        </Link>

        {/* Desktop */}
        <ul
          className={`hidden md:flex items-center gap-9 text-[0.82rem] tracking-wide ${
            transparent ? "text-white" : "text-navy"
          }`}
        >
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`link-underline transition-opacity hover:opacity-70 ${
                  pathname === item.href ? "opacity-100" : "opacity-90"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4 md:gap-5">
          {/* Carrito */}
          <button
            onClick={openCart}
            aria-label="Abrir carrito"
            className={`relative ${transparent ? "text-white" : "text-navy"} hover:opacity-70 transition-opacity`}
          >
            <ShoppingBag size={22} strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-terracota px-1 text-[0.6rem] font-medium text-white">
                {count}
              </span>
            )}
          </button>

          <a
            href={waLink(WA_MESSAGES.general)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn hidden md:inline-flex !py-2.5 !px-5 !text-[0.72rem]"
          >
            WhatsApp
          </a>

          {/* Mobile toggle */}
          <button
            aria-label="Menú"
            onClick={() => setOpen((v) => !v)}
            className={`md:hidden ${transparent ? "text-white" : "text-navy"}`}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-fondo border-t border-navy/10">
          <ul className="container-luxe flex flex-col py-4 text-navy">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-3 text-sm tracking-wide"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-3">
              <a
                href={waLink(WA_MESSAGES.general)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn w-full"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
