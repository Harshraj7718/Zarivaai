"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The footer crew, as small cameos around the site. Each one blinks, follows the pointer
 * with its eyes, and hops and says a line when clicked. Lines "boil" with the rest of the theme.
 */
type Eye = { x: number; y: number; r: number; p: number; m: number };
type Kind = "bolt" | "dot" | "sprout" | "byte";

const ART: Record<Kind, { box: [number, number, number, number]; eyes: Eye[]; idle?: "bob" | "sway"; body: React.ReactNode }> = {
  bolt: {
    box: [-48, -130, 98, 136], idle: "bob",
    eyes: [{ x: -9, y: -86, r: 5.2, p: 2.6, m: 2 }, { x: 9, y: -86, r: 5.2, p: 2.6, m: 2 }],
    body: <>
      <path d="M-24 0 h16 v-7 h-16 Z M8 0 h16 v-7 h-16 Z" />
      <path className="n thick" d="M-16 -7 v-16 M16 -7 v-16" />
      <rect x="-26" y="-62" width="52" height="40" rx="9" />
      <circle className="l" cx="0" cy="-45" r="6.5" />
      <path className="n thin" d="M-17 -31 h9 M8 -31 h9" />
      <path className="n thick" d="M-26 -56 C-40 -52 -42 -40 -38 -31" /><circle cx="-38" cy="-28" r="5" />
      <path className="n thick" d="M26 -56 C40 -62 44 -76 40 -88" /><circle cx="40" cy="-91" r="5" />
      <path className="n" d="M-6 -62 v-6 M6 -62 v-6" />
      <rect x="-35" y="-94" width="6" height="14" rx="2.5" /><rect x="29" y="-94" width="6" height="14" rx="2.5" />
      <rect x="-30" y="-106" width="60" height="38" rx="11" />
      <rect className="s" x="-23" y="-99" width="46" height="25" rx="7" />
      <path className="ln" d="M-5 -79.5 C-2 -77 2 -77 5 -79.5" />
      <path className="n" d="M0 -106 v-13" /><circle className="o" cx="0" cy="-123" r="5.5" />
    </>,
  },
  dot: {
    box: [-30, -38, 60, 40], idle: "bob",
    eyes: [{ x: -5.5, y: -18, r: 0, p: 2.4, m: 1.4 }, { x: 5.5, y: -18, r: 0, p: 2.4, m: 1.4 }],
    body: <>
      <circle className="o" cx="0" cy="-17" r="17" />
      <path className="n thin" d="M8 -29 C13 -26 16 -21 16 -15" style={{ stroke: "#fff", opacity: 0.8 }} />
      <path className="n" d="M-4 -10 C-2 -8 2 -8 4 -10" />
      <path className="n thin" d="M-24 -30 l-4 -3 M-25 -20 l-5 0 M24 -30 l4 -3 M25 -20 l5 0" />
    </>,
  },
  sprout: {
    box: [-30, -80, 60, 82], idle: "sway",
    eyes: [{ x: -7.5, y: -40, r: 6, p: 3, m: 2.6 }, { x: 8, y: -40, r: 6, p: 3, m: 2.6 }],
    body: <>
      <path className="n" d="M0 -58 v-7" />
      <path className="l" d="M0 -64 C-4 -74 -16 -80 -27 -76 C-23 -66 -11 -62 0 -64 Z" />
      <path className="l" d="M0 -64 C5 -76 18 -80 28 -75 C23 -64 11 -61 0 -64 Z" />
      <path className="l" d="M-22 0 L-22 -40 C-22 -54 -12 -60 0 -60 C12 -60 22 -54 22 -40 L22 0 Z" />
      <path className="k" d="M-4 -30 C-2 -25 3 -25 5 -30 Z" />
      <path className="n thin" d="M-17 -32 l3 -2 M-14 -31 l3 -2 M14 -32 l3 -2 M17 -31 l3 -2" />
    </>,
  },
  byte: {
    box: [-40, -58, 80, 94],
    eyes: [{ x: -8, y: -34, r: 5, p: 2.5, m: 1.8 }, { x: 8, y: -34, r: 5, p: 2.5, m: 1.8 }],
    body: <>
      <path className="n thick" d="M-12 0 C-13 10 -12 18 -10 26 M12 0 C13 10 12 18 10 26" />
      <ellipse className="k" cx="-11" cy="29" rx="6" ry="3.6" /><ellipse className="k" cx="12" cy="29" rx="6" ry="3.6" />
      <path d="M-30 0 L30 0 L25 -9 L-25 -9 Z" />
      <path className="n thin" d="M-18 -4.5 h4 M-10 -4.5 h4 M-2 -4.5 h4 M6 -4.5 h4 M14 -4.5 h4" />
      <rect x="-25" y="-54" width="50" height="45" rx="5" />
      <rect className="s" x="-20" y="-49" width="40" height="34" rx="3" />
      <path className="ln" d="M-7 -24 l-4 3 l4 3 M7 -24 l4 3 l-4 3 M2 -26 l-4 10" />
      <path className="n thick" d="M-25 -20 C-36 -18 -38 -8 -34 -2 M25 -20 C36 -18 38 -8 34 -2" />
    </>,
  },
};

