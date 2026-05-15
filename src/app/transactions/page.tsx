import { prisma } from "@/lib/prisma";
import { TransactionForm } from "@/components/transaction-form";

// Página de listagem de transações
// Busca dados diretamente do banco utilizando Server Components
export default async function TransactionsPage() {

  // Busca transações ordenadas pelas mais recentes
  const transactions = await prisma.transaction.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-5xl mx-auto">

        {/* Cabeçalho da página */}
        <h1 className="text-4xl font-bold">
          Transações
        </h1>

        <p className="text-zinc-400 mt-2">
          Gerencie suas receitas e despesas.
        </p>

        {/* Formulário de criação de transações */}
        <TransactionForm />

        {/* Tabela de transações */}
        <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">

          <table className="w-full">

            {/* Cabeçalho da tabela */}
            <thead className="bg-zinc-800">
              <tr>
                <th className="text-left p-4">Título</th>
                <th className="text-left p-4">Categoria</th>
                <th className="text-left p-4">Tipo</th>
                <th className="text-right p-4">Valor</th>
              </tr>
            </thead>

            {/* Corpo da tabela */}
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-t border-zinc-800"
                >

                  {/* Nome da transação */}
                  <td className="p-4">
                    {transaction.title}
                  </td>

                  {/* Categoria */}
                  <td className="p-4 text-zinc-400">
                    {transaction.category}
                  </td>

                  {/* Tipo da transação */}
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.type === "income"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {transaction.type === "income"
                        ? "Receita"
                        : "Despesa"}
                    </span>
                  </td>

                  {/* Valor */}
                  <td
                    className={`p-4 text-right font-semibold ${
                      transaction.type === "income"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"} R${" "}
                    {transaction.amount.toFixed(2).replace(".", ",")}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </main>
  );
}