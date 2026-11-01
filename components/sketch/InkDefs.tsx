"use client";

import { useEffect } from "react";

/**
 * Site-wide SVG filters for the sketchbook theme (same recipe as the doodle footer):
 *  - #ink-head: dry-brush ink for big headings (rough edges + a few streaks)
 *  - #boil0..2: three hand-drawn "takes" that are swapped 8 times a second on every `.boil` element
 */
export default function InkDefs() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Swap one CSS variable on <html> (read by `.boil { filter: var(--boil) }`), so React-rendered
    // elements are never touched directly and hydration stays clean.
    const root = document.documentElement;
    let k = 0;
    const t = setInterval(() => {
      if (document.hidden) return;
      k = (k + 1) % 3;
      root.style.setProperty("--boil", `url(#boil${k})`);
    }, 125);
    return () => { clearInterval(t); root.style.removeProperty("--boil"); };
  }, []);

  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <defs>
        {[0, 1, 2].map(k => (
          <filter key={k} id={`boil${k}`} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed={k * 7 + 3} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        ))}
        <filter id="ink-head" x="-2%" y="-6%" width="104%" height="112%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="11" result="edge" />
          <feDisplacementMap in="SourceGraphic" in2="edge" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="rough" />
          {/* only fine ink specks (no long streaks, which read like strikethroughs on body-size headings) */}
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="9" result="speck" />
          <feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -26 7.6" result="holes" />
          <feComposite in="rough" in2="holes" operator="out" />
        </filter>
      </defs>
    </svg>
  );
}
