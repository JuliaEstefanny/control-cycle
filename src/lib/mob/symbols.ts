import type { MobSymbol } from "@/types/db";

export interface SymbolConfig {
  valor: MobSymbol;
  rotulo: string;
  cor: string;
  corTexto: string;
  descricao: string;
}

export const MOB_SYMBOLS: SymbolConfig[] = [
  {
    valor: "vermelho",
    rotulo: "Vermelho",
    cor: "#ef4444",
    corTexto: "#fff",
    descricao: "Sangramento / Menstruação",
  },
  {
    valor: "manchas",
    rotulo: "Manchas",
    cor: "#ef4444",
    corTexto: "#000",
    descricao: "Manchas / Final da menstruação",
  },
  {
    valor: "verde",
    rotulo: "Verde",
    cor: "#22c55e",
    corTexto: "#fff",
    descricao: "Seca / Sem muco",
  },
  {
    valor: "amarelo",
    rotulo: "Amarelo",
    cor: "#eab308",
    corTexto: "#000",
    descricao: "Padrão de fluxo que se repete",
  },
  {
    valor: "branco",
    rotulo: "Branco",
    cor: "#f5f5f5",
    corTexto: "#374151",
    descricao: "Possível fertilidade",
  },
  /*  {
      valor: "R1",
      rotulo: "R1",
      cor: "#a855f7",
      corTexto: "#fff",
      descricao: "Regra 1",
    },
    {
      valor: "R2",
      rotulo: "R2",
      cor: "#8b5cf6",
      corTexto: "#fff",
      descricao: "Regra 2",
    },
    {
      valor: "R3",
      rotulo: "R3",
      cor: "#7c3aed",
      corTexto: "#fff",
      descricao: "Regra 3",
    },*/
  {
    valor: "1",
    rotulo: "1",
    cor: "#6b7280",
    corTexto: "#fff",
    descricao: "Contagem 1",
  },
  {
    valor: "2",
    rotulo: "2",
    cor: "#6b7280",
    corTexto: "#fff",
    descricao: "Contagem 2",
  },
  {
    valor: "3",
    rotulo: "3",
    cor: "#6b7280",
    corTexto: "#fff",
    descricao: "Contagem 3",
  },
];

export function getSymbolConfig(valor: MobSymbol): SymbolConfig | undefined {
  return MOB_SYMBOLS.find((s) => s.valor === valor);
}
