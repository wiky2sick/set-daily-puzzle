export type SetTraits = {
  shape: number;
  color: number;
  shading: number;
  count: number;
};

export function parseSetCode(code: string): SetTraits {
  return {
    shape: Number(code[0]),
    color: Number(code[1]),
    shading: Number(code[2]),
    count: Number(code[3]) + 1,
  };
}

export function buildSetId(cards: string[]): string {
  return [...cards].sort().join("|");
}

function allSame(values: number[]): boolean {
  return values.every((v) => v === values[0]);
}

export function describeSetType(cards: string[]): string {
  if (cards.length !== 3) return "SET";

  const traits = cards.map(parseSetCode);

  const shapeNames = ["oval", "squiggle", "diamond"] as const;
  const colorNames = ["red", "green", "purple"] as const;
  const shadingNames = ["solid", "striped", "open"] as const;

  const attrs = [
    {
      name: "Shape",
      values: traits.map((t) => t.shape),
      labels: shapeNames,
    },
    {
      name: "Color",
      values: traits.map((t) => t.color),
      labels: colorNames,
    },
    {
      name: "Shading",
      values: traits.map((t) => t.shading),
      labels: shadingNames,
    },
  ] as const;

  return attrs
    .map((attr) => {
      if (allSame(attr.values)) {
        const label = attr.labels[attr.values[0]] ?? String(attr.values[0]);
        return `${attr.name}: ${label}`;
      }
      return `${attr.name}: all different`;
    })
    .join(" • ");
}
