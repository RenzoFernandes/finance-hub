import { Filter, Trash2 } from "lucide-react";
import type { Prisma, TransactionType } from "@prisma/client";
import { Suspense } from "react";
import { deleteTransactionAction } from "@/app/transactions/actions";
import { DashboardFilter } from "@/components/dashboard/dashboard-filter";
import { ExportButton } from "@/components/export-button";
import { TransactionEditDialog } from "@/components/transaction-edit-dialog";
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
              <p className="page-description">Gerencie, filtre, edite e exporte suas movimentações com uma visão operacional clara.</p>
            </div>

            <div className="responsive-actions">
              <ExportButton queryString={query.toString()} />
              <TransactionForm categories={categories} />
            </div>
          </div>

          <div className="surface-panel relative z-20 mt-8">
            <div className="mb-5 flex items-center gap-2 border-b border-white/[0.06] pb-4">
              <Filter className="size-4 text-emerald-300" />
              <span className="font-medium tracking-tight text-white">Filtros de busca</span>
            </div>

            <form id="filter-form" className="hidden">
              <input type="hidden" name="start" value={params.start ?? ""} />
              <input type="hidden" name="end" value={params.end ?? ""} />
            </form>

            <div className="grid min-w-0 items-center gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.75fr)_minmax(0,1fr)_minmax(0,0.9fr)_110px]">
              <Input form="filter-form" name="q" defaultValue={params.q} placeholder="Buscar por título ou descrição" className="field-control h-10 min-w-0" />
              <select form="filter-form" name="type" defaultValue={params.type ?? ""} className="field-control h-10 min-w-0">
                <option className="bg-[#090d14] text-slate-200" value="">Todos os tipos</option>
                <option className="bg-[#090d14] text-slate-200" value="income">Receitas</option>
                <option className="bg-[#090d14] text-slate-200" value="expense">Despesas</option>
              </select>
              <select form="filter-form" name="categoryId" defaultValue={params.categoryId ?? ""} className="field-control h-10 min-w-0">
                <option className="bg-[#090d14] text-slate-200" value="">Todas as categorias</option>
                {categories.map((category) => (
                  <option className="bg-[#090d14] text-slate-200" key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <div className="min-w-0 [&>div]:w-full [&_button]:w-full">
                <Suspense fallback={<div className="h-10 animate-pulse rounded-xl bg-white/5" />}>
                  <DashboardFilter />
                </Suspense>
              </div>

              <Button form="filter-form" type="submit" className="h-10 w-full min-w-0 rounded-xl bg-white font-medium text-slate-950 shadow-md hover:bg-slate-200">
                Aplicar
              </Button>
            </div>
          </div>

          <div className="mt-8">
            {transactions.length === 0 ? (
              <div className="empty-state">Nenhuma transação encontrada para os filtros selecionados.</div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="surface-panel p-4 sm:p-5">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="truncate text-base font-semibold text-white">{transaction.title}</p>
                            {transaction.description ? (
                              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">{transaction.description}</p>
                            ) : null}
                          </div>

                          <p className={`shrink-0 text-sm font-semibold ${transaction.type === "income" ? "text-emerald-300" : "text-rose-300"}`}>
                            {transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
                          </p>
                        </div>

                        <div className="mt-4 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: transaction.category.color }} />
                            <span className="truncate">{transaction.category.name}</span>
                          </span>
                          <span>{formatDate(transaction.date)}</span>
                          <span className={transaction.type === "income" ? "text-emerald-300" : "text-rose-300"}>
                            {transaction.type === "income" ? "Receita" : "Despesa"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                        <TransactionEditDialog
                          categories={categories}
                          transaction={{
                            id: transaction.id,
                            title: transaction.title,
                            description: transaction.description ?? "",
                            amount: transaction.amount,
                            type: transaction.type,
                            categoryId: transaction.categoryId,
                            date: formatDateInput(transaction.date),
                          }}
                        />

                        <form action={deleteTransactionAction}>
                          <input type="hidden" name="id" value={transaction.id} />
                          <Button type="submit" variant="destructive" size="sm" className="h-10 w-full rounded-lg bg-rose-500/10 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 sm:w-28">
                            <Trash2 className="mr-1.5 size-3" />
                            Excluir
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
