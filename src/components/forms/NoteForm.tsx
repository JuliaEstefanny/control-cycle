"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { noteSchema, type NoteFormValues } from "@/lib/validation/note";
import {
  SENSACAO_OPTIONS,
  APARENCIA_OPTIONS,
  SANGRAMENTO_OPTIONS,
  REGRA_MOB_OPTIONS,
  REGRA_MOB_DESCRICOES,
} from "@/lib/mob/options";
import { MOB_SYMBOLS } from "@/lib/mob/symbols";
import { calcularDiaCiclo, formatarData } from "@/lib/mob/cycle";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import type { Cycle, MobSymbol } from "@/types/db";

interface PBI {
  sensacao?: string | null;
  aparencia?: string | null;
  aparencia_outra?: string | null;
  simbolo_mob?: MobSymbol | null;
}

interface NoteFormProps {
  cicloId: string;
  userId: string;
  dataInicial: string;
  dataDefault: string;
  diaCicloDefault: number;
  todosOsCiclos: Cycle[];
  notaExistente?: Partial<NoteFormValues> & { id?: string };
  pbi?: PBI | null;
}

function encontrarCicloPorData(ciclos: Cycle[], data: string): Cycle | null {
  if (!data) return null;
  return (
    ciclos.find((c) => {
      if (data < c.data_inicial) return false;
      if (c.data_final && data > c.data_final) return false;
      if (!c.data_final && c.status !== "ativo") return false;
      return true;
    }) ?? null
  );
}

