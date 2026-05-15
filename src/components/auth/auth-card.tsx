import Link from "next/link";
import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
};

export function AuthCard({ title, description, footer, children }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10 text-white">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center text-3xl font-bold tracking-tight">
          FinanceHub
        </Link>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="mt-2 text-sm text-zinc-400">{description}</p>
          </div>

          <div className="mt-6">{children}</div>

          <div className="mt-6 border-t border-zinc-800 pt-5 text-center text-sm text-zinc-400">
            {footer}
          </div>
        </section>
      </div>
    </main>
  );
}
