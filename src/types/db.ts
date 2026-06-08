export type CycleStatus = "ativo" | "encerrado" | "arquivado";

export type TipoUsuario = "aluna" | "instrutora" | "convidada";

export type ShareStatus = "pendente" | "aceito" | "recusado";

export type MobSymbol =
  | "vermelho"
  | "manchas"
  | "verde"
  | "amarelo"
  | "branco"
  | "R1"
  | "R2"
  | "R3"
  | "1"
  | "2"
  | "3";

export type RegrasMob =
  | "Regra 1"
  | "Regra 2"
  | "Regra 3"
  | "Regra do Ápice"
  | "Não se aplica";

export type SangramentoNivel = "nenhum" | "mancha" | "leve" | "moderado" | "intenso";

export interface Profile {
  id: string;
  nome: string;
  email: string;
  objetivo: string | null;
  data_nascimento: string | null;
  tipo_usuario: TipoUsuario | null;
  preferencias: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CycleShare {
  id: string;
  cycle_id: string;
  owner_id: string;
  recipient_email: string;
  status: ShareStatus;
  created_at: string;
  updated_at: string;
}

export interface Cycle {
  id: string;
  user_id: string;
  nome: string | null;
  data_inicial: string;
  data_final: string | null;
  status: CycleStatus;
  observacoes_gerais: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  cycle_id: string;
  user_id: string;
  data: string;
  dia_ciclo: number;
  sensacao: string;
  sensacao_outra: string | null;
  aparencia: string;
  aparencia_outra: string | null;
  relacao_sexual: boolean;
  relacao_periodo: string | null;
  sangramento: SangramentoNivel;
  simbolo_mob: MobSymbol | null;
  regra_mob: RegrasMob | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CycleWithStats extends Cycle {
  total_notas: number;
  ultima_anotacao: string | null;
}
