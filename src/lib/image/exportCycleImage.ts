import type { Cycle, Note } from "@/types/db";
import { getSymbolConfig } from "@/lib/mob/symbols";
import { SENSACAO_OPTIONS, APARENCIA_OPTIONS } from "@/lib/mob/options";
import { formatarData } from "@/lib/mob/cycle";

const BLOCK_SIZE = 20;
// Largura fixa de cada coluna de dado (px) — mesma para todos os blocos
const COL_W = 60;
// Largura fixa da coluna de rótulo (px)
const LABEL_W = 90;

const LINHAS = [
  { key: "dia_ciclo",   rotulo: "Dia" },
  { key: "data",        rotulo: "Data" },
  { key: "simbolo",     rotulo: "Símbolo" },
  { key: "relacao",     rotulo: "Relação" },
  { key: "sensacao",    rotulo: "Sensação" },
  { key: "aparencia",   rotulo: "Aparência" },
  { key: "sangramento", rotulo: "Sangramento" },
  { key: "regra_mob",   rotulo: "Regra MOB" },
  { key: "observacoes", rotulo: "Observações" },
];

function labelSensacao(v: string) {
  return SENSACAO_OPTIONS.find((o) => o.value === v)?.label ?? v;
}
function labelAparencia(v: string) {
  return APARENCIA_OPTIONS.find((o) => o.value === v)?.label ?? v;
}

function celulaConteudo(key: string, nota: Note): string {
  switch (key) {
    case "dia_ciclo":
      return `<span style="font-weight:600;color:#e11d48;font-size:12px;">${nota.dia_ciclo}</span>`;
    case "data":
      return `<span style="font-size:10px;color:#374151;">${formatarData(nota.data)}</span>`;
    case "simbolo": {
      const cfg = nota.simbolo_mob ? getSymbolConfig(nota.simbolo_mob) : null;
      if (!cfg) return `<span style="color:#d1d5db;font-size:11px;">—</span>`;
      return `<span style="display:inline-block;width:24px;height:24px;border-radius:6px;background:${cfg.cor};"></span>`;
    }
    case "relacao":
      return nota.relacao_sexual
        ? `<span style="font-size:11px;font-weight:500;color:#f43f5e;">Sim</span>`
        : `<span style="font-size:11px;color:#d1d5db;">Não</span>`;
    case "sensacao": {
      const label = nota.sensacao === "outra"
        ? nota.sensacao_outra ?? "Outra"
        : labelSensacao(nota.sensacao);
      return `<span style="font-size:11px;color:#374151;">${label}</span>`;
    }
    case "aparencia": {
      const label = nota.aparencia === "outro"
        ? nota.aparencia_outra ?? "Outro"
        : labelAparencia(nota.aparencia);
      return `<span style="font-size:11px;color:#374151;">${label}</span>`;
    }
    case "sangramento":
      if (nota.sangramento === "nenhum")
        return `<span style="font-size:11px;color:#d1d5db;">—</span>`;
      return `<span style="font-size:11px;font-weight:500;color:#ef4444;">${nota.sangramento}</span>`;
    case "regra_mob":
      return `<span style="font-size:11px;color:#374151;">${nota.regra_mob ?? "—"}</span>`;
    case "observacoes":
      return `<span style="font-size:11px;color:#6b7280;">${nota.observacoes ?? "—"}</span>`;
    default:
      return "—";
  }
}

function blocoHtml(notas: Note[], inicio: number, fim: number): string {
  const notasBloco = notas.filter((n) => n.dia_ciclo >= inicio && n.dia_ciclo <= fim);
  if (notasBloco.length === 0) return "";

  // Gera todas as 20 colunas do bloco; vazia se não há nota para aquele dia
  const diasRange = Array.from({ length: BLOCK_SIZE }, (_, i) => inicio + i);

  const tdData = (conteudo: string, vazia = false) =>
    `<td style="width:${COL_W}px;min-width:${COL_W}px;max-width:${COL_W}px;padding:5px 2px;text-align:center;vertical-align:middle;border-right:1px solid #f3f4f6;border-bottom:1px solid #e5e7eb;background:${vazia ? "#fafafa" : "#ffffff"};">${conteudo}</td>`;

  const linhasHtml = LINHAS.map(({ key, rotulo }) => {
    const tdRotulo = `<td style="width:${LABEL_W}px;min-width:${LABEL_W}px;max-width:${LABEL_W}px;background:#f9fafb;padding:6px 8px;font-size:11px;font-weight:600;color:#6b7280;border-right:1px solid #e5e7eb;white-space:nowrap;border-bottom:1px solid #e5e7eb;">${rotulo}</td>`;

    const celulas = diasRange.map((dia) => {
      const nota = notasBloco.find((n) => n.dia_ciclo === dia);
      if (!nota) return tdData("", true);
      return tdData(celulaConteudo(key, nota));
    }).join("");

    return `<tr>${tdRotulo}${celulas}</tr>`;
  }).join("");

  const totalW = LABEL_W + COL_W * BLOCK_SIZE;

  return `
    <div style="margin-bottom:24px;">
      <div style="font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Dias ${inicio}–${fim}</div>
      <table style="border-collapse:collapse;width:${totalW}px;table-layout:fixed;border:1px solid #e5e7eb;">
        <tbody>${linhasHtml}</tbody>
      </table>
    </div>`;
}

export async function exportarCicloImagem(ciclo: Cycle, notas: Note[]) {
  const html2canvas = (await import("html2canvas")).default;

  const ordenadas = [...notas].sort((a, b) => a.dia_ciclo - b.dia_ciclo);
  if (ordenadas.length === 0) return;

  const maxDia = ordenadas[ordenadas.length - 1].dia_ciclo;
  const blocos: string[] = [];
  for (let inicio = 1; inicio <= maxDia; inicio += BLOCK_SIZE) {
    blocos.push(blocoHtml(ordenadas, inicio, inicio + BLOCK_SIZE - 1));
  }

  // Largura total = rótulo + 20 colunas
  const totalW = LABEL_W + COL_W * BLOCK_SIZE;
  const wrapperW = totalW + 48; // 24px padding em cada lado

  const cabecalho = `
    <div style="margin-bottom:20px;">
      <div style="font-size:22px;font-weight:700;color:#1f2937;">Control Cycle</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">
        ${ciclo.nome ?? `Ciclo de ${formatarData(ciclo.data_inicial)}`}
        &nbsp;·&nbsp; Início: ${formatarData(ciclo.data_inicial)}
        ${ciclo.data_final ? `&nbsp;·&nbsp; Fim: ${formatarData(ciclo.data_final)}` : ""}
        &nbsp;·&nbsp; ${notas.length} anotações
      </div>
    </div>`;

  const wrapper = document.createElement("div");
  Object.assign(wrapper.style, {
    position: "absolute",
    top: "0px",
    left: "-9999px",
    width: `${wrapperW}px`,
    background: "#ffffff",
    padding: "24px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#000000",
    boxSizing: "border-box",
  });

  wrapper.innerHTML = cabecalho + blocos.join("");
  document.body.appendChild(wrapper);

  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );

  try {
    const canvas = await html2canvas(wrapper, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
      width: wrapper.scrollWidth,
      height: wrapper.scrollHeight,
      windowWidth: wrapperW + 100,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
    });

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `ciclo-${ciclo.data_inicial}.png`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  } finally {
    document.body.removeChild(wrapper);
  }
}
