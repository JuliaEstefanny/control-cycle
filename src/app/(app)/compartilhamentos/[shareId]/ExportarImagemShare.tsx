"use client";

import { useState } from "react";
import { exportarCicloImagem } from "@/lib/image/exportCycleImage";
import type { Cycle, Note } from "@/types/db";

interface Props {
  ciclo: Cycle;
  notas: Note[];
}

export function ExportarImagemShare({ ciclo, notas }: Props) {
  const [exportando, setExportando] = useState(false);

  async function handleExportar() {
    setExportando(true);
    try { await exportarCicloImagem(ciclo, notas); }
    finally { setExportando(false); }
  }

  return (
    <button
      onClick={handleExportar}
      disabled={exportando || notas.length === 0}
      className="text-sm text-rose-500 font-medium border border-rose-200 rounded-xl px-4 py-2 hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {exportando ? "Gerando imagem..." : "Exportar imagem"}
    </button>
  );
}
