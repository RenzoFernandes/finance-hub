"use client";

import { useActionState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { demoLoginAction, loginAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({ demoError }: { demoError?: boolean }) {
  const [state, formAction, isPending] = useActionState(loginAction, {});

  return (
    <div className="space-y-4">
      {(state.error || demoError) && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {state.error ?? "Rode o seed para criar a conta demo antes de entrar."}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-200" htmlFor="email">
            E-mail
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue="demo@financehub.com"
            className="h-11 border-zinc-700 bg-zinc-950 text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-200" htmlFor="password">
            Senha
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            defaultValue="demo123456"
            className="h-11 border-zinc-700 bg-zinc-950 text-white"
            required
          />
        </div>

        <Button disabled={isPending} className="h-11 w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-400">
          {isPending ? <Loader2 className="animate-spin" /> : <LogIn />}
          Entrar
        </Button>
      </form>

      <form action={demoLoginAction}>
        <Button type="submit" variant="outline" className="h-11 w-full border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-800">
          Entrar com conta demo
        </Button>
      </form>
    </div>
  );
}
