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
    <form onSubmit={handleSubmit} className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Nova transação</h2>
        <p className="mt-1 text-sm text-zinc-400">Registre receitas e despesas com categoria e data.</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="h-11 border-zinc-800 bg-zinc-950 text-white"
          required
        />

        <Input
          type="number"
          placeholder="Valor"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="h-11 border-zinc-800 bg-zinc-950 text-white"
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
          className="h-11 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-zinc-600"
        >
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
        </select>

        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="h-11 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-zinc-600"
          required
        >
          <option value="">Selecione uma categoria</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <Input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="h-11 border-zinc-800 bg-zinc-950 text-white"
          required
        />

        <Input
          type="text"
          placeholder="Descrição opcional"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="h-11 border-zinc-800 bg-zinc-950 text-white"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || filteredCategories.length === 0}
        className="mt-6 h-11 bg-emerald-500 px-5 text-zinc-950 hover:bg-emerald-400"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : <Plus />}
        Salvar transação
      </Button>
    </form>
  );
}
