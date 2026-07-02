import type { Metadata } from "next";
import { LoginForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Iniciar sesión", robots: { index: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  return (
    <div className="pt-32 md:pt-40 pb-24">
      <div className="container-luxe">
        <LoginForm redirectTo={redirect || "/"} />
      </div>
    </div>
  );
}
