import React from "react";
import type { FoundSet } from "../types";
import { describeSetType } from "../setUtils";
import { SetCardPreview } from "./SetCardPreview";

export function SidePanel({
  foundSets,
  totalSets
}: {
  foundSets: FoundSet[];
  totalSets: number;
}) {
  const foundCount = foundSets.length;
  const pct = totalSets > 0 ? Math.min(100, Math.round((foundCount / totalSets) * 100)) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Your Sets</h3>
        <div className="text-xs text-slate-500">
          Found <span className="text-slate-700">{foundCount}</span> / {totalSets}
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-4 max-h-[55vh] space-y-2 overflow-auto pr-1">
        {foundSets.length === 0 ? (
          <div className="text-sm text-slate-500">Find your first set ✨</div>
        ) : (
          foundSets.map((setEntry, idx) => (
            <div key={setEntry.id} className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Set {idx + 1}
              </div>
              <div className="mt-1 text-[11px] leading-relaxed text-slate-500">
                {describeSetType(setEntry.cards)}
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2">
                {setEntry.cards.map((code) => (
                  <SetCardPreview key={`${setEntry.id}-${code}`} code={code} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
