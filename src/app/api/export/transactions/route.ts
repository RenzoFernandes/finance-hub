import { NextResponse } from "next/server";
import type { Prisma, TransactionType } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function csvEscape(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const categoryId = searchParams.get("categoryId");
  const q = searchParams.get("q");
  const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined;
  const month = searchParams.get("month") ? Number(searchParams.get("month")) : undefined;

  const filters: Prisma.TransactionWhereInput = {
    userId: user.id,
    ...(type === "income" || type === "expense" ? { type: type as TransactionType } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(year && month
      ? { date: { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) } }
      : year
        ? { date: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) } }
        : {}),
  };

  const transactions = await prisma.transaction.findMany({
    where: filters,
    include: { category: true },
    orderBy: { date: "desc" },
  });

  const header = ["Data", "Título", "Descrição", "Tipo", "Categoria", "Valor"];
  const rows = transactions.map((transaction) => [
    formatDate(transaction.date),
    transaction.title,
    transaction.description,
    transaction.type === "income" ? "Receita" : "Despesa",
    transaction.category.name,
    transaction.amount.toFixed(2),
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  const filename = `financehub-transacoes-${formatDate(new Date())}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
