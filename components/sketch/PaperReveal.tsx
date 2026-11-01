"use client";

import { useId, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * Crumpled-paper reveal: the content starts as a balled-up sheet (squashed, tilted, and warped by an
 * animated SVG displacement filter, with crease facets on top) and unfolds flat as you scroll.
 * Desktop: pinned and scrubbed to the scroll. Small screens: plays once when it comes into view.
 * The creases stay faintly visible afterwards, like a page that has been smoothed out.
 */
export default function PaperReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const root = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const disp = useRef<SVGFEDisplacementMapElement>(null);

  // deterministic crease facets: a jittered grid split into triangles, each lit or shadowed
  const facets = useMemo(() => {
    const cols = 9, rows = 6, rnd = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
    const pt = (c: number, r: number) => {
      const edge = c === 0 || r === 0 || c === cols || r === rows;
      const jx = edge ? 0 : (rnd(c * 31 + r * 7) - 0.5) * 9, jy = edge ? 0 : (rnd(c * 13 + r * 29) - 0.5) * 12;
      return [(c / cols) * 100 + jx, (r / rows) * 100 + jy];
    };
    const tris: { d: string; light: boolean; a: string }[] = [];
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      const p = [pt(c, r), pt(c + 1, r), pt(c + 1, r + 1), pt(c, r + 1)];
      const flip = rnd(c * 5 + r * 11) > 0.5;
      const t1 = flip ? [p[0], p[1], p[2]] : [p[0], p[1], p[3]];
      const t2 = flip ? [p[0], p[2], p[3]] : [p[1], p[2], p[3]];
      [t1, t2].forEach((t, k) => {
        const v = rnd(c * 17 + r * 23 + k * 3);
        // round so the server and browser render identical numbers (Math.sin differs in the last digits)
        tris.push({ d: "M" + t.map(q => q.map(n => n.toFixed(2)).join(" ")).join(" L") + " Z", light: v > 0.5, a: (0.05 + v * 0.13).toFixed(3) });
      });
    }
    return tris;
  }, []);

  useGSAP(() => {
    const el = sheet.current, map = disp.current, wrap = root.current;
    if (!el || !map || !wrap) return;
    const creases = el.querySelector(".paper__creases"), inner = el.querySelector(".paper__inner");
    const filterOn = () => { el.style.filter = `url(#crumple-${uid})`; };
    const filterOff = () => { el.style.filter = "none"; };

    const build = () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      tl.fromTo(el, { scale: 0.26, rotate: -16, borderRadius: 220, y: 30 }, { scale: 1, rotate: 0, borderRadius: 22, y: 0, duration: 1 }, 0)
        .fromTo(map, { attr: { scale: 120 } }, { attr: { scale: 0 }, duration: 1 }, 0)
        .fromTo(creases, { opacity: 1 }, { opacity: 0.16, duration: 1 }, 0)
        .fromTo(inner, { opacity: 0.15 }, { opacity: 1, duration: 0.5 }, 0.45)
        .from(el.querySelectorAll("[data-paper-item]"), { y: 24, opacity: 0, stagger: 0.08, duration: 0.35, ease: "power3.out" }, 0.7);
      return tl;
    };

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: reduce)", () => { filterOff(); gsap.set(creases, { opacity: 0.16 }); });
    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 900px)", () => {
      filterOn();
      const tl = build();
      gsap.timeline({
        scrollTrigger: {
          trigger: wrap, start: "top top", end: "+=130%", scrub: 0.8, pin: true, anticipatePin: 1,
          // keep text crisp once the sheet is flat; warp again only while it is crumpling
          onUpdate: self => (self.progress > 0.97 ? filterOff() : filterOn()),
        },
      }).add(tl);
    });
    mm.add("(prefers-reduced-motion: no-preference) and (max-width: 899px)", () => {
      filterOn();
      const tl = build().pause();
      tl.eventCallback("onComplete", filterOff);
      gsap.timeline({ scrollTrigger: { trigger: wrap, start: "top 70%", once: true, onEnter: () => { tl.duration(1.6).play(); } } });
    });
  }, { scope: root });

  return (
    <div ref={root} className={`paper-stage ${className}`}>
      <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
        <filter id={`crumple-${uid}`} x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="7" result="n" />
          <feDisplacementMap ref={disp} in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div ref={sheet} className="paper">
        <div className="paper__inner">{children}</div>
        <svg className="paper__creases" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {facets.map((f, i) => <path key={i} d={f.d} fill={f.light ? "#fff" : "#002200"} fillOpacity={f.a} stroke="#002200" strokeOpacity={0.12} strokeWidth={0.15} />)}
        </svg>
      </div>
    </div>
  );
}
