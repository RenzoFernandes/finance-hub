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
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-white sm:text-xl">Transações recentes</h2>
      </div>

      {transactions.length === 0 ? (
        <div className="mt-6 empty-state">Nenhuma transação cadastrada ainda.</div>
      ) : (
        <div className="mt-6 divide-y divide-white/[0.08]">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{transaction.title}</p>
                <p className="mt-1 flex min-w-0 items-center gap-2 text-xs text-slate-400">
                  <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: transaction.category.color }} />
                  <span className="truncate">{transaction.category.name}</span>
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className={`text-sm font-semibold ${transaction.type === "income" ? "text-emerald-300" : "text-rose-300"}`}>
                  {transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
                </p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(transaction.date)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
