"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [isOpen, setIsOpen] = useState(false);
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
      setIsOpen(false);
      router.refresh();
    } catch {
      toast.error("Não foi possível criar a transação.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 w-full gap-2 rounded-xl bg-emerald-300 font-semibold text-slate-950 shadow-xl hover:bg-emerald-200 sm:w-auto">
          <Plus className="size-4" />
          Nova Transação
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[92svh] max-w-xl overflow-y-auto border-white/10 bg-[#090d14] text-white shadow-2xl sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight text-white">Nova transação</DialogTitle>
          <DialogDescription className="text-slate-400">
            Registre receitas e despesas com categoria, data e descrição opcional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Título da operação</label>
              <Input
                type="text"
                placeholder="Ex: Pagamento de aluguel"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="field-control h-11 w-full"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Valor (R$)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="field-control h-11 w-full"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Tipo</label>
              <select
                value={type}
                onChange={(event) => {
                  setType(event.target.value as "income" | "expense");
                  setCategoryId("");
                }}
                className="field-control h-11 w-full"
              >
                <option className="bg-[#090d14] text-slate-200" value="income">Receita</option>
                <option className="bg-[#090d14] text-slate-200" value="expense">Despesa</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Categoria</label>
              <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="field-control h-11 w-full" required>
                <option className="bg-[#090d14] text-slate-200" value="">Selecione uma categoria</option>
                {filteredCategories.map((category) => (
                  <option className="bg-[#090d14] text-slate-200" key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Data</label>
              <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="field-control h-11 w-full" required />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Descrição opcional</label>
              <Input
                type="text"
                placeholder="Adicione detalhes extras se necessário..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="field-control h-11 w-full"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="h-11 rounded-xl border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || filteredCategories.length === 0}
              className="h-11 rounded-xl bg-emerald-300 px-6 font-semibold text-slate-950 hover:bg-emerald-200 sm:w-auto"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Plus className="mr-2 size-4" />}
              Salvar transação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
