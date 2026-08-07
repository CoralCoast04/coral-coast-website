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
import { A_LA_MEDIDA, type Product } from "@/lib/products";

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
  gift: boolean; // envolver para regalo
};

export type AppliedCoupon = {
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
};

type CartContextType = {
  items: CartItem[];
  savedItems: CartItem[];
  coupon: AppliedCoupon | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, size: string, qty?: number) => void;
  removeItem: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  toggleGift: (key: string) => void;
  saveForLater: (key: string) => void;
  moveToCart: (key: string) => void;
  removeSaved: (key: string) => void;
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
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
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
        setSavedItems(parsed.savedItems ?? []);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, savedItems, coupon }));
  }, [items, savedItems, coupon, hydrated]);

  function addItem(product: Product, size: string, qty = 1) {
    const key = `${product.id}::${size}`;
    // Precio "a la medida": si se elige esa opción y hay un precio definido,
    // se usa ese (sin oferta), sin alterar los precios por talla.
    const mtm = product.made_to_measure_price;
    const useMtm = size === A_LA_MEDIDA && mtm != null && mtm > 0;
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
          price: useMtm ? mtm : product.price,
          sale_price: useMtm ? null : product.sale_price,
          size,
          qty,
          gift: false,
        },
      ];
    });
    setIsOpen(true);
  }

  function toggleGift(key: string) {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, gift: !i.gift } : i))
    );
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

  function saveForLater(key: string) {
    setItems((prev) => {
      const it = prev.find((i) => i.key === key);
      if (it) setSavedItems((s) => (s.some((x) => x.key === key) ? s : [...s, it]));
      return prev.filter((i) => i.key !== key);
    });
  }

  function moveToCart(key: string) {
    setSavedItems((prev) => {
      const it = prev.find((i) => i.key === key);
      if (it) {
        setItems((c) => {
          const existing = c.find((x) => x.key === key);
          return existing
            ? c.map((x) => (x.key === key ? { ...x, qty: x.qty + it.qty } : x))
            : [...c, it];
        });
        setIsOpen(true);
      }
      return prev.filter((i) => i.key !== key);
    });
  }

  function removeSaved(key: string) {
    setSavedItems((prev) => prev.filter((i) => i.key !== key));
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
    savedItems,
    coupon,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addItem,
    removeItem,
    setQty,
    toggleGift,
    saveForLater,
    moveToCart,
    removeSaved,
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
