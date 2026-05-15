"use client";

import { useEffect, useRef, useState } from "react";
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

function getCompactMonthLabel(label: string) {
  return label.split("/")[0] ?? label;
}

export function FinancialChart({ data }: FinancialChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    if (!chartRef.current) return;

    const updateWidth = () => {
      setChartWidth(chartRef.current?.clientWidth ?? 0);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(chartRef.current);

    return () => observer.disconnect();
  }, []);

  const isCompact = chartWidth > 0 && chartWidth < 520;
  const isTablet = chartWidth >= 520 && chartWidth < 760;
  const chartHeight = isCompact ? 260 : isTablet ? 300 : 320;

  return (
    <section className="surface-panel min-w-0 overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            Receitas x despesas
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
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

      <div
        ref={chartRef}
        className="mt-6 w-full min-w-0 sm:mt-8"
        style={{ height: chartHeight }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barCategoryGap={isCompact ? "24%" : "18%"}
            barGap={isCompact ? 4 : 8}
            margin={{
              top: 10,
              right: isCompact ? 4 : 10,
              left: isCompact ? -22 : -4,
              bottom: isCompact ? 4 : 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148,163,184,0.16)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              interval={isCompact ? "preserveStartEnd" : 0}
              minTickGap={isCompact ? 14 : 8}
              tick={{ fontSize: isCompact ? 10 : 12 }}
              tickFormatter={isCompact ? getCompactMonthLabel : undefined}
            />
            <YAxis
              width={isCompact ? 42 : 54}
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              tickMargin={isCompact ? 6 : 12}
              tick={{ fontSize: isCompact ? 10 : 12 }}
              tickFormatter={(value) =>
                new Intl.NumberFormat("pt-BR", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(value)
              }
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.035)" }}
              formatter={(value) => [
                new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(value ?? 0)),
                "",
              ]}
              labelStyle={{
                color: "#94a3b8",
                marginBottom: "8px",
                fontSize: isCompact ? "12px" : "13px",
              }}
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "12px",
                color: "#fff",
                boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                padding: isCompact ? "10px 12px" : "12px 16px",
                maxWidth: isCompact ? "220px" : "280px",
              }}
              wrapperStyle={{ maxWidth: "calc(100vw - 32px)", outline: "none" }}
            />
            <Bar
              dataKey="receitas"
              name="Receitas"
              fill="#6ee7b7"
              radius={[5, 5, 0, 0]}
              maxBarSize={isCompact ? 22 : 40}
            />
            <Bar
              dataKey="despesas"
              name="Despesas"
              fill="#fda4af"
              radius={[5, 5, 0, 0]}
              maxBarSize={isCompact ? 22 : 40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
