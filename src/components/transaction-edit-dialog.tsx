"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { updateTransactionAction } from "@/app/transactions/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type CategoryOption = {
  id: string;
  name: string;
  type: "income" | "expense";
};

type EditableTransaction = {
  id: string;
  title: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  date: string;
};

type TransactionEditDialogProps = {
  categories: CategoryOption[];
  transaction: EditableTransaction;
};

export function TransactionEditDialog({ categories, transaction }: TransactionEditDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState(transaction.type);
  const [categoryId, setCategoryId] = useState(transaction.categoryId);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type]
  );

  async function handleSubmit(formData: FormData) {
    try {
      setIsLoading(true);
      await updateTransactionAction(formData);
      setIsOpen(false);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-10 flex-1 rounded-lg border-emerald-400/20 bg-emerald-400/10 text-xs font-semibold text-emerald-300 hover:bg-emerald-400/20 sm:w-28 sm:flex-none">
          <Pencil className="mr-1.5 size-3" />
          Editar
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[92svh] max-w-xl overflow-y-auto border-white/10 bg-[#090d14] text-white shadow-2xl sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight text-white">Editar transação</DialogTitle>
          <DialogDescription className="text-slate-400">
            Atualize os dados da movimentação selecionada.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="mt-4">
          <input type="hidden" name="id" value={transaction.id} />

          <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Título da operação</label>
              <Input name="title" defaultValue={transaction.title} className="field-control h-11 w-full" required />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Valor (R$)</label>
              <Input name="amount" type="number" min="0.01" step="0.01" defaultValue={transaction.amount} className="field-control h-11 w-full" required />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Tipo</label>
              <select
                name="type"
                value={type}
                onChange={(event) => {
                  const nextType = event.target.value as "income" | "expense";
                  setType(nextType);
                  setCategoryId(categories.find((category) => category.type === nextType)?.id ?? "");
                }}
                className="field-control h-11 w-full"
              >
                <option className="bg-[#090d14] text-slate-200" value="income">Receita</option>
                <option className="bg-[#090d14] text-slate-200" value="expense">Despesa</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Categoria</label>
              <select name="categoryId" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="field-control h-11 w-full" required>
                {filteredCategories.map((category) => (
                  <option className="bg-[#090d14] text-slate-200" key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Data</label>
              <Input name="date" type="date" defaultValue={transaction.date} className="field-control h-11 w-full" required />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Descrição opcional</label>
              <Input name="description" defaultValue={transaction.description} className="field-control h-11 w-full" />
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
            <Button type="submit" disabled={isLoading || filteredCategories.length === 0} className="h-11 rounded-xl bg-emerald-300 px-6 font-semibold text-slate-950 hover:bg-emerald-200 sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Pencil className="mr-2 size-4" />}
              Salvar alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
