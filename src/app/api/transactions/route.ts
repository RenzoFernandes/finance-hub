import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const transaction = await prisma.transaction.create({
      data: {
        title: body.title,
        amount: body.amount,
        type: body.type,
        category: body.category,
        description: body.description,
      },
    });

    return NextResponse.json(transaction, {
      status: 201,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Erro ao criar transação",
      },
      {
        status: 500,
      }
    );
  }
}