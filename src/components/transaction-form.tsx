"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CategoryOption = {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
};

type TransactionFormProps = {
  categories: CategoryOption[];
};

export function TransactionForm({ categories }: TransactionFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("income");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type]
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!title.trim() || Number(amount) <= 0 || !categoryId) {
      toast.error("Preencha título, valor e categoria.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          amount: Number(amount),
          type,
          categoryId,
          date,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar transação");
      }

      setTitle("");
      setAmount("");
      setType("income");
      setCategoryId("");
      setDate(new Date().toISOString().slice(0, 10));
      setDescription("");

      toast.success("Transação criada com sucesso!");
      router.refresh();
    } catch {
      toast.error("Não foi possível criar a transação.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="surface-panel mt-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="page-kicker">Lançamento</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Nova transação</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-slate-400">Registre receitas e despesas com categoria, data e descrição opcional.</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="field-control h-11"
          required
        />

        <Input
          type="number"
          placeholder="Valor"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="field-control h-11"
          min="0.01"
          step="0.01"
          required
        />

        <select
          value={type}
          onChange={(event) => {
            setType(event.target.value as "income" | "expense");
            setCategoryId("");
          }}
          className="field-control h-11"
        >
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
        </select>

        <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="field-control h-11" required>
          <option value="">Selecione uma categoria</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="field-control h-11" required />

        <Input
          type="text"
          placeholder="Descrição opcional"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="field-control h-11"
        />
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          type="submit"
          disabled={isLoading || filteredCategories.length === 0}
          className="h-11 rounded-xl bg-emerald-300 px-5 font-semibold text-slate-950 hover:bg-emerald-200"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Plus />}
          Salvar transação
        </Button>
      </div>
    </form>
  );
}
