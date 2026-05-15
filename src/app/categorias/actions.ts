"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parseType(value: FormDataEntryValue | null) {
  return value === "income" ? "income" : "expense";
}

export async function createCategoryAction(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "#22c55e");
  const type = parseType(formData.get("type"));

  if (!name) {
    return;
  }

  await prisma.category.create({
    data: {
      name,
      color,
      type,
      userId: user.id,
    },
  });

  revalidatePath("/categorias");
}

export async function updateCategoryAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "#22c55e");
  const type = parseType(formData.get("type"));

  if (!id || !name) {
    return;
  }

  await prisma.category.updateMany({
    where: {
      id,
      userId: user.id,
    },
    data: {
      name,
      color,
      type,
    },
  });

  revalidatePath("/categorias");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

export async function deleteCategoryAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  const transactionCount = await prisma.transaction.count({
    where: {
      categoryId: id,
      userId: user.id,
    },
  });

  if (transactionCount > 0) {
    return;
  }

  await prisma.category.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidatePath("/categorias");
}
