import React from "react";
import { Modal } from "./Modal";

export function PaywallModal({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} title="Want another round?" onClose={onClose}>
      <p className="text-slate-700">
        Daily is complete. Unlock unlimited puzzles and practice modes.
      </p>

      <div className="mt-5 flex gap-3">
        <button
          className="flex-1 rounded-xl bg-primary px-4 py-2 font-semibold text-white hover:opacity-95"
          onClick={() => {
            // MVP stub: no payment yet
            alert("MVP: Hook this up to Stripe later.");
          }}
        >
          Unlock Unlimited
        </button>
        <button
          className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
          onClick={onClose}
        >
          Not now
        </button>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        $X/month • cancel anytime
      </div>
    </Modal>
  );
}
