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
    <section className="surface-panel">
      <div>
        <p className="page-kicker">Atividade</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Transações recentes</h2>
      </div>

      {transactions.length === 0 ? (
        <div className="mt-6 empty-state">Nenhuma transação cadastrada ainda.</div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-[0.14em] text-slate-500">
                <th className="py-3 text-left">Descrição</th>
                <th className="py-3 text-left">Categoria</th>
                <th className="py-3 text-left">Data</th>
                <th className="py-3 text-right">Valor</th>
                <th className="py-3 text-right">Tipo</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-white/[0.08] last:border-0">
                  <td className="py-4 font-medium text-white">{transaction.title}</td>
                  <td className="py-4 text-slate-300">
                    <span className="inline-flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ backgroundColor: transaction.category.color }} />
                      {transaction.category.name}
                    </span>
                  </td>
                  <td className="py-4 text-slate-400">{formatDate(transaction.date)}</td>
                  <td
                    className={`py-4 text-right font-semibold ${
                      transaction.type === "income" ? "text-emerald-300" : "text-rose-300"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
                  </td>
                  <td className="py-4 text-right">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        transaction.type === "income"
                          ? "bg-emerald-300/10 text-emerald-300"
                          : "bg-rose-300/10 text-rose-300"
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
    </section>
  );
}
