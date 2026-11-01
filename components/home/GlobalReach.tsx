"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { initGlobe } from "@/lib/engines/globe";

const REGIONS = [
  { id: "usa", flag: "US", name: "United States", cities: "New York · San Francisco · Austin · Chicago · Toronto",
    blurb: "SaaS builds, AI agents and growth marketing for US startups and growing businesses, run by a team that overlaps your working day.",
    services: ["SaaS engineering", "AI agents", "Digital marketing", "CRM & ERP", "Web & app"], points: ["Calls and stand-ups scheduled in US hours", "US-English copy, pricing and campaigns", "Contracts and invoicing in USD"] },
  { id: "eu", flag: "EU", name: "Europe & UK", cities: "London · Berlin · Amsterdam · Paris · Stockholm",
    blurb: "Product engineering, automation and day-to-day operations for European teams, with data handling planned around GDPR from the first call.",
    services: ["SaaS engineering", "AI agents", "Business operations", "Web & app", "Consulting"], points: ["Full working-day overlap with UK and CET", "Data processing agreements on request", "Contracts and invoicing in EUR or GBP"] },
  { id: "me", flag: "ME", name: "Middle East", cities: "Dubai · Riyadh · Doha",
    blurb: "ERP, CRM and AI customer support for fast-growing businesses across the Gulf, built for how your teams already work.",
    services: ["CRM & ERP", "AI agents", "Social media", "Web & app"], points: ["Support for English and Arabic interfaces", "Same-day responses in Gulf hours", "Contracts and invoicing in USD or AED"] },
  { id: "apac", flag: "AP", name: "India & Asia-Pacific", cities: "Bengaluru · Mumbai · Singapore · Sydney",
    blurb: "From hospital management platforms to marketplace listings, we build and grow businesses across India, Southeast Asia and Australia.",
    services: ["SaaS engineering", "Digital marketing", "Business operations", "CRM & ERP", "Consulting"], points: ["On-site workshops where needed", "Local marketplace and listing expertise", "Contracts and invoicing in INR, SGD or AUD"] },
  { id: "world", flag: "◎", name: "Everywhere else", cities: "Wherever you are, if you're online we can work together",
    blurb: "Remote-first means location is never the blocker. If you have an idea and an internet connection, we can build it and grow it with you.",
    services: ["All 8 services"], points: ["Async updates you can read in any time zone", "A weekly call at a time that suits you", "Contracts and invoicing in USD"] },
];

export default function GlobalReach() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const zin = useRef<HTMLButtonElement>(null);
  const zout = useRef<HTMLButtonElement>(null);
  const globe = useRef<{ focus: (id: string) => void; destroy: () => void } | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!canvas.current) return;
    const g = initGlobe(canvas.current, { zoomIn: zin.current, zoomOut: zout.current });
    globe.current = g;
    g.focus(REGIONS[0].id);
    return () => { g.destroy(); globe.current = null; };
  }, []);

  useEffect(() => { globe.current?.focus(REGIONS[active].id); }, [active]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const k = ({ ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 } as Record<string, number>)[e.key];
    if (!k) return;
    e.preventDefault();
    const n = (i + k + REGIONS.length) % REGIONS.length;
    setActive(n); tabs.current[n]?.focus();
  };

  const r = REGIONS[active];
  return (
    <section id="global" className="sec global">
      <div className="wrap">
        <div data-reveal>
          <p className="kicker mono"><i />Global reach</p>
          <h2 className="h2">Serving clients in the USA, Europe <span className="soft">and everywhere in between.</span></h2>
          <p className="sub">Remote-first from day one. The same team, the same eight services and the same way of working, whichever time zone you&apos;re in.</p>
        </div>

        <div className="global__grid" data-reveal>
          <div className="globe-wrap">
            <canvas ref={canvas} id="globe" role="img" aria-label="Rotating wireframe globe showing the cities and regions Zariva.AI serves. Drag to turn it." />
            <div className="globe-zoom" role="group" aria-label="Zoom the globe">
              <button type="button" ref={zin} aria-label="Zoom in">+</button>
              <button type="button" ref={zout} aria-label="Zoom out">−</button>
            </div>
            <p className="globe-hint mono">Drag to rotate · Ctrl + scroll to zoom</p>
          </div>

          <div className="regions">
            <div className="regions__list" role="tablist" aria-label="Regions we serve">
              {REGIONS.map((x, i) => (
                <button key={x.id} ref={el => { tabs.current[i] = el; }} role="tab" aria-selected={active === i} tabIndex={active === i ? 0 : -1}
                  onClick={() => setActive(i)} onKeyDown={e => onKey(e, i)}>
                  <span className="flag mono">{x.flag}</span>
                  <span><b>{x.name}</b><small>{x.cities}</small></span>
                  <span className="arr">→</span>
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={r.id} className="region-card card" aria-live="polite"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <p className="mono small region-card__k">Serving {r.name}</p>
                <p className="region-card__blurb">{r.blurb}</p>
                <div className="region-card__chips">{r.services.map(s => <span key={s}>{s}</span>)}</div>
                <ul>{r.points.map(p => <li key={p}>{p}</li>)}</ul>
                <a className="tlink" href="#contact">Start a project in {r.id === "world" ? "your region" : r.name} <span className="arr">→</span></a>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="global__stats" data-reveal>
          <div><b>5</b><span className="mono small">regions served</span></div>
          <div><b>8</b><span className="mono small">services in every region</span></div>
          <div><b>1</b><span className="mono small">team across time zones</span></div>
          <div><b>100%</b><span className="mono small">remote-first delivery</span></div>
        </div>
      </div>
    </section>
  );
}
