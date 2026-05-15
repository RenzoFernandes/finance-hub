import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildTransactionFilters, getReportSummary } from "@/lib/report-filters";
import { prisma } from "@/lib/prisma";

type ReportTransaction = {
  date: Date;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: {
    name: string;
  };
};

const page = {
  width: 595,
  height: 842,
  margin: 42,
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

function escapePdfText(value: string | number) {
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

function text(x: number, y: number, size: number, value: string | number, font = "F1") {
  return `BT /${font} ${size} Tf ${x} ${y} Td (${escapePdfText(value)}) Tj ET`;
}

function line(x1: number, y1: number, x2: number, y2: number) {
  return `${x1} ${y1} m ${x2} ${y2} l S`;
}

function rect(x: number, y: number, width: number, height: number) {
  return `${x} ${y} ${width} ${height} re S`;
}

function wrap(value: string, maxLength: number) {
  const words = value.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.slice(0, 2);
}

function drawHeader(commands: string[], title: string, userName: string, generatedAt: Date) {
  commands.push("0.12 0.14 0.18 rg");
  commands.push(`0 ${page.height - 92} ${page.width} 92 re f`);
  commands.push("1 1 1 rg");
  commands.push(text(page.margin, page.height - 56, 20, title, "F2"));
  commands.push(text(page.margin, page.height - 78, 10, `FinanceHub - ${userName}`));
  commands.push(text(420, page.height - 78, 10, `Gerado em ${formatDate(generatedAt)}`));
  commands.push("0 0 0 rg");
}

function drawSummary(
  commands: string[],
  y: number,
  summary: ReturnType<typeof getReportSummary>
) {
  const cards = [
    ["Total recebido", moneyForPdf(summary.totalIncome)],
    ["Total gasto", moneyForPdf(summary.totalExpense)],
    ["Saldo final", moneyForPdf(summary.finalBalance)],
    ["Maior despesa", summary.topExpenseCategory],
    ["Media de gastos", moneyForPdf(summary.averageExpense)],
  ];
  const cardWidth = 96;

  commands.push("0.88 0.9 0.93 RG");
  cards.forEach(([label, value], index) => {
    const x = page.margin + index * (cardWidth + 8);
    commands.push(rect(x, y - 52, cardWidth, 52));
    commands.push(text(x + 8, y - 18, 8, label));
    commands.push(text(x + 8, y - 38, 10, String(value).slice(0, 18), "F2"));
  });
  commands.push("0 0 0 RG");
}

function drawTableHeader(commands: string[], y: number) {
  commands.push("0.95 0.96 0.98 rg");
  commands.push(`${page.margin} ${y - 18} ${page.width - page.margin * 2} 24 re f`);
  commands.push("0 0 0 rg");
  commands.push(text(page.margin + 8, y - 10, 8, "Data", "F2"));
  commands.push(text(page.margin + 72, y - 10, 8, "Tipo", "F2"));
  commands.push(text(page.margin + 138, y - 10, 8, "Categoria", "F2"));
  commands.push(text(page.margin + 250, y - 10, 8, "Titulo", "F2"));
  commands.push(text(page.margin + 430, y - 10, 8, "Valor", "F2"));
}

function drawRows(commands: string[], transactions: ReportTransaction[], startIndex: number, startY: number) {
  let y = startY;
  let index = startIndex;

  while (index < transactions.length && y > 78) {
    const transaction = transactions[index];
    const titleLines = wrap(transaction.title, 28);
    const rowHeight = titleLines.length > 1 ? 32 : 24;

    commands.push("0.88 0.9 0.93 RG");
    commands.push(line(page.margin, y - rowHeight + 6, page.width - page.margin, y - rowHeight + 6));
    commands.push("0 0 0 RG");
    commands.push(text(page.margin + 8, y - 10, 8, formatDate(transaction.date)));
    commands.push(text(page.margin + 72, y - 10, 8, transaction.type === "income" ? "Receita" : "Despesa"));
    commands.push(text(page.margin + 138, y - 10, 8, transaction.category.name.slice(0, 20)));
    titleLines.forEach((lineText, lineIndex) => {
      commands.push(text(page.margin + 250, y - 10 - lineIndex * 11, 8, lineText));
    });
    commands.push(text(page.margin + 430, y - 10, 8, moneyForPdf(transaction.amount)));

    y -= rowHeight;
    index += 1;
  }

  return { nextIndex: index, nextY: y };
}

function createReportPdf({
  userName,
  transactions,
  summary,
}: {
  userName: string;
  transactions: ReportTransaction[];
  summary: ReturnType<typeof getReportSummary>;
}) {
  const generatedAt = new Date();
  const pages: string[] = [];
  let index = 0;

  do {
    const commands: string[] = [];
    drawHeader(commands, "Relatorio financeiro", userName, generatedAt);

    let y = page.height - 128;

    if (pages.length === 0) {
      drawSummary(commands, y, summary);
      y -= 86;
      commands.push(text(page.margin, y, 13, "Transacoes detalhadas", "F2"));
      y -= 18;
    }

    drawTableHeader(commands, y);
    y -= 28;

    if (transactions.length === 0) {
      commands.push(text(page.margin, y - 8, 10, "Nenhuma transacao encontrada para os filtros selecionados."));
      index = 1;
    } else {
      const result = drawRows(commands, transactions, index, y);
      index = result.nextIndex;
    }

    commands.push(text(page.margin, 38, 8, `Pagina ${pages.length + 1}`));
    pages.push(commands.join("\n"));
  } while (index < transactions.length);

  const objects: string[] = [];
  const catalogObject = 1;
  const pagesObject = 2;
  const fontRegularObject = 3;
  const fontBoldObject = 4;
  const firstPageObject = 5;

  objects[catalogObject] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[pagesObject] = `<< /Type /Pages /Kids ${pages
    .map((_, pageIndex) => `${firstPageObject + pageIndex * 2} 0 R`)
    .join(" ")} /Count ${pages.length} >>`;
  objects[fontRegularObject] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objects[fontBoldObject] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

  pages.forEach((content, pageIndex) => {
    const pageObject = firstPageObject + pageIndex * 2;
    const contentObject = pageObject + 1;
    objects[pageObject] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.width} ${page.height}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObject} 0 R >>`;
    objects[contentObject] = `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`;
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = Buffer.byteLength(pdf, "latin1");
    pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;

  for (let index = 1; index < objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "latin1");
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
  const pdf = createReportPdf({ userName: user.name, transactions, summary });
  const filename = `financehub-relatorio-${escapeFilename(formatIsoDate(new Date()))}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(pdf.length),
    },
  });
}
