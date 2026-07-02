"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type FormState = {
  ok: boolean;
  message: string;
} | null;

function str(v: FormDataEntryValue | null): string {
  return (typeof v === "string" ? v : "").trim();
}

/** Solicitud de cita → tabla `appointments`. */
export async function submitAppointment(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const payload = {
    name: str(formData.get("name")),
    email: str(formData.get("email")),
    phone: str(formData.get("phone")),
    preferred_date: str(formData.get("preferred_date")) || null,
    preferred_time: str(formData.get("preferred_time")) || null,
    interest: str(formData.get("interest")) || null,
    notes: str(formData.get("notes")) || null,
  };

  if (!payload.name || (!payload.email && !payload.phone)) {
    return {
      ok: false,
      message: "Por favor incluye tu nombre y al menos un medio de contacto.",
    };
  }

  if (!isSupabaseConfigured) {
    // Sin base de datos aún: confirmamos para que el flujo se pueda probar.
    return {
      ok: true,
      message:
        "¡Gracias! Recibimos tu solicitud. Te contactaremos para confirmar tu cita.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("appointments").insert(payload);
    if (error) throw error;
    return {
      ok: true,
      message:
        "¡Gracias! Recibimos tu solicitud. Te contactaremos para confirmar tu cita.",
    };
  } catch {
    return {
      ok: false,
      message:
        "No pudimos guardar tu solicitud. Escríbenos por WhatsApp y lo resolvemos enseguida.",
    };
  }
}

/** Mensaje de contacto → tabla `messages`. */
export async function submitMessage(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const payload = {
    name: str(formData.get("name")),
    email: str(formData.get("email")),
    phone: str(formData.get("phone")) || null,
    subject: str(formData.get("subject")) || null,
    message: str(formData.get("message")),
  };

  if (!payload.name || !payload.email || !payload.message) {
    return {
      ok: false,
      message: "Completa tu nombre, correo y mensaje, por favor.",
    };
  }

  if (!isSupabaseConfigured) {
    return {
      ok: true,
      message: "¡Gracias por escribirnos! Te responderemos muy pronto.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("messages").insert(payload);
    if (error) throw error;
    return {
      ok: true,
      message: "¡Gracias por escribirnos! Te responderemos muy pronto.",
    };
  } catch {
    return {
      ok: false,
      message:
        "No pudimos enviar tu mensaje. Escríbenos por WhatsApp y con gusto te atendemos.",
    };
  }
}
