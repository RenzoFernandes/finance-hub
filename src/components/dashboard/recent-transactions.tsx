const transactions = [
  {
    id: 1,
    title: "Salário",
    category: "Receita",
    date: "15/05/2026",
    amount: "R$ 5.200,00",
    type: "income",
  },
  {
    id: 2,
    title: "Mercado",
    category: "Alimentação",
    date: "14/05/2026",
    amount: "R$ 320,00",
    type: "expense",
  },
  {
    id: 3,
    title: "Freelance",
    category: "Receita",
    date: "12/05/2026",
    amount: "R$ 1.500,00",
    type: "income",
  },
  {
    id: 4,
    title: "Internet",
    category: "Casa",
    date: "10/05/2026",
    amount: "R$ 120,00",
    type: "expense",
  },
];

export function RecentTransactions() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-8">
      <div>
        <h2 className="text-xl font-semibold text-white">
          Transações Recentes
        </h2>

        <p className="text-zinc-400 text-sm mt-1">
          Últimas movimentações financeiras registradas
        </p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400">
              <th className="text-left py-3">Descrição</th>
              <th className="text-left py-3">Categoria</th>
              <th className="text-left py-3">Data</th>
              <th className="text-right py-3">Valor</th>
              <th className="text-right py-3">Tipo</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b border-zinc-800 last:border-0"
              >
                <td className="py-4 text-white">{transaction.title}</td>
                <td className="py-4 text-zinc-400">{transaction.category}</td>
                <td className="py-4 text-zinc-400">{transaction.date}</td>
                <td
                  className={`py-4 text-right font-medium ${
                    transaction.type === "income"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}{" "}
                  {transaction.amount}
                </td>
                <td className="py-4 text-right">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      transaction.type === "income"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {transaction.type === "income" ? "Receita" : "Despesa"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}