import React from "react";
import { Modal } from "./Modal";

export function HowToPlayModal({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} title="How to play" onClose={onClose}>
      <div className="space-y-3 text-sm leading-relaxed">
        <p>
          Select <span className="font-semibold">3 cards</span>. A valid SET means
          that for each attribute (shape, color, shading, count), the three cards are
          either <span className="font-semibold">all the same</span> or{" "}
          <span className="font-semibold">all different</span>.
        </p>
        <p>If any attribute has exactly two matching and one different, it’s not a set.</p>
        <p className="text-slate-500">
          Tip: Two cards determine the third—your brain will start seeing it.
        </p>
      </div>
    </Modal>
  );
}
