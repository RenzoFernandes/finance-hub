"use client";

import Link from "next/link";
import { ArrowUpCircle, FileText, LayoutDashboard, Menu, Tags, Target, WalletCards, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transações", icon: ArrowUpCircle },
  { href: "/categorias", label: "Categorias", icon: Tags },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/relatorios", label: "Relatórios", icon: FileText },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Button variant="ghost" size="icon" className="rounded-full text-slate-300 hover:bg-white/[0.08]" onClick={() => setIsOpen(true)} aria-label="Abrir menu">
        <Menu />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <nav
            className="h-full w-80 max-w-[86vw] border-r border-white/10 bg-[#090d14] p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                <span className="grid size-10 place-items-center rounded-2xl border border-emerald-300/25 bg-emerald-400/10 text-emerald-300">
                  <WalletCards className="size-5" />
                </span>
                <span className="text-xl font-semibold text-white">FinanceHub</span>
              </Link>
              <Button variant="ghost" size="icon" className="rounded-full text-slate-300 hover:bg-white/[0.08]" onClick={() => setIsOpen(false)} aria-label="Fechar menu">
                <X />
              </Button>
            </div>

            <div className="mt-8 flex flex-col gap-2">
              {items.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-300 transition hover:bg-white/[0.055] hover:text-white"
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
