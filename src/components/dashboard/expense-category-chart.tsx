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
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Despesas por categoria</h2>
        <p className="mt-1 text-sm text-zinc-400">Distribuição dos gastos registrados</p>
      </div>

      {data.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-400">
          Nenhuma despesa para exibir.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-[220px_1fr]">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>
                  {data.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {data.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-zinc-300">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-medium text-white">
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
