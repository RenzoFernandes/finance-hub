import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { FinancialCard } from "@/components/dashboard/financial-card";
import { FinancialChart } from "@/components/dashboard/financial-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";

export default function DashboardPage() {
  return (
    <main className="flex bg-zinc-950 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-8">
          <h1 className="text-3xl font-bold text-white">Financial Overview</h1>

          <p className="text-zinc-400 mt-2">Monitor your finances and goals.</p>

          <div className="p-8">
            <h1 className="text-3xl font-bold text-white">Visão Financeira</h1>

            <p className="text-zinc-400 mt-2">
              Monitore suas finanças e metas.
            </p>

            <div className="grid grid-cols-3 gap-6 mt-10">
              <FinancialCard
                title="Saldo"
                value="R$ 12.450"
                description="Saldo disponível atualmente"
              />

              <FinancialCard
                title="Receitas"
                value="R$ 8.200"
                description="Total recebido no mês"
                variant="income"
              />

              <FinancialCard
                title="Despesas"
                value="R$ 3.400"
                description="Total gasto no mês"
                variant="expense"
              />
            </div>

            <FinancialChart />

            <RecentTransactions />

          </div>
        </div>
      </div>
    </main>
  );
}
