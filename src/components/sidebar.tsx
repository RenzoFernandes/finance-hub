"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpCircle, FileText, LayoutDashboard, Settings, Tags, Target, WalletCards } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transações", icon: ArrowUpCircle },
  { href: "/categorias", label: "Categorias", icon: Tags },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/relatorios", label: "Relatórios", icon: FileText },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 border-r border-white/10 bg-[#090d14]/92 px-5 py-6 shadow-2xl shadow-black/30 backdrop-blur-xl lg:flex lg:flex-col">
      <Link href="/dashboard" className="flex items-center gap-3 rounded-2xl px-2">
        <span className="grid size-11 place-items-center rounded-2xl border border-emerald-300/25 bg-emerald-400/10 text-emerald-300">
          <WalletCards className="size-5" />
        </span>
        <span>
          <span className="block text-lg font-semibold tracking-tight text-white">FinanceHub</span>
          <span className="block text-xs text-slate-500">Personal finance OS</span>
        </span>
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-white/[0.055] text-white"
                  : "text-slate-400 hover:bg-white/[0.055] hover:text-white"
              }`}
            >
              <span
                className={`grid size-9 place-items-center rounded-xl border transition ${
                  isActive
                    ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-300"
                    : "border-white/[0.08] bg-white/[0.035] text-slate-400 group-hover:border-emerald-300/20 group-hover:bg-emerald-400/10 group-hover:text-emerald-300"
                }`}
              >
                <Icon size={18} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl border border-emerald-300/15 bg-emerald-400/8 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Plano portfolio</p>
        <p className="mt-2 text-sm leading-5 text-slate-300">Dashboard profissional com dados reais, relatórios e exportações.</p>
      </div>
    </aside>
  );
}
