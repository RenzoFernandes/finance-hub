import { Plus, Trash2 } from "lucide-react";
import { createCategoryAction, deleteCategoryAction, updateCategoryAction } from "@/app/categorias/actions";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  const user = await requireUser();
  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  return (
    <main className="flex min-h-screen bg-zinc-950">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Topbar title="Categorias" userName={user.name} />

        <div className="p-4 text-white md:p-8">
          <div>
            <h1 className="text-3xl font-bold">Categorias</h1>
            <p className="mt-2 text-zinc-400">Organize receitas e despesas com cores para leitura rápida.</p>
          </div>

          <form action={createCategoryAction} className="mt-8 grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6 md:grid-cols-[1fr_180px_120px_auto]">
            <Input name="name" placeholder="Nome da categoria" className="h-11 border-zinc-800 bg-zinc-950 text-white" required />
            <select name="type" className="h-11 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none">
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
            <Input name="color" type="color" defaultValue="#22c55e" className="h-11 border-zinc-800 bg-zinc-950 p-1" aria-label="Cor da categoria" />
            <Button className="h-11 bg-emerald-500 text-zinc-950 hover:bg-emerald-400">
              <Plus />
              Criar
            </Button>
          </form>

          <section className="mt-8 grid gap-4 lg:grid-cols-2">
            {categories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900 p-10 text-center text-sm text-zinc-400">
                Nenhuma categoria cadastrada.
              </div>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                  <form action={updateCategoryAction} className="grid gap-4 md:grid-cols-[1fr_150px_90px]">
                    <input type="hidden" name="id" value={category.id} />
                    <Input name="name" defaultValue={category.name} className="h-10 border-zinc-800 bg-zinc-950 text-white" />
                    <select
                      name="type"
                      defaultValue={category.type}
                      className="h-10 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none"
                    >
                      <option value="expense">Despesa</option>
                      <option value="income">Receita</option>
                    </select>
                    <Input name="color" type="color" defaultValue={category.color} className="h-10 border-zinc-800 bg-zinc-950 p-1" />

                    <div className="flex items-center justify-between gap-3 md:col-span-3">
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <span className="size-3 rounded-full" style={{ backgroundColor: category.color }} />
                        {category.type === "income" ? "Receita" : "Despesa"} · {category._count.transactions} transações
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" variant="outline" className="border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-800">
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </form>

                  <form action={deleteCategoryAction} className="mt-3 flex justify-end">
                    <input type="hidden" name="id" value={category.id} />
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={category._count.transactions > 0}
                      title={category._count.transactions > 0 ? "Remova ou altere as transações antes de excluir." : "Excluir categoria"}
                    >
                      <Trash2 />
                      Excluir
                    </Button>
                  </form>
                </div>
              ))
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
