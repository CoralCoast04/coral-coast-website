// Direcciones del cliente (client-safe: sin dependencias de servidor).

export type Address = {
  id: string;
  label: string | null; // "Casa", "Oficina"
  recipient: string | null; // quién recibe
  phone: string | null;
  province: string | null;
  municipality: string | null;
  address: string; // calle, número, referencia
  is_default: boolean;
};
