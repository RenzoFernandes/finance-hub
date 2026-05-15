"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { defaultCategories, demoUser } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";

type AuthState = {
  error?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function ensureDefaultCategories(userId: string) {
  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: {
        userId_name_type: {
          userId,
          name: category.name,
          type: category.type,
        },
      },
      update: {
        color: category.color,
      },
      create: {
        ...category,
        userId,
      },
    });
  }
}

export async function loginAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe e-mail e senha para continuar." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "E-mail ou senha inválidos." };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function registerAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) {
    return { error: "Informe seu nome para criar a conta." };
  }

  if (!email.includes("@")) {
    return { error: "Informe um e-mail válido." };
  }

  if (password.length < 8) {
    return { error: "A senha precisa ter pelo menos 8 caracteres." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Já existe uma conta com este e-mail." };
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
    },
  });

  await ensureDefaultCategories(user.id);
  await createSession(user.id);
  redirect("/dashboard");
}

export async function demoLoginAction() {
  const user = await prisma.user.findUnique({
    where: {
      email: demoUser.email,
    },
  });

  if (!user) {
    redirect("/login?error=demo");
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
