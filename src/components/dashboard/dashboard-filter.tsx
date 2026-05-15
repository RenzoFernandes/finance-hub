"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DashboardFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);

  const startParam = searchParams.get("start") || "";
  const endParam = searchParams.get("end") || "";
  
  const [start, setStart] = useState(startParam);
  const [end, setEnd] = useState(endParam);

  function applyFilter(startDate: Date | null, endDate: Date | null) {
    const params = new URLSearchParams(searchParams.toString());
    
    if (startDate && endDate) {
      params.set("start", startDate.toISOString().slice(0, 10));
      params.set("end", endDate.toISOString().slice(0, 10));
    } else {
      params.delete("start");
      params.delete("end");
    }
    
    router.push(`?${params.toString()}`);
    setIsOpen(false);
  }

  function handlePreset(preset: "month" | "quarter" | "semester" | "annual" | "all") {
    const now = new Date();
    let startDate = new Date();
    const endDate = new Date(now); // Data atual por padrão nas seleções rápidas

    switch (preset) {
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter":
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        break;
      case "semester":
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        break;
      case "annual":
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        break;
      case "all":
        startDate = new Date(now.getFullYear() - 5, now.getMonth(), 1);
        break;
    }
    
    applyFilter(startDate, endDate);
  }

  function handleCustom(e: React.FormEvent) {
    e.preventDefault();
    if (start && end) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("start", start);
      params.set("end", end);
      router.push(`?${params.toString()}`);
      setIsOpen(false);
    }
  }

  function formatDateStr(dateString: string) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }

  let buttonLabel = "Mês atual";
  if (startParam && endParam) {
    const s = new Date(startParam);
    const e = new Date(endParam);
    const monthsDiff = (e.getFullYear() - s.getFullYear()) * 12 + e.getMonth() - s.getMonth() + 1;
    
    if (monthsDiff >= 60) buttonLabel = "5+ Anos";
    else if (monthsDiff === 12) buttonLabel = "Anual";
    else if (monthsDiff === 6) buttonLabel = "Semestre";
    else if (monthsDiff === 3) buttonLabel = "Trimestre";
    else if (monthsDiff === 1) buttonLabel = "Mês atual";
    else buttonLabel = `${formatDateStr(startParam)} a ${formatDateStr(endParam)}`;
  }

  return (
    <div className="relative">
      <Button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        variant="outline" 
        className="h-10 gap-2 rounded-xl border-white/10 bg-white/[0.045] text-white hover:bg-white/[0.08]"
      >
        <CalendarIcon className="size-4" />
        {buttonLabel}
        <ChevronDown className="size-4 text-slate-400" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-[320px] rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">Períodos rápidos</p>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={() => handlePreset("month")} className="border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white">Mês</Button>
            <Button size="sm" variant="outline" onClick={() => handlePreset("quarter")} className="border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white">Trimestre</Button>
            <Button size="sm" variant="outline" onClick={() => handlePreset("semester")} className="border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white">Semestre</Button>
            <Button size="sm" variant="outline" onClick={() => handlePreset("annual")} className="border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white">Anual</Button>
            <Button size="sm" variant="outline" onClick={() => handlePreset("all")} className="col-span-2 border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white">5+ Anos</Button>
          </div>

          <div className="my-4 h-px bg-white/10" />

          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">Personalizado</p>
          <form onSubmit={handleCustom} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-slate-500">Início</label>
                <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="h-9 field-control text-sm" required />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Fim</label>
                <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="h-9 field-control text-sm" required />
              </div>
            </div>
            <Button type="submit" className="w-full h-9 rounded-xl bg-emerald-300 text-slate-950 hover:bg-emerald-200">
              Aplicar datas
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
