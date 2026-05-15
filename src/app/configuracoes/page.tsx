import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireUser } from "@/lib/auth";
import { changePasswordAction, deleteAccountAction } from "@/app/configuracoes/actions";
import { AlertCircle, Lock, ShieldAlert, Trash2 } from "lucide-react";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await requireUser();
  const isDemo = user.email === "demo@financehub.com";
  
  const params = await searchParams;

  return (
    <main className="app-shell">
      <Sidebar />

      <div className="app-main">
        <Topbar title="Configurações" userName={user.name} />

        <div className="page-container max-w-4xl">
          <div className="page-header mb-10">
            <div>
              <p className="page-kicker">Gerenciamento</p>
              <h1 className="page-title">Configurações de Conta</h1>
              <p className="page-description">Gerencie as credenciais do seu perfil financeiro.</p>
            </div>
          </div>

          <div className="grid gap-8">
            {/* Seção: Alterar Senha */}
            <div className="surface-card p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-white/[0.04] text-slate-300">
                  <Lock className="size-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-white">Alterar Senha</h2>
                  <p className="text-sm text-slate-400">Atualize sua senha de acesso periodicamente.</p>
                </div>
              </div>

              {isDemo && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm font-medium text-amber-200">
                  <AlertCircle className="size-5 shrink-0" />
                  <p>Ação bloqueada. Não é possível alterar a senha da conta de demonstração pública.</p>
                </div>
              )}

              {params.success === "password" && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-300">
                  <Lock className="size-5 shrink-0" />
                  <p>Sua senha foi alterada com sucesso.</p>
                </div>
              )}

              <form action={changePasswordAction} className="grid gap-4 max-w-md">
                <Input
                  name="currentPassword"
                  type="password"
                  placeholder="Senha atual"
                  className="field-control"
                  required
                  disabled={isDemo}
                />
                <Input
                  name="newPassword"
                  type="password"
                  placeholder="Nova senha"
                  className="field-control"
                  required
                  disabled={isDemo}
                  minLength={6}
                />
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirme a nova senha"
                  className="field-control"
                  required
                  disabled={isDemo}
                  minLength={6}
                />
                <Button 
                  type="submit" 
                  disabled={isDemo}
                  className="mt-2 h-11 rounded-xl bg-emerald-400 text-slate-950 hover:bg-emerald-300 disabled:opacity-50 font-semibold"
                >
                  Atualizar Senha
                </Button>
              </form>
            </div>

            {/* Seção: Excluir Conta */}
            <div className="surface-card relative overflow-hidden border-rose-500/10 p-6 shadow-rose-900/10 md:p-8">
              <div className="absolute left-0 top-0 h-full w-1 bg-rose-500/50" />
              
              <div className="mb-6 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-rose-500/10 text-rose-400">
                  <ShieldAlert className="size-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-rose-300">Zona de Perigo</h2>
                  <p className="text-sm text-slate-400">Excluir conta e apagar todos os dados permanentemente.</p>
                </div>
              </div>

              {isDemo ? (
                <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-medium text-rose-200">
                  <AlertCircle className="size-5 shrink-0" />
                  <p>Como medida de segurança coletiva, a exclusão da conta demo está bloqueada.</p>
                </div>
              ) : (
                <form action={deleteAccountAction} className="grid gap-4 max-w-md rounded-xl border border-rose-500/20 bg-rose-500/[0.02] p-5">
                  <p className="text-sm text-slate-300 mb-2">
                    Atenção: Essa ação é <strong>irreversível</strong>. Todas as suas transações, categorias e metas serão apagadas para sempre do banco de dados.
                  </p>
                  <Input
                    name="password"
                    type="password"
                    placeholder="Digite sua senha atual para confirmar"
                    className="field-control border-rose-500/30 focus-visible:border-rose-400"
                    required
                  />
                  <Button 
                    type="submit" 
                    variant="destructive"
                    className="mt-2 h-11 rounded-xl bg-rose-600 hover:bg-rose-500 font-semibold text-white"
                  >
                    <Trash2 className="mr-2 size-4" />
                    Sim, excluir minha conta
                  </Button>
                </form>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </main>
  );
}
