import React from "react";
import { parseSetCode } from "../setUtils";
import { SetSymbol } from "./SetSymbol";

const COLORS = {
  0: "#e11d48",
  1: "#059669",
  2: "#7c3aed",
} as const;

export function SetCardPreview({ code, size = 20 }: { code: string; size?: number }) {
  const { shape, color, shading, count } = parseSetCode(code);
  const colorHex = COLORS[color as keyof typeof COLORS] ?? COLORS[0];
  const patternId = React.useId().replace(/:/g, "");

  return (
    <div className="flex items-center justify-center gap-0.5 rounded-md border border-slate-200 bg-white px-2 py-2 min-h-16">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="select-none flex items-center justify-center">
          <SetSymbol
            shape={shape}
            shading={shading}
            color={colorHex}
            size={size}
            patternId={`${patternId}-${i}`}
          />
        </span>
      ))}
    </div>
  );
}
