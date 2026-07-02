// Catálogo de contenido editable (client-safe, sin dependencias de servidor).
// Cada campo tiene: clave, etiqueta, grupo (sección), tipo y valor por defecto.

export type ContentType = "text" | "textarea" | "image";

export type ContentField = {
  key: string;
  label: string;
  group: string;
  type: ContentType;
  def: string;
};

const U = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const CONTENT_FIELDS: ContentField[] = [
  // ---------------------------------------------------------------- Inicio · Hero
  { key: "hero_eyebrow", label: "Etiqueta superior", group: "Inicio · Hero", type: "text", def: "Casa de diseño dominicana · Hecho en RD" },
  { key: "hero_title", label: "Título", group: "Inicio · Hero", type: "text", def: "El Caribe, hecho a tu medida." },
  { key: "hero_subtitle", label: "Subtítulo", group: "Inicio · Hero", type: "textarea", def: "Chacabanas, trajes, bermudas y pantalones en lino y otros tejidos nobles. Piezas de colección o diseñadas a tu medida." },
  { key: "hero_image", label: "Imagen de fondo (póster del video)", group: "Inicio · Hero", type: "image", def: U("photo-1616486338812-3dadae4b4ace", 1920) },

  // -------------------------------------------------------------- Inicio · Intro
  { key: "home_intro_eyebrow", label: "Etiqueta", group: "Inicio · Intro", type: "text", def: "El estudio" },
  { key: "home_intro_title", label: "Título", group: "Inicio · Intro", type: "text", def: "Diseño dominicano, hecho a tu medida." },
  { key: "home_intro_text", label: "Texto", group: "Inicio · Intro", type: "textarea", def: "Coral Coast es una casa de diseño dominicana dedicada a la ropa a la medida. Trabajamos el lino y otros tejidos nobles para crear chacabanas, trajes, bermudas y pantalones de líneas limpias y caída impecable. Elige una pieza de colección o la diseñamos contigo, a tu gusto — con la atención sin prisa de un estudio privado." },

  // -------------------------------------------------------------- Inicio · Franja
  { key: "home_band_image", label: "Imagen ancha", group: "Inicio · Franja", type: "image", def: U("photo-1600607687920-4e2a09cf159d", 1920) },
  { key: "home_band_quote", label: "Frase", group: "Inicio · Franja", type: "textarea", def: "“Una prenda que cae bien no se nota — se siente.”" },

  // ------------------------------------------------------------ Inicio · Destacados
  { key: "home_featured_eyebrow", label: "Etiqueta", group: "Inicio · Destacados", type: "text", def: "Selección" },
  { key: "home_featured_title", label: "Título", group: "Inicio · Destacados", type: "text", def: "Piezas destacadas" },
  { key: "home_featured_text", label: "Texto", group: "Inicio · Destacados", type: "textarea", def: "Un vistazo a la colección. Todas las piezas se confeccionan a la medida — el cierre se conversa por WhatsApp." },

  // -------------------------------------------------------------- Inicio · Valores
  { key: "home_values_eyebrow", label: "Etiqueta", group: "Inicio · Valores", type: "text", def: "Por qué Coral Coast" },
  { key: "home_values_title", label: "Título", group: "Inicio · Valores", type: "text", def: "El detalle es el lujo." },
  { key: "value1_title", label: "Valor 1 · Título", group: "Inicio · Valores", type: "text", def: "Hecho a tu medida" },
  { key: "value1_text", label: "Valor 1 · Texto", group: "Inicio · Valores", type: "textarea", def: "Cada prenda se ajusta a tu silueta. Sin tallas genéricas — solo tu medida." },
  { key: "value2_title", label: "Valor 2 · Título", group: "Inicio · Valores", type: "text", def: "Tejidos nobles" },
  { key: "value2_text", label: "Valor 2 · Texto", group: "Inicio · Valores", type: "textarea", def: "Lino y otros tejidos nobles que respiran bajo el sol y envejecen con carácter." },
  { key: "value3_title", label: "Valor 3 · Título", group: "Inicio · Valores", type: "text", def: "Estudio privado" },
  { key: "value3_text", label: "Valor 3 · Texto", group: "Inicio · Valores", type: "textarea", def: "Te atendemos por cita, en el estudio o a domicilio. Diseño de colección o a tu gusto." },

  // ---------------------------------------------------------------- Inicio · CTA
  { key: "home_cta_eyebrow", label: "Etiqueta", group: "Inicio · CTA", type: "text", def: "Atención personalizada" },
  { key: "home_cta_title", label: "Título", group: "Inicio · CTA", type: "text", def: "Reserva una cita en el estudio." },
  { key: "home_cta_text", label: "Texto", group: "Inicio · CTA", type: "textarea", def: "Tomamos tus medidas, elegimos tejido y color, y diseñamos la pieza contigo — en el estudio o a domicilio. Cerramos por WhatsApp, a tu ritmo." },

  // ------------------------------------------------------------------- Colección
  { key: "coleccion_title", label: "Título", group: "Colección", type: "text", def: "Piezas de lino, a tu medida." },
  { key: "coleccion_text", label: "Texto", group: "Colección", type: "textarea", def: "Chacabanas, bermudas, trajes y pantalones en lino y otros tejidos nobles. Todo se confecciona a la medida: úsalos como punto de partida o diseñamos la pieza contigo. El cierre se conversa por WhatsApp." },
  { key: "coleccion_cta_title", label: "Cierre · Título", group: "Colección", type: "text", def: "¿Tienes un diseño en mente?" },
  { key: "coleccion_cta_text", label: "Cierre · Texto", group: "Colección", type: "textarea", def: "Cuéntanos qué imaginas — tejido, color, corte — y lo diseñamos a tu gusto." },

  // ---------------------------------------------------------------------- Agenda
  { key: "agenda_title", label: "Título", group: "Agenda", type: "text", def: "Agenda tu cita." },
  { key: "agenda_text", label: "Texto", group: "Agenda", type: "textarea", def: "Reserva una sesión en el estudio privado. Tomamos tus medidas, elegimos tejido y color, y diseñamos la pieza contigo. Elige fecha y hora; confirmamos por WhatsApp o correo." },

  // ---------------------------------------------------------------- Sobre nosotros
  { key: "about_h1", label: "Título principal", group: "Sobre nosotros", type: "text", def: "Nacidos junto al mar, hechos con calma." },
  { key: "about_story", label: "Historia", group: "Sobre nosotros", type: "textarea", def: "Coral Coast es una casa de diseño dominicana dedicada a la ropa a la medida. Creamos chacabanas, trajes, bermudas y pantalones en lino y otros tejidos nobles, con el cuidado del buen diseño y la frescura del Caribe." },
  { key: "about_band_image", label: "Imagen ancha", group: "Sobre nosotros", type: "image", def: U("photo-1520006403909-838d6b92c22e", 1920) },
  { key: "about_manifesto_title", label: "Manifiesto · Título", group: "Sobre nosotros", type: "text", def: "Menos, pero mejor." },
  { key: "about_manifesto_p1", label: "Manifiesto · Párrafo 1", group: "Sobre nosotros", type: "textarea", def: "No producimos por temporada ni por tendencia. Confeccionamos prendas hechas para durar: chacabanas de ocasión, trajes de lino para bodas al aire libre, bermudas y pantalones que caen impecables bajo el sol. Cada una, hecha a tu medida." },
  { key: "about_manifesto_p2", label: "Manifiesto · Párrafo 2", group: "Sobre nosotros", type: "textarea", def: "Trabajamos por cita, en estudio privado o a domicilio, porque creemos en la atención sin prisa. Tomamos tus medidas, elegimos tejido y estilo contigo, y el cierre ocurre por WhatsApp — directo y sin fricción." },

  // -------------------------------------------------------------------- Contacto
  { key: "contacto_text", label: "Texto de intro", group: "Contacto", type: "textarea", def: "¿Preguntas sobre una pieza, un pedido especial o una colaboración? Escríbenos y te respondemos con gusto." },

  // ---------------------------------------------------------------------- Footer
  { key: "footer_tagline", label: "Descripción", group: "Footer", type: "textarea", def: "Casa de diseño dominicana. Chacabanas, trajes, bermudas y pantalones en lino y otros tejidos nobles — de colección o a tu medida." },

  // --------------------------------------------------------------------- Estudio
  { key: "studio_address", label: "Dirección", group: "Estudio", type: "text", def: "Santo Domingo, República Dominicana" },
  { key: "studio_hours", label: "Horario", group: "Estudio", type: "text", def: "Lunes a sábado · por cita" },
  { key: "studio_maps_url", label: "Enlace de Google Maps (embed opcional)", group: "Estudio", type: "text", def: "" },
];

export const DEFAULT_CONTENT: Record<string, string> = Object.fromEntries(
  CONTENT_FIELDS.map((f) => [f.key, f.def])
);

/** Grupos en orden, para el panel admin. */
export const CONTENT_GROUPS: string[] = [...new Set(CONTENT_FIELDS.map((f) => f.group))];

export type SiteContent = Record<string, string>;
