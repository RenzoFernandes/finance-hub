import Link from "next/link";
import { Download } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { FinancialCard } from "@/components/dashboard/financial-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireUser } from "@/lib/auth";
import { buildTransactionFilters, getReportSummary } from "@/lib/report-filters";
import { prisma } from "@/lib/prisma";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    categoryId?: string;
    start?: string;
    end?: string;
  }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const filters = buildTransactionFilters(user.id, params);

  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: filters,
      include: { category: true },
      orderBy: { date: "desc" },
    }),
    prisma.category.findMany({
      where: { userId: user.id },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    }),
  ]);
  const summary = getReportSummary(transactions);
  const query = new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1])));

  return (
    <main className="app-shell">
      <Sidebar />

      <div className="app-main">
        <Topbar title="Relatórios" userName={user.name} />

        <div className="page-container">
          <div className="page-header">
            <div>
              <p className="page-kicker">Inteligência financeira</p>
              <h1 className="page-title">Relatórios financeiros</h1>
              <p className="page-description">Analise períodos, categorias e tipos de movimentação com resumo executivo e tabela detalhada.</p>
            </div>

            <Button asChild variant="outline" className="h-11 rounded-xl border-white/10 bg-white/[0.045] text-white hover:bg-white/[0.08]">
              <Link href={`/api/export/report?${query.toString()}`}>
                <Download />
                Exportar PDF
              </Link>
            </Button>
          </div>

          <form className="surface-panel mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-[160px_220px_160px_160px_auto]">
            <select name="type" defaultValue={params.type ?? ""} className="field-control">
              <option value="">Todos os tipos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
            <select name="categoryId" defaultValue={params.categoryId ?? ""} className="field-control">
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <Input name="start" type="date" defaultValue={params.start} className="field-control" />
            <Input name="end" type="date" defaultValue={params.end} className="field-control" />
            <Button className="h-10 rounded-xl bg-white text-slate-950 hover:bg-slate-200">Filtrar</Button>
          </form>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <FinancialCard title="Total recebido" value={formatCurrency(summary.totalIncome)} description="Receitas no período" variant="income" />
            <FinancialCard title="Total gasto" value={formatCurrency(summary.totalExpense)} description="Despesas no período" variant="expense" />
            <FinancialCard title="Saldo final" value={formatCurrency(summary.finalBalance)} description="Resultado do período" variant={summary.finalBalance >= 0 ? "income" : "expense"} />
            <FinancialCard title="Maior despesa" value={summary.topExpenseCategory} description="Categoria com maior gasto" />
            <FinancialCard title="Média de gastos" value={formatCurrency(summary.averageExpense)} description="Ticket médio de despesas" />
          </div>

          <div className="table-shell mt-8">
            {transactions.length === 0 ? (
              <div className="empty-state m-6">Nenhum dado encontrado para este relatório.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="table-head">
                    <tr>
                      <th className="p-4 text-left">Data</th>
                      <th className="p-4 text-left">Título</th>
                      <th className="p-4 text-left">Categoria</th>
                      <th className="p-4 text-left">Tipo</th>
                      <th className="p-4 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="table-row">
                        <td className="p-4 text-slate-400">{formatDate(transaction.date)}</td>
                        <td className="p-4 font-medium text-white">{transaction.title}</td>
                        <td className="p-4 text-slate-300">{transaction.category.name}</td>
                        <td className="p-4 text-slate-300">{transaction.type === "income" ? "Receita" : "Despesa"}</td>
                        <td className={`p-4 text-right font-semibold ${transaction.type === "income" ? "text-emerald-300" : "text-rose-300"}`}>
                          {transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
