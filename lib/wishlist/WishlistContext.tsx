"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toggleWishlist } from "@/app/wishlist-actions";

type WishlistContextType = {
  isLoggedIn: boolean;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  count: number;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({
  initialIds,
  isLoggedIn,
  children,
}: {
  initialIds: string[];
  isLoggedIn: boolean;
  children: ReactNode;
}) {
  const [ids, setIds] = useState<Set<string>>(new Set(initialIds));
  const router = useRouter();

  const has = useCallback((id: string) => ids.has(id), [ids]);

  const toggle = useCallback(
    async (id: string) => {
      if (!isLoggedIn) {
        router.push("/login?redirect=/coleccion");
        return;
      }
      // Optimista
      setIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      const res = await toggleWishlist(id);
      if (res.needLogin) router.push("/login");
    },
    [isLoggedIn, router]
  );

  return (
    <WishlistContext.Provider value={{ isLoggedIn, has, toggle, count: ids.size }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist debe usarse dentro de <WishlistProvider>");
  return ctx;
}
