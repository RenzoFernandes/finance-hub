type FinancialCardProps = {
  title: string;
  value: string;
  description: string;
  variant?: "default" | "income" | "expense";
};

export function FinancialCard({
  title,
  value,
  description,
  variant = "default",
}: FinancialCardProps) {
  const variantStyle = {
    default: {
      value: "text-white",
      accent: "bg-sky-300",
      glow: "shadow-sky-500/10",
    },
    income: {
      value: "text-emerald-300",
      accent: "bg-emerald-300",
      glow: "shadow-emerald-500/10",
    },
    expense: {
      value: "text-rose-300",
      accent: "bg-rose-300",
      glow: "shadow-rose-500/10",
    },
  };
  const styles = variantStyle[variant];

  return (
    <div className={`surface-card relative overflow-hidden p-5 shadow-2xl ${styles.glow}`}>
      <div className={`absolute left-0 top-0 h-full w-1 ${styles.accent}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
          <h2 className={`mt-3 truncate text-2xl font-semibold tracking-tight md:text-3xl ${styles.value}`}>{value}</h2>
        </div>
        <span className={`mt-1 size-2.5 rounded-full ${styles.accent}`} />
      </div>
      <p className="mt-4 text-sm leading-5 text-slate-400">{description}</p>
    </div>
  );
}
