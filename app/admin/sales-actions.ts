"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getMonthlyReport } from "@/lib/sales.server";
import { sendMonthlyReport } from "@/lib/email";

export type SalesActionState = { ok: boolean; message: string } | null;

function num(v: FormDataEntryValue | null): number {
  const n = parseFloat(String(v ?? "").replace(/[^\d.]/g, ""));
  return isNaN(n) ? 0 : n;
}

async function requireAdmin() {
  if (!isSupabaseConfigured) throw new Error("Supabase no configurado.");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado.");
  const { data: admin, error } = await supabase.rpc("is_admin");
  if (!error && admin === false) throw new Error("No autorizado.");
  return supabase;
}

/** Registra una venta manual (tienda física u online). */
export async function addSale(
  _prev: SalesActionState,
  formData: FormData
): Promise<SalesActionState> {
  try {
    const supabase = await requireAdmin();
    const item = String(formData.get("item") || "").trim();
    if (!item) return { ok: false, message: "Indica la pieza vendida." };
    const qty = Math.max(1, Math.round(num(formData.get("qty")) || 1));
    const unit_price = num(formData.get("unit_price"));
    const channel =
      String(formData.get("channel") || "tienda") === "online" ? "online" : "tienda";
    const sold_at =
      String(formData.get("sold_at") || "").trim() ||
      new Date().toISOString().slice(0, 10);
    const note = String(formData.get("note") || "").trim() || null;

    const { error } = await supabase.from("sales").insert({
      item,
      qty,
      unit_price,
      total: qty * unit_price,
      channel,
      sold_at,
      note,
    });
    if (error) throw error;

    revalidatePath("/admin");
    return { ok: true, message: "Venta registrada." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al guardar." };
  }
}

export async function deleteSale(id: string): Promise<void> {
  const supabase = await requireAdmin();
  await supabase.from("sales").delete().eq("id", id);
  revalidatePath("/admin");
}

/** Registra los ítems de una orden online como ventas. */
export async function registerOrderAsSale(orderId: string): Promise<SalesActionState> {
  try {
    const supabase = await requireAdmin();
    const { data: order } = await supabase
      .from("orders")
      .select("items, created_at")
      .eq("id", orderId)
      .maybeSingle();
    if (!order) return { ok: false, message: "Orden no encontrada." };

    const items = (order.items ?? []) as {
      name: string;
      qty: number;
      unit_price: number;
    }[];
    const soldAt = String(order.created_at).slice(0, 10);
    const rows = items.map((i) => ({
      item: i.name,
      qty: i.qty,
      unit_price: i.unit_price,
      total: i.qty * i.unit_price,
      channel: "online",
      sold_at: soldAt,
      order_id: orderId,
    }));
    if (rows.length) {
      const { error } = await supabase.from("sales").insert(rows);
      if (error) throw error;
    }
    revalidatePath("/admin");
    return { ok: true, message: "Orden registrada como venta." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al registrar." };
  }
}

/** Genera y envía por correo el reporte de un mes (para el botón del panel). */
export async function sendMonthlyReportNow(
  year: number,
  month: number
): Promise<SalesActionState> {
  try {
    await requireAdmin();
    const report = await getMonthlyReport(year, month);
    if (!report)
      return {
        ok: false,
        message: "No se pudo generar el reporte (falta la service role de Supabase).",
      };
    const ok = await sendMonthlyReport(report);
    return ok
      ? { ok: true, message: "Reporte enviado por correo." }
      : { ok: false, message: "No se pudo enviar (revisa la configuración de Resend)." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error." };
  }
}
