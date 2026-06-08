import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatarData } from "@/lib/mob/cycle";
import { CycleChart } from "@/components/chart/CycleChart";
import { ExportarImagemShare } from "./ExportarImagemShare";
import type { Note, Cycle } from "@/types/db";

interface Props {
  params: Promise<{ shareId: string }>;
}

export default async function GraficoCompartilhadoPage({ params }: Props) {
  const { shareId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profileUsuario } = await supabase
    .from("profiles").select("email").eq("id", user.id).single();

  const { data: share } = await supabase
    .from("cycle_shares")
    .select("id, cycle_id, owner_id, status, cycles(*, notes(*))")
    .eq("id", shareId)
    .eq("recipient_email", profileUsuario?.email ?? "")
    .eq("status", "aceito")
    .single<{
      id: string;
      cycle_id: string;
      owner_id: string;
      status: string;
      cycles: (Cycle & { notes: Note[] }) | null;
    }>();

  if (!share || !share.cycles) notFound();

  // Busca nome do dono via RPC (SECURITY DEFINER, contorna RLS de profiles)
  const { data: donoRaw } = await supabase.rpc("get_perfis_publicos", { ids: [share.owner_id] });
  const dono = ((donoRaw ?? []) as { id: string; nome: string; email: string }[])[0] ?? null;

  const ciclo = share.cycles;
  const notas: Note[] = ciclo.notes ?? [];
  const voltarHref = `/compartilhamentos/recebidos/${share.owner_id}`;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-3">
        <Link
          href={voltarHref}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors w-fit"
        >
          <ChevronLeft size={16} /> {dono?.nome ?? "Voltar"}
        </Link>
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Gráfico compartilhado por</p>
          <h1 className="text-2xl font-bold text-gray-800">{dono?.nome ?? "Usuária"}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {ciclo.nome ?? `Ciclo de ${formatarData(ciclo.data_inicial)}`}
            {" · "}Início: {formatarData(ciclo.data_inicial)}
            {ciclo.data_final && ` · Fim: ${formatarData(ciclo.data_final)}`}
            {" · "}{notas.length} anotações
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <ExportarImagemShare ciclo={ciclo} notas={notas} />
      </div>
      <CycleChart ciclo={ciclo} notas={notas} />
    </div>
  );
}
