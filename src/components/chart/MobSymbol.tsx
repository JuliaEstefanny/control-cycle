import { getSymbolConfig } from "@/lib/mob/symbols";
import type { MobSymbol as MobSymbolType } from "@/types/db";

interface MobSymbolProps {
  simbolo: MobSymbolType | null | undefined;
  size?: "sm" | "md";
  semRotulo?: boolean;
}

export function MobSymbol({ simbolo, size = "md", semRotulo = false }: MobSymbolProps) {
  if (!simbolo) {
    return (
      <div
        className={`rounded-lg border border-dashed border-gray-200 flex items-center justify-center ${
          size === "sm" ? "w-7 h-7 text-xs" : "w-10 h-10 text-sm"
        }`}
      >
        <span className="text-gray-300">—</span>
      </div>
    );
  }

  const config = getSymbolConfig(simbolo);
  if (!config) return null;

  const dotSize = size === "sm" ? 3 : 4;

  return (
    <div
      title={config.descricao}
      className={`rounded-lg flex items-center justify-center font-bold shadow-sm ${
        size === "sm" ? "w-7 h-7 text-xs" : "w-10 h-10 text-sm"
      }`}
      style={{ backgroundColor: config.cor, color: config.corTexto }}
    >
      {simbolo === "manchas" ? (
        <div className="flex gap-0.5 items-center justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full bg-black"
              style={{ width: dotSize, height: dotSize }}
            />
          ))}
        </div>
      ) : (
        !semRotulo && config.rotulo
      )}
    </div>
  );
}
