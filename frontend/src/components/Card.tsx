import React from "react";

type Props = {
  code: string; // "0122"
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
};

// SET colors: red, green, purple (slightly richer for light theme)
const COLORS = {
  0: "#e11d48", // rose-600
  1: "#059669", // emerald-600
  2: "#7c3aed", // violet-600
} as const;

function parse(code: string) {
  const s = Number(code[0]);
  const c = Number(code[1]);
  const sh = Number(code[2]);
  const ct = Number(code[3]) + 1;
  return { shape: s, color: c, shading: sh, count: ct };
}

const SHAPE_SIZE = 64;

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
  const strokeWidth = Math.max(1.5, size / 16);
  const isSolid = shading === 0;
  const isStriped = shading === 1;

  return (
    <svg
      width={(size * 14) / 24}
      height={size}
      viewBox="0 0 14 24"
      className="flex-shrink-0"
      aria-hidden
    >
      <defs>
        <pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          width="4"
          height="4"
        >
          <line x1="0" y1="0" x2="4" y2="0" stroke={color} strokeWidth="1.2" />
          <line x1="0" y1="2" x2="4" y2="2" stroke={color} strokeWidth="1.2" />
          <line x1="0" y1="4" x2="4" y2="4" stroke={color} strokeWidth="1.2" />
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

// SET squiggle: wavy double-bump shape
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
  const strokeWidth = Math.max(1.5, size / 16);
  const isSolid = shading === 0;
  const isStriped = shading === 1;
  // Base squiggle path is horizontal; rotate to keep card symbols vertical.
  const pathD =
    "M 2 9 C 2 4 8 2 12 6 C 16 10 20 6 22 9 C 22 14 16 16 12 12 C 8 8 2 12 2 9 Z";

  return (
    <svg
      width={(size * 18) / 24}
      height={size}
      viewBox="0 0 18 24"
      className="flex-shrink-0"
      aria-hidden
    >
      <defs>
        <pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          width="4"
          height="4"
        >
          <line x1="0" y1="0" x2="4" y2="0" stroke={color} strokeWidth="1.2" />
          <line x1="0" y1="2" x2="4" y2="2" stroke={color} strokeWidth="1.2" />
          <line x1="0" y1="4" x2="4" y2="4" stroke={color} strokeWidth="1.2" />
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

// SET diamond: rhombus
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
  const strokeWidth = Math.max(1.5, size / 16);
  const isSolid = shading === 0;
  const isStriped = shading === 1;

  return (
    <svg
      width={(size * 17) / 20}
      height={size}
      viewBox="0 0 17 20"
      className="flex-shrink-0"
      aria-hidden
    >
      <defs>
        <pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          width="4"
          height="4"
        >
          <line x1="0" y1="0" x2="4" y2="0" stroke={color} strokeWidth="1.2" />
          <line x1="0" y1="2" x2="4" y2="2" stroke={color} strokeWidth="1.2" />
          <line x1="0" y1="4" x2="4" y2="4" stroke={color} strokeWidth="1.2" />
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

export function Card({ code, selected, disabled, onClick }: Props) {
  const { shape, color, shading, count } = parse(code);
  const colorHex = COLORS[color as keyof typeof COLORS] ?? COLORS[0];
  const patternId = React.useId().replace(/:/g, "");

  const ring = selected ? "ring-2 ring-primary" : "ring-1 ring-slate-300";
  const lift = selected ? "-translate-y-0.5" : "";
  const cursor = disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-slate-100";

  return (
    <button
      onClick={() => !disabled && onClick()}
      className={`relative flex h-40 w-full min-w-0 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-3 shadow-sm transition ${ring} ${lift} ${cursor}`}
      aria-label={`Card ${code}`}
    >
      <div className="flex items-center justify-center gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} className="select-none flex items-center justify-center">
            {renderShape(shape, shading, colorHex, SHAPE_SIZE, `${patternId}-${i}`)}
          </span>
        ))}
      </div>
      <div className="absolute bottom-2 right-2 text-[10px] text-slate-400">
        {code}
      </div>
    </button>
  );
}
