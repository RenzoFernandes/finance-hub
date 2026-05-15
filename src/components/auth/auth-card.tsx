import Link from "next/link";
import { WalletCards } from "lucide-react";
import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
};

export function AuthCard({ title, description, footer, children }: AuthCardProps) {
  return (
    <main className="grid min-h-screen bg-[#080b10] px-4 py-10 text-white lg:grid-cols-[1fr_520px]">
      <section className="hidden min-h-[calc(100vh-5rem)] items-center justify-center border border-white/10 bg-slate-950/60 p-10 shadow-2xl shadow-black/30 backdrop-blur lg:flex">
        <div className="max-w-xl">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl border border-emerald-300/25 bg-emerald-400/10 text-emerald-300">
              <WalletCards className="size-6" />
            </span>
            <span>
              <span className="block text-2xl font-semibold tracking-tight">FinanceHub</span>
              <span className="block text-sm text-slate-500">Personal finance OS</span>
            </span>
          </div>

          <h2 className="mt-12 text-5xl font-semibold tracking-tight">Finanças pessoais com padrão de produto global.</h2>
          <p className="mt-6 text-lg leading-8 text-slate-400">
            Dashboard moderno, categorias, metas, relatórios e exportações em uma experiência limpa, segura e pronta para portfólio.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {["Dashboard", "Relatórios", "Metas"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm font-medium text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <span className="grid size-11 place-items-center rounded-2xl border border-emerald-300/25 bg-emerald-400/10 text-emerald-300">
              <WalletCards className="size-5" />
            </span>
            <span className="text-2xl font-semibold tracking-tight">FinanceHub</span>
          </Link>

          <div className="surface-card p-6 md:p-8">
            <div>
              <p className="page-kicker">Acesso seguro</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
            </div>

            <div className="mt-7">{children}</div>

            <div className="mt-7 border-t border-white/10 pt-5 text-center text-sm text-slate-400">{footer}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
