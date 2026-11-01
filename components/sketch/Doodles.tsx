"use client";

import { useState } from "react";

/** Little ink doodles that drift in a section's background. Click one to pop it; it comes back a moment later. */
export type DoodleKind = "leaf" | "dot" | "star" | "bolt" | "code" | "chart" | "sparkle" | "cog";

const ART: Record<DoodleKind, React.ReactNode> = {
  leaf: <><path fill="#79D900" d="M-10 10 C-12 -4 -2 -12 11 -12 C12 2 4 11 -10 10 Z" /><path fill="none" d="M-10 10 C-4 4 2 -2 8 -9" /></>,
  dot: <><circle fill="#FF9100" r="9" /><circle fill="#fff" stroke="none" cx="-3" cy="-3" r="2.4" /></>,
  star: <path fill="#FF9100" d="M0 -12 L3.4 -4 L12 -3.6 L5.4 2 L7.6 11 L0 6 L-7.6 11 L-5.4 2 L-12 -3.6 L-3.4 -4 Z" />,
  bolt: <path fill="#79D900" d="M3 -13 L-8 2 L-1 2 L-4 13 L8 -3 L1 -3 Z" />,
  code: <path fill="none" strokeWidth="2.6" d="M-6 -8 L-12 0 L-6 8 M6 -8 L12 0 L6 8 M3 -10 L-3 10" />,
  chart: <><path fill="none" d="M-12 -12 V10 H12" /><path fill="none" stroke="#3d7400" strokeWidth="2.6" d="M-8 4 L-2 -2 L3 2 L10 -7 M5 -7 H10 V-2" /></>,
  sparkle: <path fill="#79D900" d="M0 -12 C1 -4 4 -1 12 0 C4 1 1 4 0 12 C-1 4 -4 1 -12 0 C-4 -1 -1 -4 0 -12 Z" />,
  cog: <><circle fill="#F1F1E9" r="9" /><path fill="none" d="M0 -12 v3 M0 9 v3 M-12 0 h3 M9 0 h3 M-8.5 -8.5 l2 2 M6.5 6.5 l2 2 M-8.5 8.5 l2 -2 M6.5 -6.5 l2 -2" /><circle fill="none" r="3.4" /></>,
};

export type DoodleSpot = { kind: DoodleKind; left: string; top: string; size?: number };

export default function Doodles({ items }: { items: DoodleSpot[] }) {
  const [popped, setPopped] = useState<number[]>([]);
  const pop = (i: number) => {
    setPopped(p => [...p, i]);
    setTimeout(() => setPopped(p => p.filter(x => x !== i)), 1600);
  };
  return (
    <div className="doodles" aria-hidden="true">
      {items.map((d, i) => {
        const size = d.size ?? 28;
        const seed = (i * 37) % 10;
        return (
          <span key={i} className={`doodle boil${popped.includes(i) ? " popped" : ""}`} onPointerDown={() => pop(i)}
            style={{ left: d.left, top: d.top, width: size, height: size,
              "--dur": `${6 + seed * 0.5}s`, "--delay": `${-seed * 0.7}s`, "--r0": `${-10 + seed}deg`, "--r1": `${4 + seed}deg`, "--dx": `${(seed % 2 ? 1 : -1) * (4 + seed)}px` } as React.CSSProperties}>
            <svg viewBox="-16 -16 32 32">{ART[d.kind]}</svg>
          </span>
        );
      })}
    </div>
  );
}
