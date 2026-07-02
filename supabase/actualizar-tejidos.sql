-- =============================================================================
-- Coral Coast · Limpieza de tejidos y textos (quita "algodón" y "sastre")
-- Ejecútalo UNA VEZ en el SQL Editor si ya cargaste la colección de ejemplo.
-- Solo actualiza las piezas de ejemplo por su slug; no toca las que tú crees.
-- =============================================================================

update public.products set
  name = 'Chacabana Manga Corta',
  description = 'Versión fresca y ligera para el día. Caída suave y comodidad de clima cálido.',
  fabric = 'Lino texturizado'
where slug = 'chacabana-manga-corta';

update public.products set
  description = 'Bermuda de lino en tono arena. Pretina limpia y largo a la rodilla — del estudio a la costa.'
where slug = 'bermuda-lino-arena';

update public.products set
  name = 'Bermuda Estructurada',
  fabric = 'Lino estructurado'
where slug = 'bermuda-lino-algodon-navy';

update public.products set
  description = 'Traje de dos piezas en lino navy, entretela ligera y caída natural. Confección de autor para el trópico.'
where slug = 'traje-lino-navy';

update public.products set
  name = 'Traje de Lino Arena',
  fabric = 'Lino texturizado'
where slug = 'traje-lino-algodon-arena';

-- Por si quedó algún "Lino-algodón" en piezas que hayas duplicado:
update public.products set fabric = 'Lino texturizado' where fabric ilike '%algod%';
