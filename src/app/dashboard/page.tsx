import { AlertTriangle, PiggyBank, Target } from "lucide-react";
import { ExpenseCategoryChart } from "@/components/dashboard/expense-category-chart";
import { FinancialCard } from "@/components/dashboard/financial-card";
import { FinancialChart } from "@/components/dashboard/financial-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date);
}

export default async function DashboardPage() {
  const user = await requireUser();
  const today = new Date();
  const nearDeadlineLimit = new Date(today);
  nearDeadlineLimit.setDate(today.getDate() + 30);
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const [transactions, goals] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { date: "desc" },
    }),
    prisma.goal.findMany({
      where: { userId: user.id },
      orderBy: { deadline: "asc" },
      take: 3,
    }),
  ]);

  const income = transactions.filter((transaction) => transaction.type === "income").reduce((acc, transaction) => acc + transaction.amount, 0);
  const expense = transactions.filter((transaction) => transaction.type === "expense").reduce((acc, transaction) => acc + transaction.amount, 0);
  const balance = income - expense;
  const monthIncome = transactions
    .filter((transaction) => transaction.type === "income" && transaction.date.getMonth() === currentMonth && transaction.date.getFullYear() === currentYear)
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  const monthExpense = transactions
    .filter((transaction) => transaction.type === "expense" && transaction.date.getMonth() === currentMonth && transaction.date.getFullYear() === currentYear)
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  const monthSavings = monthIncome - monthExpense;

  const chartData = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date(currentYear, currentMonth - 5 + index, 1);
    const monthlyTransactions = transactions.filter(
      (transaction) => transaction.date.getMonth() === date.getMonth() && transaction.date.getFullYear() === date.getFullYear()
    );

    return {
      month: getMonthLabel(date),
      receitas: monthlyTransactions.filter((transaction) => transaction.type === "income").reduce((acc, transaction) => acc + transaction.amount, 0),
      despesas: monthlyTransactions.filter((transaction) => transaction.type === "expense").reduce((acc, transaction) => acc + transaction.amount, 0),
    };
  });
  const expensesByCategory = Object.values(
    transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce<Record<string, { name: string; value: number; color: string }>>((acc, transaction) => {
        const key = transaction.category.id;
        acc[key] = acc[key] ?? {
          name: transaction.category.name,
          value: 0,
          color: transaction.category.color,
        };
        acc[key].value += transaction.amount;
        return acc;
      }, {})
  ).sort((a, b) => b.value - a.value);

  const alerts = [
    balance < 0 ? "Seu saldo está negativo. Revise os gastos recentes." : null,
    monthExpense > monthIncome ? "As despesas do mês superaram as receitas." : null,
    monthExpense > monthIncome * 0.8 && monthIncome > 0 ? "Seu gasto mensal já passou de 80% das receitas." : null,
    goals.some((goal) => goal.status !== "completed" && goal.deadline <= nearDeadlineLimit)
      ? "Há metas próximas do prazo nos próximos 30 dias."
      : null,
  ].filter(Boolean);

  return (
    <main className="flex min-h-screen bg-zinc-950">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Topbar title="Dashboard" userName={user.name} />

        <div className="p-4 md:p-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-white">Visão financeira</h1>
            <p className="text-zinc-400">Monitore seu saldo, receitas, despesas e metas em tempo real.</p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FinancialCard title="Saldo total" value={formatCurrency(balance)} description="Saldo disponível atualmente" />
            <FinancialCard title="Receitas" value={formatCurrency(income)} description="Total recebido" variant="income" />
            <FinancialCard title="Despesas" value={formatCurrency(expense)} description="Total gasto" variant="expense" />
            <FinancialCard title="Economia do mês" value={formatCurrency(monthSavings)} description="Receitas menos despesas do mês" variant={monthSavings >= 0 ? "income" : "expense"} />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
            <FinancialChart data={chartData} />

            <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-amber-300" />
                <h2 className="text-xl font-semibold text-white">Alertas importantes</h2>
              </div>

              <div className="mt-5 space-y-3">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <div key={alert} className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-100">
                      {alert}
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                    Nenhum alerta crítico no momento.
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="mt-8">
            <ExpenseCategoryChart data={expensesByCategory} />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <RecentTransactions transactions={transactions.slice(0, 5)} />

            <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="flex items-center gap-2">
                <Target className="size-5 text-sky-300" />
                <h2 className="text-xl font-semibold text-white">Metas em progresso</h2>
              </div>

              <div className="mt-5 space-y-4">
                {goals.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-zinc-800 p-6 text-center text-sm text-zinc-400">
                    Cadastre sua primeira meta financeira.
                  </div>
                ) : (
                  goals.map((goal) => {
                    const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

                    return (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium text-white">{goal.title}</span>
                          <span className="text-zinc-400">{progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                          <div className="h-full rounded-full bg-emerald-400" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <PiggyBank className="size-3" />
                          {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
