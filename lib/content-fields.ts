// Datos puros (client-safe) del contenido editable — sin dependencias de servidor.

export const DEFAULT_CONTENT: Record<string, string> = {
  hero_title: "El Caribe, hecho a tu medida.",
  hero_subtitle:
    "Chacabanas, trajes, bermudas y pantalones en lino y otros tejidos nobles. Piezas de colección o diseñadas a tu medida.",
  about_story:
    "Coral Coast es una casa de diseño dominicana dedicada a la ropa a la medida. Creamos chacabanas, trajes, bermudas y pantalones en lino y otros tejidos nobles, con el cuidado del buen diseño y la frescura del Caribe.",
  studio_address: "Santo Domingo, República Dominicana",
  studio_hours: "Lunes a sábado · por cita",
  studio_maps_url: "",
};

export const CONTENT_FIELDS: {
  key: string;
  label: string;
  textarea?: boolean;
}[] = [
  { key: "hero_title", label: "Hero · Título" },
  { key: "hero_subtitle", label: "Hero · Subtítulo", textarea: true },
  { key: "about_story", label: "Sobre nosotros · Historia", textarea: true },
  { key: "studio_address", label: "Estudio · Dirección" },
  { key: "studio_hours", label: "Estudio · Horario" },
  { key: "studio_maps_url", label: "Estudio · Enlace de Google Maps" },
];

export type SiteContent = Record<string, string>;
