import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { NoteForm } from "@/components/forms/NoteForm";
import type { Note, Cycle } from "@/types/db";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarAnotacaoPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: nota } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single<Note>();

  if (!nota) notFound();

  const [{ data: ciclo }, { data: ciclos }] = await Promise.all([
    supabase
      .from("cycles")
      .select("*")
      .eq("id", nota.cycle_id)
      .single<Cycle>(),
    supabase
      .from("cycles")
      .select("*")
      .eq("user_id", user!.id)
      .order("data_inicial", { ascending: false })
      .returns<Cycle[]>(),
  ]);

  if (!ciclo) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Editar anotação</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Dia {nota.dia_ciclo} do ciclo
        </p>
      </div>

      <NoteForm
        cicloId={ciclo.id}
        userId={user!.id}
        dataInicial={ciclo.data_inicial}
        dataDefault={nota.data}
        diaCicloDefault={nota.dia_ciclo}
        todosOsCiclos={ciclos ?? []}
        notaExistente={{
          id: nota.id,
          data: nota.data,
          dia_ciclo: nota.dia_ciclo,
          sensacao: nota.sensacao,
          sensacao_outra: nota.sensacao_outra ?? undefined,
          aparencia: nota.aparencia,
          aparencia_outra: nota.aparencia_outra ?? undefined,
          relacao_sexual: nota.relacao_sexual,
          relacao_periodo: nota.relacao_periodo ?? undefined,
          sangramento: nota.sangramento,
          simbolo_mob: nota.simbolo_mob ?? undefined,
          regra_mob: nota.regra_mob ?? undefined,
          observacoes: nota.observacoes ?? undefined,
        }}
      />
    </div>
  );
}
