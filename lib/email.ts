import "server-only";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Remitente verificado en Resend (ej. "Coral Coast <hola@coralcoastrd.com>").
const RESEND_FROM =
  process.env.RESEND_FROM || "Coral Coast <onboarding@resend.dev>";

export const isEmailConfigured = Boolean(RESEND_API_KEY);

/** Envía un correo vía Resend. No-op si no hay API key configurada. */
async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!RESEND_API_KEY) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

const rd = (n: number) => (n <= 0 ? "A consultar" : "RD$ " + n.toLocaleString("es-DO"));

const shell = (title: string, body: string) => `
  <div style="font-family:Inter,Arial,sans-serif;background:#F0F4F6;padding:32px 0;color:#0D2B3E">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden">
      <div style="background:#0D2B3E;padding:28px 32px">
        <div style="font-family:Georgia,serif;color:#E6C9A8;font-size:22px;letter-spacing:1px">CORAL COAST</div>
        <div style="color:#7DA8BF;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:4px">Dominican Design House</div>
      </div>
      <div style="padding:32px">
        <h1 style="font-family:Georgia,serif;font-weight:normal;font-size:24px;margin:0 0 16px">${title}</h1>
        ${body}
      </div>
      <div style="padding:20px 32px;border-top:1px solid #eee;font-size:12px;color:#7C8F7A">
        Coral Coast · Santo Domingo, RD · <a href="https://coralcoastrd.com" style="color:#D97A5E">coralcoastrd.com</a>
      </div>
    </div>
  </div>`;

export type OrderEmailData = {
  to: string;
  trackingCode: string;
  customerName?: string | null;
  items: { name: string; qty: number; unit_price: number; size?: string }[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string | null;
};

/** Confirmación de pedido con código de seguimiento. */
export async function sendOrderConfirmation(o: OrderEmailData): Promise<boolean> {
  const rows = o.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0">${i.qty} × ${i.name}${i.size ? ` <span style="color:#7C8F7A">(${i.size})</span>` : ""}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right">${rd(i.unit_price * i.qty)}</td>
      </tr>`
    )
    .join("");

  const body = `
    <p style="line-height:1.6">Hola${o.customerName ? " " + o.customerName : ""}, recibimos tu pedido. Te contactaremos por WhatsApp para coordinar medidas, tejido y entrega.</p>
    <div style="background:#F0F4F6;border-radius:6px;padding:16px;margin:20px 0;text-align:center">
      <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#7C8F7A">Número de pedido</div>
      <div style="font-family:Georgia,serif;font-size:26px;color:#D97A5E;letter-spacing:2px;margin-top:4px">${o.trackingCode}</div>
      <a href="https://coralcoastrd.com/rastrear?codigo=${o.trackingCode}" style="display:inline-block;margin-top:10px;font-size:13px;color:#0D2B3E">Ver estado del pedido →</a>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}
      <tr><td style="padding:10px 0 0">Subtotal</td><td style="padding:10px 0 0;text-align:right">${rd(o.subtotal)}</td></tr>
      ${o.discount > 0 ? `<tr><td style="color:#7C8F7A">Descuento${o.couponCode ? ` (${o.couponCode})` : ""}</td><td style="color:#7C8F7A;text-align:right">−${rd(o.discount)}</td></tr>` : ""}
      <tr><td style="padding-top:6px;font-weight:600">Total</td><td style="padding-top:6px;text-align:right;font-weight:600">${rd(o.total)}</td></tr>
    </table>`;

  return sendEmail({
    to: o.to,
    subject: `Tu pedido Coral Coast · ${o.trackingCode}`,
    html: shell("Recibimos tu pedido", body),
  });
}

const STUDIO_EMAIL = process.env.STUDIO_EMAIL || "hola@coralcoastrd.com";

export type OrderNotifyData = {
  trackingCode: string;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  items: { name: string; qty: number; size?: string; gift?: boolean }[];
  total: number;
  deliveryMethod?: "envio" | "retiro" | null;
  address?: string | null;
  pickupDate?: string | null;
  pickupTime?: string | null;
  hasGift: boolean;
};

/** Aviso al estudio (hola@coralcoastrd.com) de un nuevo pedido / cita. */
export async function sendOrderNotification(o: OrderNotifyData): Promise<boolean> {
  const rows = o.items
    .map((i) => `<li>${i.qty} × ${i.name}${i.size ? ` (${i.size})` : ""}${i.gift ? " 🎁 regalo" : ""}</li>`)
    .join("");

  const entrega =
    o.deliveryMethod === "retiro"
      ? `<p><strong>Retiro en el estudio</strong>${o.pickupDate ? ` — cita: ${o.pickupDate}${o.pickupTime ? " " + o.pickupTime : ""}` : ""}</p>`
      : o.deliveryMethod === "envio"
        ? `<p><strong>Envío a domicilio</strong>${o.address ? `<br>${o.address}` : ""}</p>`
        : "";

  const body = `
    <p style="line-height:1.6">Nuevo pedido <strong>${o.trackingCode}</strong>.</p>
    <p style="line-height:1.6">
      ${o.customerName ? `Cliente: ${o.customerName}<br>` : ""}
      ${o.customerPhone ? `Tel: ${o.customerPhone}<br>` : ""}
      ${o.customerEmail ? `Correo: ${o.customerEmail}` : ""}
    </p>
    <ul style="line-height:1.7">${rows}</ul>
    <p><strong>Total: ${rd(o.total)}</strong></p>
    ${o.hasGift ? '<p>🎁 Incluye piezas para regalo.</p>' : ""}
    ${entrega}`;

  return sendEmail({
    to: STUDIO_EMAIL,
    subject: `Nuevo pedido ${o.trackingCode}${o.deliveryMethod === "retiro" ? " · cita de retiro" : ""}`,
    html: shell("Nuevo pedido", body),
  });
}

/** Bienvenida a suscriptores de novedades. */
export async function sendWelcome(to: string): Promise<boolean> {
  const body = `
    <p style="line-height:1.6">¡Gracias por unirte a Coral Coast! Te avisaremos primero sobre nuevas colecciones, piezas limitadas y promociones.</p>
    <p style="line-height:1.6"><a href="https://coralcoastrd.com/coleccion" style="color:#D97A5E">Explorar la colección →</a></p>`;
  return sendEmail({
    to,
    subject: "Bienvenido a Coral Coast 🌾",
    html: shell("Bienvenido a la casa", body),
  });
}
