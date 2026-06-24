import { z } from "zod";

export const noteSchema = z.object({
  data: z.string().min(1, "Informe a data da anotação."),
  dia_ciclo: z.number().int().min(1),
  // Regra 1
  sensacao: z.string().min(1, "Informe o que você sentiu hoje para salvar a anotação."),
  sensacao_outra: z.string().optional(),
  // Regra 2
  aparencia: z.string().min(1, "Informe o que você viu hoje para salvar a anotação."),
  aparencia_outra: z.string().optional(),
  relacao_sexual: z.boolean(),
  relacao_periodo: z.string().optional(),
  sangramento: z.enum(["nenhum", "mancha", "leve", "moderado", "intenso"]),
  simbolo_mob: z
    .enum(["vermelho", "manchas", "verde", "amarelo", "branco", "R1", "R2", "R3", "1", "2", "3"])
    .nullable()
    .refine((v) => v !== null && v !== undefined, { message: "Selecione um símbolo / selo MOB para salvar a anotação." }),
  regra_mob: z
    .enum(["Regra 1", "Regra 2", "Regra 3", "Regra do Ápice", "Não se aplica"])
    .nullable()
    .optional(),
  observacoes: z.string().optional(),
});

export type NoteFormValues = z.infer<typeof noteSchema>;

export const cycleSchema = z.object({
  nome: z.string().optional(),
  data_inicial: z.string().min(1, "A data inicial do ciclo é obrigatória."),
  data_final: z.string().optional(),
  observacoes_gerais: z.string().optional(),
});

export type CycleFormValues = z.infer<typeof cycleSchema>;

export const profileSchema = z.object({
  nome: z.string().min(1, "Informe seu nome."),
  objetivo: z.string().optional(),
  data_nascimento: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
