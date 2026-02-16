import React, { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

export function Toast({
  message,
  type,
  onDone
}: {
  message: string;
  type: ToastType;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, [onDone]);

  const cls =
    type === "success"
      ? "border-emerald-300 bg-emerald-50"
      : type === "error"
        ? "border-rose-300 bg-rose-50"
        : "border-slate-300 bg-slate-100";

  return (
    <div className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl border px-4 py-2 shadow-lg ${cls}`}>
      <div className="text-sm text-slate-800">{message}</div>
    </div>
  );
}
