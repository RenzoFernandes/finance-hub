"use client";

import Link from "next/link";
import { ArrowUpCircle, FileText, LayoutDashboard, Menu, Tags, Target, X } from "lucide-react";
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
      <Button variant="ghost" size="icon" className="text-zinc-300" onClick={() => setIsOpen(true)} aria-label="Abrir menu">
        <Menu />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70" onClick={() => setIsOpen(false)}>
          <nav
            className="h-full w-72 border-r border-zinc-800 bg-zinc-950 p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="text-2xl font-bold text-white" onClick={() => setIsOpen(false)}>
                FinanceHub
              </Link>
              <Button variant="ghost" size="icon" className="text-zinc-300" onClick={() => setIsOpen(false)} aria-label="Fechar menu">
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
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
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
