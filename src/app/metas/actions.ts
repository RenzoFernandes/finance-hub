"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parseAmount(value: FormDataEntryValue | null) {
  return Number(String(value ?? "0").replace(",", "."));
}

function getStatus(currentAmount: number, targetAmount: number, deadline: Date) {
  if (currentAmount >= targetAmount) {
    return "completed";
  }

  if (deadline < new Date()) {
    return "overdue";
  }

  return "active";
}

export async function createGoalAction(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const targetAmount = parseAmount(formData.get("targetAmount"));
  const currentAmount = parseAmount(formData.get("currentAmount"));
  const deadline = new Date(String(formData.get("deadline") ?? ""));

  if (!title || targetAmount <= 0 || Number.isNaN(deadline.getTime())) {
    return;
  }

  await prisma.goal.create({
    data: {
      title,
      targetAmount,
      currentAmount,
      deadline,
      status: getStatus(currentAmount, targetAmount, deadline),
      userId: user.id,
    },
  });

  revalidatePath("/metas");
  revalidatePath("/dashboard");
}

export async function updateGoalAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const targetAmount = parseAmount(formData.get("targetAmount"));
  const currentAmount = parseAmount(formData.get("currentAmount"));
  const deadline = new Date(String(formData.get("deadline") ?? ""));

  if (!id || !title || targetAmount <= 0 || Number.isNaN(deadline.getTime())) {
    return;
  }

  await prisma.goal.updateMany({
    where: {
      id,
      userId: user.id,
    },
    data: {
      title,
      targetAmount,
      currentAmount,
      deadline,
      status: getStatus(currentAmount, targetAmount, deadline),
    },
  });

  revalidatePath("/metas");
  revalidatePath("/dashboard");
}

export async function deleteGoalAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await prisma.goal.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidatePath("/metas");
  revalidatePath("/dashboard");
}
