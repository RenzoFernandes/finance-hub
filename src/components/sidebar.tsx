import {
  LayoutDashboard,
  ArrowUpCircle,
  Target,
  FileText,
  Settings,
} from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-zinc-900 border-r border-zinc-800 p-6">
      <h1 className="text-3xl font-bold text-white">
        FinanceHub
      </h1>

      <nav className="mt-10 flex flex-col gap-2">
        <button className="flex items-center gap-3 bg-zinc-800 text-white px-4 py-3 rounded-xl transition hover:bg-zinc-700">
          <LayoutDashboard size={20} />
          Dashboard
        </button>

        <button className="flex items-center gap-3 text-zinc-400 px-4 py-3 rounded-xl transition hover:bg-zinc-800 hover:text-white">
          <ArrowUpCircle size={20} />
          Transações
        </button>

        <button className="flex items-center gap-3 text-zinc-400 px-4 py-3 rounded-xl transition hover:bg-zinc-800 hover:text-white">
          <Target size={20} />
          Metas
        </button>

        <button className="flex items-center gap-3 text-zinc-400 px-4 py-3 rounded-xl transition hover:bg-zinc-800 hover:text-white">
          <FileText size={20} />
          Relatórios
        </button>

        <button className="flex items-center gap-3 text-zinc-400 px-4 py-3 rounded-xl transition hover:bg-zinc-800 hover:text-white">
          <Settings size={20} />
          Configurações
        </button>
      </nav>
    </aside>
  );
}