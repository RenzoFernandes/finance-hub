"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parseAmount(value: FormDataEntryValue | null) {
  return Number(String(value ?? "0").replace(",", "."));
}

function parseType(value: FormDataEntryValue | null) {
  return value === "income" ? "income" : "expense";
}

export async function updateTransactionAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const amount = parseAmount(formData.get("amount"));
  const type = parseType(formData.get("type"));
  const categoryId = String(formData.get("categoryId") ?? "");
  const date = new Date(String(formData.get("date") ?? ""));
  const description = String(formData.get("description") ?? "").trim();

  if (!id || !title || amount <= 0 || !categoryId || Number.isNaN(date.getTime())) {
    return;
  }

  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId: user.id,
      type,
    },
  });

  if (!category) {
    return;
  }

  await prisma.transaction.updateMany({
    where: {
      id,
      userId: user.id,
    },
    data: {
      title,
      amount,
      type,
      categoryId,
      date,
      description: description || null,
    },
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

export async function deleteTransactionAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await prisma.transaction.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}
