import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthCard
      title="Crie sua conta"
      description="Organize sua vida financeira com categorias, metas e relatórios claros."
      footer={
        <>
          Já tem uma conta?{" "}
          <Link href="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
            Entrar
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
