import { Suspense } from "react";
import { AlertTriangle, PiggyBank, Target } from "lucide-react";
import { DashboardFilter } from "@/components/dashboard/dashboard-filter";
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
  const month = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", "");
  return `${month}/${date.getFullYear()}`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const today = new Date();
  const nearDeadlineLimit = new Date(today);
  nearDeadlineLimit.setDate(today.getDate() + 30);
  
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const startDate = params.start ? new Date(params.start) : new Date(currentYear, currentMonth, 1);
  const endDate = params.end ? new Date(params.end) : new Date(today); // Data atual por padrão

  const queryEndDate = new Date(endDate);
  queryEndDate.setDate(queryEndDate.getDate() + 1);

  const chartStartDate = new Date(endDate.getFullYear(), endDate.getMonth() - 5, 1);
  const earliestFetchDate = startDate < chartStartDate ? startDate : chartStartDate;

  const [transactions, goals, aggregateIncome, aggregateExpense] = await Promise.all([
    prisma.transaction.findMany({
      where: { 
        userId: user.id,
        date: { 
          gte: earliestFetchDate,
          lt: queryEndDate
        }
      },
      include: { category: true },
      orderBy: { date: "desc" },
    }),
    prisma.goal.findMany({
      where: { userId: user.id },
      orderBy: { deadline: "asc" },
      take: 3,
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId: user.id, type: "income" }
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId: user.id, type: "expense" }
    })
  ]);

  const income = aggregateIncome._sum.amount || 0;
  const expense = aggregateExpense._sum.amount || 0;
  const balance = income - expense;
  
  const currentPeriodTransactions = transactions.filter(
    (transaction) => transaction.date >= startDate && transaction.date < queryEndDate
  );

  const periodIncome = currentPeriodTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  const periodExpense = currentPeriodTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  const periodSavings = periodIncome - periodExpense;

  const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth() + 1;
  const actualChartMonths = Math.min(12, Math.max(6, monthsDiff));

  const chartData = Array.from({ length: actualChartMonths }).map((_, index) => {
    const date = new Date(endDate.getFullYear(), endDate.getMonth() - actualChartMonths + 1 + index, 1);
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
    currentPeriodTransactions
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
    balance < 0 ? "Seu saldo total está negativo. Revise os gastos recentes." : null,
    periodExpense > periodIncome ? "As despesas do período superaram as receitas." : null,
    periodExpense > periodIncome * 0.8 && periodIncome > 0 ? "Seu gasto no período já passou de 80% das receitas." : null,
    goals.some((goal) => goal.status !== "completed" && goal.deadline <= nearDeadlineLimit)
      ? "Há metas próximas do prazo nos próximos 30 dias."
      : null,
  ].filter(Boolean);

  return (
    <main className="app-shell">
      <Sidebar />

      <div className="app-main">
        <Topbar title="Dashboard" userName={user.name} />

        <div className="page-container">
          <div className="page-header">
            <div>
              <p className="page-kicker">Central financeira</p>
              <h1 className="page-title">Visão financeira</h1>
              <p className="page-description">Monitore saldo, receitas, despesas, metas e alertas com uma visão executiva dos seus dados.</p>
            </div>
            <div className="flex items-center">
              <Suspense fallback={<div className="h-10 w-32 animate-pulse rounded-xl bg-white/5" />}>
                <DashboardFilter />
              </Suspense>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FinancialCard title="Saldo total" value={formatCurrency(balance)} description="Saldo disponível" />
            <FinancialCard title="Receitas do período" value={formatCurrency(periodIncome)} description="Total recebido" variant="income" />
            <FinancialCard title="Despesas do período" value={formatCurrency(periodExpense)} description="Total gasto" variant="expense" />
            <FinancialCard title="Economia no período" value={formatCurrency(periodSavings)} description="Receitas menos despesas" variant={periodSavings >= 0 ? "income" : "expense"} />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.8fr)]">
            <FinancialChart data={chartData} />

            <section className="surface-panel">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-amber-300/10 text-amber-300">
                  <AlertTriangle className="size-5" />
                </span>
                <div>
                  <p className="page-kicker">Risco</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Alertas importantes</h2>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <div key={alert} className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
                      {alert}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-100">
                    Nenhum alerta crítico no momento.
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="mt-6">
            <ExpenseCategoryChart data={expensesByCategory} />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
            <RecentTransactions transactions={currentPeriodTransactions.slice(0, 5)} />

            <section className="surface-panel">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-sky-300/10 text-sky-300">
                  <Target className="size-5" />
                </span>
                <div>
                  <p className="page-kicker">Objetivos</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Metas em progresso</h2>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {goals.length === 0 ? (
                  <div className="empty-state">Cadastre sua primeira meta financeira.</div>
                ) : (
                  goals.map((goal) => {
                    const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

                    return (
                      <div key={goal.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium text-white">{goal.title}</span>
                          <span className="text-slate-400">{progress}%</span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                          <div className="h-full rounded-full bg-emerald-300" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
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