export function NoteForm({
  cicloId,
  userId,
  dataInicial,
  dataDefault,
  diaCicloDefault,
  todosOsCiclos,
  notaExistente,
  pbi,
}: NoteFormProps) {
  const router = useRouter();
  const [erroServidor, setErroServidor] = useState("");
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  async function handleExcluir() {
    if (!notaExistente?.id) return;
    setExcluindo(true);
    const supabase = createClient();
    const { error } = await supabase.from("notes").delete().eq("id", notaExistente.id);
    if (error) {
      setErroServidor("Erro ao excluir. Tente novamente.");
      setExcluindo(false);
      setConfirmandoExclusao(false);
      return;
    }
    router.push(`/grafico/${cicloId}`);
    router.refresh();
  }
  const [cicloParaData, setCicloParaData] = useState<Cycle | null>(
    encontrarCicloPorData(todosOsCiclos, dataDefault)
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      data: notaExistente?.data ?? dataDefault,
      dia_ciclo: notaExistente?.dia_ciclo ?? diaCicloDefault,
      sensacao: notaExistente?.sensacao ?? "",
      aparencia: notaExistente?.aparencia ?? "",
      relacao_sexual: notaExistente?.relacao_sexual ?? false,
      sangramento: notaExistente?.sangramento ?? "nenhum",
      simbolo_mob: notaExistente?.simbolo_mob ?? null,
      regra_mob: notaExistente?.regra_mob ?? null,
      observacoes: notaExistente?.observacoes ?? "",
    },
  });

  const registroData = register("data");

  function handleDataChange(e: React.ChangeEvent<HTMLInputElement>) {
    registroData.onChange(e);
    const novaData = e.target.value;
    const ciclo = encontrarCicloPorData(todosOsCiclos, novaData);
    setCicloParaData(ciclo);
    if (novaData && ciclo) {
      setValue("dia_ciclo", calcularDiaCiclo(ciclo.data_inicial, novaData));
    }
  }

  const sensacaoSelecionada = watch("sensacao");
  const aparenciaSelecionada = watch("aparencia");
  const relacaoSexual = watch("relacao_sexual");
  const simboloSelecionado = watch("simbolo_mob");
  const regraSelecionada = watch("regra_mob");

  function carregarPbi() {
    if (!pbi) return;
    if (pbi.sensacao) setValue("sensacao", pbi.sensacao);
    if (pbi.aparencia) {
      setValue("aparencia", pbi.aparencia);
      if (pbi.aparencia === "outro" && pbi.aparencia_outra) {
        setValue("aparencia_outra", pbi.aparencia_outra);
      }
    }
    setValue("simbolo_mob", pbi.simbolo_mob ?? null);
  }

  async function onSubmit(valores: NoteFormValues) {
    setErroServidor("");

    if (!valores.simbolo_mob) {
      setErroServidor("Selecione um símbolo / selo MOB para salvar a anotação.");
      return;
    }

    const ciclo = encontrarCicloPorData(todosOsCiclos, valores.data);

    if (!ciclo) {
      setErroServidor("A data selecionada não pertence a nenhum ciclo. Não é possível salvar esta anotação.");
      return;
    }

    if (ciclo.status !== "ativo") {
      setErroServidor(
        `Esta data pertence ao ciclo "${ciclo.nome ?? formatarData(ciclo.data_inicial)}" que está encerrado. Reabra o ciclo em Meus Ciclos para fazer esta anotação.`
      );
      return;
    }

    const supabase = createClient();

    const payload = {
      ...valores,
      cycle_id: ciclo.id,
      user_id: userId,
      simbolo_mob: valores.simbolo_mob ?? null,
      regra_mob: valores.regra_mob ?? null,
    };

    let error;

    if (notaExistente?.id) {
      ({ error } = await supabase
        .from("notes")
        .update(payload)
        .eq("id", notaExistente.id));
    } else {
      ({ error } = await supabase.from("notes").insert(payload));
    }

    if (error) {
      if (error.code === "23505") {
        setErroServidor("Já existe uma anotação registrada para esta data.");
      } else {
        setErroServidor("Erro ao salvar. Tente novamente.");
      }
      return;
    }

    router.push(`/grafico/${ciclo.id}`);
    router.refresh();
  }

  const cicloAtualParaExibir = cicloParaData;

  const labelPbiSensacao = pbi?.sensacao
    ? SENSACAO_OPTIONS.find((o) => o.value === pbi.sensacao)?.label ?? pbi.sensacao
    : null;
  const labelPbiAparencia = pbi?.aparencia
    ? pbi.aparencia === "outro"
      ? `Outro${pbi.aparencia_outra ? ` · ${pbi.aparencia_outra}` : ""}`
      : APARENCIA_OPTIONS.find((o) => o.value === pbi.aparencia)?.label ?? pbi.aparencia
    : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Info do ciclo relacionado à data */}
      {cicloAtualParaExibir ? (
        <div className={`rounded-xl px-4 py-3 text-sm ${
          cicloAtualParaExibir.status === "ativo"
            ? "bg-green-50 border border-green-200"
            : "bg-amber-50 border border-amber-200"
        }`}>
          <p className={`font-medium ${cicloAtualParaExibir.status === "ativo" ? "text-green-700" : "text-amber-700"}`}>
            {cicloAtualParaExibir.status === "ativo" ? "Ciclo atual" : "Ciclo encerrado"}
            {cicloAtualParaExibir.nome ? ` · ${cicloAtualParaExibir.nome}` : ""}
          </p>
          <p className={`text-xs mt-0.5 ${cicloAtualParaExibir.status === "ativo" ? "text-green-600" : "text-amber-600"}`}>
            {cicloAtualParaExibir.status === "ativo"
              ? `Iniciado em ${formatarData(cicloAtualParaExibir.data_inicial)} · em andamento`
              : `${formatarData(cicloAtualParaExibir.data_inicial)} → ${formatarData(cicloAtualParaExibir.data_final!)}`
            }
          </p>
          {cicloAtualParaExibir.status !== "ativo" && (
            <p className="text-xs text-amber-600 mt-1 font-medium">
              Para anotar neste ciclo, reabra-o em Meus Ciclos.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-xl px-4 py-3 text-sm bg-red-50 border border-red-200">
          <p className="font-medium text-red-700">Sem ciclo para esta data</p>
          <p className="text-xs text-red-600 mt-0.5">
            A data selecionada não pertence a nenhum ciclo registrado.
          </p>
        </div>
      )}

      {/* Dia e data */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Dia do ciclo</label>
          <div className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-600">
            {watch("dia_ciclo")}
          </div>
        </div>
        <Input
          label="Data"
          type="date"
          {...registroData}
          onChange={handleDataChange}
          error={errors.data?.message}
        />
      </div>

      {/* Botão PBI */}
      {pbi && (pbi.sensacao || pbi.aparencia || pbi.simbolo_mob) && (
        <button
          type="button"
          onClick={carregarPbi}
          className="w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-sm font-medium text-rose-600 hover:bg-rose-100 transition-colors text-left px-4"
        >
          Usar Meu PBI
          <span className="ml-2 text-xs text-rose-400 font-normal">
            {[labelPbiSensacao, labelPbiAparencia, pbi.simbolo_mob].filter(Boolean).join(" · ")}
          </span>
        </button>
      )}

      {/* Sensação — obrigatório */}
      <div className="flex flex-col gap-2">
        <Select
          label="O que eu sinto?"
          options={SENSACAO_OPTIONS as unknown as { value: string; label: string }[]}
          placeholder="Selecione a sensação"
          {...register("sensacao")}
          error={errors.sensacao?.message}
        />
        <p className="text-xs text-gray-400">
          Descreva a sensação percebida na vulva durante as atividades normais do dia.
        </p>
        {sensacaoSelecionada === "outra" && (
          <Input
            placeholder="Descreva a sensação"
            {...register("sensacao_outra")}
          />
        )}
      </div>

      {/* Aparência — obrigatório */}
      <div className="flex flex-col gap-2">
        <Select
          label="O que eu vejo?"
          options={APARENCIA_OPTIONS as unknown as { value: string; label: string }[]}
          placeholder="Selecione a aparência"
          {...register("aparencia")}
          error={errors.aparencia?.message}
        />
        <p className="text-xs text-gray-400">
          Descreva o que foi visto na roupa íntima ou no papel ao se limpar.
        </p>
        {aparenciaSelecionada === "outro" && (
          <Input
            placeholder="Descreva a aparência"
            {...register("aparencia_outra")}
          />
        )}
      </div>

      {/* Sangramento */}
      <Select
        label="Sangramento"
        options={SANGRAMENTO_OPTIONS as unknown as { value: string; label: string }[]}
        {...register("sangramento")}
        error={errors.sangramento?.message}
      />

      {/* Relação sexual */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Relação sexual</label>
        <div className="flex gap-3">
          {["Não", "Sim"].map((opcao) => {
            const val = opcao === "Sim";
            return (
              <button
                key={opcao}
                type="button"
                onClick={() => setValue("relacao_sexual", val)}
                className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-colors ${
                  relacaoSexual === val
                    ? "bg-rose-500 text-white border-rose-500"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {opcao}
              </button>
            );
          })}
        </div>
        {relacaoSexual && (
          <Select
            options={[
              { value: "noite", label: "À noite" },
              { value: "dia", label: "Durante o dia" },
            ]}
            placeholder="Período (opcional)"
            {...register("relacao_periodo")}
          />
        )}
      </div>

      {/* Símbolo MOB */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Símbolo / Selo MOB</label>
        <div className="grid grid-cols-5 gap-2">
          {MOB_SYMBOLS.map((s) => (
            <button
              key={s.valor}
              type="button"
              title={s.descricao}
              onClick={() =>
                setValue("simbolo_mob", simboloSelecionado === s.valor ? null : (s.valor as MobSymbol))
              }
              className={`aspect-square rounded-xl border-2 text-sm font-bold transition-all ${
                simboloSelecionado === s.valor ? "border-gray-800 scale-110 shadow" : "border-transparent"
              }`}
              style={{ backgroundColor: s.cor, color: s.corTexto }}
            >
              {s.valor === "manchas" ? (
                <div className="flex gap-0.5 items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                </div>
              ) : (
                s.rotulo
              )}
            </button>
          ))}
        </div>
        {simboloSelecionado && (
          <p className="text-xs text-gray-400">
            {MOB_SYMBOLS.find((s) => s.valor === simboloSelecionado)?.descricao}
          </p>
        )}
      </div>

      {/* Regra MOB */}
      <div className="flex flex-col gap-2">
        <Select
          label="Regra MOB (opcional)"
          options={REGRA_MOB_OPTIONS as unknown as { value: string; label: string }[]}
          placeholder="Não informar"
          {...register("regra_mob")}
          onChange={(e) => setValue("regra_mob", (e.target.value as NoteFormValues["regra_mob"]) || null)}
        />
        {regraSelecionada && REGRA_MOB_DESCRICOES[regraSelecionada] && (
          <p className="text-xs text-gray-400">
            {REGRA_MOB_DESCRICOES[regraSelecionada]}
          </p>
        )}
      </div>

      {/* Observações */}
      <Textarea
        label="Observações livres (opcional)"
        placeholder="Ex: dor de ovulação, cólicas, estresse, dúvida sobre o muco..."
        {...register("observacoes")}
      />

      {erroServidor && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{erroServidor}</p>
      )}

      <div className="flex flex-col gap-2">
        <Button type="submit" loading={isSubmitting} size="lg" className="w-full">
          Salvar anotação
        </Button>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>

        {notaExistente?.id && (
          <div className="mt-2 pt-4 border-t border-gray-100">
            {!confirmandoExclusao ? (
              <button
                type="button"
                onClick={() => setConfirmandoExclusao(true)}
                className="w-full py-2.5 rounded-xl border border-red-200 text-sm font-medium text-red-400 hover:bg-red-50 transition-colors"
              >
                Excluir anotação
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-center text-gray-600">
                  Tem certeza? Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmandoExclusao(false)}
                    disabled={excluindo}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleExcluir}
                    disabled={excluindo}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {excluindo ? "Excluindo…" : "Confirmar exclusão"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
