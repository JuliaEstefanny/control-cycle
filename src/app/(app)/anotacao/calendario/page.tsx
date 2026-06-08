import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CalendarPicker } from "@/components/calendar/CalendarPicker";
import type { Cycle, Note } from "@/types/db";

export default async function CalendarioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: cicloAtivo } = await supabase
    .from("cycles")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "ativo")
    .single<Cycle>();

  if (!cicloAtivo) redirect("/ciclos");

  const { data: notas } = await supabase
    .from("notes")
    .select("id, data")
    .eq("cycle_id", cicloAtivo.id)
    .returns<Pick<Note, "id" | "data">[]>();

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Nova anotação</h1>
        <p className="text-gray-500 text-sm mt-0.5">Selecione o dia que deseja registrar</p>
      </div>

      <CalendarPicker
        notas={notas ?? []}
        cicloDataInicial={cicloAtivo.data_inicial}
      />
    </div>
  );
}
