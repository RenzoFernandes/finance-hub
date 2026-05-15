import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <AuthCard
      title="Acesse sua conta"
      description="Entre para acompanhar seu saldo, despesas, metas e relatórios."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-medium text-emerald-400 hover:text-emerald-300">
            Criar cadastro
          </Link>
        </>
      }
    >
      <LoginForm demoError={params.error === "demo"} />
    </AuthCard>
  );
}
