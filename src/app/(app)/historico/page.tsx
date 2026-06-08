import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { formatarData, calcularDuracaoCiclo } from "@/lib/mob/cycle";
import { HistoricoActions } from "./HistoricoActions";
import type { Cycle } from "@/types/db";

interface CycleComContagem extends Cycle {
  notes: { count: number }[];
}

export default async function HistoricoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: ciclos } = await supabase
    .from("cycles")
    .select("*, notes(count)")
    .eq("user_id", user!.id)
    .order("data_inicial", { ascending: false })
    .returns<CycleComContagem[]>();

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Histórico</h1>
        <p className="text-gray-500 text-sm mt-0.5">Seus ciclos registrados</p>
      </div>

      {!ciclos || ciclos.length === 0 ? (
        <Card>
          <p className="text-gray-400 text-center py-8">Nenhum ciclo registrado ainda.</p>
          <div className="text-center">
            <Link href="/ciclos" className="text-rose-500 font-medium hover:underline text-sm">
              Criar primeiro ciclo
            </Link>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {ciclos.map((ciclo) => {
            const totalNotas = ciclo.notes?.[0]?.count ?? 0;
            const duracao = ciclo.data_final
              ? calcularDuracaoCiclo(ciclo.data_inicial, ciclo.data_final)
              : null;

            return (
              <Card key={ciclo.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">
                        {ciclo.nome ?? `Ciclo de ${formatarData(ciclo.data_inicial)}`}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        ciclo.status === "ativo"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {ciclo.status === "ativo" ? "Ativo" : ciclo.status === "encerrado" ? "Encerrado" : "Arquivado"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Início: {formatarData(ciclo.data_inicial)}
                      {ciclo.data_final && ` · Fim: ${formatarData(ciclo.data_final)}`}
                    </p>
                    <p className="text-sm text-gray-400">
                      {duracao ? `${duracao} dias` : "Em andamento"} · {totalNotas} anotações
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Link
                      href={`/grafico/${ciclo.id}`}
                      className="text-sm text-rose-500 font-medium hover:underline text-right"
                    >
                      Ver gráfico
                    </Link>
                    <HistoricoActions cicloId={ciclo.id} ciclo={ciclo} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