export default function Crew({ kind, says, size = 80, style, bubbleLeft }: { kind: Kind; says: string; size?: number; style?: React.CSSProperties; bubbleLeft?: boolean }) {
  const art = ART[kind];
  const [x, y, w, h] = art.box;
  const svg = useRef<SVGSVGElement>(null);
  const pupils = useRef<(SVGGElement | null)[]>([]);
  const [talk, setTalk] = useState(false);
  const [hop, setHop] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // eyes follow the pointer
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, px = 0, py = 0;
    const update = () => {
      raf = 0;
      const s = svg.current;
      if (!s) return;
      const r = s.getBoundingClientRect(), k = w / r.width;
      art.eyes.forEach((e, i) => {
        const ex = r.left + (e.x - x) / k, ey = r.top + (e.y - y) / k;
        const dx = px - ex, dy = py - ey, d = Math.hypot(dx, dy) || 1, m = e.m * Math.min(1, d / 220);
        pupils.current[i]?.setAttribute("transform", `translate(${(dx / d * m).toFixed(2)} ${(dy / d * m).toFixed(2)})`);
      });
    };
    const onMove = (ev: PointerEvent) => { px = ev.clientX; py = ev.clientY; if (!raf) raf = requestAnimationFrame(update); };
    addEventListener("pointermove", onMove, { passive: true });
    return () => { removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, [art.eyes, w, x, y]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const poke = () => {
    setTalk(true); setHop(false);
    requestAnimationFrame(() => setHop(true));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setTalk(false); setHop(false); }, 2600);
  };

  return (
    <span className="crew" style={{ width: size, ...style }}>
      {talk && <span className={`crew-say${bubbleLeft ? " left" : ""}`} role="status">{says}</span>}
      <svg ref={svg} viewBox={`${x} ${y} ${w} ${h}`} width={size} height={(size * h) / w} className="boil" role="button" tabIndex={0}
        aria-label={`${kind}: ${says}`} onClick={poke} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); poke(); } }}>
        <g className={`crew-art crew-body ${hop ? "hop" : art.idle ?? ""}`}>
          {art.body}
          {art.eyes.map((e, i) => (
            <g key={i} className="crew-lid" style={{ animationDelay: `${(i * 0.02 + (kind.length % 3) * 0.9).toFixed(2)}s` }}>
              {e.r > 0 && <circle className="eye-w" cx={e.x} cy={e.y} r={e.r} />}
              <g ref={el => { pupils.current[i] = el; }}>
                <circle className="k" cx={e.x} cy={e.y} r={e.p} />
                <circle className="glint" cx={e.x + e.p * 0.35} cy={e.y - e.p * 0.4} r={e.p * 0.32} />
              </g>
            </g>
          ))}
        </g>
      </svg>
    </span>
  );
}
