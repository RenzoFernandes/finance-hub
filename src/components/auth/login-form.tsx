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
        <div className="rounded-2xl border border-rose-300/30 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
          {state.error ?? "Rode o seed para criar a conta demo antes de entrar."}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="email">
            E-mail
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="field-control h-11"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="password">
            Senha
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="field-control h-11"
            required
          />
        </div>

        <Button disabled={isPending} className="h-11 w-full rounded-xl bg-emerald-300 font-semibold text-slate-950 hover:bg-emerald-200">
          {isPending ? <Loader2 className="animate-spin" /> : <LogIn />}
          Entrar
        </Button>
      </form>

      <form action={demoLoginAction}>
        <Button type="submit" variant="outline" className="h-11 w-full rounded-xl border-white/10 bg-white/[0.045] text-white hover:bg-white/[0.08]">
          Entrar com conta demo
        </Button>
      </form>
    </div>
  );
}
