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

type Summary = ReturnType<typeof getReportSummary>;

type PdfContext = {
  commands: string[];
  pageNumber: number;
  totalPages: number;
};

const page = {
  width: 595,
  height: 842,
  margin: 40,
};

const table = {
  left: 40,
  topFirstPage: 500,
  topNextPage: 690,
  rowHeight: 24,
  bottom: 72,
  columns: {
    date: 52,
    type: 114,
    category: 178,
    title: 292,
    amount: 492,
  },
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

function color(commands: string[], value: string) {
  commands.push(`${value} rg`);
}

function strokeColor(commands: string[], value: string) {
  commands.push(`${value} RG`);
}

function text(commands: string[], x: number, y: number, value: string | number, options?: { size?: number; bold?: boolean; color?: string }) {
  if (options?.color) {
    color(commands, options.color);
  }

  commands.push("BT");
  commands.push(`/${options?.bold ? "F2" : "F1"} ${options?.size ?? 9} Tf`);
  commands.push(`${x} ${y} Td`);
  commands.push(`(${normalizeForPdf(value)}) Tj`);
  commands.push("ET");
}

function filledRect(commands: string[], x: number, y: number, width: number, height: number, fill: string) {
  color(commands, fill);
  commands.push(`${x} ${y} ${width} ${height} re f`);
}

function line(commands: string[], x1: number, y1: number, x2: number, y2: number, stroke = "0.86 0.88 0.91") {
  strokeColor(commands, stroke);
  commands.push(`${x1} ${y1} m ${x2} ${y2} l S`);
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

function drawPageChrome(ctx: PdfContext, userName: string, generatedAt: Date) {
  const { commands } = ctx;

  filledRect(commands, 0, 760, page.width, 82, "0.10 0.12 0.16");
  filledRect(commands, 40, 782, 8, 28, "0.16 0.73 0.46");
  text(commands, 58, 799, "FinanceHub", { size: 18, bold: true, color: "1 1 1" });
  text(commands, 58, 780, "Relatorio financeiro pessoal", { size: 9, color: "0.78 0.82 0.88" });
  text(commands, 405, 800, `Gerado em ${formatDate(generatedAt)}`, { size: 8, color: "0.78 0.82 0.88" });
  text(commands, 405, 784, `Usuario: ${userName}`, { size: 8, color: "0.78 0.82 0.88" });

  line(commands, page.margin, 54, page.width - page.margin, 54, "0.88 0.90 0.93");
  text(commands, page.margin, 36, "FinanceHub - controle financeiro pessoal", { size: 8, color: "0.42 0.45 0.50" });
  text(commands, 500, 36, `Pagina ${ctx.pageNumber} de ${ctx.totalPages}`, { size: 8, color: "0.42 0.45 0.50" });
}

function drawSummaryCard(commands: string[], x: number, y: number, label: string, value: string, accent: string) {
  filledRect(commands, x, y, 160, 62, "0.97 0.98 0.99");
  filledRect(commands, x, y, 4, 62, accent);
  strokeColor(commands, "0.88 0.90 0.93");
  commands.push(`${x} ${y} 160 62 re S`);
  text(commands, x + 14, y + 40, label, { size: 8, color: "0.40 0.43 0.48" });
  text(commands, x + 14, y + 18, truncate(value, 22), { size: 12, bold: true, color: "0.08 0.10 0.14" });
}

function drawSummary(commands: string[], summary: Summary) {
  text(commands, page.margin, 720, "Resumo do periodo", { size: 15, bold: true, color: "0.08 0.10 0.14" });
  text(commands, page.margin, 703, "Indicadores consolidados com base nos filtros selecionados.", {
    size: 9,
    color: "0.42 0.45 0.50",
  });

  drawSummaryCard(commands, 40, 620, "Total recebido", moneyForPdf(summary.totalIncome), "0.16 0.73 0.46");
  drawSummaryCard(commands, 218, 620, "Total gasto", moneyForPdf(summary.totalExpense), "0.91 0.26 0.25");
  drawSummaryCard(commands, 396, 620, "Saldo final", moneyForPdf(summary.finalBalance), summary.finalBalance >= 0 ? "0.16 0.73 0.46" : "0.91 0.26 0.25");
  drawSummaryCard(commands, 40, 540, "Maior categoria", summary.topExpenseCategory, "0.22 0.52 0.92");
  drawSummaryCard(commands, 218, 540, "Media de gastos", moneyForPdf(summary.averageExpense), "0.60 0.35 0.90");
}

function drawFilters(commands: string[], params: { type: string | null; start: string | null; end: string | null }) {
  const typeLabel = params.type === "income" ? "Receitas" : params.type === "expense" ? "Despesas" : "Todos";
  const period = `${params.start ? formatDate(new Date(params.start)) : "Inicio"} ate ${params.end ? formatDate(new Date(params.end)) : "Hoje"}`;

  text(commands, 396, 562, "Filtros", { size: 8, color: "0.40 0.43 0.48" });
  text(commands, 396, 545, `Tipo: ${typeLabel}`, { size: 9, bold: true, color: "0.08 0.10 0.14" });
  text(commands, 396, 528, `Periodo: ${period}`, { size: 8, color: "0.40 0.43 0.48" });
}

function drawTableHeader(commands: string[], y: number) {
  text(commands, table.left, y + 30, "Transacoes detalhadas", { size: 13, bold: true, color: "0.08 0.10 0.14" });
  filledRect(commands, table.left, y, page.width - table.left * 2, 26, "0.13 0.15 0.19");
  text(commands, table.columns.date, y + 9, "Data", { size: 8, bold: true, color: "1 1 1" });
  text(commands, table.columns.type, y + 9, "Tipo", { size: 8, bold: true, color: "1 1 1" });
  text(commands, table.columns.category, y + 9, "Categoria", { size: 8, bold: true, color: "1 1 1" });
  text(commands, table.columns.title, y + 9, "Titulo", { size: 8, bold: true, color: "1 1 1" });
  text(commands, table.columns.amount, y + 9, "Valor", { size: 8, bold: true, color: "1 1 1" });
}

function drawTransactionRow(commands: string[], transaction: ReportTransaction, y: number, index: number) {
  if (index % 2 === 0) {
    filledRect(commands, table.left, y - 2, page.width - table.left * 2, table.rowHeight, "0.98 0.99 1");
  }

  line(commands, table.left, y - 4, page.width - table.left, y - 4, "0.90 0.92 0.94");
  text(commands, table.columns.date, y + 6, formatDate(transaction.date), { size: 8, color: "0.18 0.20 0.24" });
  text(commands, table.columns.type, y + 6, transaction.type === "income" ? "Receita" : "Despesa", {
    size: 8,
    bold: true,
    color: transaction.type === "income" ? "0.10 0.55 0.34" : "0.75 0.18 0.16",
  });
  text(commands, table.columns.category, y + 6, truncate(transaction.category.name, 18), { size: 8, color: "0.18 0.20 0.24" });
  text(commands, table.columns.title, y + 6, truncate(transaction.title, 31), { size: 8, color: "0.18 0.20 0.24" });
  text(commands, table.columns.amount, y + 6, moneyForPdf(transaction.amount), {
    size: 8,
    bold: true,
    color: transaction.type === "income" ? "0.10 0.55 0.34" : "0.75 0.18 0.16",
  });
}

function rowsPerPage(firstPage: boolean) {
  const top = firstPage ? table.topFirstPage : table.topNextPage;
  return Math.floor((top - table.bottom) / table.rowHeight);
}

function getTotalPages(transactions: ReportTransaction[]) {
  if (transactions.length === 0) {
    return 1;
  }

  const first = rowsPerPage(true);
  const next = rowsPerPage(false);

  return 1 + Math.max(0, Math.ceil((transactions.length - first) / next));
}

function createPageStream({
  pageNumber,
  totalPages,
  userName,
  generatedAt,
  summary,
  params,
  rows,
  rowOffset,
}: {
  pageNumber: number;
  totalPages: number;
  userName: string;
  generatedAt: Date;
  summary: Summary;
  params: { type: string | null; start: string | null; end: string | null };
  rows: ReportTransaction[];
  rowOffset: number;
}) {
  const ctx: PdfContext = {
    commands: [],
    pageNumber,
    totalPages,
  };
  const firstPage = pageNumber === 1;
  let y = firstPage ? table.topFirstPage : table.topNextPage;

  drawPageChrome(ctx, userName, generatedAt);

  if (firstPage) {
    drawSummary(ctx.commands, summary);
    drawFilters(ctx.commands, params);
  }

  drawTableHeader(ctx.commands, y);
  y -= table.rowHeight;

  if (rows.length === 0) {
    text(ctx.commands, table.left, y, "Nenhuma transacao encontrada para os filtros selecionados.", {
      size: 10,
      color: "0.42 0.45 0.50",
    });
  }

  rows.forEach((transaction, index) => {
    drawTransactionRow(ctx.commands, transaction, y, rowOffset + index);
    y -= table.rowHeight;
  });

  return ctx.commands.join("\n");
}

function createPdf({
  userName,
  transactions,
  summary,
  params,
}: {
  userName: string;
  transactions: ReportTransaction[];
  summary: Summary;
  params: { type: string | null; start: string | null; end: string | null };
}) {
  const generatedAt = new Date();
  const totalPages = getTotalPages(transactions);
  const streams: string[] = [];
  let cursor = 0;

  for (let currentPage = 1; currentPage <= totalPages; currentPage += 1) {
    const limit = rowsPerPage(currentPage === 1);
    const rows = transactions.slice(cursor, cursor + limit);

    streams.push(
      createPageStream({
        pageNumber: currentPage,
        totalPages,
        userName,
        generatedAt,
        summary,
        params,
        rows,
        rowOffset: cursor,
      })
    );

    cursor += limit;
  }

  const objects: string[] = [];
  const pageObjectIds: number[] = [];

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

  let nextObjectId = 5;

  streams.forEach((stream) => {
    const pageObjectId = nextObjectId;
    const contentObjectId = nextObjectId + 1;

    pageObjectIds.push(pageObjectId);
    objects[pageObjectId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.width} ${page.height}] ` +
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
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;

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
  const pdf = createPdf({
    userName: user.name,
    transactions,
    summary,
    params,
  });
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
