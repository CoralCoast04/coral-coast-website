"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ShoppingBag, Heart, User } from "lucide-react";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";
import { useCart } from "@/lib/cart/CartContext";
import { useWishlist } from "@/lib/wishlist/WishlistContext";
import { logoutCustomer } from "@/app/auth-actions";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/coleccion", label: "Colección" },
  { href: "/agenda", label: "Agenda tu cita" },
  { href: "/sobre-nosotros", label: "Sobre nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export function Navbar({ userEmail }: { userEmail: string | null }) {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const { count: wishCount } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [acct, setAcct] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setAcct(false);
  }, [pathname]);

  const onHome = pathname === "/";
  const transparent = onHome && !scrolled;
  const iconColor = transparent ? "text-white" : "text-navy";

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        transparent ? "bg-transparent" : "bg-fondo/85 backdrop-blur-md border-b border-navy/10"
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

        {/* Desktop nav */}
        <ul className={`hidden lg:flex items-center gap-8 text-[0.82rem] tracking-wide ${transparent ? "text-white" : "text-navy"}`}>
          {NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={`link-underline transition-opacity hover:opacity-70 ${pathname === item.href ? "opacity-100" : "opacity-90"}`}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4 md:gap-5">
          {/* Favoritos */}
          <Link href="/favoritos" aria-label="Favoritos" className={`relative ${iconColor} hover:opacity-70 transition-opacity`}>
            <Heart size={21} strokeWidth={1.5} />
            {wishCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-terracota px-1 text-[0.6rem] font-medium text-white">
                {wishCount}
              </span>
            )}
          </Link>

          {/* Cuenta */}
          <div className="relative">
            {userEmail ? (
              <button onClick={() => setAcct((v) => !v)} aria-label="Mi cuenta" className={`${iconColor} hover:opacity-70 transition-opacity`}>
                <User size={21} strokeWidth={1.5} />
              </button>
            ) : (
              <Link href="/login" aria-label="Ingresar" className={`${iconColor} hover:opacity-70 transition-opacity`}>
                <User size={21} strokeWidth={1.5} />
              </Link>
            )}
            {acct && userEmail && (
              <div className="absolute right-0 mt-3 w-52 bg-fondo border border-navy/10 shadow-lg py-2 text-sm text-navy">
                <p className="px-4 py-2 text-xs text-navy/50 truncate">{userEmail}</p>
                <Link href="/favoritos" className="block px-4 py-2 hover:bg-navy/5">Favoritos</Link>
                <form action={logoutCustomer}>
                  <button className="w-full text-left px-4 py-2 hover:bg-navy/5">Cerrar sesión</button>
                </form>
              </div>
            )}
          </div>

          {/* Carrito */}
          <button onClick={openCart} aria-label="Abrir carrito" className={`relative ${iconColor} hover:opacity-70 transition-opacity`}>
            <ShoppingBag size={22} strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-terracota px-1 text-[0.6rem] font-medium text-white">
                {count}
              </span>
            )}
          </button>

          <a href={waLink(WA_MESSAGES.general)} target="_blank" rel="noopener noreferrer" className="btn hidden md:inline-flex !py-2.5 !px-5 !text-[0.72rem]">
            WhatsApp
          </a>

          <button aria-label="Menú" onClick={() => setOpen((v) => !v)} className={`lg:hidden ${iconColor} transition-transform duration-300 active:scale-90`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? "x" : "menu"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="block"
              >
                {open ? <X size={24} /> : <Menu size={24} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="lg:hidden overflow-hidden bg-fondo/95 backdrop-blur-md border-t border-navy/10"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.ul
              className="container-luxe flex flex-col py-4 text-navy"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }}
            >
              {[...NAV, { href: "/favoritos", label: "Favoritos" }].map((item) => (
                <motion.li
                  key={item.href}
                  variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}
                >
                  <Link href={item.href} className="block py-3 text-sm tracking-wide">{item.label}</Link>
                </motion.li>
              ))}
              <motion.li variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}>
                {userEmail ? (
                  <form action={logoutCustomer}>
                    <button className="block py-3 text-sm tracking-wide text-navy/70">Cerrar sesión</button>
                  </form>
                ) : (
                  <Link href="/login" className="block py-3 text-sm tracking-wide">Ingresar / Registrarse</Link>
                )}
              </motion.li>
              <motion.li className="pt-3" variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}>
                <a href={waLink(WA_MESSAGES.general)} target="_blank" rel="noopener noreferrer" className="btn w-full">WhatsApp</a>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
