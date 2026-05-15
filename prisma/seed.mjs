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

const demoTransactions = [];
const startDate = new Date('2024-01-01T12:00:00Z');
const endDate = new Date();
let currentDate = new Date(startDate);

while (currentDate <= endDate) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  demoTransactions.push({ title: "Salário mensal", amount: 8500, type: "income", category: "Salário", date: new Date(Date.UTC(year, month, 5, 12)) });
  demoTransactions.push({ title: "Aluguel", amount: 2600, type: "expense", category: "Moradia", date: new Date(Date.UTC(year, month, 10, 12)) });
  demoTransactions.push({ title: "Internet e Luz", amount: 280, type: "expense", category: "Moradia", date: new Date(Date.UTC(year, month, 15, 12)) });
  
  for (let week = 1; week <= 4; week++) {
    const amount = 400 + Math.floor(Math.random() * 300);
    demoTransactions.push({ title: "Mercado", amount, type: "expense", category: "Alimentação", date: new Date(Date.UTC(year, month, week * 7, 12)) });
  }

  for (let i = 0; i < 4; i++) {
    const amount = 100 + Math.floor(Math.random() * 150);
    const day = 5 + Math.floor(Math.random() * 20);
    demoTransactions.push({ title: "Restaurante/Delivery", amount, type: "expense", category: "Lazer", date: new Date(Date.UTC(year, month, day, 12)) });
  }

  for (let i = 0; i < 6; i++) {
    const amount = 20 + Math.floor(Math.random() * 40);
    const day = 1 + Math.floor(Math.random() * 28);
    demoTransactions.push({ title: "Uber e Metrô", amount, type: "expense", category: "Transporte", date: new Date(Date.UTC(year, month, day, 12)) });
  }

  if (month % 2 === 0) {
    const amount = 1500 + Math.floor(Math.random() * 1000);
    demoTransactions.push({ title: "Projeto Freelance", amount, type: "income", category: "Freelance", date: new Date(Date.UTC(year, month, 20, 12)) });
  }
  
  demoTransactions.push({ title: "Dividendos FIIs", amount: 350 + Math.floor(Math.random() * 100), type: "income", category: "Investimentos", date: new Date(Date.UTC(year, month, 15, 12)) });

  currentDate.setMonth(currentDate.getMonth() + 1);
}

const filteredDemoTransactions = demoTransactions.filter(t => t.date <= endDate);

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
    data: filteredDemoTransactions.map((transaction) => {
      const category = categories.get(transaction.category);

      return {
        title: transaction.title,
        amount: transaction.amount,
        type: transaction.type,
        description: "Dado inicial da conta demo",
        date: transaction.date,
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
