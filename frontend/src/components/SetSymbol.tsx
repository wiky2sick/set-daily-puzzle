import React from "react";

type Props = {
  shape: number;
  shading: number;
  color: string;
  size: number;
  patternId?: string;
};

const SHAPES = ["oval", "squiggle", "diamond"] as const;

export function SetSymbol({ shape, shading, color, size }: Props) {
  const shapeId = SHAPES[shape] ?? SHAPES[0];
  const isStriped = shading === 1;
  const isOutline = shading === 2;

  return (
    <svg
      width={size / 2}
      height={size}
      viewBox="0 0 200 400"
      className="flex-shrink-0"
      style={{ transition: "width 0.5s, height 0.5s" }}
      aria-hidden
    >
      <use
        href={`#${shapeId}`}
        fill={isOutline ? "transparent" : color}
        mask={isStriped ? "url(#mask-stripe)" : undefined}
      />
      <use href={`#${shapeId}`} stroke={color} fill="none" strokeWidth={18} />
    </svg>
  );
}
