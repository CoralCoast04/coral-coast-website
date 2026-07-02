import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { TrackOrder } from "@/components/TrackOrder";

export const metadata: Metadata = {
  title: "Rastrea tu pedido",
  description:
    "Consulta el estado de tu pedido Coral Coast con tu número de pedido.",
};

export default async function RastrearPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string }>;
}) {
  const { codigo } = await searchParams;

  return (
    <div className="pt-28 md:pt-36 pb-24">
      <div className="container-luxe">
        <Reveal className="max-w-xl mb-10">
          <p className="eyebrow text-salvia mb-4">Seguimiento</p>
          <h1 className="text-4xl md:text-6xl text-navy leading-tight">
            Rastrea tu pedido.
          </h1>
          <p className="mt-5 text-lg text-navy/65 font-light leading-relaxed">
            Ingresa el número de pedido que te enviamos (por WhatsApp o correo)
            para ver su estado.
          </p>
        </Reveal>

        <TrackOrder initialCode={codigo ?? ""} />
      </div>
    </div>
  );
}
