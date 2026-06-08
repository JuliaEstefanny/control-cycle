import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { AcoesPendente } from "../../AcoesPendente";

function dataSegura(valor: string | null | undefined): string {
  if (!valor) return "—";
  try {
    const [ano, mes, dia] = valor.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  } catch { return "—"; }
}

interface ShareComCiclo {
  id: string;
  cycle_id: string;
  owner_id: string;
  status: string;
  created_at: string;
  cycles: { id: string; nome: string | null; data_inicial: string; data_final: string | null; status: string } | null;
}

interface Props { params: Promise<{ ownerId: string }> }

export default async function GraficosRecebidasPage({ params }: Props) {
  const { ownerId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: meuPerfil } = await supabase
    .from("profiles").select("email").eq("id", user.id).single();
  const meuEmail = meuPerfil?.email ?? "";

  // Busca perfil do remetente via RPC (SECURITY DEFINER)
  const { data: perfisRemetente } = await supabase
    .rpc("get_perfis_publicos", { ids: [ownerId] });
  const perfisArr = (perfisRemetente ?? []) as { id: string; nome: string; email: string }[];
  const dono = perfisArr[0] ?? null;

  // Busca todos os shares recebidos com join nos ciclos, filtra por owner em memória
  const { data: todosShares } = await supabase
    .from("cycle_shares")
    .select("id, cycle_id, owner_id, status, created_at, cycles(id, nome, data_inicial, data_final, status)")
    .eq("recipient_email", meuEmail)
    .order("created_at", { ascending: false })
    .returns<ShareComCiclo[]>();

  const shares = (todosShares ?? []).filter((s) => s.owner_id === ownerId);

  if (shares.length === 0 && !dono) notFound();

  const donoNome = dono?.nome ?? "Usuária";
  const donoEmail = dono?.email ?? "";

  const pendentes = shares.filter((s) => s.status === "pendente");
  const aceitos = shares.filter((s) => s.status === "aceito");

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
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
              {donoNome[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{donoNome}</h1>
            {donoEmail && <p className="text-sm text-gray-400">{donoEmail}</p>}
          </div>
        </div>
      </div>

      {/* Solicitações pendentes */}
      {pendentes.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Aguardando sua resposta ({pendentes.length})
          </h2>
          {pendentes.map((share) => (
            <Card key={share.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm text-gray-700 font-medium">
                    {share.cycles?.nome ?? (share.cycles?.data_inicial
                      ? `Ciclo de ${dataSegura(share.cycles.data_inicial)}`
                      : "Ciclo compartilhado")}
                  </p>
                  <p className="text-xs text-gray-400">Enviado em {dataSegura(share.created_at)}</p>
                </div>
                <AcoesPendente shareId={share.id} recipientEmail={meuEmail} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Gráficos aceitos */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Gráficos compartilhados ({aceitos.length})
        </h2>
        {aceitos.length === 0 ? (
          <Card>
            <p className="text-gray-400 text-center py-6 text-sm">
              Nenhum gráfico aceito ainda.
            </p>
          </Card>
        ) : (
          aceitos.map((share) => {
            const ciclo = share.cycles;
            return (
              <Link key={share.id} href={`/compartilhamentos/${share.id}`}>
                <Card>
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
                    <span className="text-gray-300 text-lg shrink-0">›</span>
                  </div>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
