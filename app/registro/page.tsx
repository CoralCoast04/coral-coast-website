import type { Metadata } from "next";
import { RegisterForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Crear cuenta", robots: { index: false } };

export default function RegistroPage() {
  return (
    <div className="pt-32 md:pt-40 pb-24">
      <div className="container-luxe">
        <RegisterForm />
      </div>
    </div>
  );
}
