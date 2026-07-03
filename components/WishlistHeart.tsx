"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist/WishlistContext";

export function WishlistHeart({
  productId,
  className = "",
  size = 18,
}: {
  productId: string;
  className?: string;
  size?: number;
}) {
  const { has, toggle } = useWishlist();
  const active = has(productId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      aria-label={active ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={`flex items-center justify-center rounded-full bg-white/85 backdrop-blur-sm text-navy transition-colors duration-300 hover:text-terracota ${className}`}
    >
      <Heart size={size} className={active ? "fill-terracota text-terracota" : ""} />
    </button>
  );
}
