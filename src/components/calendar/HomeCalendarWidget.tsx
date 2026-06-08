"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X, Edit2, Plus } from "lucide-react";
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
import type { Note, MobSymbol } from "@/types/db";
import { SENSACAO_OPTIONS, APARENCIA_OPTIONS } from "@/lib/mob/options";
import { getSymbolConfig } from "@/lib/mob/symbols";

interface HomeCalendarWidgetProps {
  notas: Note[];
  cicloDataInicial: string;
}

function labelSensacao(valor: string) {
  return SENSACAO_OPTIONS.find((o) => o.value === valor)?.label ?? valor;
}
function labelAparencia(valor: string) {
  return APARENCIA_OPTIONS.find((o) => o.value === valor)?.label ?? valor;
}

function SymbolBadge({ simbolo }: { simbolo: MobSymbol | null }) {
  if (!simbolo) return null;
  const cfg = getSymbolConfig(simbolo);
  if (!cfg) return null;
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-md shrink-0"
      style={{ backgroundColor: cfg.cor, color: cfg.corTexto }}
    >
      {simbolo === "manchas" && (
        <span className="flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-current" />
          <span className="w-1 h-1 rounded-full bg-current" />
          <span className="w-1 h-1 rounded-full bg-current" />
        </span>
      )}
    </span>
  );
}

