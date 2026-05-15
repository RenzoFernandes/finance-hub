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

  const valueLength = value.length;
  let textSizeClass = "text-xl md:text-2xl tracking-tight";
  
  if (valueLength > 22) {
    textSizeClass = "text-[11px] sm:text-xs md:text-sm tracking-tighter";
  } else if (valueLength > 18) {
    textSizeClass = "text-xs sm:text-sm md:text-base tracking-tighter";
  } else if (valueLength > 14) {
    textSizeClass = "text-sm sm:text-base md:text-lg tracking-tight";
  } else if (valueLength > 10) {
    textSizeClass = "text-base sm:text-lg md:text-xl tracking-tight";
  }

  return (
    <div className={`surface-card relative flex h-full flex-col overflow-hidden p-6 shadow-xl transition-all hover:shadow-2xl ${styles.glow}`}>
      <div className={`absolute left-0 top-0 h-full w-1 ${styles.accent}`} />
      
      <div className="flex min-h-[36px] items-start gap-2.5">
        <span className={`mt-1 size-2 shrink-0 rounded-full ${styles.accent} shadow-sm`} />
        <p className="text-xs font-semibold uppercase leading-snug tracking-widest text-slate-400">{title}</p>
      </div>
      
      <div className="mt-5 flex-1 flex items-center">
        <h2 className={`whitespace-nowrap font-bold w-full ${textSizeClass} ${styles.value}`} title={value}>
          {value}
        </h2>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">{description}</p>
    </div>
  );
}
