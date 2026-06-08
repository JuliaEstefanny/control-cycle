"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { dataHoje } from "@/lib/mob/cycle";
import type { Cycle } from "@/types/db";

interface CicloActionsProps {
  ciclo: Cycle;
  temCicloAtivo: boolean;
}

export function CicloActions({ ciclo, temCicloAtivo }: CicloActionsProps) {
  const router = useRouter();

  async function handleEncerrar() {
    if (!confirm("Deseja encerrar este ciclo?")) return;
    const supabase = createClient();
    await supabase
      .from("cycles")
      .update({ status: "encerrado", data_final: dataHoje() })
      .eq("id", ciclo.id);
    router.refresh();
  }

  async function handleReabrir() {
    if (temCicloAtivo) {
      alert("Você já tem um ciclo ativo. Encerre o ciclo atual antes de reabrir este.");
      return;
    }
    if (!confirm("Deseja reabrir este ciclo?")) return;
    const supabase = createClient();
    await supabase
      .from("cycles")
      .update({ status: "ativo", data_final: null })
      .eq("id", ciclo.id);
    router.refresh();
  }

  async function handleExcluir() {
    if (!confirm("Excluir este ciclo e todas as anotações? Esta ação não pode ser desfeita.")) return;
    const supabase = createClient();
    await supabase.from("cycles").delete().eq("id", ciclo.id);
    router.refresh();
  }

  return (
    <div className="flex gap-3">
      {ciclo.status === "ativo" && (
        <button
          onClick={handleEncerrar}
          className="text-xs text-gray-400 hover:text-gray-600 hover:underline"
        >
          Encerrar
        </button>
      )}
      {ciclo.status === "encerrado" && (
        <button
          onClick={handleReabrir}
          className="text-xs text-blue-400 hover:text-blue-600 hover:underline"
        >
          Reabrir
        </button>
      )}
      <button
        onClick={handleExcluir}
        className="text-xs text-red-400 hover:text-red-600 hover:underline"
      >
        Excluir
      </button>
    </div>
  );
}
