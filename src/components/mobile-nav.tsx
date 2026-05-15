"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpCircle,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Tags,
  Target,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import { logoutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transações", icon: ArrowUpCircle },
  { href: "/categorias", label: "Categorias", icon: Tags },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/relatorios", label: "Relatórios", icon: FileText },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="size-11 shrink-0 rounded-xl border border-white/10 bg-white/[0.035] text-slate-200 hover:bg-white/[0.08] hover:text-white"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menu"
        aria-controls={menuId}
        aria-expanded={isOpen}
      >
        <Menu className="size-5" />
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm animate-in fade-in-0 duration-200"
          onClick={() => setIsOpen(false)}
        >
          <nav
            id={menuId}
            aria-label="Menu principal"
            className="flex h-dvh w-[min(22rem,92vw)] flex-col border-r border-white/10 bg-[#090d14] shadow-2xl shadow-black/40 animate-in slide-in-from-left-5 duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-white/10 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-5">
              <div className="flex items-center justify-between gap-3">
                <Link href="/dashboard" className="flex min-w-0 items-center gap-3" onClick={() => setIsOpen(false)}>
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-emerald-300/25 bg-emerald-400/10 text-emerald-300">
                    <WalletCards className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-lg font-semibold tracking-tight text-white">FinanceHub</span>
                    <span className="block truncate text-xs text-slate-500">Personal finance OS</span>
                  </span>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-11 shrink-0 rounded-xl text-slate-300 hover:bg-white/[0.08] hover:text-white"
                  onClick={() => setIsOpen(false)}
                  aria-label="Fechar menu"
                >
                  <X className="size-5" />
                </Button>
              </div>
            </div>

            <div className="scroll-shell flex-1 px-3 py-4 sm:px-4">
              <div className="flex flex-col gap-1.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`group relative flex min-h-12 items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-white/[0.065] text-white"
                          : "text-slate-300 hover:bg-white/[0.055] hover:text-white"
                      }`}
                    >
                      {isActive && <span className="absolute left-0 h-7 w-1 rounded-r-full bg-emerald-300" />}
                      <span
                        className={`grid size-10 shrink-0 place-items-center rounded-xl border transition ${
                          isActive
                            ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-300"
                            : "border-white/[0.08] bg-white/[0.035] text-slate-400 group-hover:border-emerald-300/20 group-hover:bg-emerald-400/10 group-hover:text-emerald-300"
                        }`}
                      >
                        <Icon size={18} />
                      </span>
                      <span className="min-w-0 truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-white/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5">
              <div className="rounded-2xl border border-emerald-300/15 bg-emerald-400/8 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Plano portfolio</p>
                <p className="mt-2 text-sm leading-5 text-slate-300">Dashboard profissional com dados reais, relatórios e exportações.</p>
              </div>

              <form action={logoutAction} className="mt-3">
                <Button
                  type="submit"
                  variant="ghost"
                  className="h-11 w-full justify-start gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 text-slate-300 hover:bg-white/[0.08] hover:text-white"
                >
                  <LogOut className="size-4" />
                  Sair da conta
                </Button>
              </form>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
