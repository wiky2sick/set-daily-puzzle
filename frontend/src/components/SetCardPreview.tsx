import React from "react";
import { parseSetCode } from "../setUtils";

const COLORS = {
  0: "#e11d48",
  1: "#059669",
  2: "#7c3aed",
} as const;

function ShapeOval({
  shading,
  color,
  size,
  patternId,
}: {
  shading: number;
  color: string;
  size: number;
  patternId: string;
}) {
  const strokeWidth = Math.max(1.1, size / 16);
  const isSolid = shading === 0;
  const isStriped = shading === 1;

  return (
    <svg width={(size * 14) / 24} height={size} viewBox="0 0 14 24" className="flex-shrink-0" aria-hidden>
      <defs>
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="4" height="4">
          <line x1="0" y1="0" x2="4" y2="0" stroke={color} strokeWidth="1.1" />
          <line x1="0" y1="2" x2="4" y2="2" stroke={color} strokeWidth="1.1" />
          <line x1="0" y1="4" x2="4" y2="4" stroke={color} strokeWidth="1.1" />
        </pattern>
      </defs>
      <ellipse
        cx="7"
        cy="12"
        rx="5"
        ry="10"
        fill={isSolid ? color : isStriped ? `url(#${patternId})` : "none"}
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

function ShapeSquiggle({
  shading,
  color,
  size,
  patternId,
}: {
  shading: number;
  color: string;
  size: number;
  patternId: string;
}) {
  const strokeWidth = Math.max(1.1, size / 16);
  const isSolid = shading === 0;
  const isStriped = shading === 1;
  const pathD =
    "M 2 9 C 2 4 8 2 12 6 C 16 10 20 6 22 9 C 22 14 16 16 12 12 C 8 8 2 12 2 9 Z";

  return (
    <svg width={(size * 18) / 24} height={size} viewBox="0 0 18 24" className="flex-shrink-0" aria-hidden>
      <defs>
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="4" height="4">
          <line x1="0" y1="0" x2="4" y2="0" stroke={color} strokeWidth="1.1" />
          <line x1="0" y1="2" x2="4" y2="2" stroke={color} strokeWidth="1.1" />
          <line x1="0" y1="4" x2="4" y2="4" stroke={color} strokeWidth="1.1" />
        </pattern>
      </defs>
      <g transform="translate(0,24) rotate(-90)">
        <path
          d={pathD}
          fill={isSolid ? color : isStriped ? `url(#${patternId})` : "none"}
          stroke={color}
          strokeWidth={strokeWidth}
        />
      </g>
    </svg>
  );
}

function ShapeDiamond({
  shading,
  color,
  size,
  patternId,
}: {
  shading: number;
  color: string;
  size: number;
  patternId: string;
}) {
  const strokeWidth = Math.max(1.1, size / 16);
  const isSolid = shading === 0;
  const isStriped = shading === 1;

  return (
    <svg width={(size * 17) / 20} height={size} viewBox="0 0 17 20" className="flex-shrink-0" aria-hidden>
      <defs>
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="4" height="4">
          <line x1="0" y1="0" x2="4" y2="0" stroke={color} strokeWidth="1.1" />
          <line x1="0" y1="2" x2="4" y2="2" stroke={color} strokeWidth="1.1" />
          <line x1="0" y1="4" x2="4" y2="4" stroke={color} strokeWidth="1.1" />
        </pattern>
      </defs>
      <path
        d="M 8.5 1 L 16 10 L 8.5 19 L 1 10 Z"
        fill={isSolid ? color : isStriped ? `url(#${patternId})` : "none"}
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

function renderShape(
  shapeIdx: number,
  shading: number,
  color: string,
  size: number,
  patternId: string
) {
  const ShapeComponent =
    shapeIdx === 0 ? ShapeOval : shapeIdx === 1 ? ShapeSquiggle : ShapeDiamond;

  return (
    <ShapeComponent
      shading={shading}
      color={color}
      size={size}
      patternId={patternId}
    />
  );
}

export function SetCardPreview({ code, size = 20 }: { code: string; size?: number }) {
  const { shape, color, shading, count } = parseSetCode(code);
  const colorHex = COLORS[color as keyof typeof COLORS] ?? COLORS[0];
  const patternId = React.useId().replace(/:/g, "");

  return (
    <div className="flex items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-2 min-h-16">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="select-none flex items-center justify-center">
          {renderShape(shape, shading, colorHex, size, `${patternId}-${i}`)}
        </span>
      ))}
    </div>
  );
}
