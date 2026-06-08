import { createClient } from "@/lib/supabase/server";
import { ListaPessoas } from "./ListaPessoas";

interface PerfilPublico { id: string; nome: string; email: string }

export default async function CompartilhamentosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles").select("email").eq("id", user.id).single();
  const meuEmail = profile?.email ?? "";

  // Recebidos e enviados em paralelo
  const [{ data: recebidos }, { data: enviados }] = await Promise.all([
    supabase
      .from("cycle_shares")
      .select("id, owner_id, recipient_email, status")
      .eq("recipient_email", meuEmail),
    supabase
      .from("cycle_shares")
      .select("id, owner_id, recipient_email, status")
      .eq("owner_id", user.id),
  ]);

  // Busca perfis dos remetentes via RPC (SECURITY DEFINER — contorna RLS de profiles)
  const ownerIds = [...new Set((recebidos ?? []).map((s) => s.owner_id))];
  const { data: perfisRemetentesRaw } = ownerIds.length > 0
    ? await supabase.rpc("get_perfis_publicos", { ids: ownerIds })
    : { data: null };
  const perfisRemetentes = (perfisRemetentesRaw ?? []) as PerfilPublico[];

  // Busca perfis dos destinatários via RPC (SECURITY DEFINER, contorna RLS de profiles)
  const emailsDestinatarios = [...new Set((enviados ?? []).map((s) => s.recipient_email))];
  const { data: perfisDestinatariosRaw } = emailsDestinatarios.length > 0
    ? await supabase.rpc("get_perfis_por_email", { emails: emailsDestinatarios })
    : { data: null };
  const perfisDestinatarios = (perfisDestinatariosRaw ?? []) as PerfilPublico[];

  // Agrupa recebidos por owner_id
  const remetentesMap = new Map<string, { id: string; nome: string; email: string; pendente: boolean; aceito: boolean }>();
  for (const share of recebidos ?? []) {
    const p = perfisRemetentes.find((x: PerfilPublico) => x.id === share.owner_id);
    if (!p) continue;
    const atual = remetentesMap.get(share.owner_id) ?? { id: p.id, nome: p.nome, email: p.email, pendente: false, aceito: false };
    if (share.status === "pendente") atual.pendente = true;
    if (share.status === "aceito") atual.aceito = true;
    remetentesMap.set(share.owner_id, atual);
  }

  // Agrupa enviados por recipient_email
  const destinatariosMap = new Map<string, { nome: string | null; email: string; pendente: boolean; aceito: boolean }>();
  for (const share of enviados ?? []) {
    const p = perfisDestinatarios.find((x: PerfilPublico) => x.email === share.recipient_email) ?? null;
    const atual = destinatariosMap.get(share.recipient_email) ?? { nome: p?.nome ?? null, email: share.recipient_email, pendente: false, aceito: false };
    if (share.status === "pendente") atual.pendente = true;
    if (share.status === "aceito") atual.aceito = true;
    destinatariosMap.set(share.recipient_email, atual);
  }

  const pessoasRecebidas = [...remetentesMap.values()].map((r) => ({
    id: r.id,
    nome: r.nome,
    email: r.email,
    pendente: r.pendente,
    aceito: r.aceito,
    tipo: "recebido" as const,
    href: `/compartilhamentos/recebidos/${r.id}`,
  }));

  const pessoasEnviadas = [...destinatariosMap.values()].map((d) => ({
    id: d.email,
    nome: d.nome,
    email: d.email,
    pendente: d.pendente,
    aceito: d.aceito,
    tipo: "enviado" as const,
    href: `/compartilhamentos/enviados/${encodeURIComponent(d.email)}`,
  }));

  return (
    <ListaPessoas
      pessoasRecebidas={pessoasRecebidas}
      pessoasEnviadas={pessoasEnviadas}
    />
  );
}
