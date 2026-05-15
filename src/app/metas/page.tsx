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
    <main className="app-shell">
      <Sidebar />

      <div className="app-main">
        <Topbar title="Metas" userName={user.name} />

        <div className="page-container">
          <div className="page-header">
            <div>
              <p className="page-kicker">Planejamento</p>
              <h1 className="page-title">Metas financeiras</h1>
              <p className="page-description">Acompanhe objetivos com prazo, progresso e status em um painel consistente.</p>
            </div>
          </div>

          <form action={createGoalAction} className="surface-panel mt-8 grid gap-4 lg:grid-cols-[1fr_160px_160px_160px_auto]">
            <Input name="title" placeholder="Nome da meta" className="field-control h-11" required />
            <Input name="targetAmount" type="number" min="0.01" step="0.01" placeholder="Valor alvo" className="field-control h-11" required />
            <Input name="currentAmount" type="number" min="0" step="0.01" placeholder="Valor atual" className="field-control h-11" />
            <Input name="deadline" type="date" className="field-control h-11" required />
            <Button className="h-11 rounded-xl bg-emerald-300 font-semibold text-slate-950 hover:bg-emerald-200">
              <Plus />
              Criar
            </Button>
          </form>

          <section className="mt-8 grid gap-4 xl:grid-cols-2">
            {goals.length === 0 ? (
              <div className="empty-state">Nenhuma meta cadastrada ainda.</div>
            ) : (
              goals.map((goal) => {
                const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                const isNearDeadline = goal.status !== "completed" && goal.deadline <= nearDeadline;

                return (
                  <article key={goal.id} className="surface-card p-5">
                    <form action={updateGoalAction} className="grid gap-4 md:grid-cols-2">
                      <input type="hidden" name="id" value={goal.id} />
                      <Input name="title" defaultValue={goal.title} className="field-control h-10 md:col-span-2" />
                      <Input name="targetAmount" type="number" min="0.01" step="0.01" defaultValue={goal.targetAmount} className="field-control h-10" />
                      <Input name="currentAmount" type="number" min="0" step="0.01" defaultValue={goal.currentAmount} className="field-control h-10" />
                      <Input name="deadline" type="date" defaultValue={formatDateInput(goal.deadline)} className="field-control h-10" />
                      <Button type="submit" variant="outline" className="rounded-xl border-white/10 bg-white/[0.045] text-white hover:bg-white/[0.08]">
                        Salvar
                      </Button>
                    </form>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-slate-400">
                          {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            goal.status === "completed"
                              ? "bg-emerald-300/10 text-emerald-300"
                              : goal.status === "overdue"
                                ? "bg-rose-300/10 text-rose-300"
                                : "bg-sky-300/10 text-sky-300"
                          }`}
                        >
                          {statusLabel(goal.status)}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                        <div className="h-full rounded-full bg-emerald-300" style={{ width: `${progress}%` }} />
                      </div>

                      <div className={`flex items-center gap-2 text-sm ${isNearDeadline ? "text-amber-300" : "text-slate-400"}`}>
                        <CalendarClock className="size-4" />
                        Prazo em {new Intl.DateTimeFormat("pt-BR").format(goal.deadline)}
                        {isNearDeadline ? " · atenção ao prazo" : ""}
                      </div>
                    </div>

                    <form action={deleteGoalAction} className="mt-4 flex justify-end">
                      <input type="hidden" name="id" value={goal.id} />
                      <Button type="submit" variant="destructive" className="rounded-xl">
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
