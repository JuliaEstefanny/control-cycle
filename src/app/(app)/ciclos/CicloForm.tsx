"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { dataHoje } from "@/lib/mob/cycle";

interface CicloFormProps {
  userId: string;
  temCicloAtivo: boolean;
}

export function CicloForm({ userId, temCicloAtivo }: CicloFormProps) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [dataInicial, setDataInicial] = useState(dataHoje());
  const [observacoes, setObservacoes] = useState("");
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (temCicloAtivo) {
      setErro("Você já tem um ciclo ativo. Encerre o ciclo atual antes de criar um novo.");
      return;
    }

    setCriando(true);
    const supabase = createClient();

    const { error } = await supabase.from("cycles").insert({
      user_id: userId,
      nome: nome || null,
      data_inicial: dataInicial,
      status: "ativo",
      observacoes_gerais: observacoes || null,
    });

    if (error) {
      setErro("Erro ao criar ciclo. Tente novamente.");
    } else {
      setNome("");
      setObservacoes("");
      router.refresh();
    }

    setCriando(false);
  }

  return (
    <form onSubmit={handleCriar} className="flex flex-col gap-4">
      {temCicloAtivo && (
        <p className="text-sm text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
          Você já tem um ciclo ativo. Encerre-o antes de criar um novo.
        </p>
      )}
      <Input
        label="Nome do ciclo (opcional)"
        placeholder="Ex: Ciclo 01, Após férias..."
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        disabled={temCicloAtivo}
      />
      <Input
        label="Data inicial"
        type="date"
        value={dataInicial}
        onChange={(e) => setDataInicial(e.target.value)}
        required
        disabled={temCicloAtivo}
      />
      <Textarea
        label="Observações gerais (opcional)"
        placeholder="Ex: após parar pílula, pós-parto..."
        value={observacoes}
        onChange={(e) => setObservacoes(e.target.value)}
        disabled={temCicloAtivo}
      />

      {erro && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{erro}</p>
      )}

      <Button type="submit" loading={criando} disabled={temCicloAtivo}>
        Criar ciclo
      </Button>
    </form>
  );
}
