"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  addMonths,
  subMonths,
  isAfter,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Note } from "@/types/db";

interface CalendarPickerProps {
  notas: Pick<Note, "id" | "data">[];
  cicloDataInicial: string;
}

export function CalendarPicker({ notas, cicloDataInicial }: CalendarPickerProps) {
  const router = useRouter();
  const today = new Date();
  const [mesAtual, setMesAtual] = useState(today);

  const notasPorData = new Map(notas.map((n) => [n.data, n.id]));
  const dataInicialCiclo = parseISO(cicloDataInicial);

  const inicioMes = startOfMonth(mesAtual);
  const fimMes = endOfMonth(mesAtual);
  const inicioGrid = startOfWeek(inicioMes, { weekStartsOn: 0 });
  const fimGrid = endOfWeek(fimMes, { weekStartsOn: 0 });
  const dias = eachDayOfInterval({ start: inicioGrid, end: fimGrid });

  function handleDiaClick(dia: Date) {
    const isoDate = format(dia, "yyyy-MM-dd");
    const notaId = notasPorData.get(isoDate);

    if (notaId) {
      router.push(`/anotacao/${notaId}/editar`);
    } else {
      router.push(`/anotacao/nova?data=${isoDate}`);
    }
  }

  const podeVoltar = isAfter(inicioMes, dataInicialCiclo);
  const podeAvancar = !isSameMonth(mesAtual, today);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      {/* Header do mês */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => podeVoltar && setMesAtual(subMonths(mesAtual, 1))}
          disabled={!podeVoltar}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>

        <h2 className="font-semibold text-gray-800 capitalize">
          {format(mesAtual, "MMMM yyyy", { locale: ptBR })}
        </h2>

        <button
          onClick={() => podeAvancar && setMesAtual(addMonths(mesAtual, 1))}
          disabled={!podeAvancar}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Cabeçalho dias da semana */}
      <div className="grid grid-cols-7 mb-1">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <div key={i} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-y-1">
        {dias.map((dia) => {
          const isoDate = format(dia, "yyyy-MM-dd");
          const doCiclo = isSameMonth(dia, mesAtual);
          const isHoje = isSameDay(dia, today);
          const temNota = notasPorData.has(isoDate);
          const isFuturo = isAfter(dia, today);
          const antesDoInicio = isAfter(dataInicialCiclo, dia);
          const desabilitado = !doCiclo || isFuturo || antesDoInicio;

          return (
            <button
              key={isoDate}
              onClick={() => !desabilitado && handleDiaClick(dia)}
              disabled={desabilitado}
              className={[
                "relative flex flex-col items-center justify-center h-10 w-full rounded-xl text-sm font-medium transition-colors",
                desabilitado
                  ? "text-gray-200 cursor-default"
                  : temNota
                  ? "text-white [background-color:#f43f5e] hover:[background-color:#e11d48]"
                  : isHoje
                  ? "bg-rose-50 text-rose-600 ring-1 ring-rose-300 hover:bg-rose-100"
                  : "text-gray-700 hover:bg-gray-100",
              ].join(" ")}
            >
              {format(dia, "d")}
              {temNota && doCiclo && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/70" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md [background-color:#f43f5e]" />
          <span>Anotado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-rose-50 ring-1 ring-rose-300" />
          <span>Hoje</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-gray-100" />
          <span>Disponível</span>
        </div>
      </div>
    </div>
  );
}
