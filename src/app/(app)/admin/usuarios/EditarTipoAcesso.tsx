"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  usuarioId: string;
  tipoAcesoAtual: string;
}

const TIPO_ACESSO_OPTIONS = [
  { value: "Usuario", label: "Usuária" },
  { value: "Adm", label: "Administrador(a)" },
];

export function EditarTipoAcesso({ usuarioId, tipoAcesoAtual }: Props) {
  const router = useRouter();
  const [tipoAcesso, setTipoAcesso] = useState(tipoAcesoAtual);
  const [atualizando, setAtualizando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const novoTipo = e.target.value;
    setTipoAcesso(novoTipo);
    setMensagem("");
    setAtualizando(true);

    const supabase = createClient();
    const { data, error } = await supabase.rpc("alterar_tipo_acesso", {
      usuario_id: usuarioId,
      novo_tipo: novoTipo,
    });

    if (error || data?.erro) {
      setTipoAcesso(tipoAcesoAtual);
      setMensagem("Erro ao alterar tipo de acesso.");
      setAtualizando(false);
      return;
    }

    setMensagem("✓ Atualizado");
    setAtualizando(false);
    router.refresh();
    setTimeout(() => setMensagem(""), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <select
          value={tipoAcesso}
          onChange={handleChange}
          disabled={atualizando}
          className={`appearance-none px-3 py-1.5 rounded-lg border text-sm font-medium cursor-pointer disabled:opacity-50 ${
            tipoAcesso === "Adm"
              ? "bg-purple-50 border-purple-200 text-purple-800"
              : "bg-gray-50 border-gray-200 text-gray-800"
          }`}
        >
          {TIPO_ACESSO_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
      </div>
      {mensagem && (
        <span className={`text-xs font-medium ${mensagem.startsWith("✓") ? "text-green-600" : "text-red-600"}`}>
          {mensagem}
        </span>
      )}
    </div>
  );
}
