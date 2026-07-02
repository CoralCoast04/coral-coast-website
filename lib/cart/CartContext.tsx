"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { effectivePrice } from "@/lib/format";
import type { Product } from "@/lib/products";

export type CartItem = {
  key: string; // id + talla (para diferenciar la misma pieza en distinta talla)
  id: string;
  slug: string;
  name: string;
  image_url: string;
  price: number;
  sale_price: number | null;
  size: string; // talla elegida o "A la medida"
  qty: number;
};

export type AppliedCoupon = {
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
};

type CartContextType = {
  items: CartItem[];
  coupon: AppliedCoupon | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, size: string, qty?: number) => void;
  removeItem: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  applyCoupon: (c: AppliedCoupon) => void;
  removeCoupon: () => void;
  count: number;
  subtotal: number;
  discount: number;
  total: number;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "coral-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Cargar desde localStorage al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setItems(parsed.items ?? []);
        setCoupon(parsed.coupon ?? null);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Persistir
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, coupon }));
  }, [items, coupon, hydrated]);

  function addItem(product: Product, size: string, qty = 1) {
    const key = `${product.id}::${size}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...prev,
        {
          key,
          id: product.id,
          slug: product.slug,
          name: product.name,
          image_url: product.image_url,
          price: product.price,
          sale_price: product.sale_price,
          size,
          qty,
        },
      ];
    });
    setIsOpen(true);
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function setQty(key: string, qty: number) {
    setItems((prev) =>
      prev
        .map((i) => (i.key === key ? { ...i, qty: Math.max(0, qty) } : i))
        .filter((i) => i.qty > 0)
    );
  }

  function clear() {
    setItems([]);
    setCoupon(null);
  }

  const { count, subtotal, discount, total } = useMemo(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce(
      (s, i) => s + effectivePrice(i) * i.qty,
      0
    );
    let discount = 0;
    if (coupon) {
      discount =
        coupon.discount_type === "percent"
          ? Math.round((subtotal * coupon.discount_value) / 100)
          : Math.min(coupon.discount_value, subtotal);
    }
    return { count, subtotal, discount, total: Math.max(0, subtotal - discount) };
  }, [items, coupon]);

  const value: CartContextType = {
    items,
    coupon,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addItem,
    removeItem,
    setQty,
    clear,
    applyCoupon: setCoupon,
    removeCoupon: () => setCoupon(null),
    count,
    subtotal,
    discount,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
