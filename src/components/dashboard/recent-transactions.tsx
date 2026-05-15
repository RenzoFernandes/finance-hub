type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  date: Date;
  category: {
    name: string;
    color: string;
  };
};

type RecentTransactionsProps = {
  transactions: Transaction[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Transações recentes</h2>
        <p className="mt-1 text-sm text-zinc-400">Últimas movimentações financeiras registradas</p>
      </div>

      {transactions.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-400">
          Nenhuma transação cadastrada ainda.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="py-3 text-left">Descrição</th>
                <th className="py-3 text-left">Categoria</th>
                <th className="py-3 text-left">Data</th>
                <th className="py-3 text-right">Valor</th>
                <th className="py-3 text-right">Tipo</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-zinc-800 last:border-0">
                  <td className="py-4 text-white">{transaction.title}</td>
                  <td className="py-4 text-zinc-300">
                    <span className="inline-flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ backgroundColor: transaction.category.color }} />
                      {transaction.category.name}
                    </span>
                  </td>
                  <td className="py-4 text-zinc-400">{formatDate(transaction.date)}</td>
                  <td
                    className={`py-4 text-right font-medium ${
                      transaction.type === "income" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
                  </td>
                  <td className="py-4 text-right">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
