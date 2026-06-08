"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  shareId: string;
  label?: string;
  variante?: "normal" | "perigo";
}

export function CancelarCompartilhamento({ shareId, label = "Cancelar", variante = "normal" }: Props) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);

  async function handleCancelar() {
    setCarregando(true);
    const supabase = createClient();
    await supabase.from("cycle_shares").delete().eq("id", shareId);
    router.refresh();
    setCarregando(false);
  }

  const classe = variante === "perigo"
    ? "text-xs text-red-400 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
    : "text-xs text-gray-400 hover:text-gray-600 font-medium border border-gray-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50";

  return (
    <button onClick={handleCancelar} disabled={carregando} className={classe}>
      {carregando ? "..." : label}
    </button>
  );
}
