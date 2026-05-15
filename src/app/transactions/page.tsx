import Link from "next/link";
import { Download, Trash2 } from "lucide-react";
import type { Prisma, TransactionType } from "@prisma/client";
import { deleteTransactionAction, updateTransactionAction } from "@/app/transactions/actions";
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
    month?: string;
    year?: string;
    q?: string;
  }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const year = params.year ? Number(params.year) : undefined;
  const month = params.month ? Number(params.month) : undefined;

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
    ...(year && month
      ? {
          date: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1),
          },
        }
      : year
        ? {
            date: {
              gte: new Date(year, 0, 1),
              lt: new Date(year + 1, 0, 1),
            },
          }
        : {}),
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

  const years = Array.from(new Set(transactions.map((transaction) => transaction.date.getFullYear()).concat(new Date().getFullYear()))).sort(
    (a, b) => b - a
  );
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

            <Button asChild variant="outline" className="h-11 rounded-xl border-white/10 bg-white/[0.045] text-white hover:bg-white/[0.08]">
              <Link href={`/api/export/transactions?${query.toString()}`}>
                <Download />
                Exportar CSV
              </Link>
            </Button>
          </div>

          <TransactionForm categories={categories} />

          <form className="surface-panel mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_160px_220px_120px_120px_auto]">
            <Input name="q" defaultValue={params.q} placeholder="Buscar por título ou descrição" className="field-control" />
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
            <select name="month" defaultValue={params.month ?? ""} className="field-control">
              <option value="">Mês</option>
              {Array.from({ length: 12 }).map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  {String(index + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
            <select name="year" defaultValue={params.year ?? ""} className="field-control">
              <option value="">Ano</option>
              {years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <Button className="h-10 rounded-xl bg-white text-slate-950 hover:bg-slate-200">Filtrar</Button>
          </form>

          <div className="table-shell mt-8">
            {transactions.length === 0 ? (
              <div className="empty-state m-6">Nenhuma transação encontrada para os filtros selecionados.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-sm">
                  <thead className="table-head">
                    <tr>
                      <th className="p-4 text-left">Título</th>
                      <th className="p-4 text-left">Categoria</th>
                      <th className="p-4 text-left">Data</th>
                      <th className="p-4 text-left">Tipo</th>
                      <th className="p-4 text-right">Valor</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="table-row align-top">
                        <td className="p-4">
                          <form id={`transaction-${transaction.id}`} action={updateTransactionAction} className="space-y-2">
                            <input type="hidden" name="id" value={transaction.id} />
                            <Input name="title" defaultValue={transaction.title} className="field-control h-9" />
                            <Input name="description" defaultValue={transaction.description ?? ""} placeholder="Descrição" className="field-control h-9" />
                          </form>
                        </td>
                        <td className="p-4">
                          <select form={`transaction-${transaction.id}`} name="categoryId" defaultValue={transaction.categoryId} className="field-control h-9 w-full">
                            {categories
                              .filter((category) => category.type === transaction.type)
                              .map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td className="p-4">
                          <Input form={`transaction-${transaction.id}`} name="date" type="date" defaultValue={formatDateInput(transaction.date)} className="field-control h-9" />
                          <p className="mt-2 text-xs text-slate-500">{formatDate(transaction.date)}</p>
                        </td>
                        <td className="p-4">
                          <select form={`transaction-${transaction.id}`} name="type" defaultValue={transaction.type} className="field-control h-9 w-full">
                            <option value="income">Receita</option>
                            <option value="expense">Despesa</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <Input
                            form={`transaction-${transaction.id}`}
                            name="amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            defaultValue={transaction.amount}
                            className="field-control ml-auto h-9 w-32 text-right"
                          />
                          <p className={`mt-2 font-semibold ${transaction.type === "income" ? "text-emerald-300" : "text-rose-300"}`}>
                            {transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
                          </p>
                        </td>
                        <td className="space-y-2 p-4 text-right">
                          <Button form={`transaction-${transaction.id}`} type="submit" variant="outline" className="w-full rounded-xl border-white/10 bg-white/[0.045] text-white hover:bg-white/[0.08]">
                            Salvar
                          </Button>
                          <form action={deleteTransactionAction}>
                            <input type="hidden" name="id" value={transaction.id} />
                            <Button type="submit" variant="destructive" className="w-full rounded-xl">
                              <Trash2 />
                              Excluir
                            </Button>
                          </form>
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
