"use server";

import { redirect } from "next/navigation";
import { destroySession, hashPassword, requireUser, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function changePasswordAction(formData: FormData) {
  const user = await requireUser();

  if (user.email === "demo@financehub.com") {
    throw new Error("Ação não permitida na conta de demonstração.");
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error("Preencha todos os campos.");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("A nova senha e a confirmação não conferem.");
  }

  if (newPassword.length < 6) {
    throw new Error("A nova senha deve ter no mínimo 6 caracteres.");
  }

  const userRecord = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!userRecord) {
    throw new Error("Usuário não encontrado.");
  }

  const isValid = await verifyPassword(currentPassword, userRecord.passwordHash);

  if (!isValid) {
    throw new Error("A senha atual está incorreta.");
  }

  const newPasswordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newPasswordHash },
  });

  // Idealmente redireciona com sucesso ou usamos um componente client para dar toast. 
  // Redirecionando para a mesma página com um query param de sucesso
  redirect("/configuracoes?success=password");
}

export async function deleteAccountAction(formData: FormData) {
  const user = await requireUser();

  if (user.email === "demo@financehub.com") {
    throw new Error("Ação não permitida na conta de demonstração.");
  }

  const password = formData.get("password") as string;

  if (!password) {
    throw new Error("A senha é obrigatória para excluir a conta.");
  }

  const userRecord = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!userRecord) {
    throw new Error("Usuário não encontrado.");
  }

  const isValid = await verifyPassword(password, userRecord.passwordHash);

  if (!isValid) {
    throw new Error("Senha incorreta.");
  }

  await prisma.user.delete({
    where: { id: user.id },
  });

  await destroySession();
  redirect("/login?deleted=true");
}
