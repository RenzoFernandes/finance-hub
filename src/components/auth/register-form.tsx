"use client";

import { useActionState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { registerAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, {});

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-2xl border border-rose-300/30 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="name">
          Nome
        </label>
        <Input id="name" name="name" autoComplete="name" className="field-control h-11" required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="email">
          E-mail
        </label>
        <Input id="email" name="email" type="email" autoComplete="email" className="field-control h-11" required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="password">
          Senha
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          className="field-control h-11"
          required
        />
      </div>

      <Button disabled={isPending} className="h-11 w-full rounded-xl bg-emerald-300 font-semibold text-slate-950 hover:bg-emerald-200">
        {isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
        Criar conta
      </Button>
    </form>
  );
}
