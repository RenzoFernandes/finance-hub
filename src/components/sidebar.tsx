import Link from "next/link";
import { ArrowUpCircle, FileText, LayoutDashboard, Settings, Tags, Target } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transações", icon: ArrowUpCircle },
  { href: "/categorias", label: "Categorias", icon: Tags },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/relatorios", label: "Relatórios", icon: FileText },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r border-zinc-800 bg-zinc-900 p-6 lg:block">
      <Link href="/dashboard" className="text-3xl font-bold text-white">
        FinanceHub
      </Link>

      <nav className="mt-10 flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
