import { differenceInCalendarDays, parseISO, format } from "date-fns";

/**
 * Calcula o dia do ciclo com base na data inicial e na data da anotação.
 * Dia 1 = data inicial do ciclo.
 */
export function calcularDiaCiclo(dataInicial: string, dataAnotacao: string): number {
  const inicio = parseISO(dataInicial);
  const anotacao = parseISO(dataAnotacao);
  return differenceInCalendarDays(anotacao, inicio) + 1;
}

/**
 * Retorna a data de hoje no formato ISO (yyyy-MM-dd).
 */
export function dataHoje(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/**
 * Formata uma data ISO para exibição no formato dd/MM/yyyy.
 */
export function formatarData(dataISO: string): string {
  return format(parseISO(dataISO), "dd/MM/yyyy");
}

/**
 * Calcula a duração do ciclo em dias.
 */
export function calcularDuracaoCiclo(dataInicial: string, dataFinal: string): number {
  return differenceInCalendarDays(parseISO(dataFinal), parseISO(dataInicial)) + 1;
}
