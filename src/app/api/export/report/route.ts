import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildTransactionFilters, getReportSummary } from "@/lib/report-filters";
import { prisma } from "@/lib/prisma";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function pdfTextHex(text: string) {
  const bytes = Buffer.from(`\uFEFF${text}`, "utf16le");
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function escapePdfName(text: string) {
  return text.replace(/[^\w-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}

function createPdf(lines: string[]) {
  const content = lines
    .slice(0, 34)
    .map((line, index) => `BT /F1 11 Tf 48 ${780 - index * 20} Td <${pdfTextHex(line)}> Tj ET`)
    .join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const params = {
    type: searchParams.get("type"),
    categoryId: searchParams.get("categoryId"),
    start: searchParams.get("start"),
    end: searchParams.get("end"),
  };
  const transactions = await prisma.transaction.findMany({
    where: buildTransactionFilters(user.id, params),
    include: { category: true },
    orderBy: { date: "desc" },
  });
  const summary = getReportSummary(transactions);
  const lines = [
    "FinanceHub - Relatório financeiro",
    `Usuário: ${user.name}`,
    `Gerado em: ${formatDate(new Date())}`,
    "",
    `Total recebido: ${formatCurrency(summary.totalIncome)}`,
    `Total gasto: ${formatCurrency(summary.totalExpense)}`,
    `Saldo final: ${formatCurrency(summary.finalBalance)}`,
    `Maior categoria de despesa: ${summary.topExpenseCategory}`,
    `Média de gastos: ${formatCurrency(summary.averageExpense)}`,
    "",
    "Transações",
    ...transactions.map(
      (transaction) =>
        `${formatDate(transaction.date)} | ${transaction.type === "income" ? "Receita" : "Despesa"} | ${transaction.category.name} | ${
          transaction.title
        } | ${formatCurrency(transaction.amount)}`
    ),
  ];
  const pdf = createPdf(lines);
  const filename = `financehub-relatorio-${escapePdfName(formatDate(new Date()))}.pdf`;

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
