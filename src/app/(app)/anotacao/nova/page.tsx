import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NoteForm } from "@/components/forms/NoteForm";
import { calcularDiaCiclo, dataHoje } from "@/lib/mob/cycle";
import type { Cycle, Profile, MobSymbol } from "@/types/db";

export default async function NovaAnotacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: dataParam } = await searchParams;
  const dataEscolhida = dataParam ?? null;

  const [{ data: ciclos }, { data: profile }] = await Promise.all([
    supabase
      .from("cycles")
      .select("*")
      .eq("user_id", user!.id)
      .order("data_inicial", { ascending: false })
      .returns<Cycle[]>(),
    supabase
      .from("profiles")
      .select("preferencias")
      .eq("id", user!.id)
      .single<Pick<Profile, "preferencias">>(),
  ]);

  const cicloAtivo = ciclos?.find((c) => c.status === "ativo") ?? null;

  if (!cicloAtivo) {
    redirect("/ciclos");
  }

  const dataBase = dataEscolhida ?? dataHoje();
  const diaCiclo = calcularDiaCiclo(cicloAtivo.data_inicial, dataBase);
  const pbi = (profile?.preferencias as Record<string, unknown>)?.pbi ?? null;

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Nova anotação</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Dia {diaCiclo} do ciclo · {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      <NoteForm
        cicloId={cicloAtivo.id}
        userId={user!.id}
        dataInicial={cicloAtivo.data_inicial}
        dataDefault={dataBase}
        diaCicloDefault={diaCiclo}
        todosOsCiclos={ciclos ?? []}
        pbi={pbi as { sensacao?: string; aparencia?: string; aparencia_outra?: string; simbolo_mob?: MobSymbol } | null}
      />
    </div>
  );
}
