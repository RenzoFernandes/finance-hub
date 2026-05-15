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
    <main className="grid min-h-screen bg-[#080b10] p-4 text-white sm:p-5 lg:h-screen lg:grid-cols-[minmax(0,1fr)_minmax(440px,500px)] lg:gap-6 lg:overflow-hidden lg:p-6 xl:grid-cols-[minmax(0,1fr)_minmax(500px,560px)] xl:gap-8">
      <section className="hidden h-full items-center justify-center rounded-3xl border border-white/10 bg-slate-950/60 p-8 shadow-2xl shadow-black/30 backdrop-blur lg:flex xl:p-10">
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

          <h2 className="mt-12 text-4xl font-semibold tracking-tight xl:text-5xl">
            Finanças pessoais com padrão de produto global.
          </h2>
          <p className="mt-6 text-base leading-8 text-slate-400 xl:text-lg">
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

      <section className="flex min-w-0 items-center justify-center py-4 lg:py-0">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <span className="grid size-11 place-items-center rounded-2xl border border-emerald-300/25 bg-emerald-400/10 text-emerald-300">
              <WalletCards className="size-5" />
            </span>
            <span className="text-2xl font-semibold tracking-tight">FinanceHub</span>
          </Link>

          <div className="surface-card p-5 sm:p-6 md:p-8">
            <div>
              <p className="page-kicker">Acesso seguro</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
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
