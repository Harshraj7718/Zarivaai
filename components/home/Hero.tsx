"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import HeroShader from "./HeroShader";
import Crew from "@/components/sketch/Crew";
import Doodles from "@/components/sketch/Doodles";
import Eyes from "@/components/sketch/Eyes";
import InkLogo from "@/components/sketch/InkLogo";

const WORDS = ["software.", "SaaS platform.", "AI agents.", "CRM & ERP.", "web & apps."];
const PERF = ["Growth on track", "> 3 AI agents live · 1,240 replies this week", "> leads up 18% week on week", "> sprint 6 shipped · 0 incidents"];
const DESKS = [
  { x: 80, y: 204, icon: "</>", name: "SaaS" },
  { x: 220, y: 204, icon: "✦", name: "AI agents" },
  { x: 360, y: 204, icon: "⇄", name: "CRM & ERP" },
  { x: 140, y: 296, icon: "↗", name: "Marketing" },
  { x: 300, y: 296, icon: "◎", name: "Operations" },
];
const WIRES = ["M220 126 V148 H80 V170", "M220 126 V170", "M220 126 V148 H360 V170", "M220 126 V148 H80 V246 H140 V262", "M220 126 V148 H360 V246 H300 V262"];
const PULSE_DUR = ["2.4s", "1.8s", "2.4s", "3.2s", "3.2s"];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [word, setWord] = useState(0);
  const [desk, setDesk] = useState(0);
  const [paused, setPaused] = useState(false);
  const [perf, setPerf] = useState(PERF[0]);
  const [hint, setHint] = useState("Share your site and we'll show you where growth is stuck.");
  const [site, setSite] = useState("");

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const a = setInterval(() => setWord(w => (w + 1) % WORDS.length), 2800);
    let i = 0, typer: ReturnType<typeof setInterval> | undefined;
    const b = setInterval(() => {
      i = (i + 1) % PERF.length;
      const line = PERF[i];
      let n = 0;
      clearInterval(typer);
      typer = setInterval(() => { setPerf(line.slice(0, ++n)); if (n >= line.length) clearInterval(typer); }, 18);
    }, 4200);
    return () => { clearInterval(a); clearInterval(b); clearInterval(typer); };
  }, []);

  useEffect(() => {
    if (paused || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setDesk(d => (d + 1) % DESKS.length), 1400);
    return () => clearInterval(t);
  }, [paused]);

  useEffect(() => {
    const s = svg.current;
    if (!s) return;
    if (paused) s.pauseAnimations(); else s.unpauseAnimations();
  }, [paused]);

  // GSAP intro: copy rises in, then the diagram and cards, then the weekly bars grow
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });
      tl.from(".hero__left > *", { y: 28, opacity: 0, stagger: 0.07 })
        .from(".harness", { scale: 0.92, opacity: 0, duration: 1 }, 0.15)
        .from(".overview, .perf", { y: 30, opacity: 0, stagger: 0.12 }, 0.45)
        .from(".bars b", { scaleY: 0, transformOrigin: "bottom", stagger: 0.07, duration: 0.7 }, 0.8)
        .from(".agents article", { y: 20, opacity: 0, stagger: 0.06, duration: 0.6 }, 0.6);
    });
  }, { scope: root });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = site.trim().replace(/^https?:\/\//, "");
    if (!v) { setHint("Add your website first, for example yourcompany.com."); return; }
    setHint(`Opening your email app to request a consult for ${v}…`);
    location.href = `mailto:hello@zariva.ai?subject=${encodeURIComponent("Free consult: " + v)}&body=${encodeURIComponent("Website: " + v + "\n\nWhat we run today:\n")}`;
  };

  return (
    <section id="top" className="hero sec" ref={root}>
      <div className="hero__left">
        <Doodles items={[{ kind: "sparkle", left: "84%", top: "9%", size: 26 }, { kind: "leaf", left: "6%", top: "93%", size: 30 }, { kind: "code", left: "88%", top: "70%", size: 28 }]} />
        <Crew kind="dot" size={56} says="I'm the dot in zariva. Hi!" style={{ right: "9%", top: "22%" }} bubbleLeft />
        <InkLogo height={58} className="hero__logo" />
        <p className="bracket mono">[ AI-powered technology & growth partner ]</p>
        <h1 className="hero__h1">
          <span className="h1__fixed">We engineer your</span>
          <span className="rot" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={WORDS[word]} className="rot__word"
                initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
              >{WORDS[word]}</motion.span>
            </AnimatePresence>
          </span>
          <span className="soft">We run your growth.</span>
        </h1>
        <p className="lead">Zariva.AI builds the SaaS platforms, CRM & ERP systems and AI agents that run your business, then markets, lists and grows it across every channel that matters.</p>
        <div className="cta-row">
          <a className="btn btn--dark" href="#contact">Start a project <span className="arr">→</span></a>
          <a className="btn btn--ghost" href="#services">Explore services</a>
        </div>
        <p className="micro mono">SaaS · AI agents · CRM & ERP · Digital marketing · BPO · Consulting</p>
        <form className="urlform" onSubmit={submit}>
          <label className="sr" htmlFor="site">Your website</label>
          <input id="site" type="text" inputMode="url" placeholder="yourcompany.com" autoComplete="url" value={site} onChange={e => setSite(e.target.value)} />
          <button type="submit">Free consult <span className="arr">→</span></button>
        </form>
        <p className="micro mono">{hint}</p>
      </div>

      <div className="hero__right">
        <HeroShader />
        <Eyes size={128} className="eyes--hero" />
        <div className="harness__top relative">
          <span className="mono small">[ one partner · full stack ]</span>
          <button className="pill mono" aria-pressed={paused} onClick={() => setPaused(p => !p)}>
            <span className="pi">{paused ? "▶" : "❙❙"}</span> {paused ? "Play" : "Pause"}
          </button>
        </div>
        <svg ref={svg} className={`harness relative${paused ? " paused" : ""}`} viewBox="0 0 440 330" role="img" aria-label="Diagram: Zariva core connected to SaaS, AI agents, CRM and ERP, marketing and operations">
          <defs>
            <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth=".8" opacity=".3" />
            </pattern>
          </defs>
          <g className="core" transform="translate(220 62)">
            <circle r="40" className="dash-ring" />
            <circle r="28" className="ring" />
            <circle r="19" className="core__fill" />
            <text className="core__glyph" y="7">z</text>
            <circle cx="10" cy="-14" r="4" className="core__dot" />
            <line x1="0" y1="40" x2="0" y2="64" className="ring" />
            <text x="50" y="-14" className="lbl">ZARIVA CORE</text>
          </g>
          <line x1="10" y1="126" x2="430" y2="126" className="floor" />
          {WIRES.map((d, i) => <path key={i} id={`w${i}`} className="wire" d={d} />)}
          {WIRES.map((_, i) => (
            <circle key={i} r="3.2" className="pulse">
              <animateMotion dur={PULSE_DUR[i]} begin={`${i * 0.45}s`} repeatCount="indefinite"><mpath href={`#w${i}`} /></animateMotion>
            </circle>
          ))}
          {DESKS.map((d, i) => (
            <g key={d.name} transform={`translate(${d.x} ${d.y})`} className={`desk${desk === i ? " on" : ""}`}>
              <rect x="-26" y="-34" width="52" height="36" rx="3" className="screen" />
              <rect x="-44" y="6" width="88" height="28" rx="2" className="table" />
              <rect x="-38" y="11" width="76" height="18" fill="url(#hatch)" />
              <text className="ico" y="-11">{d.icon}</text>
              <text className="dname" y="24">{d.name}</text>
            </g>
          ))}
        </svg>

        <div className="overview card relative">
          <div className="overview__head"><span className="mono small">Project overview</span><span className="ontrack mono small"><i />On track</span></div>
          <p className="overview__p">Live across your stack</p>
          <ul className="overview__list">
            <li><span>Hospital management SaaS · sprint 6 of 8</span><em className="st st--ok">On track</em></li>
            <li><span>AI support agent · handling first replies</span><em className="st st--live">Live</em></li>
            <li><span>CRM pipeline · synced with ERP</span><em className="st st--live">Live</em></li>
            <li><span>SEO and paid campaigns</span><em className="st st--grow">Growing</em></li>
            <li><span>Back-office team · 6 people</span><em className="st st--ok">Running</em></li>
          </ul>
        </div>

        <div className="perf card relative">
          <div className="perf__bar mono small"><span>Weekly performance</span><span className="live"><i />AI agents live</span></div>
          <div className="bars in" aria-label="Example weekly performance chart">
            {[["Mon", 42], ["Tue", 55], ["Wed", 50], ["Thu", 71], ["Fri", 88]].map(([d, h]) => (
              <div key={d} style={{ "--h": h } as React.CSSProperties}><b /><span>{d}</span></div>
            ))}
          </div>
          <p className="mono perf__line">{perf}</p>
        </div>
        <span className="mono small exd relative">Example data</span>
      </div>

      <div className="agents">
        <article><h3>SaaS engineering</h3><p>Platforms built to run your business and scale with it.</p></article>
        <article><h3>AI agents</h3><p>Support, sales ops and internal workflows, around the clock.</p></article>
        <article><h3>CRM & ERP</h3><p>Sales, operations and resourcing in one connected system.</p></article>
        <article><h3>Marketing</h3><p>SEO, paid and social that turn traffic into customers.</p></article>
        <article><h3>Operations</h3><p>Trained teams running support and the back office.</p></article>
      </div>
    </section>
  );
}
