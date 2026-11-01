"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A pair of big inked eyes that watch the cursor.
 * Pupils chase the pointer with a little lag, the eyes blink now and then, the brows lift when the
 * cursor is over something clickable, and a click makes them squint and bounce. Lines boil with the theme.
 */
export default function Eyes({ size = 140, className = "", label = "Zariva's eyes, following your cursor" }: { size?: number; className?: string; label?: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const pupils = useRef<(SVGGElement | null)[]>([]);
  const lids = useRef<(SVGGElement | null)[]>([]);
  const brows = useRef<SVGGElement>(null);
  const [squint, setSquint] = useState(false);

  // eye centres and travel, in the 200×110 drawing
  const EYES = [{ x: 58, y: 62 }, { x: 142, y: 62 }];
  const MAX = 15;

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let px = innerWidth / 2, py = innerHeight / 2, excited = 0, target = 0, raf = 0, alive = true;
    const cur = EYES.map(() => ({ x: 0, y: 0 }));
    let blinkAt = performance.now() + 1500 + Math.random() * 2500, blink = 0;

    const onMove = (e: PointerEvent) => {
      px = e.clientX; py = e.clientY;
      target = (e.target as Element | null)?.closest?.("a, button, [role='button'], input, select, textarea") ? 1 : 0;
    };
    addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
    io.observe(el);

    const frame = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      const r = el.getBoundingClientRect(), k = 200 / r.width;
      EYES.forEach((e, i) => {
        const ex = r.left + e.x / k, ey = r.top + e.y / k;
        const dx = px - ex, dy = py - ey, d = Math.hypot(dx, dy) || 1;
        const m = MAX * Math.min(1, d / 260);
        const tx = (dx / d) * m, ty = (dy / d) * m * 0.8;
        cur[i].x += (tx - cur[i].x) * (reduce ? 1 : 0.18);
        cur[i].y += (ty - cur[i].y) * (reduce ? 1 : 0.18);
        pupils.current[i]?.setAttribute("transform", `translate(${cur[i].x.toFixed(2)} ${cur[i].y.toFixed(2)})`);
      });
      excited += (target - excited) * 0.15;
      brows.current?.setAttribute("transform", `translate(0 ${(-7 * excited).toFixed(2)})`);
      // blink: lids close and open over ~160 ms
      if (!reduce && now > blinkAt) { blink = 160; blinkAt = now + 2200 + Math.random() * 3800; }
      if (blink > 0) blink = Math.max(0, blink - 16);
      const lid = blink > 0 ? Math.abs(blink - 80) / 80 : 1; // 1 open → 0 shut → 1 open
      lids.current.forEach((l, i) => l?.setAttribute("transform", `translate(0 ${(EYES[i].y * (1 - lid)).toFixed(2)}) scale(1 ${Math.max(0.08, lid).toFixed(3)})`));
    };
    raf = requestAnimationFrame(frame);
    return () => { alive = false; cancelAnimationFrame(raf); io.disconnect(); removeEventListener("pointermove", onMove); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const poke = () => { setSquint(true); setTimeout(() => setSquint(false), 650); };

  return (
    <svg ref={svg} className={`eyes boil${squint ? " is-squint" : ""} ${className}`} viewBox="0 0 200 110" width={size} height={(size * 110) / 200}
      role="img" aria-label={label} onPointerDown={poke}>
      {/* brows */}
      <g ref={brows} className="eyes__brows">
        <path d="M30 18 C44 9 66 9 82 16" />
        <path d="M118 16 C134 9 156 9 170 18" />
      </g>
      {EYES.map((e, i) => (
        <g key={i} className="eyes__eye">
          {/* hand-drawn white, slightly lopsided */}
          <path className="eyes__white" d={i === 0
            ? "M58 28 C79 27 92 44 91 63 C90 84 75 97 57 96 C37 95 25 80 26 61 C27 41 39 29 58 28 Z"
            : "M142 27 C162 28 175 43 174 63 C173 83 160 97 141 96 C121 95 108 81 109 61 C110 41 123 26 142 27 Z"} />
          <g ref={el => { lids.current[i] = el; }} className="eyes__lid">
            <g ref={el => { pupils.current[i] = el; }}>
              <circle className="eyes__pupil" cx={e.x} cy={e.y} r="13" />
              <circle className="eyes__glint" cx={e.x + 5} cy={e.y - 5} r="4" />
              <circle className="eyes__glint" cx={e.x - 4} cy={e.y + 5} r="1.6" />
            </g>
          </g>
          {/* lashes */}
          <path className="eyes__lash" d={i === 0 ? "M34 36 l-8 -6 M44 30 l-4 -8" : "M166 36 l8 -6 M156 30 l4 -8"} />
        </g>
      ))}
      {/* blush */}
      <ellipse className="eyes__blush" cx="38" cy="100" rx="11" ry="4" />
      <ellipse className="eyes__blush" cx="162" cy="100" rx="11" ry="4" />
    </svg>
  );
}
