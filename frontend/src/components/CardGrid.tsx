import React from "react";
import { Card } from "./Card";

export function CardGrid({
  board,
  selected,
  disabled,
  onToggle
}: {
  board: string[];
  selected: string[];
  disabled: boolean;
  onToggle: (code: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
      {board.map((code) => (
        <Card
          key={code}
          code={code}
          selected={selected.includes(code)}
          disabled={disabled}
          onClick={() => onToggle(code)}
        />
      ))}
    </div>
  );
}
