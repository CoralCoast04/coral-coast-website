import { getMonthlyReport, previousMonth } from "@/lib/sales.server";
import { sendMonthlyReport } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Reporte mensual automático. Lo llama el cron de Vercel el día 1 de cada mes
 * (ver vercel.json) y envía por correo el resumen del mes recién cerrado.
 * Si CRON_SECRET está configurado, exige el header Authorization de Vercel.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const { year, month } = previousMonth();
  const report = await getMonthlyReport(year, month);
  if (!report) {
    return new Response("Reporte no disponible (revisa la service role).", {
      status: 503,
    });
  }
  const res = await sendMonthlyReport(report);
  return Response.json({ ok: res.ok, error: res.error, month: report.label, revenue: report.revenue });
}
