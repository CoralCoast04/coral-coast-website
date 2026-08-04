import "server-only";
import { createServiceClient, isServiceConfigured } from "@/lib/supabase/admin";
import { sendStockAlert, isEmailConfigured } from "@/lib/email";

const SITE = "https://www.coralcoastrd.com";

/**
 * Avisa por correo a quienes pidieron "avísame cuando vuelva" de un producto
 * cuya talla volvió a tener stock. Idempotente: marca `notified_at` para no
 * repetir. No-op si falta la service role o el correo. Nunca lanza.
 */
export async function notifyRestock(productId: string): Promise<void> {
  if (!isServiceConfigured || !isEmailConfigured) return;
  try {
    const supabase = createServiceClient();
    const { data: product } = await supabase
      .from("products")
      .select("name, slug, stock")
      .eq("id", productId)
      .maybeSingle();
    if (!product) return;

    const stock = (product.stock ?? {}) as Record<string, number>;
    const anyInStock = Object.values(stock).some((n) => Number(n) > 0);
    if (!anyInStock) return;

    const { data: alerts } = await supabase
      .from("stock_alerts")
      .select("id, email, size")
      .eq("product_id", productId)
      .is("notified_at", null);
    if (!alerts || alerts.length === 0) return;

    const url = `${SITE}/coleccion/${product.slug}`;
    const sentIds: string[] = [];
    for (const a of alerts) {
      const available = a.size ? Number(stock[a.size] ?? 0) > 0 : anyInStock;
      if (!available) continue;
      const ok = await sendStockAlert({
        to: a.email,
        productName: product.name,
        size: a.size,
        url,
      });
      if (ok) sentIds.push(a.id);
    }
    if (sentIds.length) {
      await supabase
        .from("stock_alerts")
        .update({ notified_at: new Date().toISOString() })
        .in("id", sentIds);
    }
  } catch {
    /* silencioso */
  }
}
