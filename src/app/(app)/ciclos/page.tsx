import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { formatarData } from "@/lib/mob/cycle";
import { CicloForm } from "./CicloForm";
import { CicloActions } from "./CicloActions";
import type { Cycle } from "@/types/db";

interface CycleComContagem extends Cycle {
  notes: { count: number }[];
}

export default async function CiclosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: ciclos } = await supabase
    .from("cycles")
    .select("*, notes(count)")
    .eq("user_id", user!.id)
    .order("data_inicial", { ascending: false })
    .returns<CycleComContagem[]>();

  const cicloAtivo = ciclos?.find((c) => c.status === "ativo");

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Meus Ciclos</h1>
        <p className="text-gray-500 text-sm mt-0.5">Gerencie seus ciclos</p>
      </div>

      {/* Formulário novo ciclo */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Novo ciclo</h2>
        <CicloForm
          userId={user!.id}
          temCicloAtivo={!!cicloAtivo}
        />
      </Card>

      {/* Lista de ciclos */}
      {ciclos && ciclos.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Ciclos registrados
          </h2>
          {ciclos.map((ciclo) => {
            const totalNotas = ciclo.notes?.[0]?.count ?? 0;
            return (
              <Card key={ciclo.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-800">
                        {ciclo.nome ?? `Ciclo de ${formatarData(ciclo.data_inicial)}`}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        ciclo.status === "ativo"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {ciclo.status === "ativo" ? "Ativo" : ciclo.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatarData(ciclo.data_inicial)}
                      {ciclo.data_final ? ` → ${formatarData(ciclo.data_final)}` : " → em andamento"}
                      {" · "}{totalNotas} anotações
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Link
                      href={`/grafico/${ciclo.id}`}
                      className="text-xs text-rose-500 font-medium hover:underline"
                    >
                      Ver gráfico
                    </Link>
                    <CicloActions ciclo={ciclo} temCicloAtivo={!!cicloAtivo} />
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
