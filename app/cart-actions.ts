"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { sendOrderConfirmation } from "@/lib/email";

/** Genera un código de seguimiento tipo CC-7F3K9. */
function makeTrackingCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++)
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `CC-${s}`;
}

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
  size?: string;
};

export type OrderPayload = {
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
};

/**
 * Guarda la orden en Supabase (si está configurado), envía la confirmación por
 * correo y devuelve el código de seguimiento. El cierre sigue por WhatsApp.
 */
export async function createOrder(
  payload: OrderPayload
): Promise<{ ok: boolean; id?: string; tracking_code: string }> {
  const tracking_code = makeTrackingCode();

  async function emailConfirm() {
    if (payload.customer_email) {
      await sendOrderConfirmation({
        to: payload.customer_email,
        trackingCode: tracking_code,
        customerName: payload.customer_name,
        items: payload.items,
        subtotal: payload.subtotal,
        discount: payload.discount,
        total: payload.total,
        couponCode: payload.coupon_code,
      });
    }
  }

  if (!isSupabaseConfigured) {
    await emailConfirm();
    return { ok: true, tracking_code };
  }

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
        customer_email: payload.customer_email,
        tracking_code,
        status: "nuevo",
      })
      .select("id")
      .single();

    if (error) throw error;
    await emailConfirm();
    return { ok: true, id: data.id, tracking_code };
  } catch {
    // No bloqueamos el cierre por WhatsApp si falla el guardado.
    return { ok: false, tracking_code };
  }
}

export type TrackedOrder = {
  tracking_code: string;
  status: string;
  created_at: string;
  total: number;
  items: { name: string; qty: number; unit_price: number; size?: string }[];
  customer_name: string | null;
};

/** Consulta el estado de un pedido por su código (vía RPC segura). */
export async function trackOrder(
  code: string
): Promise<{ ok: boolean; order?: TrackedOrder; message?: string }> {
  const clean = code.trim();
  if (!clean) return { ok: false, message: "Ingresa tu número de pedido." };
  if (!isSupabaseConfigured)
    return { ok: false, message: "El seguimiento estará disponible pronto." };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_order_status", {
      p_code: clean,
    });
    if (error) throw error;
    const order = Array.isArray(data) ? data[0] : data;
    if (!order)
      return { ok: false, message: "No encontramos un pedido con ese número." };
    return { ok: true, order: order as TrackedOrder };
  } catch {
    return { ok: false, message: "No pudimos consultar el pedido. Intenta luego." };
  }
}
