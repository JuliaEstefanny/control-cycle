"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Cycle } from "@/types/db";

interface HistoricoActionsProps {
  cicloId: string;
  ciclo: Cycle;
}

export function HistoricoActions({ cicloId, ciclo }: HistoricoActionsProps) {
  const router = useRouter();

  async function handleExportarPDF() {
    const { exportarCicloPDF } = await import("@/lib/pdf/exportCycle");
    const supabase = createClient();
    const { data: notas } = await supabase
      .from("notes")
      .select("*")
      .eq("cycle_id", cicloId);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("nome")
      .eq("id", user!.id)
      .single();
    await exportarCicloPDF(ciclo, notas ?? [], { nome: profile?.nome ?? "" });
  }

  async function handleExcluir() {
    if (!confirm("Tem certeza que deseja excluir este ciclo? Todas as anotações serão removidas.")) return;
    const supabase = createClient();
    await supabase.from("cycles").delete().eq("id", cicloId);
    router.refresh();
  }

  return (
    <div className="flex gap-3 justify-end">
      <button
        onClick={handleExportarPDF}
        className="text-xs text-gray-500 hover:text-rose-500 hover:underline"
      >
        Exportar PDF
      </button>
      <button
        onClick={handleExcluir}
        className="text-xs text-red-400 hover:text-red-600 hover:underline"
      >
        Excluir
      </button>
    </div>
  );
}
