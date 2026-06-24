export const SENSACAO_OPTIONS = [
  { value: "seca", label: "Seca" },
  { value: "umida", label: "Úmida" },
  { value: "molhada", label: "Molhada" },
  { value: "escorregadia", label: "Escorregadia" },
  { value: "nao_sei", label: "Não sei identificar" },
] as const;

export const APARENCIA_OPTIONS = [
  { value: "nada", label: "Nada" },
  { value: "sangue", label: "Sangue" },
  { value: "mancha", label: "Mancha" },
  { value: "branco_cremoso", label: "Branco cremoso" },
  { value: "branco_pegajoso", label: "Branco pegajoso" },
  { value: "gelatinoso", label: "Gelatinoso" },
  { value: "transparente", label: "Transparente" },
  { value: "elastico", label: "Elástico" },
  { value: "clara_ovo", label: "Clara de ovo" },
  { value: "liquido_seminal", label: "Líquido seminal" },
  { value: "outro", label: "Outro" },
] as const;

export const SANGRAMENTO_OPTIONS = [
  { value: "nenhum", label: "Nenhum" },
  { value: "mancha", label: "Mancha" },
  { value: "leve", label: "Leve" },
  { value: "moderado", label: "Moderado" },
  { value: "intenso", label: "Intenso" },
] as const;

export const REGRA_MOB_OPTIONS = [
  { value: "Regra 1", label: "Regra 1" },
  { value: "Regra 2", label: "Regra 2" },
  { value: "Regra 3", label: "Regra 3" },
  { value: "Regra do Ápice", label: "Regra do Ápice" },
  { value: "Não se aplica", label: "Não se aplica" },
] as const;

export const REGRA_MOB_DESCRICOES: Record<string, string> = {
  "Regra 1": "Abstinência nos dias de sangramento e nos 3 dias seguintes ao término, pois o sangue pode ocultar o muco.",
  "Regra 2": "Abstinência em dias alternados durante o muco inicial menos fértil (início do ciclo), para não confundir com sêmen.",
  "Regra 3": "Abstinência a partir do primeiro dia de muco até o 4º dia após o ápice (pico do muco mais fértil).",
  "Regra do Ápice": "O ápice é o último dia de muco com características de maior fertilidade (escorregadio, elástico). A fertilidade se encerra no 4º dia após o ápice.",
};

export const OBJETIVO_OPTIONS = [
  { value: "conhecer_ciclo", label: "Conhecer o ciclo" },
  { value: "espacar_gravidez", label: "Espaçar gravidez" },
  { value: "buscar_gravidez", label: "Buscar gravidez" },
  { value: "monitorar_saude", label: "Monitorar saúde" },
  { value: "outro", label: "Outro" },
] as const;