export function HomeCalendarWidget({ notas, cicloDataInicial }: HomeCalendarWidgetProps) {
  const router = useRouter();
  const today = new Date();
  const [aberto, setAberto] = useState(false);
  const [mesAtual, setMesAtual] = useState(today);
  const [notaSelecionada, setNotaSelecionada] = useState<Note | null>(null);
  const [diaSemNota, setDiaSemNota] = useState<string | null>(null);

  const notasPorData = new Map(notas.map((n) => [n.data, n]));
  const dataInicialCiclo = parseISO(cicloDataInicial);

  const inicioMes = startOfMonth(mesAtual);
  const fimMes = endOfMonth(mesAtual);
  const dias = eachDayOfInterval({
    start: startOfWeek(inicioMes, { weekStartsOn: 0 }),
    end: endOfWeek(fimMes, { weekStartsOn: 0 }),
  });

  function handleDia(dia: Date) {
    const iso = format(dia, "yyyy-MM-dd");
    const nota = notasPorData.get(iso);
    if (nota) {
      setDiaSemNota(null);
      setNotaSelecionada(nota);
    } else {
      setNotaSelecionada(null);
      setDiaSemNota(iso);
    }
  }

  function toggleAberto() {
    setAberto((v) => !v);
    if (aberto) {
      setNotaSelecionada(null);
      setDiaSemNota(null);
    }
  }

  const podeVoltar = isAfter(inicioMes, dataInicialCiclo);
  const podeAvancar = !isSameMonth(mesAtual, today);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* Cabeçalho clicável para expandir/recolher */}
      <button
        onClick={toggleAberto}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-gray-700 capitalize">
          {format(mesAtual, "MMMM yyyy", { locale: ptBR })}
        </span>
        {aberto ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>

      {aberto && (
        <div className="px-4 pb-4">
          {/* Navegação de mês */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => podeVoltar && setMesAtual(subMonths(mesAtual, 1))}
              disabled={!podeVoltar}
              className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} className="text-gray-500" />
            </button>
            <span className="text-xs text-gray-500 capitalize">
              {format(mesAtual, "MMMM yyyy", { locale: ptBR })}
            </span>
            <button
              onClick={() => podeAvancar && setMesAtual(addMonths(mesAtual, 1))}
              disabled={!podeAvancar}
              className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Dias da semana */}
          <div className="grid grid-cols-7 mb-1">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
              <div key={i} className="text-center text-[10px] font-medium text-gray-400">{d}</div>
            ))}
          </div>

          {/* Grid de dias */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {dias.map((dia) => {
              const iso = format(dia, "yyyy-MM-dd");
              const doCiclo = isSameMonth(dia, mesAtual);
              const isHoje = isSameDay(dia, today);
              const temNota = notasPorData.has(iso);
              const isFuturo = isAfter(dia, today);
              const antesDoInicio = isAfter(dataInicialCiclo, dia);
              const desabilitado = !doCiclo || isFuturo || antesDoInicio;
              const selecionado = notaSelecionada?.data === iso || diaSemNota === iso;

              return (
                <button
                  key={iso}
                  onClick={() => !desabilitado && handleDia(dia)}
                  disabled={desabilitado}
                  className={[
                    "relative flex items-center justify-center h-8 w-full rounded-lg text-xs font-medium transition-colors",
                    desabilitado ? "text-gray-200 cursor-default" : "",
                    !desabilitado && selecionado ? "ring-2 ring-rose-400" : "",
                    !desabilitado && temNota
                      ? "text-white [background-color:#f43f5e] hover:[background-color:#e11d48]"
                      : !desabilitado && isHoje
                      ? "bg-rose-50 text-rose-600 ring-1 ring-rose-300 hover:bg-rose-100"
                      : !desabilitado
                      ? "text-gray-700 hover:bg-gray-100"
                      : "",
                  ].join(" ")}
                >
                  {format(dia, "d")}
                </button>
              );
            })}
          </div>

          {/* Pop-up — dia com nota */}
          {notaSelecionada && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <SymbolBadge simbolo={notaSelecionada.simbolo_mob} />
                  <span className="text-sm font-semibold text-gray-800">
                    {format(parseISO(notaSelecionada.data), "dd/MM/yyyy")}
                    <span className="text-gray-400 font-normal ml-1">· Dia {notaSelecionada.dia_ciclo}</span>
                  </span>
                </div>
                <button
                  onClick={() => setNotaSelecionada(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <p className="text-gray-400">Sensação</p>
                  <p className="text-gray-700 font-medium">
                    {notaSelecionada.sensacao === "outra"
                      ? notaSelecionada.sensacao_outra ?? "Outra"
                      : labelSensacao(notaSelecionada.sensacao)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Aparência</p>
                  <p className="text-gray-700 font-medium">
                    {notaSelecionada.aparencia === "outro"
                      ? notaSelecionada.aparencia_outra ?? "Outro"
                      : labelAparencia(notaSelecionada.aparencia)}
                  </p>
                </div>
                {notaSelecionada.sangramento !== "nenhum" && (
                  <div>
                    <p className="text-gray-400">Sangramento</p>
                    <p className="text-red-500 font-medium capitalize">{notaSelecionada.sangramento}</p>
                  </div>
                )}
                {notaSelecionada.relacao_sexual && (
                  <div>
                    <p className="text-gray-400">Relação</p>
                    <p className="text-gray-700 font-medium">
                      Sim{notaSelecionada.relacao_periodo ? ` · ${notaSelecionada.relacao_periodo}` : ""}
                    </p>
                  </div>
                )}
                {notaSelecionada.regra_mob && notaSelecionada.regra_mob !== "Não se aplica" && (
                  <div className="col-span-2">
                    <p className="text-gray-400">Regra MOB</p>
                    <p className="text-gray-700 font-medium">{notaSelecionada.regra_mob}</p>
                  </div>
                )}
                {notaSelecionada.observacoes && (
                  <div className="col-span-2">
                    <p className="text-gray-400">Observações</p>
                    <p className="text-gray-700">{notaSelecionada.observacoes}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push(`/anotacao/${notaSelecionada.id}/editar`)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-rose-500 font-medium border border-rose-200 rounded-xl py-2 hover:bg-rose-50 transition-colors"
              >
                <Edit2 size={12} />
                Editar anotação
              </button>
            </div>
          )}

          {/* Pop-up — dia sem nota */}
          {diaSemNota && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-800">
                  {format(parseISO(diaSemNota), "dd/MM/yyyy")}
                  <span className="text-gray-400 font-normal ml-1">· Sem registro</span>
                </span>
                <button
                  onClick={() => setDiaSemNota(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <button
                onClick={() => router.push(`/anotacao/nova?data=${diaSemNota}`)}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-white font-medium rounded-xl py-2 transition-colors [background-color:#f43f5e] hover:[background-color:#e11d48]"
              >
                <Plus size={12} />
                Registrar este dia
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
