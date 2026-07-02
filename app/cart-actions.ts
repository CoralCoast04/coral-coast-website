"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type CouponResult = {
  ok: boolean;
  message: string;
  coupon?: {
    code: string;
    discount_type: "percent" | "fixed";
    discount_value: number;
  };
};

// Cupones de demostración usados cuando Supabase aún no está configurado.
const DEMO_COUPONS: Record<
  string,
  { discount_type: "percent" | "fixed"; discount_value: number }
> = {
  CORAL10: { discount_type: "percent", discount_value: 10 },
  BIENVENIDO: { discount_type: "fixed", discount_value: 1000 },
};

/** Valida un cupón contra Supabase (o la lista demo) y devuelve el descuento. */
export async function validateCoupon(
  codeRaw: string,
  subtotal: number
): Promise<CouponResult> {
  const code = codeRaw.trim().toUpperCase();
  if (!code) return { ok: false, message: "Ingresa un código." };

  if (!isSupabaseConfigured) {
    const demo = DEMO_COUPONS[code];
    if (!demo) return { ok: false, message: "Cupón no válido." };
    return {
      ok: true,
      message: "Cupón aplicado.",
      coupon: { code, ...demo },
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("coupons")
      .select("code, discount_type, discount_value, active, expires_at, min_subtotal")
      .ilike("code", code)
      .maybeSingle();

    if (error || !data) return { ok: false, message: "Cupón no válido." };
    if (!data.active) return { ok: false, message: "Este cupón ya no está activo." };
    if (data.expires_at && new Date(data.expires_at) < new Date())
      return { ok: false, message: "Este cupón está vencido." };
    if (data.min_subtotal && subtotal < data.min_subtotal)
      return {
        ok: false,
        message: `El cupón aplica desde RD$ ${data.min_subtotal.toLocaleString("es-DO")}.`,
      };

    return {
      ok: true,
      message: "Cupón aplicado.",
      coupon: {
        code: data.code.toUpperCase(),
        discount_type: data.discount_type,
        discount_value: Number(data.discount_value),
      },
    };
  } catch {
    return { ok: false, message: "No pudimos validar el cupón. Intenta de nuevo." };
  }
}

export type OrderItem = {
  id: string;
  name: string;
  qty: number;
  unit_price: number;
};

export type OrderPayload = {
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  customer_name: string | null;
  customer_phone: string | null;
};

/** Guarda la orden en Supabase (si está configurado). El cierre sigue por WhatsApp. */
export async function createOrder(
  payload: OrderPayload
): Promise<{ ok: boolean; id?: string }> {
  if (!isSupabaseConfigured) return { ok: true };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .insert({
        items: payload.items,
        subtotal: payload.subtotal,
        discount: payload.discount,
        total: payload.total,
        coupon_code: payload.coupon_code,
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone,
        status: "nuevo",
      })
      .select("id")
      .single();

    if (error) throw error;
    return { ok: true, id: data.id };
  } catch {
    // No bloqueamos el cierre por WhatsApp si falla el guardado.
    return { ok: false };
  }
}
