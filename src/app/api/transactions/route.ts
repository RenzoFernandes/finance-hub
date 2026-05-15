import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
    },
    include: {
      category: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.title || !body.amount || !body.type || !body.categoryId) {
      return NextResponse.json({ error: "Preencha os campos obrigatórios." }, { status: 400 });
    }

    const category = await prisma.category.findFirst({
      where: {
        id: body.categoryId,
        userId: user.id,
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Categoria inválida." }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        title: String(body.title).trim(),
        amount: Number(body.amount),
        type: body.type,
        categoryId: category.id,
        description: body.description ? String(body.description).trim() : null,
        date: body.date ? new Date(body.date) : new Date(),
        userId: user.id,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar transação" }, { status: 500 });
  }
}
