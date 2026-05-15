import { TransactionForm } from "@/components/transaction-form";
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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export default async function TransactionsPage() {
  const user = await requireUser();

  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { date: "desc" },
    }),
    prisma.category.findMany({
      where: { userId: user.id },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <main className="flex min-h-screen bg-zinc-950">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Topbar title="Transações" userName={user.name} />

        <div className="p-4 text-white md:p-8">
          <div>
            <h1 className="text-3xl font-bold">Transações</h1>
            <p className="mt-2 text-zinc-400">Gerencie suas receitas e despesas por categoria.</p>
          </div>

          <TransactionForm categories={categories} />

          <div className="mt-8 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            {transactions.length === 0 ? (
              <div className="p-10 text-center text-sm text-zinc-400">Nenhuma transação cadastrada ainda.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-zinc-800/80 text-zinc-300">
                    <tr>
                      <th className="p-4 text-left">Título</th>
                      <th className="p-4 text-left">Categoria</th>
                      <th className="p-4 text-left">Data</th>
                      <th className="p-4 text-left">Tipo</th>
                      <th className="p-4 text-right">Valor</th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-t border-zinc-800">
                        <td className="p-4">{transaction.title}</td>
                        <td className="p-4 text-zinc-300">
                          <span className="inline-flex items-center gap-2">
                            <span className="size-2 rounded-full" style={{ backgroundColor: transaction.category.color }} />
                            {transaction.category.name}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-400">{formatDate(transaction.date)}</td>
                        <td className="p-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              transaction.type === "income"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {transaction.type === "income" ? "Receita" : "Despesa"}
                          </span>
                        </td>
                        <td
                          className={`p-4 text-right font-semibold ${
                            transaction.type === "income" ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
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
