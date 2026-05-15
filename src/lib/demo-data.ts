import type { TransactionType } from "@prisma/client";

export const demoUser = {
  name: "Usuário Demo",
  email: "demo@financehub.com",
  password: "demo123456",
};

export const defaultCategories: Array<{
  name: string;
  type: TransactionType;
  color: string;
}> = [
  { name: "Salário", type: "income", color: "#22c55e" },
  { name: "Freelance", type: "income", color: "#14b8a6" },
  { name: "Investimentos", type: "income", color: "#3b82f6" },
  { name: "Moradia", type: "expense", color: "#ef4444" },
  { name: "Alimentação", type: "expense", color: "#f97316" },
  { name: "Transporte", type: "expense", color: "#eab308" },
  { name: "Saúde", type: "expense", color: "#ec4899" },
  { name: "Lazer", type: "expense", color: "#8b5cf6" },
];

export const demoGoals = [
  {
    title: "Reserva de emergência",
    targetAmount: 18000,
    currentAmount: 11200,
    deadlineOffsetDays: 120,
  },
  {
    title: "Viagem de férias",
    targetAmount: 8500,
    currentAmount: 5200,
    deadlineOffsetDays: 35,
  },
  {
    title: "Novo notebook",
    targetAmount: 6500,
    currentAmount: 6500,
    deadlineOffsetDays: 15,
  },
];

export const demoTransactions = [
  { title: "Salário mensal", amount: 8500, type: "income", category: "Salário", daysAgo: 2 },
  { title: "Projeto landing page", amount: 2200, type: "income", category: "Freelance", daysAgo: 7 },
  { title: "Dividendos", amount: 420, type: "income", category: "Investimentos", daysAgo: 11 },
  { title: "Aluguel", amount: 2600, type: "expense", category: "Moradia", daysAgo: 3 },
  { title: "Mercado semanal", amount: 680, type: "expense", category: "Alimentação", daysAgo: 5 },
  { title: "Uber e metrô", amount: 240, type: "expense", category: "Transporte", daysAgo: 9 },
  { title: "Consulta médica", amount: 350, type: "expense", category: "Saúde", daysAgo: 12 },
  { title: "Restaurante", amount: 310, type: "expense", category: "Lazer", daysAgo: 18 },
] satisfies Array<{
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  daysAgo: number;
}>;
