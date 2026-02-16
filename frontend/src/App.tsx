import React, { useEffect, useState } from "react";
import { Api } from "./api";
import type { DailyPuzzleResponse, FoundSet } from "./types";
import { CardGrid } from "./components/CardGrid";
import { SidePanel } from "./components/SidePanel";
import { PaywallModal } from "./components/PaywallModal";
import { HowToPlayModal } from "./components/HowToPlayModal";
import { Toast, ToastType } from "./components/Toast";
import { buildSetId, describeSetType } from "./setUtils";

type ToastState = { msg: string; type: ToastType } | null;

function parseStoredFoundSets(raw: string | null): FoundSet[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => item && typeof item === "object")
      .map((item) => {
        const cards = Array.isArray(item.cards)
          ? item.cards.filter((card: unknown) => typeof card === "string")
          : [];
        const id = typeof item.id === "string" && item.id ? item.id : buildSetId(cards);
        const typeLabel =
          typeof item.typeLabel === "string" && item.typeLabel
            ? item.typeLabel
            : describeSetType(cards);

        return { id, cards, typeLabel };
      })
      .filter((item) => item.cards.length === 3 && item.id.length > 0);
  } catch {
    return [];
  }
}

function migrateLegacyFoundSigs(raw: string | null): FoundSet[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((sig) => typeof sig === "string" && sig.length > 0)
      .map((sig) => {
        const cards = sig.split("|").filter(Boolean);
        const id = buildSetId(cards);
        return {
          id,
          cards,
          typeLabel: describeSetType(cards),
        };
      })
      .filter((item) => item.cards.length === 3 && item.id.length > 0);
  } catch {
    return [];
  }
}

export default function App() {
  const [data, setData] = useState<DailyPuzzleResponse | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const [foundSets, setFoundSets] = useState<FoundSet[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const daily = await Api.getDaily();
        setData(daily);
        setMistakes(daily.progress.mistakes);
        setCompleted(daily.progress.completed);

        const foundSetsKey = `set_daily_found_sets:${daily.date}`;
        const foundSigsKey = `set_daily_found_sigs:${daily.date}`;

        const storedSets = parseStoredFoundSets(localStorage.getItem(foundSetsKey));
        if (storedSets.length > 0) {
          setFoundSets(storedSets);
        } else {
          // Backward compatibility with previous signature-only storage.
          setFoundSets(migrateLegacyFoundSigs(localStorage.getItem(foundSigsKey)));
        }
      } catch (e: any) {
        setToast({ msg: e.message || "Failed to load", type: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!data) return;
    const foundSetsKey = `set_daily_found_sets:${data.date}`;
    localStorage.setItem(foundSetsKey, JSON.stringify(foundSets));
  }, [foundSets, data]);

  const totalSets = data?.total_sets ?? 0;

  const onToggle = (code: string) => {
    if (!data || completed) return;

    setSelected((prev) => {
      if (prev.includes(code)) return prev.filter((c) => c !== code);
      if (prev.length >= 3) return prev;
      return [...prev, code];
    });
  };

  // Auto-submit when selection hits 3
  useEffect(() => {
    (async () => {
      if (!data || completed) return;
      if (selected.length !== 3) return;

      try {
        const res = await Api.guessDaily(selected);

        if (!res.is_set) {
          setMistakes((m) => m + 1);
          setToast({ msg: "Not a set — try again", type: "error" });
          setSelected([]);
          return;
        }

        if (res.already_found) {
          setToast({ msg: "Already found", type: "info" });
          setSelected([]);
          return;
        }

        const cards = [...selected].sort();
        const id = buildSetId(cards);
        setFoundSets((prev) =>
          prev.some((setEntry) => setEntry.id === id)
            ? prev
            : [...prev, { id, cards, typeLabel: describeSetType(cards) }]
        );

        setToast({ msg: "That’s a SET ✨", type: "success" });
        setSelected([]);

        if (res.completed) {
          setCompleted(true);
          setToast({ msg: "Daily complete ✅", type: "success" });
        }
      } catch (e: any) {
        setToast({ msg: e.message || "Guess failed", type: "error" });
        setSelected([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.length]);

  const foundCount = completed ? totalSets : Math.min(foundSets.length, totalSets);
  const showPaywallCTA = completed;

  return (
    <div className="min-h-screen bg-slate-100">
      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
      <HowToPlayModal open={howOpen} onClose={() => setHowOpen(false)} />
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">Daily Puzzle</div>
            <div className="text-xl font-semibold text-slate-800">
              {data?.date ?? "—"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
              onClick={() => setHowOpen(true)}
            >
              How to play
            </button>
            <button
              className="rounded-xl bg-white border border-slate-300 px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
              onClick={() => setPaywallOpen(true)}
            >
              + More puzzles
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {loading ? (
              <div className="text-slate-500">Loading…</div>
            ) : !data ? (
              <div className="text-slate-500">No data</div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Found <span className="font-semibold text-slate-800">{foundCount}</span> / {totalSets}
                    <span className="ml-3 text-slate-500">Mistakes: {mistakes}</span>
                  </div>
                  {completed && (
                    <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700 border border-emerald-200">
                      Completed
                    </div>
                  )}
                </div>

                <CardGrid board={data.board} selected={selected} disabled={completed} onToggle={onToggle} />

                {showPaywallCTA && (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="font-semibold text-slate-800">Daily complete ✅</div>
                    <div className="mt-1 text-sm text-slate-600">
                      Come back tomorrow, or unlock more puzzles.
                    </div>
                    <button
                      className="mt-3 rounded-xl bg-primary px-4 py-2 font-semibold text-white hover:opacity-95"
                      onClick={() => setPaywallOpen(true)}
                    >
                      Play another
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <SidePanel foundSets={foundSets} totalSets={totalSets} />
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          Built for quick daily focus. Upgrade visuals (SVG shapes/striping) after MVP.
        </div>
      </div>
    </div>
  );
}
