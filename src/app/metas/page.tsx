import { CalendarClock, Plus, Trash2 } from "lucide-react";
import { createGoalAction, deleteGoalAction, updateGoalAction } from "@/app/metas/actions";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function statusLabel(status: string) {
  const labels = {
    active: "Em progresso",
    completed: "Concluída",
    overdue: "Atrasada",
  };

  return labels[status as keyof typeof labels] ?? "Em progresso";
}

export default async function GoalsPage() {
  const user = await requireUser();
  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: { deadline: "asc" },
  });

  const today = new Date();
  const nearDeadline = new Date(today);
  nearDeadline.setDate(today.getDate() + 30);

  return (
    <main className="flex min-h-screen bg-zinc-950">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Topbar title="Metas" userName={user.name} />

        <div className="p-4 text-white md:p-8">
          <div>
            <h1 className="text-3xl font-bold">Metas financeiras</h1>
            <p className="mt-2 text-zinc-400">Acompanhe objetivos com prazo, progresso e status.</p>
          </div>

          <form action={createGoalAction} className="mt-8 grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6 lg:grid-cols-[1fr_160px_160px_160px_auto]">
            <Input name="title" placeholder="Nome da meta" className="h-11 border-zinc-800 bg-zinc-950 text-white" required />
            <Input name="targetAmount" type="number" min="0.01" step="0.01" placeholder="Valor alvo" className="h-11 border-zinc-800 bg-zinc-950 text-white" required />
            <Input name="currentAmount" type="number" min="0" step="0.01" placeholder="Valor atual" className="h-11 border-zinc-800 bg-zinc-950 text-white" />
            <Input name="deadline" type="date" className="h-11 border-zinc-800 bg-zinc-950 text-white" required />
            <Button className="h-11 bg-emerald-500 text-zinc-950 hover:bg-emerald-400">
              <Plus />
              Criar
            </Button>
          </form>

          <section className="mt-8 grid gap-4 xl:grid-cols-2">
            {goals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900 p-10 text-center text-sm text-zinc-400">
                Nenhuma meta cadastrada ainda.
              </div>
            ) : (
              goals.map((goal) => {
                const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                const isNearDeadline = goal.status !== "completed" && goal.deadline <= nearDeadline;

                return (
                  <article key={goal.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                    <form action={updateGoalAction} className="grid gap-4 md:grid-cols-2">
                      <input type="hidden" name="id" value={goal.id} />
                      <Input name="title" defaultValue={goal.title} className="h-10 border-zinc-800 bg-zinc-950 text-white md:col-span-2" />
                      <Input name="targetAmount" type="number" min="0.01" step="0.01" defaultValue={goal.targetAmount} className="h-10 border-zinc-800 bg-zinc-950 text-white" />
                      <Input name="currentAmount" type="number" min="0" step="0.01" defaultValue={goal.currentAmount} className="h-10 border-zinc-800 bg-zinc-950 text-white" />
                      <Input name="deadline" type="date" defaultValue={formatDateInput(goal.deadline)} className="h-10 border-zinc-800 bg-zinc-950 text-white" />
                      <Button type="submit" variant="outline" className="border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-800">
                        Salvar
                      </Button>
                    </form>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-zinc-400">
                          {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            goal.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : goal.status === "overdue"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-sky-500/10 text-sky-300"
                          }`}
                        >
                          {statusLabel(goal.status)}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${progress}%` }} />
                      </div>

                      <div className={`flex items-center gap-2 text-sm ${isNearDeadline ? "text-amber-300" : "text-zinc-400"}`}>
                        <CalendarClock className="size-4" />
                        Prazo em {new Intl.DateTimeFormat("pt-BR").format(goal.deadline)}
                        {isNearDeadline ? " · atenção ao prazo" : ""}
                      </div>
                    </div>

                    <form action={deleteGoalAction} className="mt-4 flex justify-end">
                      <input type="hidden" name="id" value={goal.id} />
                      <Button type="submit" variant="destructive">
                        <Trash2 />
                        Excluir
                      </Button>
                    </form>
                  </article>
                );
              })
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
