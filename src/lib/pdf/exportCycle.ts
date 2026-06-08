import type { Cycle, Note, Profile } from "@/types/db";
import { formatarData } from "@/lib/mob/cycle";
import { SENSACAO_OPTIONS, APARENCIA_OPTIONS } from "@/lib/mob/options";
import { getSymbolConfig } from "@/lib/mob/symbols";

function labelSensacao(v: string) {
  return SENSACAO_OPTIONS.find((o) => o.value === v)?.label ?? v;
}
function labelAparencia(v: string) {
  return APARENCIA_OPTIONS.find((o) => o.value === v)?.label ?? v;
}

export async function exportarCicloPDF(
  ciclo: Cycle,
  notas: Note[],
  profile: Pick<Profile, "nome">
) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Cabeçalho
  doc.setFontSize(16);
  doc.setTextColor(244, 63, 94);
  doc.text("Control Cycle — Gráfico do Ciclo", 14, 16);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Usuária: ${profile.nome}`, 14, 24);
  doc.text(`Início do ciclo: ${formatarData(ciclo.data_inicial)}`, 14, 30);
  if (ciclo.data_final) {
    doc.text(`Fim do ciclo: ${formatarData(ciclo.data_final)}`, 14, 36);
  }
  doc.text(
    `Gerado em: ${new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    14,
    ciclo.data_final ? 42 : 36
  );

  const notasOrdenadas = [...notas].sort((a, b) => a.dia_ciclo - b.dia_ciclo);

  const cabecalhos = [
    "Campo",
    ...notasOrdenadas.map((n) => `Dia ${n.dia_ciclo}\n${formatarData(n.data)}`),
  ];

  // linha de símbolos com cor de fundo por célula
  const linhaSimbolos = ["Símbolo", ...notasOrdenadas.map((n) => {
    const cfg = n.simbolo_mob ? getSymbolConfig(n.simbolo_mob) : null;
    return cfg ? " " : "—";
  })];

  const linhas = [
    linhaSimbolos,
    ["Relação", ...notasOrdenadas.map((n) => n.relacao_sexual ? "Sim" : "Não")],
    ["Sensação", ...notasOrdenadas.map((n) =>
      n.sensacao === "outra" ? n.sensacao_outra ?? "Outra" : labelSensacao(n.sensacao)
    )],
    ["Aparência", ...notasOrdenadas.map((n) =>
      n.aparencia === "outro" ? n.aparencia_outra ?? "Outro" : labelAparencia(n.aparencia)
    )],
    ["Sangramento", ...notasOrdenadas.map((n) => n.sangramento === "nenhum" ? "—" : n.sangramento)],
    ["Regra MOB", ...notasOrdenadas.map((n) => n.regra_mob ?? "—")],
    ["Observações", ...notasOrdenadas.map((n) => n.observacoes ?? "—")],
  ];

  // Monta estilos de cor para cada célula da linha de símbolo
  const didDrawCell = (data: { row: { index: number }; column: { index: number }; cell: { x: number; y: number; width: number; height: number } }) => {
    if (data.row.index !== 0 || data.column.index === 0) return;
    const nota = notasOrdenadas[data.column.index - 1];
    if (!nota?.simbolo_mob) return;
    const cfg = getSymbolConfig(nota.simbolo_mob);
    if (!cfg) return;
    const hex = cfg.cor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    doc.setFillColor(r, g, b);
    doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, "F");
  };

  autoTable(doc, {
    startY: ciclo.data_final ? 48 : 42,
    head: [cabecalhos],
    body: linhas,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [244, 63, 94], textColor: 255, fontStyle: "bold" },
    columnStyles: { 0: { fontStyle: "bold", fillColor: [249, 250, 251] } },
    theme: "grid",
    didDrawCell,
  });

  doc.save(`ciclo-${ciclo.data_inicial}.pdf`);
}
