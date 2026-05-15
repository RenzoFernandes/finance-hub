"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type ExpenseCategoryChartProps = {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
};

export function ExpenseCategoryChart({ data }: ExpenseCategoryChartProps) {
  return (
    <section className="surface-panel">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="page-kicker">Categorias</p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-white sm:text-xl">Despesas por categoria</h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-slate-400">
          Distribuição dos gastos para identificar concentração e oportunidades de economia.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="mt-6 empty-state">Nenhuma despesa para exibir.</div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(220px,280px)_1fr]">
          <div className="h-56 min-w-0 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={98} paddingAngle={4}>
                  {data.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "12px",
                    color: "#fff",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                  }}
                  wrapperStyle={{ maxWidth: "calc(100vw - 32px)", outline: "none" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid min-w-0 content-center gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {data.map((item) => (
              <div key={item.name} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-300">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="mt-2 block break-words text-base font-semibold text-white sm:text-lg">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
