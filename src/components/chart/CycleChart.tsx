"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { MobSymbol } from "./MobSymbol";
import { formatarData } from "@/lib/mob/cycle";
import { SENSACAO_OPTIONS, APARENCIA_OPTIONS } from "@/lib/mob/options";
import type { Note, Cycle } from "@/types/db";

interface CycleChartProps {
  ciclo: Cycle;
  notas: Note[];
  onExportarPDF?: () => void;
}

const LINHAS = [
  { key: "dia_ciclo", rotulo: "Dia" },
  { key: "data", rotulo: "Data" },
  { key: "simbolo", rotulo: "Símbolo" },
  { key: "relacao_sexual", rotulo: "Relação" },
  { key: "sensacao", rotulo: "Sensação" },
  { key: "aparencia", rotulo: "Aparência" },
  { key: "sangramento", rotulo: "Sangramento" },
  { key: "regra_mob", rotulo: "Regra MOB" },
  { key: "observacoes", rotulo: "Observações" },
] as const;

function labelSensacao(valor: string) {
  return SENSACAO_OPTIONS.find((o) => o.value === valor)?.label ?? valor;
}

function labelAparencia(valor: string) {
  return APARENCIA_OPTIONS.find((o) => o.value === valor)?.label ?? valor;
}

function CelulaConteudo({ chave, nota }: { chave: string; nota: Note }) {
  switch (chave) {
    case "dia_ciclo":
      return <span className="font-semibold text-rose-600">{nota.dia_ciclo}</span>;
    case "data":
      return <span className="text-xs">{formatarData(nota.data)}</span>;
    case "simbolo":
      return <MobSymbol simbolo={nota.simbolo_mob} size="sm" semRotulo />;
    case "regra_mob":
      return <span className="text-xs">{nota.regra_mob ?? "—"}</span>;
    case "sensacao":
      return (
        <span className="text-xs">
          {nota.sensacao === "outra" ? nota.sensacao_outra ?? "Outra" : labelSensacao(nota.sensacao)}
        </span>
      );
    case "aparencia":
      return (
        <span className="text-xs">
          {nota.aparencia === "outro" ? nota.aparencia_outra ?? "Outro" : labelAparencia(nota.aparencia)}
        </span>
      );
    case "relacao_sexual":
      return (
        <span className={`text-xs font-medium ${nota.relacao_sexual ? "text-rose-500" : "text-gray-300"}`}>
          {nota.relacao_sexual ? "Sim" : "Não"}
        </span>
      );
    case "sangramento":
      return (
        <span className={`text-xs ${nota.sangramento !== "nenhum" ? "text-red-500 font-medium" : "text-gray-300"}`}>
          {nota.sangramento === "nenhum" ? "—" : nota.sangramento}
        </span>
      );
    case "observacoes":
      return (
        <span className="text-xs text-gray-500 break-words max-w-[80px] line-clamp-2">
          {nota.observacoes ?? "—"}
        </span>
      );
    default:
      return <span>—</span>;
  }
}

export function CycleChart({ ciclo, notas, onExportarPDF }: CycleChartProps) {
  const tabelaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabelaRef.current) {
      tabelaRef.current.scrollLeft = tabelaRef.current.scrollWidth;
    }
  }, [notas]);

  if (notas.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Nenhuma anotação registrada neste ciclo ainda.</p>
        <Link href="/anotacao/calendario" className="text-rose-500 font-medium hover:underline mt-2 inline-block">
          Registrar primeira anotação
        </Link>
      </div>
    );
  }

  const notasOrdenadas = [...notas].sort((a, b) => a.dia_ciclo - b.dia_ciclo);

  return (
    <div className="flex flex-col gap-4">
      {onExportarPDF && (
        <div className="flex justify-end">
          <button
            onClick={onExportarPDF}
            className="text-sm text-rose-500 font-medium border border-rose-200 rounded-xl px-4 py-2 hover:bg-rose-50 transition-colors"
          >
            Exportar PDF
          </button>
        </div>
      )}

      <div ref={tabelaRef} className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="min-w-max">
          <table className="border-collapse">
            <tbody>
              {LINHAS.map(({ key, rotulo }) => (
                <tr key={key} className="border-b border-gray-100 last:border-0">
                  {/* Primeira coluna — rótulo (fixa) */}
                  <td className="sticky left-0 z-10 bg-gray-50 px-2 py-2 text-xs font-semibold text-gray-500 border-r border-gray-100 min-w-[72px] whitespace-nowrap">
                    {rotulo}
                  </td>

                  {/* Colunas dos dias */}
                  {notasOrdenadas.map((nota) => (
                    <td
                      key={nota.id}
                      className="px-1 py-2 text-center align-middle border-r border-gray-50 last:border-0 min-w-[56px] max-w-[72px]"
                    >
                      <div className="flex justify-center items-center">
                        <CelulaConteudo chave={key} nota={nota} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}

              {/* Linha de ação — editar */}
              <tr className="bg-gray-50">
                <td className="sticky left-0 z-10 bg-gray-50 px-2 py-2 text-xs font-semibold text-gray-500 border-r border-gray-100 min-w-[72px]">
                  Ação
                </td>
                {notasOrdenadas.map((nota) => (
                  <td key={nota.id} className="px-2 py-2 text-center">
                    <Link
                      href={`/anotacao/${nota.id}/editar`}
                      className="text-xs text-rose-400 hover:text-rose-600 hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

