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
    <main className="app-shell">
      <Sidebar />

      <div className="app-main">
        <Topbar title="Categorias" userName={user.name} />

        <div className="page-container">
          <div className="page-header">
            <div>
              <p className="page-kicker">Taxonomia</p>
              <h1 className="page-title">Categorias</h1>
              <p className="page-description">Organize receitas e despesas com cores consistentes para facilitar análise e relatórios.</p>
            </div>
          </div>

          <form action={createCategoryAction} className="surface-panel mt-8 grid gap-4 md:grid-cols-[1fr_180px_120px_auto]">
            <Input name="name" placeholder="Nome da categoria" className="field-control h-11" required />
            <select name="type" className="field-control h-11">
              <option className="bg-[#090d14] text-slate-200" value="expense">Despesa</option>
              <option className="bg-[#090d14] text-slate-200" value="income">Receita</option>
            </select>
            <Input name="color" type="color" defaultValue="#22c55e" className="field-control h-11 p-1" aria-label="Cor da categoria" />
            <Button className="h-11 rounded-xl bg-emerald-300 font-semibold text-slate-950 hover:bg-emerald-200">
              <Plus />
              Criar
            </Button>
          </form>

          <section className="mt-8 grid gap-4 lg:grid-cols-2">
            {categories.length === 0 ? (
              <div className="empty-state">Nenhuma categoria cadastrada.</div>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="surface-card p-5">
                  <form action={updateCategoryAction} className="grid gap-4 md:grid-cols-[1fr_150px_90px]">
                    <input type="hidden" name="id" value={category.id} />
                    <Input name="name" defaultValue={category.name} className="field-control h-10" />
                    <select name="type" defaultValue={category.type} className="field-control h-10">
                      <option className="bg-[#090d14] text-slate-200" value="expense">Despesa</option>
                      <option className="bg-[#090d14] text-slate-200" value="income">Receita</option>
                    </select>
                    <Input name="color" type="color" defaultValue={category.color} className="field-control h-10 p-1" />

                    <div className="flex items-center justify-between gap-3 md:col-span-3">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="size-3 rounded-full" style={{ backgroundColor: category.color }} />
                        {category.type === "income" ? "Receita" : "Despesa"} · {category._count.transactions} transações
                      </div>
                      <Button type="submit" variant="outline" className="rounded-xl border-white/10 bg-white/[0.045] text-white hover:bg-white/[0.08]">
                        Salvar
                      </Button>
                    </div>
                  </form>

                  <form action={deleteCategoryAction} className="mt-3 flex justify-end">
                    <input type="hidden" name="id" value={category.id} />
                    <Button
                      type="submit"
                      variant="destructive"
                      className="rounded-xl"
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
