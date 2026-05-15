import { PrismaClient } from "@prisma/client";
import { createHash, randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";

const prisma = new PrismaClient();
const scrypt = promisify(scryptCallback);

const demoUser = {
  name: "Usuário Demo",
  email: "demo@financehub.com",
  password: "demo123456",
};

const defaultCategories = [
  { name: "Salário", type: "income", color: "#22c55e" },
  { name: "Freelance", type: "income", color: "#14b8a6" },
  { name: "Investimentos", type: "income", color: "#3b82f6" },
  { name: "Moradia", type: "expense", color: "#ef4444" },
  { name: "Alimentação", type: "expense", color: "#f97316" },
  { name: "Transporte", type: "expense", color: "#eab308" },
  { name: "Saúde", type: "expense", color: "#ec4899" },
  { name: "Lazer", type: "expense", color: "#8b5cf6" },
];

const demoGoals = [
  { title: "Reserva de emergência", targetAmount: 18000, currentAmount: 11200, deadlineOffsetDays: 120 },
  { title: "Viagem de férias", targetAmount: 8500, currentAmount: 5200, deadlineOffsetDays: 35 },
  { title: "Novo notebook", targetAmount: 6500, currentAmount: 6500, deadlineOffsetDays: 15 },
];

const demoTransactions = [
  { title: "Salário mensal", amount: 8500, type: "income", category: "Salário", daysAgo: 2 },
  { title: "Projeto landing page", amount: 2200, type: "income", category: "Freelance", daysAgo: 7 },
  { title: "Dividendos", amount: 420, type: "income", category: "Investimentos", daysAgo: 11 },
  { title: "Aluguel", amount: 2600, type: "expense", category: "Moradia", daysAgo: 3 },
  { title: "Mercado semanal", amount: 680, type: "expense", category: "Alimentação", daysAgo: 5 },
  { title: "Uber e metrô", amount: 240, type: "expense", category: "Transporte", daysAgo: 9 },
  { title: "Consulta médica", amount: 350, type: "expense", category: "Saúde", daysAgo: 12 },
  { title: "Restaurante", amount: 310, type: "expense", category: "Lazer", daysAgo: 18 },
];

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);

  return `${salt}:${derivedKey.toString("hex")}`;
}

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function main() {
  const passwordHash = await hashPassword(demoUser.password);

  const user = await prisma.user.upsert({
    where: { email: demoUser.email },
    update: {
      name: demoUser.name,
      passwordHash,
    },
    create: {
      name: demoUser.name,
      email: demoUser.email,
      passwordHash,
    },
  });

  const categories = new Map();

  for (const category of defaultCategories) {
    const record = await prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: user.id,
          name: category.name,
          type: category.type,
        },
      },
      update: {
        color: category.color,
      },
      create: {
        ...category,
        userId: user.id,
      },
    });

    categories.set(record.name, record);
  }

  await prisma.goal.deleteMany({ where: { userId: user.id } });
  await prisma.transaction.deleteMany({ where: { userId: user.id } });

  await prisma.goal.createMany({
    data: demoGoals.map((goal) => ({
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: daysFromNow(goal.deadlineOffsetDays),
      status: goal.currentAmount >= goal.targetAmount ? "completed" : "active",
      userId: user.id,
    })),
  });

  await prisma.transaction.createMany({
    data: demoTransactions.map((transaction) => {
      const category = categories.get(transaction.category);

      return {
        title: transaction.title,
        amount: transaction.amount,
        type: transaction.type,
        description: "Dado inicial da conta demo",
        date: daysAgo(transaction.daysAgo),
        userId: user.id,
        categoryId: category.id,
      };
    }),
  });

  const token = randomBytes(32).toString("hex");
  await prisma.session.create({
    data: {
      tokenHash: createHash("sha256").update(token).digest("hex"),
      expiresAt: daysFromNow(7),
      userId: user.id,
    },
  });

  console.log("Seed concluído: demo@financehub.com / demo123456");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
