"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ExportButton({ queryString }: { queryString: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const response = await fetch(`/api/export/transactions?${queryString}`);
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao exportar");
      }

      // Tratar o download via Blob no client
      const blob = await response.blob();
      
      // Extrair filename do header se existir, ou fallback
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "financehub-transacoes.csv";
      if (contentDisposition && contentDisposition.includes("filename=")) {
        filename = contentDisposition.split("filename=")[1].replace(/["']/g, "");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Download iniciado com sucesso!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Ocorreu um erro ao exportar as transações.");
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={isExporting}
      variant="outline" 
      className="h-11 rounded-xl border-white/10 bg-white/[0.045] text-white hover:bg-white/[0.08]"
    >
      <Download className={`mr-2 size-4 ${isExporting ? "animate-bounce" : ""}`} />
      {isExporting ? "Exportando..." : "Exportar CSV"}
    </Button>
  );
}
