import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GraficoClient } from "./GraficoClient";
import { formatarData, calcularDuracaoCiclo } from "@/lib/mob/cycle";
import type { Cycle, Note } from "@/types/db";

interface Props {
  params: Promise<{ cicloId: string }>;
}

export default async function GraficoPage({ params }: Props) {
  const { cicloId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: ciclo }, { data: notas }] = await Promise.all([
    supabase.from("cycles").select("*").eq("id", cicloId).eq("user_id", user.id).single<Cycle>(),
    supabase.from("notes").select("*").eq("cycle_id", cicloId).order("dia_ciclo", { ascending: true }).returns<Note[]>(),
  ]);

  if (!ciclo) notFound();

  // Compartilhamentos deste ciclo (aceitos) — para exibir quem já tem acesso
  const { data: compartilhamentosDesteCiclo } = await supabase
    .from("cycle_shares")
    .select("id, recipient_email, status")
    .eq("cycle_id", cicloId)
    .eq("owner_id", user.id);

  // Todos os e-mails que já aceitaram qualquer ciclo deste dono — para sugerir no modal
  const { data: todosCompartilhamentos } = await supabase
    .from("cycle_shares")
    .select("recipient_email, status")
    .eq("owner_id", user.id)
    .eq("status", "aceito");

  const emailsSugeridos = [
    ...new Set((todosCompartilhamentos ?? []).map((c) => c.recipient_email)),
  ].filter(
    (email) => !(compartilhamentosDesteCiclo ?? []).some(
      (c) => c.recipient_email === email && c.status === "aceito"
    )
  );

  const totalDias = ciclo.data_final
    ? calcularDuracaoCiclo(ciclo.data_inicial, ciclo.data_final)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {ciclo.nome ?? `Ciclo de ${formatarData(ciclo.data_inicial)}`}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Início: {formatarData(ciclo.data_inicial)}
            {ciclo.data_final ? ` · Fim: ${formatarData(ciclo.data_final)}` : " · Em andamento"}
            {totalDias ? ` · ${totalDias} dias` : ""}
            {" · "}{notas?.length ?? 0} anotações
          </p>
        </div>
        <Link
          href="/anotacao/calendario"
          className="text-sm text-rose-500 font-medium border border-rose-200 rounded-xl px-4 py-2 hover:bg-rose-50 transition-colors whitespace-nowrap"
        >
          + Anotar hoje
        </Link>
      </div>

      <GraficoClient
        ciclo={ciclo}
        notas={notas ?? []}
        userId={user.id}
        compartilhamentosDesteCiclo={compartilhamentosDesteCiclo ?? []}
        emailsSugeridos={emailsSugeridos}
      />
    </div>
  );
}
