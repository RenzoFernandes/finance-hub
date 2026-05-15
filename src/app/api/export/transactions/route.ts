import { NextResponse } from "next/server";
import type { Prisma, TransactionType } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function csvEscape(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function formatCSVDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
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
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  const startDate = startParam ? new Date(startParam) : new Date(currentYear, currentMonth, 1);
  const endDate = endParam ? new Date(endParam) : new Date(today);

  const queryEndDate = new Date(endDate);
  queryEndDate.setDate(queryEndDate.getDate() + 1);

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
    date: {
      gte: startDate,
      lt: queryEndDate,
    },
  };

  const transactions = await prisma.transaction.findMany({
    where: filters,
    include: { category: true },
    orderBy: { date: "desc" },
  });

  if (transactions.length === 0) {
    return NextResponse.json({ error: "Nenhuma transação encontrada para os filtros selecionados." }, { status: 404 });
  }

  const totalIncome = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const categoryName = categoryId ? (await prisma.category.findUnique({ where: { id: categoryId } }))?.name || "Todas" : "Todas";
  const typeName = type === "income" ? "Apenas Receitas" : type === "expense" ? "Apenas Despesas" : "Todos os lançamentos";
  const searchName = q ? `"${q}"` : "Nenhum termo";
  const periodName = `${formatCSVDate(startDate)} até ${formatCSVDate(endDate)}`;

  const padRow = (arr: any[]) => {
    const newArr = [...arr];
    while (newArr.length < 6) newArr.push("");
    return newArr;
  };

  const metaHeader = [
    padRow(["FINANCE HUB - RELATÓRIO EXECUTIVO DE TRANSAÇÕES"]),
    padRow([""]),
    padRow(["[ FILTROS APLICADOS ]"]),
    padRow(["Período de Análise:", periodName]),
    padRow(["Filtro de Natureza:", typeName]),
    padRow(["Filtro de Categoria:", categoryName]),
    padRow(["Termo de Busca:", searchName]),
    padRow([""]),
    padRow(["[ RESUMO FINANCEIRO DO PERÍODO ]"]),
    padRow(["Total de Receitas:", totalIncome.toFixed(2).replace('.', ',')]),
    padRow(["Total de Despesas:", totalExpense.toFixed(2).replace('.', ',')]),
    padRow(["Saldo Líquido:", netBalance.toFixed(2).replace('.', ',')]),
    padRow([""]),
    padRow(["[ DETALHAMENTO DE LANÇAMENTOS ]"])
  ];

  const header = ["ID", "Título", "Descrição", "Categoria", "Tipo", "Valor", "Data de criação"];
  const rows = transactions.map((transaction) => [
    transaction.id,
    transaction.title,
    transaction.description || "-",
    transaction.category.name,
    transaction.type === "income" ? "Receita" : "Despesa",
    transaction.amount.toFixed(2).replace('.', ','),
    formatCSVDate(transaction.createdAt),
  ]);
  
  const BOM = "\uFEFF";
  const csvContent = [header, ...rows].map((row) => row.map(csvEscape).join(";")).join("\n");
  const csv = BOM + "sep=;\n" + csvContent;

  let filename = `financehub-transacoes-${formatCSVDate(new Date()).replaceAll('/', '-')}.csv`;
  const isHistoric = !startParam && !endParam;
  
  if (isHistoric) {
    filename = "financehub-transacoes-historico-completo.csv";
  } else if (startParam && endParam) {
    const sDate = new Date(startParam);
    const eDate = new Date(endParam);
    const monthsDiff = (eDate.getFullYear() - sDate.getFullYear()) * 12 + eDate.getMonth() - sDate.getMonth() + 1;
    
    if (monthsDiff === 12) {
      filename = `financehub-transacoes-todos-os-meses-${eDate.getFullYear()}.csv`;
    } else if (sDate.getMonth() === eDate.getMonth() && sDate.getFullYear() === eDate.getFullYear()) {
      filename = `financehub-transacoes-${String(sDate.getMonth() + 1).padStart(2, '0')}-${sDate.getFullYear()}.csv`;
    }
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
