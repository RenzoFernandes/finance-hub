import { FinancialCard } from "@/components/dashboard/financial-card";
import { FinancialChart } from "@/components/dashboard/financial-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { prisma } from "@/lib/prisma";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default async function DashboardPage() {
  const transactions = await prisma.transaction.findMany();

  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const expense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const balance = income - expense;

  return (
    <main className="flex min-h-screen bg-zinc-950">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-8">
          <h1 className="text-3xl font-bold text-white">Visão Financeira</h1>

          <p className="mt-2 text-zinc-400">
            Monitore suas finanças e metas.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6">
            <FinancialCard
              title="Saldo"
              value={formatCurrency(balance)}
              description="Saldo disponível atualmente"
            />

            <FinancialCard
              title="Receitas"
              value={formatCurrency(income)}
              description="Total recebido"
              variant="income"
            />

            <FinancialCard
              title="Despesas"
              value={formatCurrency(expense)}
              description="Total gasto"
              variant="expense"
            />
          </div>

          <FinancialChart />

          <RecentTransactions />
        </div>
      </div>
    </main>
  );
}