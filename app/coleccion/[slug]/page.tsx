import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { ProductDetail } from "@/components/ProductDetail";
import { getProduct, getProducts } from "@/lib/products.server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Pieza no encontrada" };
  return {
    title: product.name,
    description: product.description,
    openGraph: { images: [product.image_url] },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = (await getProducts())
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  return (
    <div className="pt-28 md:pt-36 pb-24">
      <div className="container-luxe">
        <Reveal>
          <ProductDetail product={product} />
        </Reveal>

        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="font-serif text-2xl text-navy mb-8">También te puede gustar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
              {related.map((p) => (
                <a key={p.id} href={`/coleccion/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-arena/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <h3 className="font-serif text-base text-navy mt-2 leading-tight">{p.name}</h3>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
