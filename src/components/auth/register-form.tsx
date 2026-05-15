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
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-200" htmlFor="name">
          Nome
        </label>
        <Input id="name" name="name" autoComplete="name" className="h-11 border-zinc-700 bg-zinc-950 text-white" required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-200" htmlFor="email">
          E-mail
        </label>
        <Input id="email" name="email" type="email" autoComplete="email" className="h-11 border-zinc-700 bg-zinc-950 text-white" required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-200" htmlFor="password">
          Senha
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          className="h-11 border-zinc-700 bg-zinc-950 text-white"
          required
        />
      </div>

      <Button disabled={isPending} className="h-11 w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-400">
        {isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
        Criar conta
      </Button>
    </form>
  );
}
