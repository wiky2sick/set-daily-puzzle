import React from "react";
import { parseSetCode } from "../setUtils";
import { SetSymbol } from "./SetSymbol";

type Props = {
  code: string; // "0122"
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
};

const COLORS = {
  0: "#e11d48",
  1: "#059669",
  2: "#7c3aed",
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getResponsiveSymbolSize(cardWidth: number, cardHeight: number, count: number): number {
  const innerWidth = Math.max(90, cardWidth - 28);
  const innerHeight = Math.max(90, cardHeight - 26);

  let size = Math.min(innerHeight * 0.64, 78);
  const widthPerSymbol = size * 0.78;
  const gap = Math.max(6, size * 0.16);
  const totalWidth = count * widthPerSymbol + (count - 1) * gap;

  if (totalWidth > innerWidth) {
    size *= innerWidth / totalWidth;
  }

  return clamp(size, 22, 78);
}

export function Card({ code, selected, disabled, onClick }: Props) {
  const { shape, color, shading, count } = parseSetCode(code);
  const colorHex = COLORS[color as keyof typeof COLORS] ?? COLORS[0];
  const patternId = React.useId().replace(/:/g, "");
  const cardRef = React.useRef<HTMLButtonElement | null>(null);
  const [symbolSize, setSymbolSize] = React.useState(62);

  React.useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setSymbolSize(getResponsiveSymbolSize(rect.width, rect.height, count));
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(el);

    return () => observer.disconnect();
  }, [count]);

  const ring = selected ? "ring-2 ring-primary" : "ring-1 ring-slate-300";
  const lift = selected ? "-translate-y-0.5" : "";
  const cursor = disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-slate-100";
  const gapPx = Math.max(4, symbolSize * 0.08);

  return (
    <button
      ref={cardRef}
      onClick={() => !disabled && onClick()}
      className={`relative flex h-40 w-full min-w-0 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-3 shadow-sm transition ${ring} ${lift} ${cursor}`}
      aria-label={`Card ${code}`}
    >
      <div className="flex items-center justify-center" style={{ gap: `${gapPx}px` }}>
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} className="select-none flex items-center justify-center">
            <SetSymbol
              shape={shape}
              shading={shading}
              color={colorHex}
              size={symbolSize}
              patternId={`${patternId}-${i}`}
            />
          </span>
        ))}
      </div>
      <div className="absolute bottom-2 right-2 text-[10px] text-slate-400">
        {code}
      </div>
    </button>
  );
}
