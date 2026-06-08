import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { CancelarCompartilhamento } from "./CancelarCompartilhamento";

function dataSegura(valor: string | null | undefined): string {
  if (!valor) return "—";
  try {
    const [ano, mes, dia] = valor.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  } catch { return "—"; }
}

interface Props { params: Promise<{ recipientEmail: string }> }

export default async function GraficosEnviadosPage({ params }: Props) {
  const { recipientEmail: emailEncoded } = await params;
  const recipientEmail = decodeURIComponent(emailEncoded);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Perfil do destinatário via RPC (SECURITY DEFINER, contorna RLS de profiles)
  const { data: destinatarioRaw } = await supabase
    .rpc("get_perfis_por_email", { emails: [recipientEmail] });
  const destinatario = ((destinatarioRaw ?? []) as { id: string; nome: string; email: string }[])[0] ?? null;

  // Todos os compartilhamentos que enviei para esse email
  const { data: shares } = await supabase
    .from("cycle_shares")
    .select("id, cycle_id, status, created_at")
    .eq("owner_id", user.id)
    .eq("recipient_email", recipientEmail)
    .order("created_at", { ascending: false });

  if (!shares || shares.length === 0) notFound();

  // Busca dados dos ciclos
  const cycleIds = shares.map((s) => s.cycle_id);
  const { data: ciclos } = await supabase
    .from("cycles")
    .select("id, nome, data_inicial, data_final, status")
    .in("id", cycleIds);
  const cicloMap = new Map((ciclos ?? []).map((c) => [c.id, c]));

  const pendentes = shares.filter((s) => s.status === "pendente");
  const aceitos = shares.filter((s) => s.status === "aceito");

  const nomeDisplay = destinatario?.nome ?? recipientEmail;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Cabeçalho com voltar */}
      <div className="flex flex-col gap-3">
        <Link
          href="/compartilhamentos"
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors w-fit"
        >
          <ChevronLeft size={16} /> Compartilhamentos
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <span className="text-base font-bold text-rose-600">
              {nomeDisplay[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{nomeDisplay}</h1>
            <p className="text-sm text-gray-400">{recipientEmail}</p>
          </div>
        </div>
      </div>

      {/* Aguardando resposta */}
      {pendentes.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Aguardando resposta ({pendentes.length})
          </h2>
          {pendentes.map((share) => {
            const ciclo = cicloMap.get(share.cycle_id);
            return (
              <Card key={share.id}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <p className="font-medium text-gray-800 text-sm">
                      {ciclo?.nome ?? (ciclo?.data_inicial ? `Ciclo de ${dataSegura(ciclo.data_inicial)}` : "Ciclo")}
                    </p>
                    {ciclo?.data_inicial && (
                      <p className="text-xs text-gray-400">
                        Início: {dataSegura(ciclo.data_inicial)}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">Enviado em {dataSegura(share.created_at)}</p>
                  </div>
                  <CancelarCompartilhamento shareId={share.id} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Aceitos */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Gráficos aceitos ({aceitos.length})
        </h2>
        {aceitos.length === 0 ? (
          <Card>
            <p className="text-gray-400 text-center py-6 text-sm">
              Nenhum gráfico aceito ainda.
            </p>
          </Card>
        ) : (
          aceitos.map((share) => {
            const ciclo = cicloMap.get(share.cycle_id);
            return (
              <Card key={share.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <p className="font-medium text-gray-800 text-sm">
                      {ciclo?.nome ?? (ciclo?.data_inicial ? `Ciclo de ${dataSegura(ciclo.data_inicial)}` : "Ciclo")}
                    </p>
                    {ciclo?.data_inicial && (
                      <p className="text-xs text-gray-400">
                        Início: {dataSegura(ciclo.data_inicial)}
                        {ciclo.data_final && ` · Fim: ${dataSegura(ciclo.data_final)}`}
                      </p>
                    )}
                    <span className={`text-xs w-fit px-2 py-0.5 rounded-full font-medium mt-0.5 ${
                      ciclo?.status === "ativo" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {ciclo?.status === "ativo" ? "Ativo" : ciclo?.status === "encerrado" ? "Encerrado" : "Arquivado"}
                    </span>
                  </div>
                  <CancelarCompartilhamento shareId={share.id} label="Revogar" variante="perigo" />
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
