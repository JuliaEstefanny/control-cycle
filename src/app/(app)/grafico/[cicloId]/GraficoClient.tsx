"use client";

import { useState } from "react";
import { CycleChart } from "@/components/chart/CycleChart";
import { exportarCicloImagem } from "@/lib/image/exportCycleImage";
import { createClient } from "@/lib/supabase/client";
import type { Cycle, Note } from "@/types/db";

interface CompartilhamentoItem {
  id: string;
  recipient_email: string;
  status: string;
}

interface GraficoClientProps {
  ciclo: Cycle;
  notas: Note[];
  userId: string;
  compartilhamentosDesteCiclo: CompartilhamentoItem[];
  emailsSugeridos: string[];
}

function CompartilharModal({
  cicloId,
  compartilhamentos,
  emailsSugeridos,
  onClose,
  onAtualizar,
}: {
  cicloId: string;
  compartilhamentos: CompartilhamentoItem[];
  emailsSugeridos: string[];
  onClose: () => void;
  onAtualizar: (novo: CompartilhamentoItem) => void;
}) {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<{ texto: string; ok: boolean } | null>(null);

  const aceitos = compartilhamentos.filter((c) => c.status === "aceito");
  const pendentes = compartilhamentos.filter((c) => c.status === "pendente");

  async function handleCompartilhar(emailAlvo: string) {
    const emailFinal = emailAlvo.trim().toLowerCase();
    if (!emailFinal) return;
    setEnviando(true);
    setMensagem(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMensagem({ texto: "Não autenticado.", ok: false }); setEnviando(false); return; }

    const { data, error } = await supabase
      .from("cycle_shares")
      .upsert({
        cycle_id: cicloId,
        owner_id: user.id,
        recipient_email: emailFinal,
        status: "pendente",
      }, { onConflict: "cycle_id,recipient_email" })
      .select("id, recipient_email, status")
      .single();

    if (error) {
      setMensagem({ texto: "Erro ao compartilhar. Tente novamente.", ok: false });
    } else {
      setMensagem({ texto: `Solicitação enviada para ${emailFinal}.`, ok: true });
      setEmail("");
      if (data) onAtualizar(data);
    }
    setEnviando(false);
  }

  const sugestoesFiltradas = emailsSugeridos.filter(
    (e) => !compartilhamentos.some((c) => c.recipient_email === e)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm flex flex-col gap-5 shadow-xl">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Compartilhar gráfico</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            A pessoa receberá uma solicitação na tela de Compartilhamentos.
          </p>
        </div>

        {/* Quem já tem acesso */}
        {aceitos.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Com acesso</p>
            {aceitos.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                <span className="text-sm text-gray-700">{c.recipient_email}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pendentes */}
        {pendentes.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Aguardando resposta</p>
            {pendentes.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                <span className="text-sm text-gray-500">{c.recipient_email}</span>
              </div>
            ))}
          </div>
        )}

        {/* Sugestões de e-mails anteriores */}
        {sugestoesFiltradas.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Compartilhar com</p>
            {sugestoesFiltradas.map((e) => (
              <button
                key={e}
                onClick={() => handleCompartilhar(e)}
                disabled={enviando}
                className="flex items-center justify-between text-sm text-gray-700 hover:text-rose-600 hover:bg-rose-50 px-2 py-1.5 rounded-lg transition-colors text-left disabled:opacity-50"
              >
                <span>{e}</span>
                <span className="text-xs text-rose-400 font-medium shrink-0 ml-2">Enviar</span>
              </button>
            ))}
          </div>
        )}

        {/* Campo livre */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Novo e-mail</p>
          <form
            onSubmit={(e) => { e.preventDefault(); handleCompartilhar(email); }}
            className="flex gap-2"
          >
            <input
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200"
            />
            <button
              type="submit"
              disabled={enviando || !email.trim()}
              className="text-sm text-white bg-rose-500 hover:bg-rose-600 rounded-xl px-3 py-2 font-medium transition-colors disabled:opacity-50 shrink-0"
            >
              {enviando ? "..." : "Enviar"}
            </button>
          </form>
        </div>

        {mensagem && (
          <p className={`text-xs rounded-lg px-3 py-2 ${mensagem.ok ? "text-green-700 bg-green-50" : "text-red-500 bg-red-50"}`}>
            {mensagem.texto}
          </p>
        )}

        <button
          onClick={onClose}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors text-center"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

export function GraficoClient({
  ciclo,
  notas,
  userId: _userId,
  compartilhamentosDesteCiclo,
  emailsSugeridos,
}: GraficoClientProps) {
  const [exportandoImg, setExportandoImg] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [compartilhamentos, setCompartilhamentos] = useState<CompartilhamentoItem[]>(compartilhamentosDesteCiclo);

  function handleNovoCompartilhamento(novo: CompartilhamentoItem) {
    setCompartilhamentos((prev) => {
      const existe = prev.findIndex((c) => c.id === novo.id);
      if (existe >= 0) {
        const copia = [...prev];
        copia[existe] = novo;
        return copia;
      }
      return [...prev, novo];
    });
  }

  async function handleExportarImagem() {
    setExportandoImg(true);
    try { await exportarCicloImagem(ciclo, notas); }
    finally { setExportandoImg(false); }
  }

  const desabilitado = notas.length === 0;
  const totalAceitos = compartilhamentos.filter((c) => c.status === "aceito").length;

  return (
    <>
      {modalAberto && (
        <CompartilharModal
          cicloId={ciclo.id}
          compartilhamentos={compartilhamentos}
          emailsSugeridos={emailsSugeridos}
          onClose={() => setModalAberto(false)}
          onAtualizar={handleNovoCompartilhamento}
        />
      )}
      <div className="flex flex-col gap-4">
        <div className="flex justify-end gap-2 flex-wrap">
          <button
            onClick={() => setModalAberto(true)}
            disabled={desabilitado}
            className="text-sm text-gray-500 font-medium border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Compartilhar{totalAceitos > 0 ? ` · ${totalAceitos}` : ""}
          </button>
          <button
            onClick={handleExportarImagem}
            disabled={exportandoImg || desabilitado}
            className="text-sm text-rose-500 font-medium border border-rose-200 rounded-xl px-4 py-2 hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportandoImg ? "Gerando imagem..." : "Exportar imagem"}
          </button>
        </div>
        <div>
          <CycleChart ciclo={ciclo} notas={notas} />
        </div>
      </div>
    </>
  );
}
