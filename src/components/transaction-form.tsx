"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function TransactionForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

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
          category,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar transação");
      }

      setTitle("");
      setAmount("");
      setType("income");
      setCategory("");
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
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-8"
    >
      <h2 className="text-2xl font-semibold text-white">Nova Transação</h2>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none"
          required
        />

        <input
          type="number"
          placeholder="Valor"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none"
          required
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none"
        >
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
        </select>

        <input
          type="text"
          placeholder="Categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none"
          required
        />

        <textarea
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="col-span-2 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none h-32 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-6 bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed transition px-6 py-3 rounded-lg font-semibold text-black"
      >
        {isLoading ? "Salvando..." : "Salvar Transação"}
      </button>
    </form>
  );
}