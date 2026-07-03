export type MediaItem = { type: "image" | "video"; url: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number; // precio base en RD$ (0 = "A consultar")
  sale_price: number | null; // precio de oferta en RD$ (null = sin oferta)
  fabric: string; // tejido principal
  color: string;
  image_url: string; // imagen de portada
  media?: MediaItem[]; // galería (imágenes y videos)
  featured: boolean;
  sizes: string[]; // tallas disponibles (ej. ["S","M","L"]) — vacío = solo a la medida
  made_to_measure: boolean; // también disponible a la medida
};

/** Galería efectiva: usa media si existe, si no, la portada como única imagen. */
export function productMedia(p: Product): MediaItem[] {
  if (p.media && p.media.length) return p.media;
  return p.image_url ? [{ type: "image", url: p.image_url }] : [];
}

/**
 * Colección curada de respaldo (moda a la medida en lino y otros tejidos nobles).
 * Se usa mientras Supabase no esté configurado; luego `getProducts()` lee de
 * la tabla `products`. Las fotos son de referencia — reemplázalas por las tuyas.
 * Los precios y tallas son editables desde el panel admin.
 */
export const fallbackProducts: Product[] = [
  {
    id: "1",
    slug: "chacabana-clasica-lino",
    name: "Chacabana Clásica",
    category: "Chacabanas",
    description:
      "Chacabana de lino puro con alforzas verticales y botones de coco. El clásico dominicano, cortado a tu medida.",
    price: 6500,
    sale_price: null,
    fabric: "Lino",
    color: "Marfil",
    image_url:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    sizes: ["S", "M", "L", "XL"],
    made_to_measure: true,
  },
  {
    id: "2",
    slug: "chacabana-manga-corta",
    name: "Chacabana Manga Corta",
    category: "Chacabanas",
    description:
      "Versión fresca y ligera para el día. Caída suave y comodidad de clima cálido.",
    price: 5200,
    sale_price: null,
    fabric: "Lino texturizado",
    color: "Blanco",
    image_url:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    sizes: ["S", "M", "L", "XL"],
    made_to_measure: true,
  },
  {
    id: "3",
    slug: "chacabana-bordada-salvia",
    name: "Chacabana Bordada",
    category: "Chacabanas",
    description:
      "Bordado sobrio a tono, tejido en lino salvia. Elegancia serena para la ocasión especial.",
    price: 7800,
    sale_price: 6900,
    fabric: "Lino",
    color: "Salvia",
    image_url:
      "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    sizes: ["S", "M", "L", "XL"],
    made_to_measure: true,
  },
  {
    id: "4",
    slug: "bermuda-lino-arena",
    name: "Bermuda de Lino",
    category: "Bermudas",
    description:
      "Bermuda de lino en tono arena. Pretina limpia y largo a la rodilla — del estudio a la costa.",
    price: 3900,
    sale_price: null,
    fabric: "Lino",
    color: "Arena",
    image_url:
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    sizes: ["30", "32", "34", "36", "38"],
    made_to_measure: true,
  },
  {
    id: "5",
    slug: "bermuda-lino-algodon-navy",
    name: "Bermuda Estructurada",
    category: "Bermudas",
    description:
      "Estructura sutil y color navy profundo. La bermuda que sube el nivel de un look de verano.",
    price: 4200,
    sale_price: null,
    fabric: "Lino estructurado",
    color: "Navy",
    image_url:
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    sizes: ["30", "32", "34", "36", "38"],
    made_to_measure: true,
  },
  {
    id: "6",
    slug: "traje-lino-navy",
    name: "Traje de Lino",
    category: "Trajes",
    description:
      "Traje de dos piezas en lino navy, entretela ligera y caída natural. Confección de autor para el trópico.",
    price: 18500,
    sale_price: null,
    fabric: "Lino",
    color: "Navy",
    image_url:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    sizes: [],
    made_to_measure: true,
  },
  {
    id: "7",
    slug: "traje-lino-algodon-arena",
    name: "Traje de Lino Arena",
    category: "Trajes",
    description:
      "Tono arena y textura viva para bodas y eventos de día. Ligereza y caída impecables bajo el sol.",
    price: 16900,
    sale_price: 14900,
    fabric: "Lino texturizado",
    color: "Arena",
    image_url:
      "https://images.unsplash.com/photo-1594938291221-94f18cbb5660?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    sizes: [],
    made_to_measure: true,
  },
  {
    id: "8",
    slug: "pantalon-lino-blanco",
    name: "Pantalón de Lino",
    category: "Pantalones",
    description:
      "Pantalón de lino de talle clásico con pinzas. Fresco, versátil, hecho a tu silueta.",
    price: 4500,
    sale_price: null,
    fabric: "Lino",
    color: "Blanco",
    image_url:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    sizes: ["30", "32", "34", "36"],
    made_to_measure: true,
  },
];

export const CATEGORIES = [
  "Todo",
  "Chacabanas",
  "Bermudas",
  "Trajes",
  "Pantalones",
] as const;

/** Etiqueta especial para piezas a la medida. */
export const A_LA_MEDIDA = "A la medida";
