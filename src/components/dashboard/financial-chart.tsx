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
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-8">
      <div>
        <h2 className="text-xl font-semibold text-white">
          Receitas x Despesas
        </h2>

        <p className="text-zinc-400 text-sm mt-1">
          Comparativo financeiro com dados reais
        </p>
      </div>

      <div className="mt-8 h-80 min-h-80 w-full min-w-0">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />

            <XAxis dataKey="month" stroke="#a1a1aa" />

            <YAxis stroke="#a1a1aa" />

            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "12px",
                color: "#fff",
              }}
            />

            <Bar dataKey="receitas" fill="#22c55e" radius={[8, 8, 0, 0]} />

            <Bar dataKey="despesas" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}