import { LogOut, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { MobileNav } from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";

type TopbarProps = {
  title: string;
  userName: string;
};

export function Topbar({ title, userName }: TopbarProps) {
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080b10]/82 px-4 backdrop-blur-xl md:px-8 xl:px-10">
      <div className="mx-auto flex h-20 w-full max-w-[1560px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <MobileNav />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/75">FinanceHub</p>
            <h2 className="truncate text-lg font-semibold text-white md:text-xl">{title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-slate-300 md:flex">
            <ShieldCheck className="size-4 text-emerald-300" />
            Ambiente seguro
          </div>
          <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/[0.035] py-1.5 pl-1.5 pr-4 sm:flex">
            <span className="grid size-9 place-items-center rounded-full bg-emerald-400 text-sm font-semibold text-slate-950">
              {initials}
            </span>
            <span className="max-w-40 truncate text-sm font-medium text-slate-200">{userName}</span>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="icon" className="rounded-full text-slate-400 hover:bg-white/[0.08] hover:text-white" aria-label="Sair">
              <LogOut />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
