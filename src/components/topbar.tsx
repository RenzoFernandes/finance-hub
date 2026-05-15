import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { MobileNav } from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";

type TopbarProps = {
  title: string;
  userName: string;
};

export function Topbar({ title, userName }: TopbarProps) {
  return (
    <header className="flex h-20 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 md:px-8">
      <div className="flex items-center gap-3">
        <MobileNav />
        <h2 className="text-lg font-semibold text-white md:text-xl">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-sm text-zinc-400 sm:block">Bem-vindo, {userName}</div>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="icon" className="text-zinc-400 hover:text-white" aria-label="Sair">
            <LogOut />
          </Button>
        </form>
      </div>
    </header>
  );
}
