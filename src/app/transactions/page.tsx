import { Filter, Trash2 } from "lucide-react";
import type { Prisma, TransactionType } from "@prisma/client";
import { Suspense } from "react";
import { deleteTransactionAction, updateTransactionAction } from "@/app/transactions/actions";
import { DashboardFilter } from "@/components/dashboard/dashboard-filter";
import { ExportButton } from "@/components/export-button";
import { TransactionForm } from "@/components/transaction-form";
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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    categoryId?: string;
    start?: string;
    end?: string;
    q?: string;
  }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const today = new Date();
  
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const startDate = params.start ? new Date(params.start) : new Date(currentYear, currentMonth, 1);
  const endDate = params.end ? new Date(params.end) : new Date(today);

  const queryEndDate = new Date(endDate);
  queryEndDate.setDate(queryEndDate.getDate() + 1);

  const filters: Prisma.TransactionWhereInput = {
    userId: user.id,
    ...(params.type === "income" || params.type === "expense" ? { type: params.type as TransactionType } : {}),
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.q
      ? {
          OR: [
            { title: { contains: params.q, mode: "insensitive" } },
            { description: { contains: params.q, mode: "insensitive" } },
          ],
        }
      : {}),
    date: {
      gte: startDate,
      lt: queryEndDate,
    },
  };

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

  const query = new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1])));

  return (
    <main className="app-shell">
      <Sidebar />

      <div className="app-main">
        <Topbar title="Transações" userName={user.name} />

        <div className="page-container">
          <div className="page-header">
            <div>
              <p className="page-kicker">Operações</p>
              <h1 className="page-title">Transações</h1>
              <p className="page-description">Gerencie, filtre, edite e exporte suas movimentações com uma tabela operacional clara.</p>
            </div>

            <div className="responsive-actions">
              <ExportButton queryString={query.toString()} />
              <TransactionForm categories={categories} />
            </div>
          </div>

          <div className="surface-panel relative z-20 mt-8">
            <div className="mb-5 flex items-center gap-2 border-b border-white/[0.06] pb-4">
              <Filter className="size-4 text-emerald-300" />
              <span className="font-medium text-white tracking-tight">Filtros de busca</span>
            </div>
            
            <form id="filter-form" className="hidden">
              <input type="hidden" name="start" value={params.start ?? ""} />
              <input type="hidden" name="end" value={params.end ?? ""} />
            </form>
            
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_160px_220px_minmax(180px,auto)_auto]">
              <Input form="filter-form" name="q" defaultValue={params.q} placeholder="Buscar por título ou descrição" className="field-control h-10" />
              <select form="filter-form" name="type" defaultValue={params.type ?? ""} className="field-control h-10">
                <option className="bg-[#090d14] text-slate-200" value="">Todos os tipos</option>
                <option className="bg-[#090d14] text-slate-200" value="income">Receitas</option>
                <option className="bg-[#090d14] text-slate-200" value="expense">Despesas</option>
              </select>
              <select form="filter-form" name="categoryId" defaultValue={params.categoryId ?? ""} className="field-control h-10">
                <option className="bg-[#090d14] text-slate-200" value="">Todas as categorias</option>
                {categories.map((category) => (
                  <option className="bg-[#090d14] text-slate-200" key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <Suspense fallback={<div className="h-10 animate-pulse rounded-xl bg-white/5" />}>
                <DashboardFilter />
              </Suspense>

              <Button form="filter-form" type="submit" className="h-10 rounded-xl bg-white font-medium text-slate-950 shadow-md hover:bg-slate-200">Aplicar</Button>
            </div>
          </div>

          <div className="table-shell mt-8">
            {transactions.length === 0 ? (
              <div className="empty-state m-6">Nenhuma transação encontrada para os filtros selecionados.</div>
            ) : (
              <div className="scroll-shell">
                <table className="w-full min-w-[980px] text-sm">
                  <thead className="table-head">
                    <tr>
                      <th className="p-3 text-left font-semibold text-slate-400">Título e Descrição</th>
                      <th className="p-3 text-left font-semibold text-slate-400">Categoria</th>
                      <th className="p-3 text-left font-semibold text-slate-400">Data</th>
                      <th className="p-3 text-left font-semibold text-slate-400">Tipo</th>
                      <th className="p-3 text-right font-semibold text-slate-400">Valor (R$)</th>
                      <th className="p-3 text-right font-semibold text-slate-400">Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="table-row align-top">
                        <td className="p-3">
                          <form id={`transaction-${transaction.id}`} action={updateTransactionAction} className="space-y-2">
                            <input type="hidden" name="id" value={transaction.id} />
                            <Input name="title" defaultValue={transaction.title} className="field-control h-9 w-full min-w-[140px]" />
                            <Input name="description" defaultValue={transaction.description ?? ""} placeholder="Descrição opcional" className="field-control h-9 w-full min-w-[140px]" />
                          </form>
                        </td>
                        <td className="p-3">
                          <select form={`transaction-${transaction.id}`} name="categoryId" defaultValue={transaction.categoryId} className="field-control h-9 w-full min-w-[130px]">
                            {categories
                              .filter((category) => category.type === transaction.type)
                              .map((category) => (
                                <option className="bg-[#090d14] text-slate-200" key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td className="p-3">
                          <Input form={`transaction-${transaction.id}`} name="date" type="date" defaultValue={formatDateInput(transaction.date)} className="field-control h-9 w-full min-w-[125px]" />
                          <p className="mt-2 text-xs font-medium text-slate-500">{formatDate(transaction.date)}</p>
                        </td>
                        <td className="p-3">
                          <select form={`transaction-${transaction.id}`} name="type" defaultValue={transaction.type} className="field-control h-9 w-full min-w-[110px]">
                            <option className="bg-[#090d14] text-slate-200" value="income">Receita</option>
                            <option className="bg-[#090d14] text-slate-200" value="expense">Despesa</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <Input
                            form={`transaction-${transaction.id}`}
                            name="amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            defaultValue={transaction.amount}
                            className="field-control ml-auto h-9 w-28 text-right"
                          />
                          <p className={`mt-2 font-semibold ${transaction.type === "income" ? "text-emerald-300" : "text-rose-300"}`}>
                            {transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
                          </p>
                        </td>
                        <td className="p-3 text-right align-top">
                          <div className="flex flex-col items-end gap-2">
                            <Button form={`transaction-${transaction.id}`} type="submit" variant="outline" size="sm" className="h-9 w-24 rounded-lg border-emerald-400/20 bg-emerald-400/10 text-xs font-semibold text-emerald-300 hover:bg-emerald-400/20">
                              Salvar
                            </Button>
                            <form action={deleteTransactionAction}>
                              <input type="hidden" name="id" value={transaction.id} />
                              <Button type="submit" variant="destructive" size="sm" className="h-9 w-24 rounded-lg bg-rose-500/10 text-xs font-semibold text-rose-300 hover:bg-rose-500/20">
                                <Trash2 className="mr-1.5 size-3" />
                                Excluir
                              </Button>
                            </form>
                          </div>
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
