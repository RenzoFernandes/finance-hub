import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildTransactionFilters, getReportSummary } from "@/lib/report-filters";
import { prisma } from "@/lib/prisma";

const linesPerPage = 42;

type PdfLine = {
  text: string;
  size?: number;
  bold?: boolean;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalizeForPdf(value: string | number) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function escapeFilename(value: string) {
  return value.replace(/[^\w-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}

function moneyForPdf(value: number) {
  return formatCurrency(value).replace("R$", "BRL");
}

function wrapLine(value: string, maxLength = 94) {
  const words = value.split(" ");
  const wrapped: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (next.length > maxLength && current) {
      wrapped.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    wrapped.push(current);
  }

  return wrapped;
}

function chunkLines(lines: PdfLine[]) {
  const pages: PdfLine[][] = [];

  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push(lines.slice(index, index + linesPerPage));
  }

  return pages.length > 0 ? pages : [[{ text: "Nenhum dado encontrado." }]];
}

function createContentStream(lines: PdfLine[], pageNumber: number, totalPages: number) {
  const commands = [
    "BT",
    "/F2 18 Tf",
    "50 790 Td",
    "(FinanceHub - Relatorio financeiro) Tj",
    "/F1 9 Tf",
    "0 -18 Td",
    `(${normalizeForPdf(`Pagina ${pageNumber} de ${totalPages}`)}) Tj`,
    "ET",
  ];

  let y = 740;

  for (const line of lines) {
    const size = line.size ?? 10;
    const font = line.bold ? "F2" : "F1";
    commands.push("BT");
    commands.push(`/${font} ${size} Tf`);
    commands.push(`50 ${y} Td`);
    commands.push(`(${normalizeForPdf(line.text)}) Tj`);
    commands.push("ET");
    y -= line.size && line.size > 11 ? 18 : 14;
  }

  return commands.join("\n");
}

function createPdf(lines: PdfLine[]) {
  const pages = chunkLines(lines);
  const objects: string[] = [];
  const pageObjectIds: number[] = [];
  const contentObjectIds: number[] = [];

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

  let nextObjectId = 5;

  pages.forEach((pageLines, index) => {
    const pageObjectId = nextObjectId;
    const contentObjectId = nextObjectId + 1;
    const stream = createContentStream(pageLines, index + 1, pages.length);

    pageObjectIds.push(pageObjectId);
    contentObjectIds.push(contentObjectId);
    objects[pageObjectId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectId} 0 R >>`;
    objects[contentObjectId] = `<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}\nendstream`;
    nextObjectId += 2;
  });

  objects[2] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;

  let pdf = "%PDF-1.4\n%\xFF\xFF\xFF\xFF\n";
  const offsets: number[] = [];

  for (let id = 1; id < objects.length; id += 1) {
    if (!objects[id]) {
      continue;
    }

    offsets[id] = Buffer.byteLength(pdf, "binary");
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "binary");
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";

  for (let id = 1; id < objects.length; id += 1) {
    pdf += `${String(offsets[id] ?? 0).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "binary");
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
  const lines: PdfLine[] = [
    { text: `Usuario: ${user.name}`, size: 11, bold: true },
    { text: `Gerado em: ${formatDate(new Date())}` },
    { text: "" },
    { text: "Resumo financeiro", size: 13, bold: true },
    { text: `Total recebido: ${moneyForPdf(summary.totalIncome)}` },
    { text: `Total gasto: ${moneyForPdf(summary.totalExpense)}` },
    { text: `Saldo final: ${moneyForPdf(summary.finalBalance)}` },
    { text: `Maior categoria de despesa: ${summary.topExpenseCategory}` },
    { text: `Media de gastos: ${moneyForPdf(summary.averageExpense)}` },
    { text: "" },
    { text: "Transacoes detalhadas", size: 13, bold: true },
    { text: "Data       Tipo      Categoria             Titulo                                      Valor", bold: true },
  ];

  if (transactions.length === 0) {
    lines.push({ text: "Nenhuma transacao encontrada para os filtros selecionados." });
  } else {
    for (const transaction of transactions) {
      const row = `${formatDate(transaction.date).padEnd(10)} ${(
        transaction.type === "income" ? "Receita" : "Despesa"
      ).padEnd(9)} ${transaction.category.name.padEnd(20).slice(0, 20)} ${transaction.title.padEnd(42).slice(0, 42)} ${moneyForPdf(
        transaction.amount
      )}`;

      wrapLine(row).forEach((line) => lines.push({ text: line }));
    }
  }

  const pdf = createPdf(lines);
  const filename = `financehub-relatorio-${escapeFilename(formatIsoDate(new Date()))}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(pdf.length),
      "Cache-Control": "no-store",
    },
  });
}
