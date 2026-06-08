import Link from "next/link";
import { PlusCircle, BarChart2, History, BookOpen, User, List, FileDown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { formatarData, calcularDiaCiclo } from "@/lib/mob/cycle";
import { SENSACAO_OPTIONS, APARENCIA_OPTIONS } from "@/lib/mob/options";
import { getSymbolConfig } from "@/lib/mob/symbols";
import { HomeCalendarWidget } from "@/components/calendar/HomeCalendarWidget";
import type { Cycle, Note, Profile, MobSymbol } from "@/types/db";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: cicloAtivo }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single<Profile>(),
    supabase
      .from("cycles")
      .select("*")
      .eq("user_id", user!.id)
      .eq("status", "ativo")
      .single<Cycle>(),
  ]);

  let ultimaAnotacao: Note | null = null;
  let totalDiasRegistrados = 0;
  let todasNotas: Note[] = [];

  if (cicloAtivo) {
    const { data: notas } = await supabase
      .from("notes")
      .select("*")
      .eq("cycle_id", cicloAtivo.id)
      .order("data", { ascending: false })
      .returns<Note[]>();

    todasNotas = notas ?? [];
    ultimaAnotacao = todasNotas[0] ?? null;
    totalDiasRegistrados = todasNotas.length;
  }

  const diaDoCiclo = cicloAtivo
    ? calcularDiaCiclo(cicloAtivo.data_inicial, new Date().toISOString().split("T")[0])
    : null;

  const shortcuts = [
    { href: cicloAtivo ? `/grafico/${cicloAtivo.id}` : "/ciclos", label: "Ver Gráfico", icon: BarChart2 },
    { href: "/historico", label: "Histórico", icon: History },
    { href: "/ciclos", label: "Meus Ciclos", icon: List },
    { href: "/manual", label: "Manual MOB", icon: BookOpen },
    { href: "/perfil", label: "Perfil", icon: User },
    ...(cicloAtivo ? [{ href: `/grafico/${cicloAtivo.id}?exportar=true`, label: "Exportar PDF", icon: FileDown }] : []),
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Saudação */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Olá, {profile?.nome?.split(" ")[0] ?? "bem-vinda"}
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Como está se sentindo hoje?</p>
      </div>

      {/* Card principal — Nova Anotação */}
      {cicloAtivo ? (
        <Link href="/anotacao/calendario">
          <div className="rounded-2xl p-4 shadow-sm cursor-pointer transition-colors [background-color:#f43f5e] hover:[background-color:#e11d48]">
            <div className="flex items-center gap-4">
              <div className="rounded-xl p-3 bg-white/20">
                <PlusCircle className="text-white" size={28} />
              </div>
              <div>
                <p className="font-semibold text-white text-lg">Nova anotação diária</p>
                <p className="text-rose-100 text-sm">Registre sua observação de hoje</p>
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <Link href="/ciclos">
          <Card className="border-dashed border-2 border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="bg-rose-100 rounded-xl p-3">
                <PlusCircle className="text-rose-500" size={28} />
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-lg">Criar primeiro ciclo</p>
                <p className="text-gray-400 text-sm">Crie um ciclo ativo para começar a registrar</p>
              </div>
            </div>
          </Card>
        </Link>
      )}

      {/* Resumo do ciclo */}
      {cicloAtivo && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Ciclo atual
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">Início do ciclo</p>
              <p className="font-semibold text-gray-800">{formatarData(cicloAtivo.data_inicial)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Dia do ciclo</p>
              <p className="font-semibold text-gray-800">{diaDoCiclo ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Última anotação</p>
              <p className="font-semibold text-gray-800">
                {ultimaAnotacao ? formatarData(ultimaAnotacao.data) : "Nenhuma ainda"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Dias registrados</p>
              <p className="font-semibold text-gray-800">{totalDiasRegistrados}</p>
            </div>
          </div>
          {(() => {
            const pbiTyped = (profile?.preferencias as Record<string, unknown>)?.pbi as { sensacao?: string; aparencia?: string; aparencia_outra?: string; simbolo_mob?: string } | undefined;
            if (!pbiTyped || (!pbiTyped.sensacao && !pbiTyped.aparencia && !pbiTyped.simbolo_mob)) return null;
            const labelSensacao = SENSACAO_OPTIONS.find((o) => o.value === pbiTyped.sensacao)?.label ?? pbiTyped.sensacao;
            const labelAparencia = pbiTyped.aparencia === "outro"
              ? `Outro${pbiTyped.aparencia_outra ? ` · ${pbiTyped.aparencia_outra}` : ""}`
              : APARENCIA_OPTIONS.find((o) => o.value === pbiTyped.aparencia)?.label ?? pbiTyped.aparencia;
            const simboloCfg = pbiTyped.simbolo_mob ? getSymbolConfig(pbiTyped.simbolo_mob as MobSymbol) : null;
            return (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2">Meu PBI</p>
                <div className="flex items-center gap-3">
                  {simboloCfg && (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm shrink-0"
                      style={{ backgroundColor: simboloCfg.cor, color: simboloCfg.corTexto }}
                    >
                      {pbiTyped.simbolo_mob === "manchas" ? (
                        <div className="flex gap-0.5">
                          <div className="w-1 h-1 rounded-full bg-black" />
                          <div className="w-1 h-1 rounded-full bg-black" />
                          <div className="w-1 h-1 rounded-full bg-black" />
                        </div>
                      ) : null}
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5">
                    {pbiTyped.sensacao && <p className="text-xs text-gray-600">Sinto: <span className="font-medium">{labelSensacao}</span></p>}
                    {pbiTyped.aparencia && <p className="text-xs text-gray-600">Vejo: <span className="font-medium">{labelAparencia}</span></p>}
                  </div>
                </div>
              </div>
            );
          })()}
        </Card>
      )}

      {/* Calendário de acesso rápido */}
      {cicloAtivo && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Calendário
          </h2>
          <HomeCalendarWidget
            notas={todasNotas}
            cicloDataInicial={cicloAtivo.data_inicial}
          />
        </div>
      )}

      {/* Atalhos */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Acesso rápido
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {shortcuts.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Card className="flex flex-col items-center gap-2 py-4 hover:bg-gray-50 transition-colors cursor-pointer text-center">
                <Icon className="text-rose-500" size={22} />
                <span className="text-xs text-gray-600 font-medium">{label}</span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
