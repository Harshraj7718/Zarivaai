"use client";

import { useEffect, useRef } from "react";
import { DotPattern } from "@/components/ui/dot-pattern";

/**
 * Site-wide background: a fixed dot grid behind every page, plus a lime copy of the
 * same grid that only shows in a soft circle around the cursor.
 */
export default function SiteDots() {
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = glow.current;
    if (!el || !matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, x = -999, y = -999;
    const paint = () => { raf = 0; el.style.setProperty("--mx", `${x}px`); el.style.setProperty("--my", `${y}px`); };
    const onMove = (e: PointerEvent) => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(paint); };
    const onLeave = () => { x = y = -999; if (!raf) raf = requestAnimationFrame(paint); };
    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => { removeEventListener("pointermove", onMove); document.removeEventListener("pointerleave", onLeave); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div aria-hidden="true" className="site-dots pointer-events-none fixed inset-0 -z-10">
      <DotPattern width={22} height={22} cx={1.5} cy={1.5} cr={1.1} className="fill-ink/15 md:fill-ink/20" />
      <div ref={glow} className="site-dots__glow absolute inset-0">
        <DotPattern width={22} height={22} cx={1.5} cy={1.5} cr={1.6} className="fill-lime md:fill-lime" />
      </div>
    </div>
  );
}
