"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export const LOADED_EVENT = "zariva:loaded";
const SEEN_KEY = "zariva-loaded";

// Same geometry as the footer / hero ink logo (font size 200, x-height ≈ 106).
const RI = "M0 -104 L0 0 M0 -56 C9 -96 36 -106 56 -96 C79 -84 103 -132 97 -160 C92 -184 64 -170 60 -116 C57 -60 54 22 80 44 C91 52 104 47 112 38";
const RI_X = 236, VA_X = 384, AI_X = 612, DOT = { x: RI_X + 104, y: -186 };

/**
 * First-visit loading screen: the zariva logo reveals itself in the centre while a lime line tracks
 * real loading (fonts + page load, at least ~1.8 s, at most ~4.5 s), then the screen lifts away.
 * Shows once per browser session; skipped with reduced motion. The markup is server-rendered so it
 * covers the page from the very first paint; a tiny head script adds `zl-skip` when it should not show.
 */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const done = () => {
      html.classList.remove("zl-active");
      try { sessionStorage.setItem(SEEN_KEY, "1"); } catch {}
      window.__zarivaLoaded = true;
      window.dispatchEvent(new Event(LOADED_EVENT));
      window.__lenis?.start();
      setGone(true);
    };
    if (html.classList.contains("zl-skip") || !root.current) { done(); return; }

    html.classList.add("zl-active");
    window.__lenis?.stop();
    const el = root.current, q = (s: string) => el.querySelector(s);

    // real loading: fonts + window load, bounded so it never feels stuck or flashes by
    const t0 = performance.now();
    const pageReady = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      document.readyState === "complete" ? Promise.resolve() : new Promise(r => addEventListener("load", r, { once: true })),
    ]);
    const capped = Promise.race([pageReady, new Promise(r => setTimeout(r, 4500))]);

    const progress = { v: 0 };
    const bar = q(".zl__bar i") as HTMLElement, pct = q(".zl__pct") as HTMLElement;
    const setP = () => { bar.style.transform = `scaleX(${progress.v / 100})`; pct.textContent = `${Math.round(progress.v)}%`; };

    // the logo reveal (offsets are in the SVG's own units: percentage transforms don't resolve on SVG text)
    const reveal = gsap.timeline({ defaults: { ease: "power3.out" } });
    reveal
      .from(".zl__za", { y: 120, opacity: 0, duration: 0.6 }, 0.15)
      .fromTo(".zl__ri", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, 0.4)
      .from(".zl__va", { y: 120, opacity: 0, duration: 0.6 }, 0.75)
      .from(".zl__dot", { y: -140, opacity: 0, duration: 0.7, ease: "bounce.out" }, 1.05)
      .from(".zl__ai", { opacity: 0, x: -16, duration: 0.5 }, 1.35)
      .from(".zl__tag", { opacity: 0, y: 8, duration: 0.5 }, 1.45);

    // progress creeps to 85% while loading, then completes
    const creep = gsap.to(progress, { v: 85, duration: 2.6, ease: "power1.out", onUpdate: setP });

    let exit: gsap.core.Timeline | null = null;
    capped.then(async () => {
      const minWait = Math.max(0, 1800 - (performance.now() - t0));
      await new Promise(r => setTimeout(r, minWait));
      creep.kill();
      exit = gsap.timeline({ onComplete: done });
      exit
        .to(progress, { v: 100, duration: 0.35, ease: "power2.out", onUpdate: setP })
        .to(reveal, { progress: 1, duration: 0.3 }, 0)                       // finish the logo if loading was quick
        .to(".zl__mark", { scale: 1.04, duration: 0.25, ease: "power2.out" }, 0.4)
        .to(".zl__meta", { opacity: 0, y: 6, duration: 0.25 }, 0.4)
        .to(".zl__mark", { opacity: 0, y: -24, duration: 0.35, ease: "power2.in" }, 0.6)
        .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.85, ease: "power4.inOut" }, 0.7)
        .add(() => { window.dispatchEvent(new Event(LOADED_EVENT + ":lifting")); }, 0.8);
    });

    return () => { reveal.kill(); creep.kill(); exit?.kill(); html.classList.remove("zl-active"); };
  }, []);

  if (gone) return null;

  return (
    <div ref={root} className="zl" role="status" aria-live="polite" aria-label="Loading Zariva.AI">
      <div className="zl__mark">
        <svg className="zl__logo" viewBox="-8 -226 690 300" aria-hidden="true">
          <text className="zl__za" x="0" y="0" textLength="222" lengthAdjust="spacingAndGlyphs">za</text>
          <path className="zl__ri" d={RI} transform={`translate(${RI_X} 0)`} pathLength={1} />
          <text className="zl__va" x={VA_X} y="0" textLength="220" lengthAdjust="spacingAndGlyphs">va</text>
          <text className="zl__ai" x={AI_X} y="0">ai</text>
          <circle className="zl__dot" cx={DOT.x} cy={DOT.y} r="19" />
        </svg>
        <p className="zl__tag mono">AI-powered technology &amp; growth partner</p>
      </div>
      <div className="zl__meta">
        <div className="zl__bar"><i /></div>
        <span className="zl__pct mono">0%</span>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    __zarivaLoaded?: boolean;
  }
}
