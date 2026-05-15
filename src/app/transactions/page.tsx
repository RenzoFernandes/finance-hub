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
    <main className="flex min-h-screen bg-zinc-950">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Topbar title="Transações" userName={user.name} />

        <div className="p-4 text-white md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Transações</h1>
              <p className="mt-2 text-zinc-400">Gerencie, filtre, edite e exporte suas movimentações.</p>
            </div>

            <Button asChild variant="outline" className="h-10 border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800">
              <Link href={`/api/export/transactions?${query.toString()}`}>
                <Download />
                Exportar CSV
              </Link>
            </Button>
          </div>

          <TransactionForm categories={categories} />

          <form className="mt-8 grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-2 xl:grid-cols-[1fr_160px_220px_120px_120px_auto]">
            <Input name="q" defaultValue={params.q} placeholder="Buscar por título ou descrição" className="h-10 border-zinc-800 bg-zinc-950 text-white" />
            <select name="type" defaultValue={params.type ?? ""} className="h-10 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none">
              <option value="">Todos os tipos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
            <select name="categoryId" defaultValue={params.categoryId ?? ""} className="h-10 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none">
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select name="month" defaultValue={params.month ?? ""} className="h-10 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none">
              <option value="">Mês</option>
              {Array.from({ length: 12 }).map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  {String(index + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
            <select name="year" defaultValue={params.year ?? ""} className="h-10 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none">
              <option value="">Ano</option>
              {years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <Button className="h-10 bg-zinc-100 text-zinc-950 hover:bg-white">Filtrar</Button>
          </form>

          <div className="mt-8 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            {transactions.length === 0 ? (
              <div className="p-10 text-center text-sm text-zinc-400">Nenhuma transação encontrada para os filtros selecionados.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-sm">
                  <thead className="bg-zinc-800/80 text-zinc-300">
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
                      <tr key={transaction.id} className="border-t border-zinc-800 align-top">
                        <td className="p-4">
                          <form id={`transaction-${transaction.id}`} action={updateTransactionAction} className="space-y-2">
                            <input type="hidden" name="id" value={transaction.id} />
                            <Input name="title" defaultValue={transaction.title} className="h-9 border-zinc-800 bg-zinc-950 text-white" />
                            <Input name="description" defaultValue={transaction.description ?? ""} placeholder="Descrição" className="h-9 border-zinc-800 bg-zinc-950 text-white" />
                          </form>
                        </td>
                        <td className="p-4">
                          <select
                            form={`transaction-${transaction.id}`}
                            name="categoryId"
                            defaultValue={transaction.categoryId}
                            className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none"
                          >
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
                          <Input form={`transaction-${transaction.id}`} name="date" type="date" defaultValue={formatDateInput(transaction.date)} className="h-9 border-zinc-800 bg-zinc-950 text-white" />
                          <p className="mt-2 text-xs text-zinc-500">{formatDate(transaction.date)}</p>
                        </td>
                        <td className="p-4">
                          <select
                            form={`transaction-${transaction.id}`}
                            name="type"
                            defaultValue={transaction.type}
                            className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none"
                          >
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
                            className="ml-auto h-9 w-32 border-zinc-800 bg-zinc-950 text-right text-white"
                          />
                          <p className={`mt-2 font-semibold ${transaction.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                            {transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
                          </p>
                        </td>
                        <td className="space-y-2 p-4 text-right">
                          <Button form={`transaction-${transaction.id}`} type="submit" variant="outline" className="w-full border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-800">
                            Salvar
                          </Button>
                          <form action={deleteTransactionAction}>
                            <input type="hidden" name="id" value={transaction.id} />
                            <Button type="submit" variant="destructive" className="w-full">
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
