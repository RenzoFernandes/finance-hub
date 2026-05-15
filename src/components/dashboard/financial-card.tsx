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
  const valueColor = {
    default: "text-white",
    income: "text-green-500",
    expense: "text-red-500",
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <p className="text-zinc-400">{title}</p>

      <h2 className={`text-3xl font-bold mt-2 ${valueColor[variant]}`}>
        {value}
      </h2>

      <p className="text-sm text-zinc-500 mt-3">{description}</p>
    </div>
  );
}