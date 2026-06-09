"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { OBJETIVO_OPTIONS, SENSACAO_OPTIONS, APARENCIA_OPTIONS } from "@/lib/mob/options";
import { MOB_SYMBOLS } from "@/lib/mob/symbols";
import type { Profile, MobSymbol, TipoUsuario } from "@/types/db";

const TIPO_USUARIO_OPTIONS = [
  { value: "aluna", label: "Aluna" },
  { value: "instrutora", label: "Instrutor(a)" },
  { value: "convidada", label: "Convidado(a)" },
];

function SecaoColapsavel({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: React.ReactNode }) {
  const [aberto, setAberto] = useState(false);
  return (
    <Card>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <p className="text-sm font-semibold text-gray-700">{titulo}</p>
          {subtitulo && <p className="text-xs text-gray-400 mt-0.5">{subtitulo}</p>}
        </div>
        {aberto ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
      </button>
      {aberto && <div className="mt-4 flex flex-col gap-4">{children}</div>}
    </Card>
  );
}

interface PerfilFormProps {
  profile: Profile | null;
  userId: string;
}

interface PBI {
  sensacao: string;
  aparencia: string;
  aparencia_outra?: string | null;
  simbolo_mob: MobSymbol | null;
}

export function PerfilForm({ profile, userId }: PerfilFormProps) {
  const router = useRouter();
  const [nome, setNome] = useState(profile?.nome ?? "");
  const [objetivo, setObjetivo] = useState(profile?.objetivo ?? "");
  const [dataNascimento, setDataNascimento] = useState(profile?.data_nascimento ?? "");
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario | "">(profile?.tipo_usuario ?? "");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [mensagemSenha, setMensagemSenha] = useState("");

  const pbiSalvo = (profile?.preferencias as Record<string, unknown>)?.pbi as PBI | undefined;
  const [pbiSensacao, setPbiSensacao] = useState(pbiSalvo?.sensacao ?? "");
  const [pbiAparencia, setPbiAparencia] = useState(pbiSalvo?.aparencia ?? "");
  const [pbiAparenciaOutra, setPbiAparenciaOutra] = useState(pbiSalvo?.aparencia_outra ?? "");
  const [pbiSimbolo, setPbiSimbolo] = useState<MobSymbol | null>(pbiSalvo?.simbolo_mob ?? null);
  const [salvandoPbi, setSalvandoPbi] = useState(false);
  const [mensagemPbi, setMensagemPbi] = useState("");

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!tipoUsuario) {
      setMensagem("Selecione o tipo de usuária.");
      return;
    }
    setSalvando(true);
    setMensagem("");

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        nome,
        objetivo: objetivo || null,
        data_nascimento: dataNascimento || null,
        tipo_usuario: tipoUsuario,
      })
      .eq("id", userId);

    if (error) {
      setMensagem("Erro ao salvar. Tente novamente.");
    } else {
      setMensagem("Perfil salvo com sucesso!");
      router.refresh();
    }

    setSalvando(false);
  }

  async function handleSalvarPbi(e: React.FormEvent) {
    e.preventDefault();
    if (pbiAparencia === "outro" && !pbiAparenciaOutra.trim()) {
      setMensagemPbi("Preencha a descrição para a opção 'Outro'.");
      return;
    }
    setSalvandoPbi(true);
    setMensagemPbi("");

    const prefsAtuais = (profile?.preferencias as Record<string, unknown>) ?? {};
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        preferencias: {
          ...prefsAtuais,
          pbi: {
            sensacao: pbiSensacao || null,
            aparencia: pbiAparencia || null,
            aparencia_outra: pbiAparencia === "outro" ? (pbiAparenciaOutra || null) : null,
            simbolo_mob: pbiSimbolo,
          },
        },
      })
      .eq("id", userId);

    if (error) {
      setMensagemPbi("Erro ao salvar. Tente novamente.");
    } else {
      setMensagemPbi("PBI salvo com sucesso!");
      router.refresh();
    }
    setSalvandoPbi(false);
  }

  async function handleAlterarSenha(e: React.FormEvent) {
    e.preventDefault();
    setMensagemSenha("");

    if (novaSenha.length < 6) {
      setMensagemSenha("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setMensagemSenha("As senhas não coincidem.");
      return;
    }

    setSalvandoSenha(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: novaSenha });

    if (error) {
      setMensagemSenha("Erro ao alterar senha. Tente novamente.");
    } else {
      setMensagemSenha("Senha alterada com sucesso!");
      setNovaSenha("");
      setConfirmarSenha("");
    }
    setSalvandoSenha(false);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="flex flex-col gap-4">
      <SecaoColapsavel titulo="Dados pessoais">
        <form onSubmit={handleSalvar} className="flex flex-col gap-4">
          <Input
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
            required
          />
          <Input
            label="E-mail"
            value={profile?.email ?? ""}
            disabled
            className="bg-gray-50 text-gray-400"
          />
          <Select
            label="Tipo de usuária"
            options={TIPO_USUARIO_OPTIONS}
            value={tipoUsuario}
            onChange={(e) => setTipoUsuario(e.target.value as TipoUsuario)}
            placeholder="Selecione o tipo"
            required
          />
          <Select
            label="Objetivo (opcional)"
            options={OBJETIVO_OPTIONS as unknown as { value: string; label: string }[]}
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
            placeholder="Selecione um objetivo"
          />
          <Input
            label="Data de nascimento (opcional)"
            type="date"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
          />

          {mensagem && (
            <p className={`text-sm rounded-xl px-3 py-2 ${
              mensagem.includes("sucesso") ? "text-green-700 bg-green-50" : "text-red-500 bg-red-50"
            }`}>
              {mensagem}
            </p>
          )}

          <Button type="submit" loading={salvando}>
            Salvar alterações
          </Button>
        </form>
      </SecaoColapsavel>

      <SecaoColapsavel
        titulo="Meu PBI"
        subtitulo="Padrão Básico de Infertilidade — seus sinais típicos de dias inférteis."
      >
        <form onSubmit={handleSalvarPbi} className="flex flex-col gap-4">
          <Select
            label="O que eu sinto (PBI)"
            options={SENSACAO_OPTIONS as unknown as { value: string; label: string }[]}
            value={pbiSensacao}
            onChange={(e) => setPbiSensacao(e.target.value)}
            placeholder="Selecione a sensação"
          />

          <div className="flex flex-col gap-2">
            <Select
              label="O que eu vejo (PBI)"
              options={APARENCIA_OPTIONS as unknown as { value: string; label: string }[]}
              value={pbiAparencia}
              onChange={(e) => { setPbiAparencia(e.target.value); if (e.target.value !== "outro") setPbiAparenciaOutra(""); }}
              placeholder="Selecione a aparência"
            />
            {pbiAparencia === "outro" && (
              <div className="flex flex-col gap-1">
                <Input
                  placeholder="Descrição (obrigatório)"
                  value={pbiAparenciaOutra}
                  maxLength={15}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
                    setPbiAparenciaOutra(val);
                  }}
                />
                <div className="flex justify-between">
                  <p className="text-xs text-gray-400">Somente letras, máx. 15 caracteres.</p>
                  <p className="text-xs text-gray-400">{pbiAparenciaOutra.length}/15</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Símbolo (PBI)</label>
            <div className="grid grid-cols-5 gap-2">
              {MOB_SYMBOLS.map((s) => (
                <button
                  key={s.valor}
                  type="button"
                  title={s.descricao}
                  onClick={() => setPbiSimbolo(pbiSimbolo === s.valor ? null : (s.valor as MobSymbol))}
                  className={`aspect-square rounded-xl border-2 text-xs font-bold transition-all ${
                    pbiSimbolo === s.valor ? "border-gray-800 scale-110 shadow" : "border-transparent"
                  }`}
                  style={{ backgroundColor: s.cor, color: s.corTexto }}
                >
                  {s.valor === "manchas" ? (
                    <div className="flex gap-0.5 items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-black" />
                      <div className="w-1 h-1 rounded-full bg-black" />
                      <div className="w-1 h-1 rounded-full bg-black" />
                    </div>
                  ) : (
                    s.rotulo
                  )}
                </button>
              ))}
            </div>
          </div>

          {mensagemPbi && (
            <p className={`text-sm rounded-xl px-3 py-2 ${
              mensagemPbi.includes("sucesso") ? "text-green-700 bg-green-50" : "text-red-500 bg-red-50"
            }`}>
              {mensagemPbi}
            </p>
          )}

          <Button type="submit" loading={salvandoPbi}>
            Salvar PBI
          </Button>
        </form>
      </SecaoColapsavel>

      <SecaoColapsavel titulo="Alterar senha">
        <form onSubmit={handleAlterarSenha} className="flex flex-col gap-4">
          <Input
            label="Nova senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            placeholder="Repita a senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
          />

          {mensagemSenha && (
            <p className={`text-sm rounded-xl px-3 py-2 ${
              mensagemSenha.includes("sucesso") ? "text-green-700 bg-green-50" : "text-red-500 bg-red-50"
            }`}>
              {mensagemSenha}
            </p>
          )}

          <Button type="submit" loading={salvandoSenha}>
            Alterar senha
          </Button>
        </form>
      </SecaoColapsavel>

      <Card>
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-700">Conta</h3>
          <button
            onClick={handleLogout}
            className="text-sm text-red-400 hover:text-red-600 hover:underline text-left"
          >
            Sair da conta
          </button>
        </div>
      </Card>
    </div>
  );
}
