"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartData = {
  month: string;
  receitas: number;
  despesas: number;
};

type FinancialChartProps = {
  data: ChartData[];
};

export function FinancialChart({ data }: FinancialChartProps) {
  return (
    <section className="surface-panel">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="page-kicker">Fluxo mensal</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Receitas x despesas</h2>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-300" />
            Receitas
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-rose-300" />
            Despesas
          </span>
        </div>
      </div>

      <div className="mt-8 h-80 min-h-80 w-full min-w-0">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.16)" vertical={false} />
            <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.035)" }}
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "16px",
                color: "#fff",
                boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              }}
            />
            <Bar dataKey="receitas" fill="#6ee7b7" radius={[10, 10, 0, 0]} />
            <Bar dataKey="despesas" fill="#fda4af" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
