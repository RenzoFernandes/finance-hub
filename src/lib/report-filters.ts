import type { Prisma, TransactionType } from "@prisma/client";

export type ReportParams = {
  type?: string | null;
  categoryId?: string | null;
  start?: string | null;
  end?: string | null;
};

export function buildTransactionFilters(userId: string, params: ReportParams): Prisma.TransactionWhereInput {
  const start = params.start ? new Date(params.start) : undefined;
  const end = params.end ? new Date(params.end) : undefined;

  if (end) {
    end.setDate(end.getDate() + 1);
  }

  return {
    userId,
    ...(params.type === "income" || params.type === "expense" ? { type: params.type as TransactionType } : {}),
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(start || end
      ? {
          date: {
            ...(start ? { gte: start } : {}),
            ...(end ? { lt: end } : {}),
          },
        }
      : {}),
  };
}

export function getReportSummary(
  transactions: Array<{
    amount: number;
    type: TransactionType;
    category: {
      name: string;
    };
  }>
) {
  const totalIncome = transactions.filter((transaction) => transaction.type === "income").reduce((acc, transaction) => acc + transaction.amount, 0);
  const totalExpense = transactions.filter((transaction) => transaction.type === "expense").reduce((acc, transaction) => acc + transaction.amount, 0);
  const expenses = transactions.filter((transaction) => transaction.type === "expense");
  const expenseByCategory = expenses.reduce<Record<string, number>>((acc, transaction) => {
    acc[transaction.category.name] = (acc[transaction.category.name] ?? 0) + transaction.amount;
    return acc;
  }, {});
  const topExpenseCategory = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0];

  return {
    totalIncome,
    totalExpense,
    finalBalance: totalIncome - totalExpense,
    topExpenseCategory: topExpenseCategory ? topExpenseCategory[0] : "Sem despesas",
    averageExpense: expenses.length > 0 ? totalExpense / expenses.length : 0,
  };
}
